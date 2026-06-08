---
description: Phase 5 — contact form component + API route (Monday.com or no-op echo)
---

Port the contact form and stand up its API route.

1. `app/api/contact/route.ts` — POST handler. Validates payload (matching the client-side rules from step 2), sanitizes string inputs (strip HTML tags, collapse newlines to spaces), then:

   **Option A — if `<MONDAY_BOARD_ID>` is a non-empty value:**
   Forward to Monday.com via GraphQL. Use **variables** to pass `column_values`, not inline JSON escaping. Endpoint: `https://api.monday.com/v2/`. Headers: `Content-Type: application/json`, `API-Version: 2023-10`, `Authorization: process.env.MONDAY_API_TOKEN`. Board: `<MONDAY_BOARD_ID>`. Return 500 with a clear error JSON if `MONDAY_API_TOKEN` isn't set; 400 on bad input; 502 on Monday errors; 200 on success.

   **Option B — if `<MONDAY_BOARD_ID>` is empty:**
   Stand up a no-op echo route that `console.error('contact form submission:', payload)` and returns `{ success: true }` — no external dependency. Add a short comment in the route explaining how to swap to a real backend later.

2. `components/ContactForm.tsx` — `'use client'`. Standard fields: firstName, lastName, company, website, email, three-input grouped phone, comments. Client-side validation with inline error display. `router.push()` to `/contact-submitted?success={true|false}` based on the API response.
3. Wire `<ContactForm />` into `app/contact-us/page.tsx` (replacing the placeholder from Phase 4).
4. Add `.env.local.example` documenting `MONDAY_API_TOKEN` (omit if Option B is in play) and `NEXT_PUBLIC_SITE_URL=<CANONICAL_URL>`. Confirm `.env.local` is gitignored.

Run `npm run dev` and submit the form once. In Option A, confirm the API returns 500 with a clear error if `MONDAY_API_TOKEN` isn't set, then ask the operator to set it and try again. In Option B, confirm the payload appears in the terminal log.
