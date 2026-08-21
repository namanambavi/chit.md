import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOwnedDrop, updateOwnedDrop } from "@/lib/drops";
import { apiError, handleApiError } from "@/lib/http";
import { updateDropSchema } from "@/lib/schemas";

export const runtime = "nodejs";

async function owner(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: apiError("Sign in to edit this chit.", 401) };
  const drop = getOwnedDrop(slug, session.user.id);
  if (!drop) return { error: apiError("Page not found.", 404) };
  return { drop };
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const result = await owner(slug); if (result.error) return result.error;
  const drop = result.drop!;
  return Response.json({ drop: { slug:drop.slug,title:drop.title,markdown:drop.markdown,updated_at:new Date(drop.updated_at).toISOString() } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try { const { slug } = await params; const result = await owner(slug); if (result.error) return result.error; const input = updateDropSchema.parse(await request.json()); updateOwnedDrop(slug, result.drop!.owner_id!, input); return Response.json({ updated:true,slug }); }
  catch (error) { return handleApiError(error); }
}
