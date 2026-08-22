import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { deleteOwnedDrop, getOwnedDrop, updateOwnedDrop } from "@/lib/drops";
import { captureServerEvent } from "@/lib/analytics";
import { apiError, handleApiError } from "@/lib/http";
import { updateDropSchema } from "@/lib/schemas";

export const runtime = "nodejs";

async function owner(slug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: apiError("Sign in to edit this chit.", 401) };
  const drop = await getOwnedDrop(slug, session.user.id);
  if (!drop) return { error: apiError("Page not found.", 404) };
  return { drop, session };
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const result = await owner(slug); if (result.error) return result.error;
  const drop = result.drop!;
  return Response.json({ drop: { slug:drop.slug,title:drop.title,markdown:drop.markdown,updated_at:new Date(drop.updated_at).toISOString() } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try { const { slug } = await params; const result = await owner(slug); if (result.error) return result.error; const input = updateDropSchema.parse(await request.json()); await updateOwnedDrop(slug, result.drop!.owner_id!, input); return Response.json({ updated:true,slug }); }
  catch (error) { return handleApiError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const result = await owner(slug);
    if (result.error) return result.error;

    const deleted = await deleteOwnedDrop(slug, result.session!.user.id);
    if (!deleted) return apiError("Page not found.", 404);

    await captureServerEvent({
      event: "chit_deleted",
      distinctId: `user:${result.session!.user.id}`,
      properties: { slug },
    });
    return Response.json({ deleted: true, slug });
  } catch (error) {
    return handleApiError(error);
  }
}
