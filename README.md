# chit.md

**Markdown, on a link.**

chit.md is the shortest path from a Markdown document to something anyone can
read. Paste or POST Markdown, get a clean public URL, and send it to a person or
another agent. No workspace invitation. No export flow. No account required.

Anonymous chits last for 24 hours. Sign in and they stay in your account.

## Why it exists

Agents are good at producing useful documents. Sharing those documents is still
oddly clumsy: attach a file, open a pull request, create a workspace page, or
send an unreadable wall of Markdown in chat.

chit.md gives every document three useful surfaces:

- a readable page for people
- raw Markdown for agents
- a small API for creating and managing chits

## Try it locally

```bash
cp .env.example .env.local
npm install
npm run db:init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste Markdown, and publish.
The local SQLite database is created under `data/` and is ignored by Git.

## Publish in one request

```bash
curl -X POST http://localhost:3000/api/v1/drops \
  -H "Content-Type: text/markdown" \
  -H "chit-title: Review this plan" \
  --data-binary @plan.md
```

The response includes a public URL, a raw Markdown URL, and—when publishing
anonymously—a private keep URL:

```json
{
  "slug": "a7kx9q",
  "url": "http://localhost:3000/a7kx9q",
  "markdown_url": "http://localhost:3000/api/v1/drops/a7kx9q/markdown",
  "claim_url": "http://localhost:3000/claim/keep_this_private",
  "expires_at": "2026-08-22T18:00:00.000Z"
}
```

Share `url`. Keep `claim_url` private: it is the capability that moves an
anonymous chit into an account.

## Built for agents

An agent does not need to scrape the interface. The app publishes its own
instructions and contract:

| Resource | Purpose |
| --- | --- |
| `/llms.txt` | Short discovery map |
| `/skill.md` | Copyable agent instructions |
| `/openapi.json` | Machine-readable API contract |
| `/api/v1/drops` | Create a chit |
| `/api/v1/drops/:slug/markdown` | Read the source Markdown |

Authenticated browser sessions and bearer credentials both attach newly
created chits to the authenticated account. Anonymous requests instead receive
a 24-hour page and a private keep link.

## Product behavior

- Write, split, and rendered-preview editor modes
- GitHub-flavored Markdown with safe syntax highlighting
- One-click copy for the public link and Markdown source
- Anonymous publishing with a real 24-hour countdown
- Expired-page tombstones with no retained document body
- Better Auth email/password accounts
- Account dashboard, ownership, editing, and deletion
- Owner attribution on saved public chits
- Rate limits, payload limits, hashed capability tokens, and untrusted HTML
  disabled during rendering
- Light and dark themes with reduced-motion support

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Production | Random secret, at least 32 characters |
| `BETTER_AUTH_URL` | Yes | Canonical application origin |
| `NEXT_PUBLIC_APP_URL` | Yes | Public origin used in returned links |
| `DATABASE_PATH` | No | SQLite path; defaults to `./data/said.db` |

The checked-in `.env.example` is safe to copy for local development.

## Deploy

The included `Dockerfile` and `railway.json` target a service with a persistent
filesystem. Mount a volume at `/data` and set:

```text
DATABASE_PATH=/data/chit.db
BETTER_AUTH_SECRET=<at least 32 random characters>
BETTER_AUTH_URL=https://chit.md
NEXT_PUBLIC_APP_URL=https://chit.md
```

SQLite is intentionally simple for the first deployment. Do not place this
configuration on an ephemeral serverless filesystem. Move to a hosted SQL
adapter before horizontal scaling.

## Verify a change

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Stack

Next.js 16, React 19, TypeScript, CodeMirror 6, Better Auth, HeroUI, SQLite,
React Markdown, and Vitest.

## Status

This is an early, working product. The core publishing, reading, expiry,
claiming, ownership, and agent flows are implemented; production hosting and
the final `chit.md` DNS setup are the next operational steps.
