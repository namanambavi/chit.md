import { ZodError } from "zod";

export function apiError(message: string, status = 400, details?: unknown) {
  const defaults: Record<number, { code: string; hint: string }> = {
    400: { code: "INVALID_REQUEST", hint: "Check the request and try again." },
    401: { code: "UNAUTHORIZED", hint: "Sign in or send a valid agent key, then retry." },
    403: { code: "FORBIDDEN", hint: "Use credentials that have access to this resource." },
    404: { code: "NOT_FOUND", hint: "Check the URL or read /openapi.json for available endpoints." },
    409: { code: "CONFLICT", hint: "Refresh the resource state before retrying." },
    413: { code: "PAYLOAD_TOO_LARGE", hint: "Send a smaller Markdown document." },
    422: { code: "VALIDATION_ERROR", hint: "Fix the listed fields and retry the request." },
    429: { code: "RATE_LIMITED", hint: "Wait before retrying, or authenticate with an agent key." },
    500: { code: "INTERNAL_ERROR", hint: "Retry later. If the problem continues, report the request and endpoint." },
  };
  const resolution = defaults[status] || defaults[400];
  return Response.json({ error: message, message, ...resolution, ...(details ? { details } : {}) }, { status, headers: { "cache-control": "no-store" } });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return apiError("The request was not valid.", 422, error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })));
  if (error instanceof SyntaxError) return apiError("The request body is not valid JSON.", 400);
  console.error("API request failed", error instanceof Error ? error.message : "Unknown error");
  return apiError("The request could not be completed.", 500);
}
