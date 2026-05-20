/**
 * Format a raw user-typed string into a US phone-number display value.
 *
 * Strips every non-digit, drops a leading "1" country code, caps at 10
 * digits, and re-emits in `(NNN) NNN-NNNN` shape — partial states included,
 * so the display auto-formats while the user is still typing. Empty input
 * stays empty (phone is optional on the contact form).
 *
 *   ""               → ""
 *   "6"              → "6"
 *   "617"            → "617"
 *   "61755"          → "(617) 55"
 *   "6175550000"     → "(617) 555-0000"
 *   "+1 617 555 …"   → "(617) 555-0000"
 *   "617-555-0000x"  → "(617) 555-0000"     (non-digits stripped)
 */
export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  // North American Numbering Plan country code — accept a leading 1 from
  // pasted or autofilled values but format around the 10-digit subscriber
  // number so the display stays consistent.
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
