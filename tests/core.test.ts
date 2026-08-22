import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { hashToken, randomToken, tokensMatch } from "@/lib/security";
import { publishSchema, titleFromMarkdown } from "@/lib/schemas";
import { safeInternalPath } from "@/lib/navigation";
import { formatExpiryCompact, formatExpiryRemaining } from "@/lib/expiry";
import { docsMarkdown } from "@/lib/docs-content";
import { preferredRepresentation } from "@/lib/accept";
import { apiError, handleApiError } from "@/lib/http";
import { agentReadinessCopy, homepageMarkdown, notFoundMarkdown, softwareApplicationJsonLd } from "@/lib/public-content";

const testDirectory = path.join(process.cwd(), "work");
const testDatabase = path.join(testDirectory, "said-test.db");
process.env.DATABASE_PATH = testDatabase;
process.env.NEXT_PUBLIC_APP_URL = "http://said.test";

describe("capability security", () => {
  it("creates non-guessable tokens and compares only their hashes", () => {
    const token = randomToken();
    expect(token.length).toBeGreaterThan(30);
    expect(tokensMatch(token, hashToken(token))).toBe(true);
    expect(tokensMatch(`${token}x`, hashToken(token))).toBe(false);
  });
});

describe("input contract", () => {
  it("derives a useful title from the first heading", () => {
    expect(titleFromMarkdown("# Review this plan\n\nBody")).toBe("Review this plan");
  });

  it("allows only same-origin auth return paths", () => {
    expect(safeInternalPath("/claim/token")).toBe("/claim/token");
    expect(safeInternalPath("javascript:alert(1)")).toBe("/dashboard");
    expect(safeInternalPath("//evil.example/path")).toBe("/dashboard");
  });

  it("rejects retired response and callback options", () => {
    expect(() => publishSchema.parse({ markdown: "# Hi", allow_responses: true })).toThrow();
    expect(() => publishSchema.parse({ markdown: "# Hi", callback_url: "https://example.com" })).toThrow();
  });

  it("gives agents one canonical account credential", () => {
    expect(docsMarkdown).toContain("CHIT_API_KEY");
    expect(docsMarkdown).toContain("Agent access");
    expect(docsMarkdown).not.toContain("CHIT_SESSION_TOKEN");
  });
});

describe("agent-readable HTTP contracts", () => {
  it("negotiates Markdown using q-values, specificity, and client order", () => {
    expect(preferredRepresentation(null)).toBe("text/html");
    expect(preferredRepresentation("text/markdown, text/html;q=0.8")).toBe("text/markdown");
    expect(preferredRepresentation("text/markdown;q=0, text/html, */*;q=1")).toBe("text/html");
    expect(preferredRepresentation("application/pdf")).toBeNull();
  });

  it("serves substantial homepage guidance and a recoverable Markdown 404", () => {
    const homepage = homepageMarkdown("https://chit.md");
    expect(homepage.length).toBeGreaterThan(500);
    expect(Object.values(agentReadinessCopy).join(" ").length).toBeGreaterThan(500);
    expect(homepage).toContain("## When to use chit.md");
    expect(homepage).toContain("https://chit.md/openapi.json");
    expect(notFoundMarkdown("https://chit.md")).toContain("https://chit.md/llms.txt");
  });

  it("publishes parseable SoftwareApplication JSON-LD", () => {
    expect(softwareApplicationJsonLd("https://chit.md")).toMatchObject({ "@type": "SoftwareApplication", name: "chit.md", url: "https://chit.md" });
  });

  it("returns structured JSON errors with recovery guidance", async () => {
    const response = apiError("Missing.", 404);
    await expect(response.json()).resolves.toMatchObject({ error: "Missing.", message: "Missing.", code: "NOT_FOUND", hint: expect.any(String) });
    const invalidJson = handleApiError(new SyntaxError("bad JSON"));
    await expect(invalidJson.json()).resolves.toMatchObject({ code: "INVALID_REQUEST" });
  });

  it("publishes discoverable machine-readable resources", async () => {
    const [{ GET: getLlms }, { GET: getSkill }, { GET: getAgentManifest }, { GET: getUnknownApi }] = await Promise.all([
      import("@/app/llms.txt/route"),
      import("@/app/skill.md/route"),
      import("@/app/.well-known/agent.json/route"),
      import("@/app/api/[...path]/route"),
    ]);
    expect(await getLlms().text()).toContain("## When to use chit.md");
    const skill = getSkill();
    expect(skill.headers.get("content-type")).toContain("text/markdown");
    expect(await skill.text()).toContain("## When to use this");
    await expect(getAgentManifest().json()).resolves.toMatchObject({ name: "chit.md", openapi_url: expect.stringContaining("/openapi.json") });
    await expect(getUnknownApi().json()).resolves.toMatchObject({ code: "NOT_FOUND", hint: expect.any(String) });
  });
});

describe("composer presentation", () => {
  it("uses compact route chrome instead of the full site navigation", () => {
    const page = fs.readFileSync(path.join(process.cwd(), "app/new/page.tsx"), "utf8");
    const form = fs.readFileSync(path.join(process.cwd(), "components/new-drop-form.tsx"), "utf8");

    expect(page).not.toContain("<Nav");
    expect(page).toContain("<AnalyticsIdentity");
    expect(form).toContain('className="composer-back"');
    expect(form).toContain('placeholder="Untitled chit"');
    expect(form).toMatch(/composer-head[\s\S]*title-field[\s\S]*composer-actions/);

    const editor = fs.readFileSync(path.join(process.cwd(), "components/markdown-editor.tsx"), "utf8");
    expect(editor).toContain('const narrowViewportQuery = "(max-width: 900px)"');
    expect(editor).toContain('className="format-inserts"');
  });

  it("restores visible markers for rendered ordered and unordered lists", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toMatch(/\.markdown-rendered ul\s*\{\s*list-style:\s*disc;/);
    expect(css).toMatch(/\.markdown-rendered ol\s*\{\s*list-style:\s*decimal;/);
    expect(css).toContain(".markdown-rendered .task-list-item { list-style: none; }");
  });
});

describe("expiry copy", () => {
  it("moves from hours to minutes to seconds", () => {
    expect(formatExpiryRemaining(24 * 3_600_000)).toBe("Expires in 24 hours");
    expect(formatExpiryRemaining(12 * 60_000)).toBe("Expires in 12 minutes");
    expect(formatExpiryRemaining(45_000)).toBe("Expires in 45 seconds");
    expect(formatExpiryRemaining(0)).toBe("Expired");
    expect(formatExpiryCompact(12 * 60_000)).toBe("12m");
  });
});

describe("drop lifecycle", () => {
  let drops: typeof import("@/lib/drops");

  beforeAll(async () => {
    fs.mkdirSync(testDirectory, { recursive: true });
    for (const suffix of ["", "-shm", "-wal"]) fs.rmSync(`${testDatabase}${suffix}`, { force: true });
    drops = await import("@/lib/drops");
  });

  afterAll(() => {
    for (const suffix of ["", "-shm", "-wal"]) fs.rmSync(`${testDatabase}${suffix}`, { force: true });
  });

  it("publishes, reads, and claims a page", async () => {
    const published = await drops.createDrop({ markdown: "# Decision\n\nChoose A or B." });
    expect(published.url).toContain(`/${published.slug}`);
    expect(published).not.toHaveProperty("inbox_url");

    const drop = await drops.getDropBySlug(published.slug);
    expect(drop?.title).toBe("Decision");

    expect(published.claim_url).not.toBeNull();
    const claimToken = published.claim_url!.split("/").at(-1)!;
    expect(await drops.claimDrop(claimToken, "user-1")).toEqual({ ok: true, slug: published.slug });
    expect((await drops.getDropBySlug(published.slug))?.expires_at).toBeNull();
  });

  it("saves authenticated publishes directly to their owner", async () => {
    const published = await drops.createDrop({ markdown: "# Account note" }, { id: "user-42", name: "Ada" });
    const drop = await drops.getDropBySlug(published.slug);
    expect(published).toMatchObject({ owned: true, owner: { name: "Ada" }, claim_url: null, expires_at: null });
    expect(drop?.owner_id).toBe("user-42");
    expect(drop?.claimed_at).not.toBeNull();
  });

  it("physically removes expired unclaimed content", async () => {
    const published = await drops.createDrop({ markdown: "# Temporary" });
    const { execute, queryOne } = await import("@/lib/db");
    await execute("UPDATE drops SET expires_at = ? WHERE slug = ?", [Date.now() - 1, published.slug]);
    expect(await drops.getDropBySlug(published.slug)).toBeNull();
    expect(await queryOne("SELECT id FROM drops WHERE slug = ?", [published.slug])).toBeUndefined();
    expect(await queryOne("SELECT slug FROM expired_chits WHERE slug = ?", [published.slug])).toEqual({ slug: published.slug });
  });

  it("does not allow a second user to steal a claimed page", async () => {
    const published = await drops.createDrop({ markdown: "# Ownership" });
    expect(published.claim_url).not.toBeNull();
    const claimToken = published.claim_url!.split("/").at(-1)!;
    expect((await drops.claimDrop(claimToken, "owner-a")).ok).toBe(true);
    expect(await drops.claimDrop(claimToken, "owner-b")).toEqual({ ok:false, reason:"claimed" });
    expect((await drops.getDropBySlug(published.slug))?.owner_id).toBe("owner-a");
  });

  it("deletes only the owner's chit", async () => {
    const published = await drops.createDrop({ markdown: "# Delete me" }, { id: "owner-a", name: "Ada" });

    expect(await drops.deleteOwnedDrop(published.slug, "owner-b")).toBe(false);
    expect(await drops.getDropBySlug(published.slug)).not.toBeNull();

    expect(await drops.deleteOwnedDrop(published.slug, "owner-a")).toBe(true);
    expect(await drops.getDropBySlug(published.slug)).toBeNull();
    expect(await drops.deleteOwnedDrop(published.slug, "owner-a")).toBe(false);
  });

  it("serves canonical Markdown and a recoverable Markdown 404", async () => {
    const published = await drops.createDrop({ markdown: "# Negotiated chit" }, { id: "owner-a", name: "Ada" });
    const { GET } = await import("@/app/api/markdown/[[...path]]/route");

    const found = await GET(new Request("http://said.test/"), { params: Promise.resolve({ path: [published.slug] }) });
    expect(found.status).toBe(200);
    expect(found.headers.get("content-type")).toContain("text/markdown");
    expect(found.headers.get("vary")).toBe("Accept");
    expect(await found.text()).toBe("# Negotiated chit");

    const missing = await GET(new Request("http://said.test/"), { params: Promise.resolve({ path: ["missing-chit"] }) });
    expect(missing.status).toBe(404);
    expect(await missing.text()).toContain("/llms.txt");
  });
});
