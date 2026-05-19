"use client";

import { useEffect, useState } from "react";
import type { Editorial, EditorialStatus } from "@/lib/types";

const DEFAULT_REPO = "fast-forward-innovation/fastforward-com";

const STATUS_ACCENT: Record<EditorialStatus, string> = {
  draft: "var(--color-ff_red)",
  revisions: "var(--color-ff_red)",
  review: "var(--color-ff_teal)",
  approved: "var(--color-ff_teal)",
  live: "var(--color-ff_gray)",
};

function dismissKey(slug: string): string {
  return `ff-draft-toast-dismissed:${slug}`;
}

function prUrl(pr: number): string {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || DEFAULT_REPO;
  return `https://github.com/${repo}/pull/${pr}`;
}

export function DraftStatusToast({
  slug,
  editorial,
}: {
  slug: string;
  editorial: Editorial;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(dismissKey(slug)) === "1") {
        setDismissed(true);
      }
    } catch {
      // sessionStorage unavailable (private mode, etc.) — just show the toast.
    }
  }, [slug]);

  if (dismissed) return null;

  const accent = STATUS_ACCENT[editorial.status] ?? "var(--color-ff_gray)";
  const href = editorial.pr ? prUrl(editorial.pr) : null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(dismissKey(slug), "1");
    } catch {
      // No-op; the in-memory state below still hides the toast for this view.
    }
    setDismissed(true);
  };

  const body = (
    <>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss draft notice"
        className="absolute top-1.5 right-2 text-[var(--color-ff_gray)] hover:text-[var(--color-ff_black)] text-lg leading-none px-1 motion-reduce:transition-none transition-colors"
      >
        ×
      </button>
      <div className="pr-4">
        <div
          className="inline-block font-mono tracking-wider uppercase text-[10px] px-2 py-0.5 mb-2 rounded-sm text-white"
          style={{ backgroundColor: accent }}
        >
          {editorial.status}
        </div>
        <div className="font-medium text-[var(--color-ff_black)] text-sm leading-tight">
          Draft preview
        </div>
        {(editorial.branch || editorial.updated) && (
          <div className="font-mono text-[11px] text-[var(--color-ff_gray)] mt-1">
            {[editorial.branch, editorial.updated && `updated ${editorial.updated}`]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}
        {editorial.reviewers && editorial.reviewers.length > 0 && (
          <div className="text-[11px] text-[var(--color-ff_gray)] mt-0.5">
            Reviewers: {editorial.reviewers.join(", ")}
          </div>
        )}
        {editorial.notes && (
          <p className="text-xs text-[var(--color-ff_black)] mt-2 leading-snug line-clamp-2">
            {editorial.notes}
          </p>
        )}
        {href && (
          <div className="font-mono text-[10px] text-[var(--color-ff_teal)] mt-2 uppercase tracking-wider">
            View PR #{editorial.pr} ↗
          </div>
        )}
      </div>
    </>
  );

  const baseClass =
    "fixed bottom-4 right-4 z-50 w-[280px] max-w-[calc(100vw-2rem)] bg-[var(--color-ff_lightGray)] text-[var(--color-ff_black)] shadow-lg p-4 pl-5 motion-reduce:transition-none transition-opacity duration-200";
  const style = { borderLeft: `4px solid ${accent}` };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${baseClass} block hover:opacity-95`}
        style={style}
      >
        {body}
      </a>
    );
  }
  return (
    <div className={baseClass} style={style}>
      {body}
    </div>
  );
}
