/**
 * Format a raw user-typed string into a phone-number display value.
 *
 * Two modes, switched by whether the input starts with "+":
 *
 *   US (no leading "+"):  strip non-digits, drop a leading "1" (NANP
 *     shorthand), cap at 10 digits, format as `(NNN) NNN-NNNN`. Partial
 *     states auto-emit so the display formats while the user types.
 *
 *   International (leading "+"):  preserve the "+", strip non-digits
 *     from the rest, cap at 15 (E.164 max). We don't carry per-country
 *     grouping rules — the number renders as `+NNN…`, which is correct
 *     if not pretty. The form's primary audience is US-based; this mode
 *     exists so non-US visitors aren't rejected outright.
 *
 *   ""                    → ""
 *   "6"                   → "6"
 *   "617"                 → "617"
 *   "61755"               → "(617) 55"
 *   "6175550000"          → "(617) 555-0000"
 *   "16175550000"         → "(617) 555-0000"   (leading 1 dropped)
 *   "617-555-0000x"       → "(617) 555-0000"   (non-digits stripped)
 *   "+"                   → "+"                (mid-entry placeholder)
 *   "+44 20 7946 0958"    → "+442079460958"
 *   "+1 617 555 0000"     → "+16175550000"     (explicit + means intl)
 */
export function formatPhoneInput(raw: string): string {
  const intlIntent = raw.trimStart().startsWith("+");
  let digits = raw.replace(/\D/g, "");

  if (intlIntent) {
    // E.164 caps total digits at 15 including country code.
    digits = digits.slice(0, 15);
    return digits.length === 0 ? "+" : `+${digits}`;
  }

  // US — NANP shorthand: a leading "1" with 11 total digits.
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
