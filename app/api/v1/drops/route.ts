import { createDrop } from "@/lib/drops";
import { apiError, handleApiError } from "@/lib/http";
import { consumeRateLimit, requestAddress } from "@/lib/rate-limit";
import { publishSchema } from "@/lib/schemas";
import { limits } from "@/lib/config";
import { resolveRequestIdentity } from "@/lib/request-identity";
import { captureServerEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const identity = await resolveRequestIdentity(request);
    if (identity.invalidCredential) return apiError("This agent key is not valid. Create a new key or publish without authentication.", 401);
    if (!identity.apiKeyId && !await consumeRateLimit("publish", requestAddress(request), limits.publishPerHour)) return apiError("Publishing limit reached. Try again later.", 429);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > limits.markdownBytes + 20_000) return apiError("The document is too large.", 413);
    const contentType = request.headers.get("content-type") || "";
    const input = contentType.includes("text/markdown")
      ? { markdown: await request.text(), title: request.headers.get("chit-title") || request.headers.get("said-title") || undefined, source: request.headers.get("chit-source") || request.headers.get("said-source") || undefined }
      : await request.json();
    const parsed = publishSchema.parse(input);
    const published = await createDrop(parsed, identity.owner);
    await captureServerEvent({
      event: "chit_created",
      distinctId: identity.distinctId || `drop:${published.id}`,
      properties: {
        channel: identity.channel,
        ownership: identity.owner ? "account" : "anonymous",
        credential: identity.apiKeyId ? "agent_key" : identity.owner ? "session" : "none",
        title_present: Boolean(parsed.title),
        markdown_size_bucket: parsed.markdown.length < 1_000 ? "under_1k" : parsed.markdown.length < 10_000 ? "1k_10k" : parsed.markdown.length < 100_000 ? "10k_100k" : "100k_plus",
      },
    });
    return Response.json(published, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return handleApiError(error); }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
