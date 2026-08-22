"use client";

import posthog from "posthog-js";

export function captureClientEvent(event: string, properties?: Record<string, string | number | boolean | null>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(event, properties);
}

export function identifyClientUser(userId: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.identify(`user:${userId}`);
}

export function resetClientAnalytics() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.reset();
}
