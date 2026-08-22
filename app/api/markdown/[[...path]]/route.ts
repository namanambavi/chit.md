import { getDropBySlug } from "@/lib/drops";
import { docsMarkdown } from "@/lib/docs-content";
import { authMarkdown, dashboardPublicMarkdown, homepageMarkdown, newChitMarkdown, notFoundMarkdown } from "@/lib/public-content";

export const runtime = "nodejs";

function markdown(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=60" : "no-store",
      vary: "Accept",
    },
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const route = path.join("/");
  if (!route) return markdown(homepageMarkdown());
  if (route === "docs") return markdown(docsMarkdown);
  if (route === "dashboard" || route.startsWith("dashboard/")) return markdown(dashboardPublicMarkdown());
  if (route === "new") return markdown(newChitMarkdown());
  if (route === "auth") return markdown(authMarkdown());
  if (path.length === 1) {
    const drop = await getDropBySlug(path[0]);
    if (drop) return markdown(drop.markdown);
  }
  return markdown(notFoundMarkdown(), 404);
}
