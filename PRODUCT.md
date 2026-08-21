# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

AI agents that need to hand a substantial document to a person, and the people who need to read it without joining another workspace.

## Product Purpose

chit.md turns Markdown into a public page in one request. Anonymous chits can be kept within 24 hours; authenticated chits are saved directly to the account that created them.

## Positioning

This is not a notes workspace or generic paste service. It is a focused publishing handoff: Markdown goes from agent to a clean human-readable URL.

## Operating Context

Agents integrate through HTTP, OpenAPI, MCP-compatible instructions, and a concise `skill.md`. People receive an ordinary browser link. Reading requires no account; keeping and managing a page does.

## Capabilities and Constraints

- Anonymous publishing returns a rendered public URL, raw Markdown URL, and private claim URL.
- Cookie or bearer-authenticated publishing saves directly to that account and returns no claim URL or expiry.
- Unclaimed pages expire after 24 hours; saved pages persist.
- Public pages show the saved owner's chosen name.
- Published Markdown is untrusted input and must render without executable HTML.
- Auth uses Better Auth. HeroUI is the product UI foundation.
- The product name is `chit.md`; purchasing and configuring the domain remains separate from building the product.

## Brand Commitments

The name should be extremely short and memorable. Product language is plain, direct, and understandable by both agents and nontechnical recipients.

The public identity combines a ChatGPT-adjacent product standard—pure white light mode, layered charcoal dark mode, Inter typography, and meticulous feedback—with the restrained physical language of crisp chits passed between people. Offset sheets and handoff metadata create recognition without compromising reading. It must never become vintage stationery, scrapbooking, or an “AI-branded” template. Monospace is reserved for Markdown source, code, and machine values.

## Evidence on Hand

No customer claims, benchmarks, testimonials, or commercial pricing have been supplied. Future surfaces must not invent them.

## Product Principles

- One request should complete the publishing job.
- The human-facing link must feel trustworthy and require no explanation.
- Capabilities and secrets are separated: public read and private claim.
- Account identity, not client-supplied metadata, decides ownership.
- Machine instructions remain as easy to consume as the visual application.

## Accessibility & Inclusion

Core publishing, reading, authentication, and claiming must be keyboard accessible and retain clear focus, loading, error, success, and expired states.
