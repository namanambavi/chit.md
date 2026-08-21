import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { hashToken, randomToken, tokensMatch } from "@/lib/security";
import { publishSchema, titleFromMarkdown } from "@/lib/schemas";
import { safeInternalPath } from "@/lib/navigation";
import { formatExpiryCompact, formatExpiryRemaining } from "@/lib/expiry";

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

  it("publishes, reads, and claims a page", () => {
    const published = drops.createDrop({ markdown: "# Decision\n\nChoose A or B." });
    expect(published.url).toContain(`/${published.slug}`);
    expect(published).not.toHaveProperty("inbox_url");

    const drop = drops.getDropBySlug(published.slug);
    expect(drop?.title).toBe("Decision");

    expect(published.claim_url).not.toBeNull();
    const claimToken = published.claim_url!.split("/").at(-1)!;
    expect(drops.claimDrop(claimToken, "user-1")).toEqual({ ok: true, slug: published.slug });
    expect(drops.getDropBySlug(published.slug)?.expires_at).toBeNull();
  });

  it("saves authenticated publishes directly to their owner", () => {
    const published = drops.createDrop({ markdown: "# Account note" }, { id: "user-42", name: "Ada" });
    const drop = drops.getDropBySlug(published.slug);
    expect(published).toMatchObject({ owned: true, owner: { name: "Ada" }, claim_url: null, expires_at: null });
    expect(drop?.owner_id).toBe("user-42");
    expect(drop?.claimed_at).not.toBeNull();
  });

  it("physically removes expired unclaimed content", async () => {
    const published = drops.createDrop({ markdown: "# Temporary" });
    const { db } = await import("@/lib/db");
    db.prepare("UPDATE drops SET expires_at = ? WHERE slug = ?").run(Date.now() - 1, published.slug);
    expect(drops.getDropBySlug(published.slug)).toBeNull();
    expect(db.prepare("SELECT id FROM drops WHERE slug = ?").get(published.slug)).toBeUndefined();
    expect(db.prepare("SELECT slug FROM expired_chits WHERE slug = ?").get(published.slug)).toEqual({ slug: published.slug });
  });

  it("does not allow a second user to steal a claimed page", () => {
    const published = drops.createDrop({ markdown: "# Ownership" });
    expect(published.claim_url).not.toBeNull();
    const claimToken = published.claim_url!.split("/").at(-1)!;
    expect(drops.claimDrop(claimToken, "owner-a").ok).toBe(true);
    expect(drops.claimDrop(claimToken, "owner-b")).toEqual({ ok:false, reason:"claimed" });
    expect(drops.getDropBySlug(published.slug)?.owner_id).toBe("owner-a");
  });
});
