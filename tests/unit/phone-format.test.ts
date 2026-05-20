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

  it("drops a leading 1 country code from 11-digit input", () => {
    expect(formatPhoneInput("16175550000")).toBe("(617) 555-0000");
    expect(formatPhoneInput("+1 (617) 555-0000")).toBe("(617) 555-0000");
    expect(formatPhoneInput("1-617-555-0000")).toBe("(617) 555-0000");
  });

  it("does not drop a leading 1 unless it's preceded by 11 total digits", () => {
    // A 10-digit number that happens to start with 1 (rare but possible
    // for some North American area codes; technically NANP disallows it,
    // but the formatter should respect what the user typed at <11 digits)
    expect(formatPhoneInput("1234567890")).toBe("(123) 456-7890");
  });
});
