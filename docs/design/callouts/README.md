# MIT-Ayiti case study callouts

Design specs for three blog callouts in the WordPress-to-Next.js case study.
Put this folder in the repo at `docs/design/callouts/`.

These are **specs, not production code.** They use a design-canvas runtime
(`support.js`, `<x-dc>`) that the site does not ship. Rebuild each one as a
component. Don't paste them in.

| File | Callout | Ground |
|---|---|---|
| five-fears.dc.html | Five fears about leaving WordPress | White, red number discs |
| five-advantages.dc.html | Five advantages of Next.js and Pantheon P1 | White, teal number discs |
| haiti-latency.dc.html | Every click costs more in Haiti | Ink (#1B1A1C), red data bars |

## Brand

- **Font:** Manrope (Google Fonts), 400/600/700/800.
- **Colors:** ink #1B1A1C, ink2 #2B2930, muted #6A7078, hairline #C2CACF,
  red #DD2E2A, teal #008CA8.
- **On dark:** #E3E7EE, #D6DBE4, #A6AFC0, hairline #4A4854.
- **Gradient top bar:** the white callouts carry an 8px bar,
  `linear-gradient(90deg, #DD2E2A 0%, #B81D19 19%, #18397F 59%, #1E2142 100%)`.
- **Size:** 1200×820, scaling down responsively.

## Prompt for Claude Code

> These three files in docs/design/callouts/ are design specs from a design
> canvas, not production code. They use a canvas runtime we don't ship.
> Rebuild each as a static, accessible React component for the blog: Manrope,
> Fast Forward brand colors as given in the files and README, fixed 1200×820
> layout that scales down responsively. Keep all copy and numbers exactly as
> written, including the source line on the latency callout. Don't add claims
> or stats. Lists should be real <ol> lists; the latency chart needs a text
> equivalent for screen readers.

## Data source (latency callout)

SpeedOf.Me, Haiti, first half of 2026: https://speedof.me/internet-speed/haiti
- Median download speed: 6.9 Mbps on all devices, 2 Mbps on mobile.
- Median latency: 101 ms.
- Global median download speed: 33.9 Mbps.
- Based on fewer than 1,000 browser tests.

Ookla's Speedtest Global Index shows much higher fixed-broadband figures for
Haiti. Re-check the numbers before publishing.
