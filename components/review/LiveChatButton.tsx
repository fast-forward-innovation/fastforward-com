"use client";

import { useEffect, useState } from "react";
import { isChatOnline } from "@/lib/chat";
import { sendReviewEvent } from "./reviewEvents";

/**
 * Placeholder: renders only while someone is online to chat. Presence is
 * checked in the browser because review pages are static. `isChatOnline()`
 * is a stub that returns false until live chat is built — see lib/chat.ts.
 */
export function LiveChatButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isChatOnline()
      .then((value) => {
        if (!cancelled) setOnline(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!online) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={() => sendReviewEvent(slug, "contact:chat")}
    >
      Live chat — we&apos;re online
    </button>
  );
}
