import { describe, expect, it } from "vitest";
import { splitCallouts } from "@/lib/callouts";

describe("splitCallouts", () => {
  it("returns the whole string as one HTML segment when there are no markers", () => {
    expect(splitCallouts("<p>Hello</p>")).toEqual([
      { kind: "html", html: "<p>Hello</p>" },
    ]);
  });

  it("splits HTML around markers in document order", () => {
    const html =
      '<p>One</p>\n<div data-callout="five-fears"></div>\n<p>Two</p>\n<div data-callout="haiti-latency"></div>\n<p>Three</p>';
    expect(splitCallouts(html)).toEqual([
      { kind: "html", html: "<p>One</p>\n" },
      { kind: "callout", name: "five-fears" },
      { kind: "html", html: "\n<p>Two</p>\n" },
      { kind: "callout", name: "haiti-latency" },
      { kind: "html", html: "\n<p>Three</p>" },
    ]);
  });

  it("drops whitespace-only HTML between and around markers", () => {
    const html =
      '<div data-callout="five-fears"></div>\n\n<div data-callout="five-advantages"></div>\n';
    expect(splitCallouts(html)).toEqual([
      { kind: "callout", name: "five-fears" },
      { kind: "callout", name: "five-advantages" },
    ]);
  });

  it("tolerates whitespace inside the marker", () => {
    expect(splitCallouts('<div  data-callout="five-fears" > </div>')).toEqual([
      { kind: "callout", name: "five-fears" },
    ]);
  });

  it("throws on an unknown callout name so typos fail the build", () => {
    expect(() =>
      splitCallouts('<div data-callout="five-feers"></div>'),
    ).toThrow(/Unknown blog callout "five-feers"/);
  });

  it("leaves other data attributes alone", () => {
    const html = '<div data-foo="five-fears"></div>';
    expect(splitCallouts(html)).toEqual([{ kind: "html", html }]);
  });
});
