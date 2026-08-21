import { appUrl } from "@/lib/config";

const slugParameter = { name: "slug", in: "path", required: true, schema: { type: "string" } } as const;
const errorResponse = {
  description: "Request failed",
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
};

export function GET() {
  return Response.json({
    openapi: "3.1.0",
    info: { title: "chit.md API", version: "1.2.0", description: "Markdown in, public URL out." },
    servers: [{ url: appUrl() }],
    paths: {
      "/api/v1/drops": { post: {
        operationId: "publishDrop", summary: "Publish a Markdown page",
        description: "Anonymous chits expire after 24 hours. Bearer-authenticated chits are saved directly to that account.",
        security: [{}, { bearerAuth: [] }],
        requestBody: { required: true, content: {
          "application/json": { schema: { $ref: "#/components/schemas/PublishRequest" } },
          "text/markdown": { schema: { type: "string", maxLength: 256000 } },
        } },
        responses: {
          "201": { description: "Page published", content: { "application/json": { schema: { $ref: "#/components/schemas/PublishResponse" } } } },
          "400": errorResponse, "413": errorResponse, "429": errorResponse,
        },
      } },
      "/api/v1/drops/{slug}": { get: {
        operationId: "getDrop", summary: "Read a public page as JSON", parameters: [slugParameter],
        responses: {
          "200": { description: "Public page", content: { "application/json": { schema: { $ref: "#/components/schemas/PublicDrop" } } } },
          "404": errorResponse,
        },
      } },
      "/api/v1/drops/{slug}/markdown": { get: {
        operationId: "getDropMarkdown", summary: "Read the original Markdown", parameters: [slugParameter],
        responses: {
          "200": { description: "Raw Markdown", content: { "text/markdown": { schema: { type: "string" } } } },
          "404": errorResponse,
        },
      } },
    },
    components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", description: "A chit.md session token." } }, schemas: {
      PublishRequest: {
        type: "object", required: ["markdown"], additionalProperties: false,
        properties: {
          markdown: { type: "string", maxLength: 256000 }, title: { type: "string", maxLength: 120 },
          source: { type: "string", maxLength: 80 },
          metadata: { type: "object", additionalProperties: { type: ["string", "number", "boolean", "null"] } },
        },
      },
      PublishResponse: {
        type: "object", required: ["id", "slug", "title", "url", "markdown_url", "claim_url", "expires_at", "owned", "owner"],
        properties: {
          id: { type: "string" }, slug: { type: "string" }, title: { type: "string" },
          url: { type: "string", format: "uri", description: "Public rendered page." },
          markdown_url: { type: "string", format: "uri", description: "Public raw Markdown." },
          claim_url: { type: ["string", "null"], format: "uri", description: "Private keep link for an anonymous chit." },
          expires_at: { type: ["string", "null"], format: "date-time" },
          owned: { type: "boolean" },
          owner: { type: ["object", "null"], properties: { name: { type: "string" } }, required: ["name"] },
        },
      },
      PublicDrop: {
        type: "object", required: ["id", "slug", "title", "markdown", "created_at", "expires_at", "claimed", "owner"],
        properties: {
          id: { type: "string" }, slug: { type: "string" }, title: { type: "string" }, markdown: { type: "string" },
          created_at: { type: "string", format: "date-time" }, expires_at: { type: ["string", "null"], format: "date-time" }, claimed: { type: "boolean" },
          owner: { type: ["object", "null"], properties: { name: { type: "string" } }, required: ["name"] },
        },
      },
      Error: { type: "object", required: ["error"], properties: { error: { type: "string" } } },
    } },
  });
}
