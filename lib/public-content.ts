import { appUrl } from "@/lib/config";

export const agentReadinessCopy = {
  heading: "A clean page from plain Markdown.",
  intro: "chit.md is for handing a document to someone without asking them to join a workspace. Paste Markdown, get a public link, and send it to a person or another agent. The page stays readable in a browser, while the original Markdown remains available for tools that need it.",
  anonymous: "No account is required. Anonymous chits last for 24 hours and include a private link that can be used to keep them.",
  account: "Sign in when the page should persist. Chits made while signed in belong to that account and can be edited or deleted from Your chits.",
  agents: "Agents can publish with one HTTP request. A named agent key saves every new chit to the same account; unauthenticated requests remain temporary.",
};

export function homepageMarkdown(base = appUrl()) {
  return `# chit.md — Markdown, on a link

${agentReadinessCopy.intro}

## When to use chit.md

Use chit.md when an agent or person needs to hand off a plan, brief, report, decision, checklist, or other Markdown document through a normal public URL. It is a focused publishing handoff, not a private notes workspace. Never publish secrets, credentials, private customer data, or anything that should not be public.

- **Anonymous:** ${agentReadinessCopy.anonymous}
- **Account-owned:** ${agentReadinessCopy.account}
- **From an agent:** ${agentReadinessCopy.agents}

## Start here

- Make a chit: ${base}/new
- Agent and API documentation: ${base}/docs
- Agent instructions: ${base}/skill.md
- OpenAPI contract: ${base}/openapi.json
- Site index for agents: ${base}/llms.txt
`;
}

export function dashboardPublicMarkdown(base = appUrl()) {
  return `# Your chits — chit.md

This private area lists the chits saved to an account. Account contents are never exposed without authentication.

To publish for an account from an agent, sign in, create a named agent key under Agent access, and send it as a bearer token. Public setup instructions remain available at ${base}/docs and ${base}/skill.md.
`;
}

export function newChitMarkdown(base = appUrl()) {
  return `# Make a chit

Paste Markdown in the browser at ${base}/new, or publish it with one request to ${base}/api/v1/drops. Anonymous chits expire after 24 hours. Signed-in chits are saved to the account that created them.

Agent instructions: ${base}/skill.md
`;
}

export function authMarkdown(base = appUrl()) {
  return `# Sign in to chit.md

Sign in is only required to keep and manage chits or to create an agent key. Reading public chits, reading the documentation, and publishing a temporary chit do not require an account.

Public documentation: ${base}/docs
Agent instructions: ${base}/skill.md
`;
}

export function notFoundMarkdown(base = appUrl()) {
  return `# 404 — No chit here

The requested page does not exist, was deleted, or its temporary link expired.

- Home: ${base}/
- Make a chit: ${base}/new
- Documentation: ${base}/docs
- Agent index: ${base}/llms.txt
- OpenAPI: ${base}/openapi.json
`;
}

export function softwareApplicationJsonLd(base = appUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "chit.md",
    url: base,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Publish Markdown as a clean public URL for people and agents.",
    featureList: [
      "Publish Markdown as a public web page",
      "Retrieve the original Markdown",
      "Save chits to an authenticated account",
      "Publish from agents with a named API key",
    ],
  };
}
