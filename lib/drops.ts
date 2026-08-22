import { nanoid } from "nanoid";
import { appUrl, limits } from "@/lib/config";
import { execute, productSchemaReady, purgeExpiredDrops, queryOne, queryRows, type Drop } from "@/lib/db";
import { hashToken, randomToken } from "@/lib/security";
import { titleFromMarkdown, type publishSchema } from "@/lib/schemas";
import type { z } from "zod";

type PublishInput = z.infer<typeof publishSchema>;
type DropOwner = { id: string; name: string };

export async function createDrop(input: PublishInput, owner?: DropOwner) {
  await productSchemaReady;
  await purgeExpiredDrops();
  const now = Date.now();
  const id = nanoid(16);
  const slug = nanoid(7);
  const claimToken = randomToken();
  const inboxToken = randomToken();
  const expiresAt = owner ? null : now + limits.anonymousTtlHours * 3_600_000;
  const title = input.title || titleFromMarkdown(input.markdown);

  await execute(`INSERT INTO drops (
    id, slug, title, markdown, created_at, updated_at, expires_at, claimed_at, owner_id,
    claim_token_hash, inbox_token_hash, callback_url, callback_secret, allow_responses, source, metadata
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [id, slug, title, input.markdown, now, now, expiresAt, owner ? now : null, owner?.id || null,
    hashToken(claimToken), hashToken(inboxToken), null, null, 0, input.source || null,
    JSON.stringify(input.metadata || {})]);

  const base = appUrl();
  return {
    id, slug, title,
    url: `${base}/${slug}`,
    markdown_url: `${base}/api/v1/drops/${slug}/markdown`,
    claim_url: owner ? null : `${base}/claim/${claimToken}`,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    owned: Boolean(owner), owner: owner ? { name: owner.name } : null,
  };
}

export async function getDropOwnerName(ownerId: string | null) {
  if (!ownerId) return null;
  const owner = await queryOne<{ name: string }>(`SELECT name FROM "user" WHERE id = ?`, [ownerId]);
  return owner?.name || null;
}

export async function getDropBySlug(slug: string, countView = false) {
  await purgeExpiredDrops();
  const found = await queryOne<Drop>("SELECT * FROM drops WHERE slug = ?", [slug]);
  if (!found) return null;
  const drop = normalizeDrop(found);
  if (!drop.claimed_at && drop.expires_at && drop.expires_at <= Date.now()) return null;
  if (countView) await execute("UPDATE drops SET view_count = view_count + 1 WHERE id = ?", [drop.id]);
  return drop;
}

export async function getDropByClaimToken(token: string) {
  await purgeExpiredDrops();
  const drop = await queryOne<Drop>("SELECT * FROM drops WHERE claim_token_hash = ?", [hashToken(token)]);
  return drop ? normalizeDrop(drop) : undefined;
}

export function isDropExpired(drop: Drop | undefined) {
  return !drop || Boolean(!drop.claimed_at && drop.expires_at && drop.expires_at <= Date.now());
}

export async function claimDrop(token: string, userId: string) {
  const drop = await getDropByClaimToken(token);
  if (!drop) return { ok: false as const, reason: "invalid" };
  if (drop.owner_id && drop.owner_id !== userId) return { ok: false as const, reason: "claimed" };
  if (!drop.owner_id && drop.expires_at && drop.expires_at <= Date.now()) return { ok: false as const, reason: "expired" };
  const now = Date.now();
  const changes = await execute(`UPDATE drops SET owner_id = ?, claimed_at = COALESCE(claimed_at, ?), expires_at = NULL, updated_at = ?
    WHERE id = ? AND (owner_id = ? OR (owner_id IS NULL AND expires_at > ?))`, [userId, now, now, drop.id, userId, now]);
  if (changes !== 1) return { ok: false as const, reason: "claimed" };
  return { ok: true as const, slug: drop.slug };
}

export async function listDropsForOwner(userId: string) {
  await purgeExpiredDrops();
  return (await queryRows<Drop>("SELECT * FROM drops WHERE owner_id = ? ORDER BY created_at DESC", [userId])).map(normalizeDrop);
}

export async function getOwnedDrop(slug: string, userId: string) {
  const drop = await queryOne<Drop>("SELECT * FROM drops WHERE slug = ? AND owner_id = ?", [slug, userId]);
  return drop ? normalizeDrop(drop) : undefined;
}

export async function updateOwnedDrop(slug: string, userId: string, input: { title: string; markdown: string }) {
  return (await execute("UPDATE drops SET title = ?, markdown = ?, updated_at = ? WHERE slug = ? AND owner_id = ?",
    [input.title, input.markdown, Date.now(), slug, userId])) === 1;
}

export async function deleteOwnedDrop(slug: string, userId: string) {
  return (await execute("DELETE FROM drops WHERE slug = ? AND owner_id = ?", [slug, userId])) === 1;
}

function normalizeDrop(drop: Drop): Drop {
  return {
    ...drop,
    created_at: Number(drop.created_at), updated_at: Number(drop.updated_at),
    expires_at: drop.expires_at === null ? null : Number(drop.expires_at),
    claimed_at: drop.claimed_at === null ? null : Number(drop.claimed_at),
    view_count: Number(drop.view_count), response_count: Number(drop.response_count),
  };
}
