import { describe, expect, it } from "vitest";
import {
  AlertThrottle,
  buildReviewAlert,
  findRecipient,
  isReviewEvent,
} from "@/lib/review-alerts";
import { findUnfilledPlaceholders, resolveEmbeds, validateReview } from "@/lib/content";
import type { Principal, Review } from "@/lib/types";

const REVIEW: Review = {
  title: "Five quick wins for acme.example",
  slug: "acme",
  date: "2026-11-02T12:00:00",
  principal: "jason",
  prospect: { name: "Acme <Corp>" },
  recipients: [
    { id: "k7f2q9mx", name: "Jane Doe", title: "VP Marketing" },
    { id: "m3x8p1aa", name: "Raj Patel" },
  ],
};

const PRINCIPAL: Principal = {
  id: "jason",
  name: "Jason Yarrington",
  email: "jason@fastforward.sh",
  slackUserId: "U0123ABC",
};

const base = {
  review: REVIEW,
  principal: PRINCIPAL,
  environment: "live",
  siteUrl: "https://fastforward.sh/",
};

describe("isReviewEvent", () => {
  it("accepts known events and rejects everything else", () => {
    expect(isReviewEvent("view")).toBe(true);
    expect(isReviewEvent("contact:chat")).toBe(true);
    expect(isReviewEvent("contact:slack")).toBe(false);
    expect(isReviewEvent("contact:fax")).toBe(false);
    expect(isReviewEvent(undefined)).toBe(false);
  });
});

describe("findRecipient", () => {
  it("matches by id", () => {
    expect(findRecipient(REVIEW, "m3x8p1aa")?.name).toBe("Raj Patel");
    expect(findRecipient(REVIEW, "nope")).toBeUndefined();
  });
});

describe("buildReviewAlert", () => {
  it("names a known recipient, links the review, and @-mentions the principal", () => {
    const { text } = buildReviewAlert({ ...base, visitorId: "k7f2q9mx", event: "view" });
    expect(text).toBe(
      "👀 *Jane Doe* (VP Marketing) opened <https://fastforward.sh/review/acme|Five quick wins for acme.example> (Acme &lt;Corp&gt;) · <@U0123ABC>",
    );
  });

  it("omits the title when the recipient has none", () => {
    const { text } = buildReviewAlert({ ...base, visitorId: "m3x8p1aa", event: "view" });
    expect(text).toContain("*Raj Patel* opened");
  });

  it("reports an unrecognised visitor ID, escaped", () => {
    const { text } = buildReviewAlert({ ...base, visitorId: "x<y", event: "view" });
    expect(text).toContain("Unrecognised visitor ID `x&lt;y` opened");
  });

  it("describes each contact event", () => {
    const say = (event: Parameters<typeof buildReviewAlert>[0]["event"]) =>
      buildReviewAlert({ ...base, visitorId: "k7f2q9mx", event }).text;
    expect(say("contact:email")).toContain("💬 *Jane Doe* (VP Marketing) clicked *Email* on");
    expect(say("contact:linkedin")).toContain("clicked *LinkedIn* on");
    expect(say("contact:chat")).toContain("started a *live chat* on");
  });

  it("prefixes non-Live environments", () => {
    const { text } = buildReviewAlert({ ...base, environment: "test", visitorId: "k7f2q9mx", event: "view" });
    expect(text.startsWith("[test] 👀")).toBe(true);
  });

  it("skips the mention when the principal has no Slack ID", () => {
    const { text } = buildReviewAlert({
      ...base,
      principal: { ...PRINCIPAL, slackUserId: "" },
      visitorId: "k7f2q9mx",
      event: "view",
    });
    expect(text).not.toContain("<@");
  });
});

describe("AlertThrottle", () => {
  it("allows one alert per key per window", () => {
    const t = new AlertThrottle(1000);
    expect(t.allow("a", 0)).toBe(true);
    expect(t.allow("a", 500)).toBe(false);
    expect(t.allow("b", 500)).toBe(true);
    expect(t.allow("a", 1000)).toBe(true);
  });
});

describe("validateReview", () => {
  // `jason` is a real entry in content/principals.yml.
  it("accepts a well-formed review", () => {
    expect(() => validateReview(REVIEW)).not.toThrow();
  });

  it("rejects an unknown principal", () => {
    expect(() => validateReview({ ...REVIEW, principal: "nobody" })).toThrow(
      /principal "nobody" is not in content\/principals.yml/,
    );
  });

  it("rejects duplicate recipient IDs", () => {
    const recipients = [
      { id: "k7f2q9mx", name: "A" },
      { id: "k7f2q9mx", name: "B" },
    ];
    expect(() => validateReview({ ...REVIEW, recipients })).toThrow(/used twice/);
  });

  it("rejects malformed recipient IDs and slugs", () => {
    expect(() =>
      validateReview({ ...REVIEW, recipients: [{ id: "Bad ID", name: "A" }] }),
    ).toThrow(/must be 6-32 lowercase/);
    expect(() => validateReview({ ...REVIEW, slug: "acme/review" })).toThrow(/kebab-case/);
  });
});

describe("unfilled placeholders (class=\"fill\")", () => {
  const withFill: Review = {
    ...REVIEW,
    pageSections: [
      { type: "HtmlEmbed", src: "x/diagram.html", html: '<section><dd><span class="fill">[Result]</span></dd><p class="note fill big">[Client]</p></section>' },
      { type: "Prose", html: "<p>Done.</p>" },
    ],
  };

  it("finds every placeholder's text, across embeds and prose", () => {
    expect(findUnfilledPlaceholders(withFill)).toEqual(["[Result]", "[Client]"]);
    expect(findUnfilledPlaceholders(REVIEW)).toEqual([]);
  });

  it("ignores classes that merely contain 'fill'", () => {
    const r: Review = { ...REVIEW, pageSections: [{ type: "Prose", html: '<p class="refill">x</p><p class="fill-light">y</p>' }] };
    expect(findUnfilledPlaceholders(r)).toEqual([]);
  });

  it("allows them in a draft but blocks publishing", () => {
    expect(() => validateReview({ ...withFill, draft: true })).not.toThrow();
    expect(() => validateReview({ ...withFill, draft: false })).toThrow(
      /can't publish with 2 unfilled placeholder\(s\).*\[Result\] \| \[Client\]/,
    );
  });
});

describe("resolveEmbeds", () => {
  it("refuses paths outside content/reviews/ and non-.html files", () => {
    expect(() => resolveEmbeds([{ type: "HtmlEmbed", src: "../pages/accessibility.mdx" }], "t")).toThrow(/must be an \.html file under content\/reviews/);
    expect(() => resolveEmbeds([{ type: "HtmlEmbed", src: "../../package.json" }], "t")).toThrow(/must be an \.html file/);
    expect(() => resolveEmbeds([{ type: "HtmlEmbed", src: "nope/missing.html" }], "t")).toThrow(/not found/);
  });
});
