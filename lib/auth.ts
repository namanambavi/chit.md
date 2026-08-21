import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins";
import { db } from "@/lib/db";
import { emailDeliveryConfigured, sendAuthEmail } from "@/lib/email";

function configuredSecret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build") return "chit-build-only-secret-not-used-at-runtime";
  if (process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_SECRET is required in production.");
  return "chit-local-development-secret-change-me";
}

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const canSendEmail = emailDeliveryConfigured();

export const authFeatures = {
  github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  emailDelivery: canSendEmail,
};

function sendInBackground(input: Parameters<typeof sendAuthEmail>[0]) {
  void sendAuthEmail(input).catch((error) => console.error("Authentication email failed", error));
}

export const auth = betterAuth({
  appName: "chit.md",
  database: db,
  secret: configuredSecret(),
  baseURL,
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: canSendEmail,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: canSendEmail ? async ({ user, url }) => sendInBackground({
      to: user.email, subject: "Reset your chit.md password", intro: "Use this link to choose a new password.", action: "Reset password", url,
    }) : undefined,
  },
  emailVerification: canSendEmail ? {
    sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => sendInBackground({
      to: user.email, subject: "Verify your chit.md email", intro: "One click and your chit.md account is ready.", action: "Verify email", url,
    }),
  } : undefined,
  socialProviders: {
    ...(authFeatures.github ? { github: { clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! } } : {}),
    ...(authFeatures.google ? { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, prompt: "select_account" as const } } : {}),
  },
  account: { accountLinking: { enabled: true, trustedProviders: ["google", "github"] } },
  plugins: [bearer(), nextCookies()],
});
