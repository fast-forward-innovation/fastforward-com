# Roadmap

Planned work for fastforward.sh that isn't built yet. Each item says why we
want it and where it plugs into the existing code.

## Live chat on prospect reviews (Firebase)

**Why.** Prospect reviews (`/review/<slug>`) end with a contact block for the
principal who sent them: email, LinkedIn, and live chat while we're online.
Live chat is the fastest path from "they read it" to a conversation. It
replaces the Slack Connect option we dropped: Slack doesn't offer a lasting
"connect with me" link, and asking a prospect to join our Slack is a big ask.

**Status.** Placeholder only. `isChatOnline()` in `lib/chat.ts` always returns
`false`, so the "Live chat" button never renders.

**Approach: Firebase.** We use the same stack on MIT-Ayiti (Firebase Auth +
Firestore), so the team already knows it:
- **Presence:** the principal's online/offline status, using the Realtime
  Database `onDisconnect` presence pattern. Drives `isChatOnline()`.
- **Visitors:** Firebase Anonymous Auth. No sign-up; the conversation is tied
  to the review slug and the personal `?v=` visitor ID.
- **Messages:** Firestore, one conversation document per visitor per review,
  with security rules limiting each visitor to their own thread.
- **Client SDK only.** Review pages stay static. Firebase loads in the browser,
  only after the visitor opens the chat, so it adds nothing to the page's
  first load.

**Where it plugs in:**
- `lib/chat.ts`: `isChatOnline()` returns real presence.
- `components/review/LiveChatButton.tsx`: opens the chat panel instead of
  only reporting the click.
- `/api/review-view`: already accepts the `contact:chat` event, so starting a
  chat already alerts the principal in Slack.

**Open questions:**
- Where does the principal answer: an internal page on the site, or a bridge
  that relays the conversation into Slack?
- What does the visitor see while we're offline: hide chat (today's
  behaviour), or leave a message for later?
- Do we keep chat transcripts, and for how long?
- Which Firebase project owns it, and which Pantheon secrets does it need?
