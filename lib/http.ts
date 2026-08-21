import { ZodError } from "zod";

export function apiError(message: string, status = 400, details?: unknown) {
  return Response.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return apiError("The request was not valid.", 422, error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })));
  console.error("API request failed", error instanceof Error ? error.message : "Unknown error");
  return apiError("The request could not be completed.", 500);
}
