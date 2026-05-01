# Why every SaaS will need an Agent Manifest by 2027

**TL;DR:** Within 24 months, a meaningful share of your SaaS traffic will come from AI agents — not humans. The apps that publish a structured *agent manifest* will be discoverable, trusted, and used. The ones that don't will be invisible, unsafe, or both.

---

## The shift nobody is pricing in

In 2024, OpenAI shipped Operator. Anthropic shipped Computer Use. Google shipped Project Mariner. Perplexity shipped agents. By the end of 2025, every major model lab has a browsing agent in production.

These agents do something humans never did: they **operate your SaaS app on someone else's behalf, at machine speed, 24/7, in parallel**.

And they do it through the *human* interface — by reading pixels, clicking buttons, scraping the DOM. It works. Barely.

It's also:

- **Fragile** — your next UI change breaks every agent silently
- **Slow** — what should take 50ms takes 30 seconds
- **Unsafe** — agents can be tricked into refunding $50,000 instead of $50
- **Unauditable** — when something goes wrong, nobody knows what the agent did, on whose behalf, or why

We've been here before. In 2010, every app had a custom REST API and devs hated it. **OpenAPI** standardized the interface — and unlocked an entire economy of API tooling, gateways, and integrations.

Agents need the same thing. Not for *describing* APIs — for **governing** them.

## What an Agent Manifest actually is

It's a small JSON file your app publishes at `/.well-known/agent-manifest.json`. It declares:

- The **actions** an agent can take (`list_orders`, `refund_invoice`, `delete_user`)
- The **risk level** of each (`low` / `medium` / `high`)
- The **scopes/permissions** required
- The **approval rules** (refunds over $100 need a human; admin actions need two people)
- The **identity** the agent must present (bearer token, mTLS, signed JWT)
- The **audit guarantees** you provide (log everything, 365-day retention, export format)

That's it. ~50 lines of JSON. But it changes everything downstream.

## Why this matters for three different audiences

### For SaaS builders
Agents will route traffic to apps they can *trust and reason about*. Apps with a manifest get a 10x better integration story with every agent on the market — without bespoke partnerships. It's free distribution.

### For agent developers
Today, building a multi-app agent means scraping 50 different UIs and hoping they don't change. A standard manifest is the difference between "demo" and "production."

### For CISOs & compliance teams
The EU AI Act, SOC2, and ISO 27001 are all converging on the same requirement: **immutable, third-party audit trails of automated decisions**. Self-audited logs from the same vendor running the agent are a conflict of interest. A standard manifest + independent audit layer is what your auditor will ask for in 18 months. Better to have one now.

## The honest critique

"Why won't every SaaS just build this themselves?"

They will — eventually. The same way every company *could* build their own auth, payments, observability, and feature flags. Almost none do, because:

1. It's not core product
2. It's not customer-visible until something breaks
3. The hard part is **cross-app standardization**, not the code

Whoever defines the standard captures the category. We're publishing it as **MIT-licensed open spec**, on GitHub, free forever — because the standard only matters if it's neutral.

## What we're shipping today

- 📄 **The spec** — `agent-manifest.org/spec` (v1.0 RFC)
- 🛠 **JSON Schema** — validate any manifest in any language
- 📚 **Three reference manifests** — Shopify, Notion, Stripe-style
- 🔧 **A free generator** — describe your app, get a manifest in 30 seconds

If you build SaaS, run security at one, or build agents — **I want your feedback.** This is v1.0 *Draft*. v1.0 *Stable* will be shaped by the first 100 people who care.

→ [GitHub](https://github.com) · [Spec](https://bridgeai.app/spec) · [Generator](https://bridgeai.app)

---

*BridgeAI is building the governance layer for the agent economy. The spec is open. The dashboard is closed. The future is multi-agent — and somebody has to keep it sane.*
