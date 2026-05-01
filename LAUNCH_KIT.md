# Launch day copy — ready to paste

---

## 1. Show HN post

**Title** (80 char max — this exact wording tested well in the genre):

```
Show HN: Agent Manifest – an open spec to make SaaS apps agent-readable
```

**URL field:** link to your GitHub repo

**Text field:**

```
Hi HN,

AI agents (Operator, Computer Use, Mariner) interact with SaaS apps by clicking
buttons and scraping the DOM. It works, barely. It's fragile, slow, unauditable,
and an obvious security disaster waiting to happen.

I've been working on an open spec — Agent Manifest v1 — that lets a SaaS app
publish a small JSON file at /.well-known/agent-manifest.json declaring:

- the actions agents can take
- risk level of each (low/medium/high)
- required scopes & permissions
- approval rules (refunds > $100 need human approval, etc.)
- agent identity requirements (bearer / mTLS / signed JWT)
- audit guarantees (log all, retention, export format)

Think OpenAPI, but for safety/governance instead of API description.

It's MIT licensed. The repo has the spec, JSON Schema, and three reference
manifests (Shopify, Notion, Stripe-style). I also built a generator that
turns an app description into a valid manifest in ~30s.

This is v1.0 Draft. Looking for feedback from:
- SaaS builders thinking about agent traffic
- Agent developers building cross-app agents
- Security/compliance folks who'll have to govern this in 12 months

Spec: https://bridgeai.app/spec
Repo: https://github.com/...
Generator: https://bridgeai.app

Happy to answer anything. What am I missing?
```

**Posting tips:**
- Post **Tuesday or Wednesday, 8–10 AM Pacific**
- Reply to every comment within the first 2 hours — HN ranking weights early engagement heavily
- Don't ask friends to upvote — HN detects this and will penalize you

---

## 2. Twitter / X thread (10 tweets)

**Tweet 1 (the hook):**
```
AI agents are about to do most of the work on your SaaS app.

They'll do it by clicking buttons and reading pixels — like a human, but
worse: fragile, slow, unauditable, and easy to trick into $50,000 refunds.

We need a standard. So I shipped one. Open source. 🧵
```

**Tweet 2:**
```
The thing I shipped: Agent Manifest v1.

A tiny JSON file your SaaS publishes at:
/.well-known/agent-manifest.json

It declares which actions agents can take, what permissions they need,
which ones require human approval, how they identify themselves, and
how everything gets audited.
```

**Tweet 3 (the OpenAPI parallel):**
```
Think of it as OpenAPI for the agent economy.

OpenAPI standardized how APIs *describe* themselves.
Agent Manifest standardizes how apps *govern* what agents do.

You don't want 50 different agent-permission models. You want one.
```

**Tweet 4 (example screenshot):**
```
Here's what one looks like for a billing app:

[attach screenshot of the example manifest from the spec page]

Note: refunds over $10k auto-escalate to human approval.
That's 5 lines of JSON instead of a custom workflow engine.
```

**Tweet 5 (why now):**
```
Why this matters now:

- Operator, Computer Use, Mariner all in production
- EU AI Act requires audit trails for automated decisions
- SOC2 auditors are starting to ask "how do you govern agents?"
- Most SaaS teams have zero answer

The 18-month window to shape the standard is open.
```

**Tweet 6 (who builds it themselves vs. adopts):**
```
"Why won't every SaaS just build this in-house?"

Same reason they don't build their own auth, payments, observability,
or feature flags. It's not core product. The hard part isn't the code —
it's the *cross-app standard*.

Open spec wins. Closed product loses.
```

**Tweet 7 (CISO angle):**
```
The buyer here isn't the SaaS PM.

It's the CISO at a company using 40 SaaS tools, trying to answer:
"What did our AI agents do across our entire stack last quarter,
and can I prove none of it broke policy?"

Today: nobody can answer that. That's the wedge.
```

**Tweet 8 (what's shipping):**
```
What's live today:

📄 The spec (v1.0 RFC) — agentmanifest.org/spec
🛠 JSON Schema for validation
📚 Reference manifests: Shopify, Notion, Stripe
🔧 Free generator: describe your app, get a manifest

All MIT licensed. Repo link in bio.
```

**Tweet 9 (call for feedback):**
```
What I want from you:

- SaaS builders: would you adopt this? what's missing?
- Agent devs: does this make your job easier?
- CISOs: is this the audit trail you've been asking for?

This is v1.0 Draft. The first 100 thoughtful comments shape v1.0 Stable.
```

**Tweet 10 (close + links):**
```
If you build SaaS, build agents, or run security at one — I'd love your eyes on this.

Spec: bridgeai.app/spec
Repo: github.com/...
Try it: bridgeai.app

The agent economy is coming whether we plan for it or not.
Let's plan for it.
```

**Posting tips:**
- Post the thread **Tuesday 9–11 AM ET** for best B2B reach
- Tag 3–5 relevant people in replies (not the main thread): agent founders, AI infra investors, well-known security voices
- Pin the thread for a week
- DM the thread to the 30 people from your Week 2 outreach list — ask them to QT, not RT

---

## 3. LinkedIn post (CISO-flavored, 200 words)

```
Your company uses 40+ SaaS tools.

In the next 12 months, AI agents will start acting inside most of them
on your employees' behalf — booking, refunding, deleting, sharing.

Quick question for any security or compliance leader reading this:

Can you, today, answer "what did AI agents do inside our SaaS stack last
week, on whose behalf, and did any of it violate policy?"

If the answer is no, you're not alone. The tooling doesn't exist yet.

I just shipped an open standard — Agent Manifest v1 — that lets every
SaaS app declare:
• which actions agents can take
• what permissions are required
• which actions need human approval
• how agents must identify themselves
• how every call gets audited

It's MIT-licensed. Free. On GitHub.

The goal: a single, neutral spec that gives CISOs one pane of glass
across every SaaS in their stack — instead of 40 different agent-permission
models from 40 different vendors.

If this is a problem you're already thinking about, I'd love 15 minutes.
If it's a problem you *should* be thinking about — same.

Link to the spec in the comments.
```

---

## 4. Outreach email template (for the 30 people in Week 2)

**Subject:** `30-second ask: feedback on a spec for agent-readable SaaS`

```
Hi {first_name},

Quick one — I'm shipping an open spec next week called Agent Manifest:
a small JSON file SaaS apps publish so AI agents can interact with them
safely (actions, permissions, approval rules, audit).

Think OpenAPI but for governance instead of description. MIT licensed.

Given your work on {their_thing}, I'd really value 5 minutes of your eyes
on the draft before I post it publicly. Two questions:

1. Does this solve a problem you actually have?
2. What's the single most obvious thing I'm missing?

Spec is here: {link}

No call needed unless you want one — a one-line reply is gold.

Thanks,
{your_name}
```

---

## 5. Where to submit on launch day

| Platform | When | Notes |
|---|---|---|
| Hacker News (Show HN) | Tue/Wed 8–10am PT | Highest leverage |
| Product Hunt | Tue/Wed 12:01am PT | Submit night before |
| Twitter/X thread | Same day, 9–11am ET | Pin for a week |
| LinkedIn | Same day, 8–10am ET | CISO version |
| Reddit r/SaaS | Same day | "I open-sourced X" framing |
| Reddit r/MachineLearning | Same day | Spec/research framing |
| Console.dev (newsletter) | Email editor | Dev tools focus |
| Ben's Bites | Submit form | AI newsletter, huge reach |
| TLDR AI | Email editor | Top AI newsletter |
| The Rundown AI | Email editor | Largest AI newsletter |
| Latent Space | Email swyx | Podcast pitch |
| AI Tinkerers | Local meetup | Speak at one |

**Rule:** post to all of them on the **same day**. Concentrated launch > drip.
