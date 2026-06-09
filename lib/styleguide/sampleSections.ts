/**
 * Canonical sample `pageSections` used by both the in-app `/styleguide`
 * block gallery and the Storybook stories. Defining the examples once here
 * keeps the two documentation surfaces in sync and guarantees every sample
 * type-checks against the real schema in `@/lib/types`.
 */
import type {
  CardGrid,
  ClientQuote,
  CodeBlock,
  FeaturedWork,
  ImageBlock,
  MainSection,
  PageSection,
  TeamProfile,
  VideoBlock,
} from "@/lib/types";
import type { PageSectionType } from "@/components/postBlocks/renderPageSection";

// A real asset that ships in /public, so image blocks render a true preview.
const SAMPLE_IMAGE = "/Touchscreen-1-denoise-gigapixel.jpg";

// ---------------------------------------------------------------------------
// MainSection
// ---------------------------------------------------------------------------

export const sampleMainSection: MainSection = {
  type: "MainSection",
  tagline: "Improving access to medical and wellness information",
  title: "The Challenge",
  background: "white",
  richText:
    "<p>A wonderful source of medical and wellness information existed, but it was hard to reach in the moments that mattered. We set out to put trustworthy guidance in expectant parents' hands — fast, calm, and in their own language.</p>",
};

export const sampleMainSectionGray: MainSection = {
  type: "MainSection",
  tagline: "How we approached it",
  title: "Our Approach",
  background: "gray",
  richText:
    "<p>We mapped the highest-anxiety moments first, then designed the shortest path from question to reassurance.</p><ul><li>Research with real parents</li><li>Bilingual content model</li><li>Offline-friendly delivery</li></ul>",
};

export const sampleMainSectionPlain: MainSection = {
  type: "MainSection",
  title: "Result",
  richText:
    "<p>Sessions doubled in the first month and support tickets dropped. The team now ships new guidance in hours, not weeks.</p>",
};

// ---------------------------------------------------------------------------
// ImageBlock
// ---------------------------------------------------------------------------

export const sampleImageBlockSingle: ImageBlock = {
  type: "ImageBlock",
  images: [
    {
      src: SAMPLE_IMAGE,
      alt: "The app running on a phone in a clinical setting",
      width: 2762,
      height: 1480,
    },
  ],
};

export const sampleImageBlockNarrow: ImageBlock = {
  type: "ImageBlock",
  width: "text",
  images: [
    {
      src: SAMPLE_IMAGE,
      alt: "A single screen from the app, aligned to the text column",
      width: 1600,
      height: 900,
    },
  ],
};

export const sampleImageBlockPair: ImageBlock = {
  type: "ImageBlock",
  images: [
    {
      src: SAMPLE_IMAGE,
      alt: "Onboarding screen",
      width: 1200,
      height: 800,
    },
    {
      src: SAMPLE_IMAGE,
      alt: "Results screen",
      width: 1200,
      height: 800,
    },
  ],
};

export const sampleImageBlockPlaceholder: ImageBlock = {
  type: "ImageBlock",
  images: [
    {
      src: "",
      alt: "Hero shot of the finished installation in the gallery space",
      width: 1600,
      height: 900,
      placeholder: true,
      notes: "Wide shot, warm lighting, people interacting with the screen.",
    },
  ],
};

// ---------------------------------------------------------------------------
// CardGrid
// ---------------------------------------------------------------------------

export const sampleCardGridWithImages: CardGrid = {
  type: "CardGrid",
  columns: 3,
  background: "gray",
  cards: [
    {
      title: "Kiosks & Pedestals",
      description:
        "Self-contained, single or multi-touch, built for high-traffic environments.",
      image: {
        src: SAMPLE_IMAGE,
        alt: "A freestanding touchscreen kiosk in a gallery",
        width: 800,
        height: 600,
      },
    },
    {
      title: "Touch Tables",
      description:
        "Multi-user, collaborative surfaces, great for exploration and storytelling.",
      image: {
        src: "",
        alt: "A multi-user touch table",
        width: 800,
        height: 600,
        placeholder: true,
        notes: "Top-down or 3/4 shot of several visitors at the table.",
      },
    },
    {
      title: "Video Walls",
      description:
        "Large-format, high-impact displays — touch or gesture-enabled, built to scale.",
      image: {
        src: "",
        alt: "A large-format video wall",
        width: 800,
        height: 600,
        placeholder: true,
        notes: "Wide shot showing the scale of the wall against people.",
      },
    },
  ],
};

export const sampleCardGridTextOnly: CardGrid = {
  type: "CardGrid",
  columns: 3,
  background: "white",
  cards: [
    {
      title: "Early-stage involvement",
      description:
        "We shape creative direction from day one — before a pixel is designed.",
    },
    {
      title: "Durability by design",
      description:
        "Public installations run all day, every day, for years. We build for that reality.",
    },
    {
      title: "Universal design",
      description:
        "ADA compliance is designed in, not bolted on. Every installation works for every visitor.",
    },
  ],
};

// ---------------------------------------------------------------------------
// ClientQuote
// ---------------------------------------------------------------------------

export const sampleClientQuote: ClientQuote = {
  type: "ClientQuote",
  tagline: "Testimonial",
  quote:
    "<p>The app is wonderful — it does exactly what we hoped and our families love it.</p>",
  clientName: "— Dr. Jane Smith, Program Director",
};

export const sampleClientQuoteNoTagline: ClientQuote = {
  type: "ClientQuote",
  quote: "<p>They felt like part of our team from day one.</p>",
  clientName: "— Alex Rivera, Head of Product",
};

// ---------------------------------------------------------------------------
// CodeBlock (lab projects only)
// ---------------------------------------------------------------------------

export const sampleCodeBlock: CodeBlock = {
  type: "CodeBlock",
  filename: "app/api/advice/route.ts",
  language: "typescript",
  code: `export async function GET(req: Request) {
  const lang = new URL(req.url).searchParams.get("lang") ?? "en";
  const advice = await getAdvice(lang);
  return Response.json(advice);
}`,
  caption: "A thin route handler that returns localized guidance.",
};

export const sampleCodeBlockBare: CodeBlock = {
  type: "CodeBlock",
  code: `pnpm add @fastforward/advice-kit
pnpm advice build`,
};

// ---------------------------------------------------------------------------
// VideoBlock (lab projects only)
// ---------------------------------------------------------------------------

export const sampleVideoLoom: VideoBlock = {
  type: "VideoBlock",
  provider: "loom",
  src: "https://www.loom.com/share/0123456789abcdef0123456789abcdef",
  title: "Screencast: building the advice engine",
  caption: "A two-minute tour of the authoring workflow.",
};

export const sampleVideoYoutube: VideoBlock = {
  type: "VideoBlock",
  provider: "youtube",
  src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  title: "Conference talk: real-time content at the edge",
};

// ---------------------------------------------------------------------------
// TeamProfile (lab projects only)
// ---------------------------------------------------------------------------

export const sampleTeamIndividual: TeamProfile = {
  type: "TeamProfile",
  kind: "individual",
  name: "Sam Carter",
  role: "Lead Engineer",
  bio: "<p>Sam built the real-time pipeline and obsesses over fast, accessible interfaces.</p>",
  links: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
  ],
};

export const sampleTeamGroup: TeamProfile = {
  type: "TeamProfile",
  kind: "team",
  name: "The Fast Forward Lab",
  role: "Design + Engineering",
  bio: "<p>A small cross-functional team that prototypes ambitious ideas end to end.</p>",
};

export const sampleTeamNoAvatar: TeamProfile = {
  type: "TeamProfile",
  name: "Jordan Lee",
  role: "Designer",
};

// ---------------------------------------------------------------------------
// FeaturedWork
// ---------------------------------------------------------------------------

export const sampleFeaturedWork: FeaturedWork = {
  type: "FeaturedWork",
  slugs: [
    "demonstrating-innovation-with-a-gamified-microsite",
    "northeastern-simplifying-online-course-registration",
    "real-time-advice-for-expectant-parents",
  ],
};

// A MainSection with the carousel embedded in its content column — the
// intended way to use FeaturedWork.
export const sampleMainSectionWithWork: MainSection = {
  type: "MainSection",
  tagline: "Proof, not promises.",
  title: "See Our Work",
  background: "white",
  richText:
    "<p>The clearest way to understand how we work is to see what we've shipped. Here's a selection of recent projects.</p>",
  blocks: [sampleFeaturedWork],
};

// A MainSection with a card grid embedded in its content column — the cards
// inherit the section's gray background.
export const sampleMainSectionWithCards: MainSection = {
  type: "MainSection",
  tagline: "One practice, four disciplines.",
  title: "Our Services",
  background: "gray",
  richText:
    "<p>These services are stronger together, but each can also stand on its own.</p>",
  blocks: [{ ...sampleCardGridTextOnly, background: undefined }],
};

// ---------------------------------------------------------------------------
// Gallery descriptor — drives the /styleguide page. Each entry groups the
// block's variants with author-facing documentation. Field references are
// sourced from `lib/types.ts` + `CONTENT.md`.
// ---------------------------------------------------------------------------

export interface FieldDoc {
  name: string;
  type: string;
  required?: boolean;
  notes: string;
}

export interface BlockVariant {
  label: string;
  section: PageSection;
}

export interface BlockDoc {
  type: PageSectionType;
  label: string;
  /** Layouts whose frontmatter may include this block. */
  allowedIn: string;
  description: string;
  fields: FieldDoc[];
  variants: BlockVariant[];
}

export const blockGallery: BlockDoc[] = [
  {
    type: "MainSection",
    label: "MainSection",
    allowedIn: "case-study, blog-case-study, lab-project",
    description:
      "The primary narrative block. Auto-numbered (01, 02…) in a left rail with the title; the tagline becomes an H3 and richText holds the prose.",
    fields: [
      { name: "title", type: "string", notes: "Short label shown in the numbered left rail." },
      { name: "tagline", type: "string", notes: "Rendered as the section H3 heading." },
      { name: "background", type: '"white" | "gray"', notes: "Section background tint." },
      { name: "richText", type: "HTML string", notes: "Body copy. Supports inline HTML (<p>, <ul>, <strong>…)." },
      { name: "blocks", type: "EmbeddableBlock[]", notes: "Blocks embedded in the content column after richText (CardGrid, FeaturedWork). They render bare and inherit this section's background." },
    ],
    variants: [
      { label: "With tagline + title", section: sampleMainSection },
      { label: "Gray background + list", section: sampleMainSectionGray },
      { label: "Title only (no tagline)", section: sampleMainSectionPlain },
      { label: "With embedded CardGrid", section: sampleMainSectionWithCards },
      { label: "With embedded FeaturedWork", section: sampleMainSectionWithWork },
    ],
  },
  {
    type: "ImageBlock",
    label: "ImageBlock",
    allowedIn: "case-study, blog-case-study, lab-project",
    description:
      "One or two images. A single image goes full-bleed (or aligned to the text column with width: text); two images render side by side. Any image can be a styled placeholder while art is in progress.",
    fields: [
      { name: "images", type: "FrontmatterImage[]", required: true, notes: "1 image = full/narrow; 2 images = side-by-side. Each needs src, alt, width, height." },
      { name: "width", type: '"full" | "text"', notes: "Single image only. text aligns to the prose column." },
      { name: "images[].placeholder", type: "boolean", notes: "Render a styled placeholder (with notes) instead of the image." },
    ],
    variants: [
      { label: "Single, full-bleed", section: sampleImageBlockSingle },
      { label: "Single, text width", section: sampleImageBlockNarrow },
      { label: "Pair (side by side)", section: sampleImageBlockPair },
      { label: "Placeholder + designer notes", section: sampleImageBlockPlaceholder },
    ],
  },
  {
    type: "CardGrid",
    label: "CardGrid",
    allowedIn: "case-study, blog-case-study, lab-project",
    description:
      "A responsive grid of titled cards — format/audience sets, or text-only feature/value cards. Each card takes an optional thumbnail (placeholder-friendly). Preferably embedded in a MainSection's `blocks` (renders bare in the content column, inherits the section background — see MainSection › 'With embedded CardGrid'); can also stand alone full-width under a MainSection with a matching background.",
    fields: [
      { name: "cards", type: "Card[]", required: true, notes: "Each: title (required), description, image (FrontmatterImage, placeholder-friendly)." },
      { name: "columns", type: "2 | 3 | 4", notes: "Desktop columns. Mobile is 1, tablet 2. Default 3." },
      { name: "background", type: '"white" | "gray"', notes: "Match the MainSection above it so the pair reads as one section." },
    ],
    variants: [
      { label: "With images (3-up)", section: sampleCardGridWithImages },
      { label: "Text only (feature cards)", section: sampleCardGridTextOnly },
    ],
  },
  {
    type: "ClientQuote",
    label: "ClientQuote",
    allowedIn: "case-study, blog-case-study, lab-project",
    description: "A pull quote with an eyebrow tagline and an attribution line.",
    fields: [
      { name: "quote", type: "HTML string", notes: "The quote itself; wrap in <p>." },
      { name: "tagline", type: "string", notes: "Small uppercase eyebrow above the quote." },
      { name: "clientName", type: "string", notes: "Attribution line below the quote." },
    ],
    variants: [
      { label: "With tagline", section: sampleClientQuote },
      { label: "No tagline", section: sampleClientQuoteNoTagline },
    ],
  },
  {
    type: "CodeBlock",
    label: "CodeBlock",
    allowedIn: "lab-project only",
    description:
      "A syntax-labeled code card with an optional filename bar and caption.",
    fields: [
      { name: "code", type: "string", required: true, notes: "The snippet (preserve newlines/indentation)." },
      { name: "filename", type: "string", notes: "Shown in the card title bar; falls back to title." },
      { name: "language", type: "string", notes: "Language label + code class (e.g. typescript)." },
      { name: "caption", type: "string", notes: "Caption below the card." },
    ],
    variants: [
      { label: "Filename + language + caption", section: sampleCodeBlock },
      { label: "Bare snippet", section: sampleCodeBlockBare },
    ],
  },
  {
    type: "VideoBlock",
    label: "VideoBlock",
    allowedIn: "lab-project only",
    description:
      "An embedded video. Loom and YouTube URLs are auto-detected and embedded; file URLs render a native <video> player.",
    fields: [
      { name: "src", type: "string", required: true, notes: "Loom/YouTube share URL, or a direct file URL." },
      { name: "provider", type: '"loom" | "youtube" | "file"', notes: "Optional; inferred from src when omitted." },
      { name: "title", type: "string", notes: "Accessible iframe title." },
      { name: "caption", type: "string", notes: "Caption below the player." },
      { name: "aspectRatio", type: "string", notes: 'CSS aspect-ratio, default "16 / 9".' },
    ],
    variants: [
      { label: "Loom", section: sampleVideoLoom },
      { label: "YouTube", section: sampleVideoYoutube },
    ],
  },
  {
    type: "TeamProfile",
    label: "TeamProfile",
    allowedIn: "lab-project only",
    description:
      "Introduces the person or team behind a lab project. Uses a hand-drawn default avatar when no image is supplied.",
    fields: [
      { name: "name", type: "string", required: true, notes: "Person or team name." },
      { name: "kind", type: '"individual" | "team"', notes: 'Switches the eyebrow ("Built by" vs "Team").' },
      { name: "role", type: "string", notes: "Title or discipline." },
      { name: "bio", type: "HTML string", notes: "Short bio; supports inline HTML." },
      { name: "avatar", type: "FrontmatterImage", notes: "Optional; omit for the default avatar." },
      { name: "links", type: "{ label, url }[]", notes: "External links rendered as a list." },
    ],
    variants: [
      { label: "Individual + links", section: sampleTeamIndividual },
      { label: "Team", section: sampleTeamGroup },
      { label: "No avatar (default)", section: sampleTeamNoAvatar },
    ],
  },
  {
    type: "FeaturedWork",
    label: "FeaturedWork",
    allowedIn: "embedded in a MainSection's blocks (case-study, blog-case-study, lab-project)",
    description:
      "A curated 'recent work' carousel of ProjectCards, hand-picked by slug. Embed it in a MainSection's `blocks` — it renders inline in that section's content column and scrolls horizontally (see MainSection › 'With embedded FeaturedWork'). Slugs that don't resolve to a published project are skipped.",
    fields: [
      { name: "slugs", type: "string[]", required: true, notes: "Project slugs to feature, in display order (e.g. demonstrating-innovation-with-a-gamified-microsite)." },
    ],
    variants: [{ label: "Carousel (shown standalone)", section: sampleFeaturedWork }],
  },
];
