/**
 * Live chat — placeholder.
 *
 * The review contact block shows a "Live chat" option only while someone is
 * online to answer it. Live chat isn't built yet, so this always reports
 * offline and the button never renders. It's planned on Firebase
 * (Realtime Database presence + Firestore messages); see docs/roadmap.md.
 * When chat lands, this is the one place presence gets wired in, and
 * `LiveChatButton` opens the chat panel.
 */
export async function isChatOnline(): Promise<boolean> {
  return false;
}
