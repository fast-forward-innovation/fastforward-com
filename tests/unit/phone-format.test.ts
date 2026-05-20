import { describe, expect, it } from "vitest";
import { formatPhoneInput } from "@/lib/phone-format";

describe("formatPhoneInput", () => {
  it("returns empty for empty input", () => {
    expect(formatPhoneInput("")).toBe("");
  });

  it("returns digits as-is up to 3 characters", () => {
    expect(formatPhoneInput("6")).toBe("6");
    expect(formatPhoneInput("61")).toBe("61");
    expect(formatPhoneInput("617")).toBe("617");
  });

  it("wraps area code in parens once we have a fourth digit", () => {
    expect(formatPhoneInput("6175")).toBe("(617) 5");
    expect(formatPhoneInput("617555")).toBe("(617) 555");
  });

  it("adds the dash separator at the seventh digit", () => {
    expect(formatPhoneInput("6175550")).toBe("(617) 555-0");
    expect(formatPhoneInput("6175550000")).toBe("(617) 555-0000");
  });

  it("caps at 10 digits", () => {
    expect(formatPhoneInput("61755500001234")).toBe("(617) 555-0000");
  });

  it("strips non-digit characters from typed input", () => {
    expect(formatPhoneInput("abc6def17")).toBe("617");
    expect(formatPhoneInput("617-555-0000x123")).toBe("(617) 555-0000");
  });

  it("re-formats already-formatted pasted values cleanly", () => {
    expect(formatPhoneInput("(617) 555-0000")).toBe("(617) 555-0000");
    expect(formatPhoneInput("617.555.0000")).toBe("(617) 555-0000");
    expect(formatPhoneInput("617 555 0000")).toBe("(617) 555-0000");
  });

  it("drops a leading 1 country code from 11-digit US input (no +)", () => {
    expect(formatPhoneInput("16175550000")).toBe("(617) 555-0000");
    expect(formatPhoneInput("1-617-555-0000")).toBe("(617) 555-0000");
  });

  it("does not drop a leading 1 unless it's preceded by 11 total digits", () => {
    // A 10-digit number that happens to start with 1 (rare but possible
    // for some North American area codes; technically NANP disallows it,
    // but the formatter should respect what the user typed at <11 digits)
    expect(formatPhoneInput("1234567890")).toBe("(123) 456-7890");
  });

  describe("international (leading +) input", () => {
    it("keeps the lone + while the user is still typing the country code", () => {
      expect(formatPhoneInput("+")).toBe("+");
      expect(formatPhoneInput("+4")).toBe("+4");
      expect(formatPhoneInput("+44")).toBe("+44");
    });

    it("inserts a space between the country code and the national number", () => {
      // First digit beyond the CC: space appears.
      expect(formatPhoneInput("+449")).toBe("+44 9");
      expect(formatPhoneInput("+1 6")).toBe("+1 6");
    });

    it("groups a UK number after the +44 country code", () => {
      expect(formatPhoneInput("+44 20 7946 0958")).toBe("+44 207 946 0958");
    });

    it("groups a French number after the +33 country code", () => {
      expect(formatPhoneInput("+33 1 42 36 33 33")).toBe("+33 142 363 333");
    });

    it("groups a NANP number after an explicit +1", () => {
      // The explicit "+" signals international intent; we still detect
      // the 1-digit NANP country code and group like a US number.
      expect(formatPhoneInput("+1 (617) 555-0000")).toBe("+1 617 555 0000");
      expect(formatPhoneInput("+16175550000")).toBe("+1 617 555 0000");
    });

    it("handles a 3-digit country code (e.g. +852 Hong Kong)", () => {
      expect(formatPhoneInput("+852 12345678")).toBe("+852 123 456 78");
      // Just the CC, no national digits yet → no trailing space
      expect(formatPhoneInput("+852")).toBe("+852");
    });

    it("caps at 15 digits (E.164 max)", () => {
      // 15 digits, leading 1 → cc='1', rest='234567890123456' → trimmed
      // by the slice(0, 15) cap to 14 in the rest.
      expect(formatPhoneInput("+123456789012345999")).toBe(
        "+1 234 567 890 123 45",
      );
    });

    it("strips letters and stray characters but keeps the + prefix", () => {
      expect(formatPhoneInput("+44 abc 20 def 7946 0958")).toBe(
        "+44 207 946 0958",
      );
    });
  });
});
