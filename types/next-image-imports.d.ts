// Tracked stand-in for the same reference inside next-env.d.ts (gitignored),
// so `tsc --noEmit` works in CI without a prior `next build`. Declares the
// module types for static image imports (*.jpg, *.jpeg, *.png, *.webp, etc.)
// used by next/image's StaticImageData flow.
/// <reference types="next/image-types/global" />
