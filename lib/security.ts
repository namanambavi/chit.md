import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(token: string, hash: string) {
  const candidate = Buffer.from(hashToken(token));
  const expected = Buffer.from(hash);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function hashAddress(value: string) {
  const salt = process.env.BETTER_AUTH_SECRET || "said-local-development";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}
