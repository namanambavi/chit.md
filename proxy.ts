import { NextRequest, NextResponse } from "next/server";
import { appendVaryAccept, preferredRepresentation } from "@/lib/accept";

export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept");
  const representation = preferredRepresentation(accept);
  if (representation === "text/markdown") {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${url.pathname}`;
    const response = NextResponse.rewrite(url);
    appendVaryAccept(response.headers);
    return response;
  }
  if (!representation && accept) {
    return new Response("Not Acceptable\n\nAvailable: text/html, text/markdown\n", {
      status: 406,
      headers: { "content-type": "text/plain; charset=utf-8", vary: "Accept" },
    });
  }
  const response = NextResponse.next();
  appendVaryAccept(response.headers);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|_vercel|favicon.ico|llms.txt|skill.md|openapi.json|robots.txt|sitemap.xml|\\.well-known|.*\\..*).*)"],
};
