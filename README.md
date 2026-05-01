# Agent Manifest Specification

> An open standard for describing how AI agents can safely interact with web applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Spec Version](https://img.shields.io/badge/spec-v1.0--draft-orange.svg)](./spec/v1.md)
[![Status](https://img.shields.io/badge/status-RFC-yellow.svg)]()

## Why this exists

Today, AI agents (OpenAI Operator, Anthropic Computer Use, Google Mariner, and the next 100 to come) interact with web apps the same way humans do — by clicking buttons and reading screens.

This is **fragile, slow, unsafe, and unauditable**.

The **Agent Manifest** is a small JSON document a SaaS app publishes to declare:

- the **actions** agents can take
- the **permissions** required for each
- the **approval rules** for high-risk operations
- the **identity** agents must present
- the **audit** guarantees provided

Think of it as **OpenAPI for the agent economy** — but with safety, identity, and governance built in from day one.

## Quick example

```json
{
  "manifest_version": "1.0",
  "app": { "name": "Acme Billing", "url": "https://acme.com" },
  "actions": [
    {
      "id": "refund_invoice",
      "description": "Issue a refund on a paid invoice",
      "risk": "high",
      "scopes": ["invoices:write", "payments:refund"],
      "requires_approval": true
    }
  ],
  "approval_rules": [
    { "when": { "action": "refund_invoice", "amount_cents": { "gt": 10000 } },
      "require": "human_approver" }
  ],
  "agent_identity": { "required": true, "verification": "bearer_token" },
  "audit": { "log_all": true, "retention_days": 365 }
}
```

## Adopt the spec in 4 steps

1. **Generate** a manifest for your app (manually, or with [AgentGate](https://agentgate.lovable.app)).
2. **Host** it at `https://yourapp.com/.well-known/agent-manifest.json`.
3. **Validate** against `schema/manifest.v1.json`.
4. **Display** the *Agent-Ready* badge on your site.

## Repository contents

```
spec/v1.md                       Human-readable specification
schema/manifest.v1.json          JSON Schema for validation
examples/                        Real-world example manifests
  ├── shopify.manifest.json
  ├── notion.manifest.json
  └── stripe.manifest.json
```

## Core principles

- **Default-deny** — nothing is exposed unless explicitly declared
- **Risk-classified** — every action carries a `low` / `medium` / `high` risk level
- **Identity-aware** — agents must be cryptographically identified
- **Approval-ready** — high-risk actions can require a human in the loop
- **Auditable** — every call is logged with identity, payload, and outcome

## Who is this for?

- **SaaS builders** who want to be discoverable & trusted by AI agents
- **Agent developers** who need a standard interface across thousands of apps
- **CISOs & compliance teams** who need to govern agent activity across their stack

## Status

This spec is at **v1.0 Draft / RFC**. We're collecting feedback from agent builders, SaaS platforms, and security teams before declaring v1.0 stable.

**Want to help shape it?** Open an issue, propose a change, or contribute an example manifest for an app you use.

## Adopters

> Be the first. Open a PR adding your logo to `ADOPTERS.md`.

## License

MIT — use it, fork it, ship it.

## Maintained by

[AgentGate](https://agentgate.lovable.app) — the governance layer for the agent economy.
