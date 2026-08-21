import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { claimDrop } from "@/lib/drops";
import { apiError, handleApiError } from "@/lib/http";
import { claimSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() }); if (!session) return apiError("Sign in before keeping this chit.", 401);
    const { token } = claimSchema.parse(await request.json()); const result = await claimDrop(token, session.user.id);
    if (!result.ok) return apiError(result.reason === "expired" ? "This keep link expired." : result.reason === "claimed" ? "This chit belongs to another account." : "This keep link is not valid.", result.reason === "claimed" ? 409 : 404);
    return Response.json({ claimed:true, slug:result.slug });
  } catch (error) { return handleApiError(error); }
}
