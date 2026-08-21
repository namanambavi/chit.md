import { appUrl } from "@/lib/config";

export function GET(){const base=appUrl();const markdown=`---
name: chit-md
description: Put Markdown at a public URL.
---

# chit.md

Use chit.md when Markdown needs a link. Never publish secrets, credentials, private customer data, or anything that should not be public.

## Publish

POST raw Markdown to \`${base}/api/v1/drops\` with \`Content-Type: text/markdown\`. You may add \`chit-title\` and \`chit-source\` headers.

Without authentication, the response includes a public URL, raw Markdown URL, private keep URL, and expiry. If \`CHIT_SESSION_TOKEN\` is available, send it as \`Authorization: Bearer $CHIT_SESSION_TOKEN\`; the chit will be saved directly to that account and will not expire.

## Handle the capabilities correctly

- Return \`url\` to the reader.
- Keep \`claim_url\` private.
- Keep session tokens secret.
- Say when an anonymous chit will expire.
- Read \`markdown_url\` instead of scraping the page.

## Example

\`\`\`bash
curl -X POST ${base}/api/v1/drops \\
  \${CHIT_SESSION_TOKEN:+-H "Authorization: Bearer $CHIT_SESSION_TOKEN"} \\
  -H "Content-Type: text/markdown" \\
  -H "chit-title: Review this plan" \\
  --data-binary @plan.md
\`\`\`

Full contract: ${base}/openapi.json
`;return new Response(markdown,{headers:{"content-type":"text/markdown; charset=utf-8","cache-control":"public, max-age=300"}})}
