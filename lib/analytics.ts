import { PostHog } from "posthog-node";

type AnalyticsValue = string | number | boolean | null | undefined;

export async function captureServerEvent(input: {
  event: string;
  distinctId: string;
  properties?: Record<string, AnalyticsValue>;
}) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) return;

  const client = new PostHog(token, { host, flushAt: 1, flushInterval: 0 });
  try {
    client.capture({
      distinctId: input.distinctId,
      event: input.event,
      properties: input.properties,
    });
    await client.shutdown();
  } catch (error) {
    console.warn("Analytics event failed", error instanceof Error ? error.message : "Unknown error");
  }
}
