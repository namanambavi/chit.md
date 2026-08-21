import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databasePath = process.env.DATABASE_PATH
  ? path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data", "said.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const globalForDb = globalThis as unknown as { saidDb?: Database.Database };

export const db = globalForDb.saidDb ?? new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") globalForDb.saidDb = db;

export function initializeProductSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drops (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      markdown TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      expires_at INTEGER,
      claimed_at INTEGER,
      owner_id TEXT,
      claim_token_hash TEXT NOT NULL UNIQUE,
      inbox_token_hash TEXT NOT NULL UNIQUE,
      callback_url TEXT,
      callback_secret TEXT,
      allow_responses INTEGER NOT NULL DEFAULT 1,
      source TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      view_count INTEGER NOT NULL DEFAULT 0,
      response_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      drop_id TEXT NOT NULL,
      name TEXT,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      delivery_status TEXT NOT NULL DEFAULT 'pending',
      delivery_attempts INTEGER NOT NULL DEFAULT 0,
      delivered_at INTEGER,
      FOREIGN KEY(drop_id) REFERENCES drops(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS drops_owner_idx ON drops(owner_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS drops_expiry_idx ON drops(expires_at);
    CREATE INDEX IF NOT EXISTS responses_drop_idx ON responses(drop_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS expired_chits (
      slug TEXT PRIMARY KEY,
      expired_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      bucket TEXT NOT NULL,
      address_hash TEXT NOT NULL,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY(bucket, address_hash, window_start)
    );
  `);
}

export function purgeExpiredDrops(now = Date.now()) {
  return db.transaction(() => {
    db.prepare(`INSERT OR REPLACE INTO expired_chits (slug, expired_at)
      SELECT slug, expires_at FROM drops
      WHERE owner_id IS NULL AND expires_at IS NOT NULL AND expires_at <= ?`).run(now);
    const changes = db.prepare("DELETE FROM drops WHERE owner_id IS NULL AND expires_at IS NOT NULL AND expires_at <= ?").run(now).changes;
    db.prepare("DELETE FROM expired_chits WHERE expired_at < ?").run(now - 30 * 24 * 3_600_000);
    return changes;
  })();
}

export function isExpiredChitSlug(slug: string) {
  return Boolean(db.prepare("SELECT 1 FROM expired_chits WHERE slug = ?").get(slug));
}

initializeProductSchema();

export type Drop = {
  id: string;
  slug: string;
  title: string;
  markdown: string;
  created_at: number;
  updated_at: number;
  expires_at: number | null;
  claimed_at: number | null;
  owner_id: string | null;
  claim_token_hash: string;
  inbox_token_hash: string;
  callback_url: string | null;
  callback_secret: string | null;
  allow_responses: number;
  source: string | null;
  metadata: string;
  view_count: number;
  response_count: number;
};

export type DropResponse = {
  id: string;
  drop_id: string;
  name: string | null;
  message: string;
  created_at: number;
  delivery_status: string;
  delivery_attempts: number;
  delivered_at: number | null;
};
