import { getDropBySlug, getDropOwnerName } from "@/lib/drops";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const drop = await getDropBySlug(slug); if (!drop) return apiError("Page not found or expired.", 404);
  const ownerName = await getDropOwnerName(drop.owner_id);
  return Response.json({ id:drop.id, slug:drop.slug, title:drop.title, markdown:drop.markdown, created_at:new Date(drop.created_at).toISOString(), expires_at:drop.expires_at ? new Date(drop.expires_at).toISOString() : null, claimed:Boolean(drop.claimed_at), owner:ownerName ? { name:ownerName } : null });
}
