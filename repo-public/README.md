# Agent Manifest Specification

> An open standard for declaring how AI agents can safely take actions in web applications — with identity, scopes, approvals, and audit built in.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Spec Version](https://img.shields.io/badge/spec-v1.0--draft-orange.svg)](./spec/v1.md)
[![Status](https://img.shields.io/badge/status-RFC-yellow.svg)]()
[![Validator](https://img.shields.io/badge/validator-live-green.svg)](https://agentgate.lovable.app/validator)

## The problem

Your team is being asked to let AI agents take real actions in production — refunds, ticket updates, CRM writes, account changes. Most teams stop at read-only because there's no clean way to **approve, restrict, log, and audit** what an agent is allowed to do.

OAuth scopes control *access*. They don't control *behavior*. "Allow this agent to refund — unless the amount > $500, then ask Sarah" is the gap.

## What this spec is

The **Agent Manifest** is a small JSON document an application publishes that declares, in machine-readable form:

- the **actions** an agent can take
- the **scopes** required for each
- the **approval rules** that gate high-risk operations
- the **identity** the agent must present
- the **audit** guarantees provided

Think of it as the contract between your app and any agent that wants to act inside it.

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

A live, dogfooded example: <https://agentgate.lovable.app/.well-known/agent-manifest.json>

## Reference implementation: AgentGate

A spec is just paper without a runtime. **[AgentGate](https://agentgate.lovable.app)** is the open reference implementation:

- a `/v1/invoke` proxy that sits in front of your APIs
- per-agent scoped tokens
- **Slack-based approvals** for risky actions
- immutable audit log

You can adopt the spec without AgentGate, and you can use AgentGate without publishing a public manifest.

## Adopt the spec in 4 steps

1. **Describe** your agent-callable actions in a manifest (by hand or with [AgentGate](https://agentgate.lovable.app)).
2. **Host** it at `https://yourapp.com/.well-known/agent-manifest.json`.
3. **Validate** against `schema/manifest.v1.json` — or paste into the [online validator](https://agentgate.lovable.app/validator).
4. **Enforce** it at runtime (with AgentGate, or your own gateway).

## Repository layout

```
spec/v1.md                       Human-readable specification
schema/manifest.v1.json          JSON Schema for validation
examples/                        Real-world example manifests
  ├── acme-helpdesk.manifest.json
  ├── shopify.manifest.json
  ├── notion.manifest.json
  └── stripe.manifest.json
ADOPTERS.md                      Companies publishing a manifest
CONTRIBUTING.md                  How to propose changes
LICENSE                          MIT
```

## Core principles

- **Default-deny** — nothing is exposed unless explicitly declared
- **Risk-classified** — every action carries `low` / `medium` / `high`
- **Identity-aware** — agents must be cryptographically identified
- **Approval-ready** — high-risk actions can require a human in the loop
- **Auditable** — every call is logged with identity, payload, and outcome

## Who this is for

Primary audience: **platform & security engineers** at companies running agent pilots who need to safely turn agents on in production.

Secondary: agent framework builders who want a standard interface across many SaaS apps; CISOs & compliance teams who need to govern agent activity across their stack.

## Status

**v1.0 Draft / RFC.** Collecting feedback from agent builders, security engineers, and SaaS platform teams before declaring v1.0 stable.

Open an issue with what's missing, what's broken, or what you'd kill.

## Adopters

See [ADOPTERS.md](./ADOPTERS.md). Be the first — open a PR adding your logo.

## License

MIT — use it, fork it, ship it. See [LICENSE](./LICENSE).

## Maintainer

[AgentGate](https://agentgate.lovable.app) — the approval & audit gateway for the agent economy.
