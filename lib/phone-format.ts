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
 *     from the rest, cap at 15 (E.164 max). We detect a 1-, 2-, or
 *     3-digit country code from a short prefix table, then group the
 *     remaining national digits in chunks of 3 (with a trailing 4-chunk
 *     when there'd otherwise be a stub) so the field reads like a phone
 *     number while typing. Per-country grouping isn't perfectly
 *     idiomatic — that would mean shipping libphonenumber — but it's
 *     vastly more readable than a smushed run of digits.
 *
 *   ""                    → ""
 *   "6"                   → "6"
 *   "617"                 → "617"
 *   "61755"               → "(617) 55"
 *   "6175550000"          → "(617) 555-0000"
 *   "16175550000"         → "(617) 555-0000"   (leading 1 dropped)
 *   "617-555-0000x"       → "(617) 555-0000"   (non-digits stripped)
 *   "+"                   → "+"                (mid-entry placeholder)
 *   "+44"                 → "+44"
 *   "+44 20 7946 0958"    → "+44 207 946 0958"
 *   "+33 1 42 36 33 33"   → "+33 142 363 333"
 *   "+1 617 555 0000"     → "+1 617 555 0000"  (explicit + means intl)
 */
export function formatPhoneInput(raw: string): string {
  const intlIntent = raw.trimStart().startsWith("+");
  let digits = raw.replace(/\D/g, "");

  if (intlIntent) {
    // E.164 caps total digits at 15 including country code.
    digits = digits.slice(0, 15);
    if (digits.length === 0) return "+";
    const ccLen = countryCodeLength(digits);
    const cc = digits.slice(0, Math.min(ccLen, digits.length));
    const rest = digits.slice(ccLen);
    return rest.length === 0
      ? `+${cc}`
      : `+${cc} ${groupNationalDigits(rest)}`;
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

// E.164 country-code length detection.
//   Single-digit codes: NANP (1), Russia/Kazakhstan (7).
//   Two-digit codes: a hand-curated subset covering the most-populous /
//     most-commonly-encountered countries per ITU-T E.164. Anything not
//     1, 7, or in this set is assumed 3-digit (the third E.164 tier).
//   The table only changes when ITU reassigns numbering plans (rare); if
//     we ever ship an actual region picker, drop this in favor of
//     libphonenumber's lookup.
const KNOWN_TWO_DIGIT_CC: ReadonlySet<string> = new Set([
  "20", "27",
  "30", "31", "32", "33", "34", "36", "39",
  "40", "41", "43", "44", "45", "46", "47", "48", "49",
  "51", "52", "53", "54", "55", "56", "57", "58",
  "60", "61", "62", "63", "64", "65", "66",
  "81", "82", "84", "86",
  "90", "91", "92", "93", "94", "95", "98",
]);

function countryCodeLength(digits: string): number {
  if (digits.length === 0) return 0;
  const first = digits[0];
  if (first === "1" || first === "7") return 1;
  if (digits.length >= 2 && KNOWN_TWO_DIGIT_CC.has(digits.slice(0, 2))) {
    return 2;
  }
  return 3;
}

// Group national digits in chunks of 3, except prefer a final 4-chunk
// over leaving a stub:
//   3 → "NNN"            6  → "NNN NNN"
//   4 → "NNNN"           7  → "NNN NNNN"
//   5 → "NNN NN"         8  → "NNN NNN NN"
//   9 → "NNN NNN NNN"   10 → "NNN NNN NNNN"
function groupNationalDigits(s: string): string {
  if (s.length === 0) return "";
  const chunks: string[] = [];
  let i = 0;
  while (i < s.length) {
    const remaining = s.length - i;
    if (remaining === 4) {
      chunks.push(s.slice(i, i + 4));
      break;
    }
    if (remaining < 3) {
      chunks.push(s.slice(i));
      break;
    }
    chunks.push(s.slice(i, i + 3));
    i += 3;
  }
  return chunks.join(" ");
}
