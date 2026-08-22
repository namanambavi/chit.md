import { getDropBySlug } from "@/lib/drops";
import { captureServerEvent } from "@/lib/analytics";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const drop = await getDropBySlug(slug); if (!drop) return apiError("Page not found or expired.", 404);
  await captureServerEvent({ event:"markdown_fetched", distinctId:`drop:${drop.id}`, properties:{ ownership:drop.owner_id ? "account" : "anonymous" } });
  return new Response(drop.markdown, { headers:{"content-type":"text/markdown; charset=utf-8","content-disposition":`inline; filename="${drop.slug}.md"`,"cache-control":"public, max-age=60","vary":"Accept"} });
}
