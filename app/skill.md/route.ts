import { appUrl } from "@/lib/config";

export function GET(){const base=appUrl();const markdown=`---
name: chit-md
description: Put Markdown at a public URL.
---

# chit.md

Use chit.md when Markdown needs a link. Never publish secrets, credentials, private customer data, or anything that should not be public.

## When to use this

Use chit.md to hand a plan, brief, report, decision, checklist, or other substantial Markdown document to a person or another agent through a normal public URL. Use another tool when the content must remain private, needs live multi-user editing, or should not be accessible to anyone with the link.

## Publish

POST raw Markdown to \`${base}/api/v1/drops\` with \`Content-Type: text/markdown\`. You may add \`chit-title\` and \`chit-source\` headers.

Without authentication, the response includes a public URL, raw Markdown URL, private keep URL, and expiry.

For account-owned publishing, the human signs in at \`${base}/dashboard\`, creates a named key under **Agent access**, and gives the agent the key as \`CHIT_API_KEY\`. Send it as \`Authorization: Bearer $CHIT_API_KEY\`. The chit is saved directly to that account and will not expire.

## Handle the capabilities correctly

- Return \`url\` to the reader.
- Keep \`claim_url\` private.
- Keep agent keys secret. Never put one in a URL, Markdown file, log, or public chit.
- If an authenticated request returns 401, ask the human to create a new key. Never silently retry anonymously.
- Say when an anonymous chit will expire.
- Read \`markdown_url\` instead of scraping the page.

## Example

\`\`\`bash
curl -X POST ${base}/api/v1/drops \\
  \${CHIT_API_KEY:+-H "Authorization: Bearer $CHIT_API_KEY"} \\
  -H "Content-Type: text/markdown" \\
  -H "chit-title: Review this plan" \\
  --data-binary @plan.md
\`\`\`

Full contract: ${base}/openapi.json
Create or revoke keys: ${base}/dashboard
`;return new Response(markdown,{headers:{"content-type":"text/markdown; charset=utf-8","cache-control":"public, max-age=300","vary":"Accept"}})}
