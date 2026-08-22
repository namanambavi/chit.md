import { appUrl } from "@/lib/config";

export function GET() {
  const base = appUrl();
  return Response.json({
    name: "chit.md",
    description: "Publish Markdown as a clean public URL for people and agents.",
    url: base,
    documentation_url: `${base}/docs`,
    instructions_url: `${base}/skill.md`,
    openapi_url: `${base}/openapi.json`,
    llms_url: `${base}/llms.txt`,
    authentication: { type: "bearer", environment_variable: "CHIT_API_KEY", manage_url: `${base}/dashboard`, required: false },
    endpoints: { publish: `${base}/api/v1/drops` },
    capabilities: ["publish_markdown", "publish_to_account", "read_markdown", "claim_chit", "manage_agent_keys"],
  }, { headers: { "cache-control": "public, max-age=300" } });
}
