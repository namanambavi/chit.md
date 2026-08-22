import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { queryOne } from "@/lib/db";

type Owner = { id: string; name: string };

export type RequestIdentity = {
  owner?: Owner;
  channel: "web" | "api";
  distinctId?: string;
  apiKeyId?: string;
  invalidCredential?: boolean;
};

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try { return new URL(origin).origin === new URL(appUrl()).origin; } catch { return false; }
}

function suppliedApiKey(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || "";
  }
  return request.headers.get("x-api-key")?.trim() || "";
}

export async function resolveRequestIdentity(request: Request): Promise<RequestIdentity> {
  const channel = isSameOrigin(request) ? "web" : "api";
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) return {
    owner: { id: session.user.id, name: session.user.name },
    channel,
    distinctId: `user:${session.user.id}`,
  };

  const key = suppliedApiKey(request);
  if (!key) return { channel, distinctId: request.headers.get("x-posthog-distinct-id") || undefined };

  const verified = await auth.api.verifyApiKey({ body: { key } });
  if (!verified.valid || !verified.key) return { channel, invalidCredential: true };
  const user = await queryOne<{ id: string; name: string }>(`SELECT id, name FROM "user" WHERE id = ?`, [verified.key.referenceId]);
  if (!user) return { channel, invalidCredential: true };
  return {
    owner: user,
    channel: "api",
    distinctId: `user:${user.id}`,
    apiKeyId: verified.key.id,
  };
}
