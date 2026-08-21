import { createDrop } from "@/lib/drops";
import { apiError, handleApiError } from "@/lib/http";
import { consumeRateLimit, requestAddress } from "@/lib/rate-limit";
import { publishSchema } from "@/lib/schemas";
import { limits } from "@/lib/config";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!await consumeRateLimit("publish", requestAddress(request), limits.publishPerHour)) return apiError("Publishing limit reached. Try again later.", 429);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > limits.markdownBytes + 20_000) return apiError("The document is too large.", 413);
    const contentType = request.headers.get("content-type") || "";
    const input = contentType.includes("text/markdown")
      ? { markdown: await request.text(), title: request.headers.get("chit-title") || request.headers.get("said-title") || undefined, source: request.headers.get("chit-source") || request.headers.get("said-source") || undefined }
      : await request.json();
    const parsed = publishSchema.parse(input);
    const session = await auth.api.getSession({ headers: request.headers });
    const owner = session ? { id: session.user.id, name: session.user.name } : undefined;
    return Response.json(await createDrop(parsed, owner), { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return handleApiError(error); }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
