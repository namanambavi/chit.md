import { execute, productSchemaReady, queryOne } from "@/lib/db";
import { hashAddress } from "@/lib/security";

export function requestAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function consumeRateLimit(bucket: string, address: string, maximum: number) {
  await productSchemaReady;
  const windowStart = Math.floor(Date.now() / 3_600_000) * 3_600_000;
  const addressHash = hashAddress(address);
  await execute("DELETE FROM rate_limits WHERE window_start < ?", [windowStart - 3_600_000]);
  const row = await queryOne<{ count: number }>(`INSERT INTO rate_limits (bucket, address_hash, window_start, count) VALUES (?, ?, ?, 1)
    ON CONFLICT(bucket, address_hash, window_start) DO UPDATE SET count = rate_limits.count + 1
    RETURNING count`, [bucket, addressHash, windowStart]);
  return Number(row?.count || 1) <= maximum;
}
