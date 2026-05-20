import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/llms.txt/route";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function fetchBody() {
  const res = await GET();
  return {
    contentType: res.headers.get("content-type"),
    body: await res.text(),
  };
}

describe("llms.txt route (Live env)", () => {
  beforeEach(() => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
  });

  it("serves Markdown content", async () => {
    const { contentType } = await fetchBody();
    expect(contentType).toContain("text/markdown");
  });

  it("starts with the H1 site title and blockquote summary", async () => {
    const { body } = await fetchBody();
    const lines = body.split("\n");
    expect(lines[0]).toBe("# Fast Forward");
    expect(body).toMatch(/^> /m);
  });

  it("includes published project URLs", async () => {
    const { body } = await fetchBody();
    expect(body).toContain(
      "https://fastforward.sh/our-work/architecture-and-release-workflow",
    );
    expect(body).toContain(
      "https://fastforward.sh/our-work/real-time-advice-for-expectant-parents",
    );
  });

  it("excludes draft project URLs", async () => {
    const { body } = await fetchBody();
    expect(body).not.toContain("/our-work/building-fastforward-sh");
    expect(body).not.toContain("/our-work/growing-with-pantheon");
  });

  it("excludes the lab-project-sample scaffolding slug", async () => {
    const { body } = await fetchBody();
    expect(body).not.toContain("lab-project-sample");
  });

  it("uses the apex domain only (no www)", async () => {
    const { body } = await fetchBody();
    expect(body).not.toMatch(/www\.fastforward\.sh/);
    expect(body).toMatch(/https:\/\/fastforward\.sh/);
  });

  it("strips HTML from excerpts in descriptions", async () => {
    const { body } = await fetchBody();
    // real-time-advice has a legacy <p>-wrapped excerpt; the route should
    // emit the prose without the tags.
    expect(body).not.toMatch(/<p>/);
    expect(body).toContain("pregnancy resource from a printed booklet");
  });
});
