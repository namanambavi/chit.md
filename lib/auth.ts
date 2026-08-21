import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins";
import { db } from "@/lib/db";

function configuredSecret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build") return "said-build-only-secret-not-used-at-runtime";
  if (process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_SECRET is required in production.");
  return "said-local-development-secret-change-me";
}

export const auth = betterAuth({
  database: db,
  secret: configuredSecret(),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: { enabled: true },
  plugins: [bearer(), nextCookies()],
});
