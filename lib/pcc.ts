import { unstable_cache } from "next/cache";
import {
  PantheonClient,
  getArticles,
  getArticleBySlug,
  type Article,
  type PantheonTree,
  type PantheonTreeNode,
} from "@pantheon-systems/pcc-sdk-core";
// archieml has no @types — see ./archieml.d.ts for the minimal surface.
import archieml from "archieml";
import type {
  Page,
  PageSection,
  MainSection,
  CodeBlock,
  VideoBlock,
  TeamProfile,
  ImageBlock,
  ClientQuote,
  AdditionalPostFields,
} from "./types";

const SITE_ID = process.env.PCC_SITE_ID;
const TOKEN = process.env.PCC_TOKEN;

const LIST_TAG = "pcc:lab-projects";
const detailTag = (slug: string) => `pcc:lab-project:${slug}`;

let _client: PantheonClient | null = null;

function getClient(): PantheonClient | null {
  if (!SITE_ID || !TOKEN) return null;
  if (!_client) {
    _client = new PantheonClient({ siteId: SITE_ID, token: TOKEN });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Fetchers — wrapped in unstable_cache so revalidateTag() works from the
// /api/revalidate webhook. Apollo's own cache isn't visible to Next's
// fetch cache, hence the explicit wrapper.
// ---------------------------------------------------------------------------

export const fetchLabProjectPages = unstable_cache(
  async (preview = false): Promise<Page[]> => {
    const client = getClient();
    if (!client) {
      console.warn(
        "[pcc] PCC_SITE_ID or PCC_TOKEN missing — skipping PCC fetch",
      );
      return [];
    }
    const articles = await getArticles(
      client,
      { publishingLevel: preview ? "REALTIME" : "PRODUCTION" },
      undefined,
      true, // withContent
    );
    return articles
      .filter((a): a is Article =>
        a != null && typeof (a as Article).resolvedContent !== "undefined",
      )
      .map(articleToPage)
      .filter((p): p is Page => p != null);
  },
  ["pcc:lab-projects:list"],
  { tags: [LIST_TAG] },
);

export async function fetchLabProjectPageBySlug(
  slug: string,
  { preview = false }: { preview?: boolean } = {},
): Promise<Page | null> {
  const cached = unstable_cache(
    async () => {
      const client = getClient();
      if (!client) return null;
      try {
        const article = await getArticleBySlug(client, slug, {
          publishingLevel: preview ? "REALTIME" : "PRODUCTION",
        });
        return article ? articleToPage(article) : null;
      } catch {
        return null;
      }
    },
    [`pcc:lab-project:${slug}`],
    { tags: [LIST_TAG, detailTag(slug)] },
  );
  return cached();
}

// ---------------------------------------------------------------------------
// Adapter — Article → Page. Branches on body shape:
//   string  →  ArchieML body (TEXT_MARKDOWN content type)
//   object  →  PantheonTree AST (TREE_PANTHEON / TREE_PANTHEON_V2)
// Both share the same metadata-field shape from the PCC dashboard schema.
// ---------------------------------------------------------------------------

function articleToPage(article: Article): Page | null {
  const meta = (article.metadata ?? {}) as Record<string, unknown>;
  // PCC keeps slug inside the article's custom metadata, not at the top level.
  const slug =
    article.slug ?? (typeof meta.slug === "string" ? meta.slug : undefined);
  const title = article.title;
  if (!slug || !title) return null;

  const additionalPostFields = readMetadataFields(meta);

  // PCC stores body as TREE_PANTHEON_V2 — a JSON-encoded AST whether the
  // author typed ArchieML, prose, or a mix. We extract the verbatim text
  // (one line per paragraph) and let archieml parse it. Phase 1b's Smart
  // Components path will branch off the same tree before this point.
  const tree = resolveTree(article.resolvedContent);
  const sourceText = tree ? treeToText(tree) : extractStringBody(article.resolvedContent);
  const pageSections = sourceText ? parseArchieMlSections(sourceText) : [];

  return {
    title,
    slug,
    date: article.publishedDate
      ? new Date(article.publishedDate).toISOString()
      : new Date().toISOString(),
    layout: "lab-project",
    additionalPostFields,
    pageSections,
    source: "pcc-archieml",
    pccArticleId: article.id,
  };
}

function resolveTree(body: Article["resolvedContent"]): PantheonTree | null {
  if (!body) return null;
  if (typeof body === "object" && "children" in body) {
    return body as PantheonTree;
  }
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.children)) {
        return parsed as PantheonTree;
      }
    } catch {
      // Not JSON — caller falls back to raw string handling.
    }
  }
  return null;
}

function extractStringBody(body: Article["resolvedContent"]): string {
  return typeof body === "string" ? body : "";
}

function treeToText(tree: PantheonTree): string {
  return (tree.children ?? [])
    .filter((node) => node.tag !== "style")
    .map(nodeToPlainText)
    .join("\n");
}

function nodeToPlainText(node: PantheonTreeNode): string {
  if (node.data) return node.data;
  if (!node.children) return "";
  return node.children.map(nodeToPlainText).join("");
}

function readMetadataFields(
  meta: Record<string, unknown>,
): AdditionalPostFields {
  const str = (k: string) =>
    typeof meta[k] === "string" ? (meta[k] as string) : undefined;
  const splitList = (k: string): string[] | undefined => {
    const raw = str(k);
    if (!raw) return undefined;
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return items.length > 0 ? items : undefined;
  };
  return {
    label: str("label"),
    tagline: str("tagline"),
    brandColor: str("brandColor"),
    stack: splitList("stack"),
    tags: splitList("tags"),
    repoUrl: str("repoUrl"),
    liveUrl: str("liveUrl"),
  };
}

// ---------------------------------------------------------------------------
// ArchieML path
// ---------------------------------------------------------------------------

interface ArchieMlParsed {
  pageSections?: Partial<PageSection>[];
}

function parseArchieMlSections(raw: string): PageSection[] {
  const normalized = normalizeArchieMlSource(raw);
  let parsed: ArchieMlParsed;
  try {
    parsed = archieml.load(normalized) as ArchieMlParsed;
  } catch (err) {
    console.warn("[pcc] archieml parse failed", err);
    return [];
  }
  const rows = Array.isArray(parsed.pageSections) ? parsed.pageSections : [];
  return rows
    .map(normalizeArchieMlRow)
    .filter((s): s is PageSection => s != null);
}

// Authors typing in Google Docs commonly repeat `[+pageSections]` or
// `[.pageSections]` before each block. ArchieML actually wants ONE opener
// followed by blank-line-separated objects, so we collapse repeats to blank
// lines. Tolerant of either prefix; canonicalises to the dot form.
function normalizeArchieMlSource(raw: string): string {
  let openerSeen = false;
  return raw
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (t === "[+pageSections]" || t === "[.pageSections]") {
        if (!openerSeen) {
          openerSeen = true;
          return "[.pageSections]";
        }
        return "";
      }
      return line;
    })
    .join("\n");
}

function stripLeadingEndMarker(s: string | undefined): string | undefined {
  if (!s) return s;
  return s.replace(/^:end\s*\n?/, "");
}

function normalizeArchieMlRow(
  row: Partial<PageSection>,
): PageSection | null {
  switch (row.type) {
    case "MainSection":
      return {
        type: "MainSection",
        title: (row as Partial<MainSection>).title,
        tagline: (row as Partial<MainSection>).tagline,
        background: (row as Partial<MainSection>).background,
        richText: stripLeadingEndMarker(
          (row as Partial<MainSection>).richText,
        ),
      };
    case "CodeBlock":
      return {
        type: "CodeBlock",
        title: (row as Partial<CodeBlock>).title,
        filename: (row as Partial<CodeBlock>).filename,
        language: (row as Partial<CodeBlock>).language,
        code: stripLeadingEndMarker((row as Partial<CodeBlock>).code) ?? "",
        caption: (row as Partial<CodeBlock>).caption,
      };
    case "VideoBlock":
      return {
        type: "VideoBlock",
        provider: (row as Partial<VideoBlock>).provider,
        src: (row as Partial<VideoBlock>).src ?? "",
        title: (row as Partial<VideoBlock>).title,
        caption: (row as Partial<VideoBlock>).caption,
        aspectRatio: (row as Partial<VideoBlock>).aspectRatio,
        poster: (row as Partial<VideoBlock>).poster,
      };
    case "TeamProfile":
      return {
        type: "TeamProfile",
        kind: (row as Partial<TeamProfile>).kind,
        name: (row as Partial<TeamProfile>).name ?? "",
        role: (row as Partial<TeamProfile>).role,
        bio: (row as Partial<TeamProfile>).bio,
        avatar: (row as Partial<TeamProfile>).avatar,
        links: (row as Partial<TeamProfile>).links,
      };
    case "ImageBlock": {
      const ib = row as Partial<ImageBlock> & Record<string, unknown>;
      // ArchieML can't cleanly express deeply nested arrays of objects, so
      // we also accept flat fields (`imageSrc`, `imageAlt`, `imageWidth`,
      // `imageHeight`) and assemble a single-image array from them.
      let images = Array.isArray(ib.images) ? ib.images : [];
      const flatSrc =
        typeof ib.imageSrc === "string" ? (ib.imageSrc as string) : undefined;
      const flatSrcLegacy =
        typeof ib.src === "string" ? (ib.src as string) : undefined;
      const src = flatSrc ?? flatSrcLegacy;
      if (images.length === 0 && src) {
        const numOrNull = (v: unknown): number | null => {
          if (typeof v === "number") return v;
          if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          }
          return null;
        };
        images = [
          {
            src,
            alt:
              (typeof ib.imageAlt === "string" && (ib.imageAlt as string)) ||
              (typeof ib.alt === "string" && (ib.alt as string)) ||
              "",
            width: numOrNull(ib.imageWidth ?? ib.width),
            height: numOrNull(ib.imageHeight ?? ib.height),
          },
        ];
      }
      const widthVariant =
        ib.width === "full" || ib.width === "text" ? ib.width : undefined;
      return {
        type: "ImageBlock",
        images,
        width: widthVariant,
      };
    }
    case "ClientQuote":
      return {
        type: "ClientQuote",
        clientName: (row as Partial<ClientQuote>).clientName,
        tagline: (row as Partial<ClientQuote>).tagline,
        quote: (row as Partial<ClientQuote>).quote,
      };
    default:
      console.warn(`[pcc] archieml: unknown section type "${row.type}"`);
      return null;
  }
}

