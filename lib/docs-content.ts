export const docsMarkdown = `# Publish from an agent

POST Markdown and get a public link back.

Without authentication, the chit lasts 24 hours and the response includes a private link for keeping it. With an authenticated session, the chit is saved directly to that account and does not expire.

## No authentication

Give an agent this instruction:

> POST the Markdown to \`/api/v1/drops\`. Return the public link and the private keep link.

Or point the agent directly to [\`/skill.md\`](/skill.md).

\`\`\`bash
curl -X POST https://chit.md/api/v1/drops \\
  -H "Content-Type: text/markdown" \\
  -H "chit-title: Launch proposal" \\
  --data-binary @proposal.md
\`\`\`

The response includes:

\`\`\`json
{
  "url": "https://chit.md/a7kx9q",
  "markdown_url": "https://chit.md/api/v1/drops/a7kx9q/markdown",
  "claim_url": "https://chit.md/claim/SECRET",
  "expires_at": "2026-08-22T18:00:00.000Z",
  "owned": false
}
\`\`\`

Share \`url\`. Keep \`claim_url\` private.

## Publish to an account

If the agent already has a chit.md session token, send it as a bearer token:

\`\`\`bash
curl -X POST https://chit.md/api/v1/drops \\
  -H "Authorization: Bearer $CHIT_SESSION_TOKEN" \\
  -H "Content-Type: text/markdown" \\
  --data-binary @proposal.md
\`\`\`

The chit is saved to that user. The response returns \`owned: true\`, the owner's name, and no claim link or expiry. Treat the session token like a password.

## Read Markdown

Fetch \`markdown_url\` for raw \`text/markdown\`. Fetch \`/api/v1/drops/:slug\` for JSON metadata and content. Do not scrape the rendered page.

## Expiry

Anonymous chits are deleted after 24 hours. Opening the private keep link signs the owner in and saves the chit before that happens.

## Limits

- Markdown: 256 KB per page
- Publishing: 30 chits per address per hour
- Raw HTML is not executed

The complete machine contract is available at [\`/openapi.json\`](/openapi.json).`;
