export const APP_NAME = "chit.md";

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const limits = {
  markdownBytes: 256_000,
  titleLength: 120,
  anonymousTtlHours: 24,
  publishPerHour: 30,
} as const;
