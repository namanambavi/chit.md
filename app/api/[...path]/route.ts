import { apiError } from "@/lib/http";

function unknownApi() {
  return apiError("API endpoint not found.", 404);
}

export const GET = unknownApi;
export const POST = unknownApi;
export const PUT = unknownApi;
export const PATCH = unknownApi;
export const DELETE = unknownApi;
