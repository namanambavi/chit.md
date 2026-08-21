import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Pool, type QueryResultRow } from "pg";

type ProductDatabase = Database.Database | Pool;
const connectionString = process.env.DATABASE_URL;
export const usesPostgres = Boolean(connectionString);
const globalForDb = globalThis as unknown as { chitDb?: ProductDatabase };

function createDatabase(): ProductDatabase {
  if (connectionString) {
    return new Pool({ connectionString, max: Number(process.env.DATABASE_POOL_MAX || 10), idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 });
  }
  const databasePath = process.env.DATABASE_PATH
    ? path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH)
    : path.join(process.cwd(), "data", "chit.db");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

export const db = globalForDb.chitDb ?? createDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.chitDb = db;

function postgresSql(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function queryRows<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<T[]> {
  if (db instanceof Pool) return (await db.query<T>(postgresSql(sql), values)).rows;
  return db.prepare(sql).all(...values) as T[];
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<T | undefined> {
  if (db instanceof Pool) return (await db.query<T>(postgresSql(sql), values)).rows[0];
  return db.prepare(sql).get(...values) as T | undefined;
}

export async function execute(sql: string, values: unknown[] = []): Promise<number> {
  if (db instanceof Pool) return (await db.query(postgresSql(sql), values)).rowCount || 0;
  return db.prepare(sql).run(...values).changes;
}

const productSchema = usesPostgres ? `
  CREATE TABLE IF NOT EXISTS drops (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, markdown TEXT NOT NULL,
    created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL, expires_at BIGINT, claimed_at BIGINT,
    owner_id TEXT, claim_token_hash TEXT NOT NULL UNIQUE, inbox_token_hash TEXT NOT NULL UNIQUE,
    callback_url TEXT, callback_secret TEXT, allow_responses INTEGER NOT NULL DEFAULT 0, source TEXT,
    metadata TEXT NOT NULL DEFAULT '{}', view_count INTEGER NOT NULL DEFAULT 0, response_count INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS drops_owner_idx ON drops(owner_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS drops_expiry_idx ON drops(expires_at);
  CREATE TABLE IF NOT EXISTS expired_chits (slug TEXT PRIMARY KEY, expired_at BIGINT NOT NULL);
  CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT NOT NULL, address_hash TEXT NOT NULL, window_start BIGINT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(bucket, address_hash, window_start)
  );
` : `
  CREATE TABLE IF NOT EXISTS drops (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, markdown TEXT NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, expires_at INTEGER, claimed_at INTEGER,
    owner_id TEXT, claim_token_hash TEXT NOT NULL UNIQUE, inbox_token_hash TEXT NOT NULL UNIQUE,
    callback_url TEXT, callback_secret TEXT, allow_responses INTEGER NOT NULL DEFAULT 0, source TEXT,
    metadata TEXT NOT NULL DEFAULT '{}', view_count INTEGER NOT NULL DEFAULT 0, response_count INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS drops_owner_idx ON drops(owner_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS drops_expiry_idx ON drops(expires_at);
  CREATE TABLE IF NOT EXISTS expired_chits (slug TEXT PRIMARY KEY, expired_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT NOT NULL, address_hash TEXT NOT NULL, window_start INTEGER NOT NULL,
    count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(bucket, address_hash, window_start)
  );
`;

export async function initializeProductSchema() {
  if (db instanceof Pool) await db.query(productSchema);
  else db.exec(productSchema);
}

export const productSchemaReady = initializeProductSchema();

export async function purgeExpiredDrops(now = Date.now()) {
  await productSchemaReady;
  if (db instanceof Pool) {
    const result = await db.query(`
      WITH expired AS (
        DELETE FROM drops WHERE owner_id IS NULL AND expires_at IS NOT NULL AND expires_at <= $1
        RETURNING slug, expires_at
      )
      INSERT INTO expired_chits (slug, expired_at)
      SELECT slug, expires_at FROM expired
      ON CONFLICT (slug) DO UPDATE SET expired_at = EXCLUDED.expired_at
      RETURNING slug
    `, [now]);
    await db.query("DELETE FROM expired_chits WHERE expired_at < $1", [now - 30 * 24 * 3_600_000]);
    return result.rowCount || 0;
  }
  return db.transaction(() => {
    db.prepare(`INSERT OR REPLACE INTO expired_chits (slug, expired_at)
      SELECT slug, expires_at FROM drops WHERE owner_id IS NULL AND expires_at IS NOT NULL AND expires_at <= ?`).run(now);
    const changes = db.prepare("DELETE FROM drops WHERE owner_id IS NULL AND expires_at IS NOT NULL AND expires_at <= ?").run(now).changes;
    db.prepare("DELETE FROM expired_chits WHERE expired_at < ?").run(now - 30 * 24 * 3_600_000);
    return changes;
  })();
}

export async function isExpiredChitSlug(slug: string) {
  await productSchemaReady;
  return Boolean(await queryOne("SELECT 1 FROM expired_chits WHERE slug = ?", [slug]));
}

export type Drop = {
  id: string; slug: string; title: string; markdown: string; created_at: number; updated_at: number;
  expires_at: number | null; claimed_at: number | null; owner_id: string | null;
  claim_token_hash: string; inbox_token_hash: string; callback_url: string | null; callback_secret: string | null;
  allow_responses: number; source: string | null; metadata: string; view_count: number; response_count: number;
};
