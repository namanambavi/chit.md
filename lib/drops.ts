import { nanoid } from "nanoid";
import { appUrl, limits } from "@/lib/config";
import { db, purgeExpiredDrops, type Drop } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/security";
import { titleFromMarkdown, type publishSchema } from "@/lib/schemas";
import type { z } from "zod";

type PublishInput = z.infer<typeof publishSchema>;
type DropOwner = { id: string; name: string };

export function createDrop(input: PublishInput, owner?: DropOwner) {
  purgeExpiredDrops();
  const now = Date.now();
  const id = nanoid(16);
  const slug = nanoid(7);
  const claimToken = randomToken();
  const inboxToken = randomToken();
  const expiresAt = owner ? null : now + limits.anonymousTtlHours * 3_600_000;
  const title = input.title || titleFromMarkdown(input.markdown);

  db.prepare(`INSERT INTO drops (
    id, slug, title, markdown, created_at, updated_at, expires_at, claimed_at, owner_id,
    claim_token_hash, inbox_token_hash, callback_url, callback_secret, allow_responses, source, metadata
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, slug, title, input.markdown, now, now, expiresAt, owner ? now : null, owner?.id || null,
      hashToken(claimToken), hashToken(inboxToken), null, null, 0, input.source || null,
      JSON.stringify(input.metadata || {}));

  const base = appUrl();
  return {
    id,
    slug,
    title,
    url: `${base}/${slug}`,
    markdown_url: `${base}/api/v1/drops/${slug}/markdown`,
    claim_url: owner ? null : `${base}/claim/${claimToken}`,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    owned: Boolean(owner),
    owner: owner ? { name: owner.name } : null,
  };
}

export function getDropOwnerName(ownerId: string | null) {
  if (!ownerId) return null;
  const owner = db.prepare(`SELECT name FROM "user" WHERE id = ?`).get(ownerId) as { name: string } | undefined;
  return owner?.name || null;
}

export function getDropBySlug(slug: string, countView = false) {
  purgeExpiredDrops();
  const drop = db.prepare("SELECT * FROM drops WHERE slug = ?").get(slug) as Drop | undefined;
  if (!drop || (!drop.claimed_at && drop.expires_at && drop.expires_at <= Date.now())) return null;
  if (countView) db.prepare("UPDATE drops SET view_count = view_count + 1 WHERE id = ?").run(drop.id);
  return drop;
}

export function getDropByClaimToken(token: string) {
  purgeExpiredDrops();
  return db.prepare("SELECT * FROM drops WHERE claim_token_hash = ?").get(hashToken(token)) as Drop | undefined;
}

export function isDropExpired(drop: Drop | undefined) {
  return !drop || Boolean(!drop.claimed_at && drop.expires_at && drop.expires_at <= Date.now());
}

export function claimDrop(token: string, userId: string) {
  const drop = getDropByClaimToken(token);
  if (!drop) return { ok: false as const, reason: "invalid" };
  if (drop.owner_id && drop.owner_id !== userId) return { ok: false as const, reason: "claimed" };
  if (!drop.owner_id && drop.expires_at && drop.expires_at <= Date.now()) return { ok: false as const, reason: "expired" };
  const now = Date.now();
  const result = db.prepare(`UPDATE drops SET owner_id = ?, claimed_at = COALESCE(claimed_at, ?), expires_at = NULL, updated_at = ?
    WHERE id = ? AND (owner_id = ? OR (owner_id IS NULL AND expires_at > ?))`)
    .run(userId, now, now, drop.id, userId, now);
  if (result.changes !== 1) return { ok: false as const, reason: "claimed" };
  return { ok: true as const, slug: drop.slug };
}

export function listDropsForOwner(userId: string) {
  purgeExpiredDrops();
  return db.prepare("SELECT * FROM drops WHERE owner_id = ? ORDER BY created_at DESC").all(userId) as Drop[];
}

export function getOwnedDrop(slug: string, userId: string) {
  return db.prepare("SELECT * FROM drops WHERE slug = ? AND owner_id = ?").get(slug, userId) as Drop | undefined;
}

export function updateOwnedDrop(slug: string, userId: string, input: { title: string; markdown: string }) {
  const result = db.prepare("UPDATE drops SET title = ?, markdown = ?, updated_at = ? WHERE slug = ? AND owner_id = ?")
    .run(input.title, input.markdown, Date.now(), slug, userId);
  return result.changes === 1;
}
