import { db } from "@/lib/db";
import { hashAddress } from "@/lib/security";

export function requestAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export function consumeRateLimit(bucket: string, address: string, maximum: number) {
  const now = Date.now();
  const windowStart = Math.floor(now / 3_600_000) * 3_600_000;
  const addressHash = hashAddress(address);
  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM rate_limits WHERE window_start < ?").run(windowStart - 3_600_000);
    const row = db.prepare("SELECT count FROM rate_limits WHERE bucket = ? AND address_hash = ? AND window_start = ?")
      .get(bucket, addressHash, windowStart) as { count: number } | undefined;
    if (row && row.count >= maximum) return false;
    db.prepare(`INSERT INTO rate_limits (bucket, address_hash, window_start, count) VALUES (?, ?, ?, 1)
      ON CONFLICT(bucket, address_hash, window_start) DO UPDATE SET count = count + 1`)
      .run(bucket, addressHash, windowStart);
    return true;
  });
  return transaction();
}
