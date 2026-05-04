
# AgentGate pivot: from spec-first to gateway-first, with Slack approvals

## Goal

Reposition AgentGate around the painkiller — **approve, block, and log every risky AI agent action before it touches production** — and ship the single feature that makes it indispensable: **Slack approvals with Approve/Deny buttons**. The Agent Manifest spec stays in the project as a credibility marker, but is demoted from hero to a "How it works / Open standard" section.

---

## Part 1 — Reposition the landing page

Target reader: **platform / security engineer at a 50–500 person company being asked "can we let this agent take actions in production?"**

### Hero section (Landing.tsx)

Replace current hero with:

- Eyebrow: `For platform & security teams`
- H1: **The approval & audit gateway for AI agents.**
- Sub: *Block, approve, and log every risky agent action before it hits production. Drop-in. Works with MCP, OpenAI Agents, Claude, or any HTTP API.*
- Primary CTA: `Watch a refund get approved in 60 seconds` → `/getting-started` (or demo)
- Secondary CTA: `Read the open spec` → `/spec` (small, text-link styled)

Kill: "OpenAPI for the agent economy", the badge CTA, "Be agent-ready" framing, all "by 2027 / within 24 months" future-tense copy.

### New section order

1. Hero (above)
2. **The problem** — three short cards in security-engineer language:
   - "Agents are read-only because we can't approve writes"
   - "We're hand-rolling Slack approvals + audit tables"
   - "OAuth scopes control access, not behavior"
3. **How AgentGate works** — three-step diagram:
   ```text
   Agent ──► AgentGate ──► Your API
              │
              ├─ scope check
              ├─ Slack approval (if risky)
              └─ audit log
   ```
4. **Live demo / video placeholder** — single embedded clip or animated GIF of the refund-approval flow. (Asset to be recorded later — leave a styled placeholder card with a "Coming soon" badge and link to `/getting-started`.)
5. **Open standard** (demoted) — short section: "AgentGate is built on the open Agent Manifest spec — MIT-licensed, governance-friendly, vendor-neutral." Link to GitHub + `/spec`.
6. **Get started** — three install steps (token → manifest → first invoke).

### Copy elsewhere

- Update `index.html` `<title>` and meta description to match new positioning.
- Update README hero blurb on the public spec repo (note for user to push manually — we can only edit the in-repo `repo-public/README.md`).

---

## Part 2 — Slack approvals (the killer feature)

### User flow

1. Engineer connects their Slack workspace via the Lovable Slack connector (one click, no custom app).
2. On the **Apps** page, engineer picks a default Slack channel per connected app (e.g. `#agent-approvals`).
3. When an agent calls `/v1/invoke` for a risky action, AgentGate:
   - Creates the `pending_approvals` row (already works).
   - Posts a Slack message to the configured channel with an Approve / Deny button block.
   - Returns `202 pending_approval` to the agent (already works).
4. Reviewer clicks **Approve** or **Deny** in Slack.
5. Slack hits an AgentGate edge function → updates `pending_approvals.status` → writes `audit_logs` row → updates the Slack message in place ("Approved by @alex • 14:02").
6. The in-app `/app/approvals` page stays in sync (it already polls).

### Schema additions (one migration)

- `connected_apps.slack_channel_id text` — channel to post approvals to.
- `connected_apps.slack_team_id text` — workspace identifier.
- `pending_approvals.slack_message_ts text` — Slack message timestamp, used to update the message after a decision.

No RLS changes needed — all new columns live on already-protected tables.

### Edge function changes

- **`v1-invoke`** (existing): after inserting a `pending_approvals` row, call a new helper that posts to Slack via the connector gateway (`https://connector-gateway.lovable.dev/slack/api/chat.postMessage`) using interactive button blocks. Store the returned `ts` on the approval row. Best-effort — Slack failure does not block approval creation; it's logged and surfaced in the dashboard.
- **`slack-interactivity`** (new, `verify_jwt = false`): receives Slack's `block_actions` POSTs.
  - Verify the Slack signature (`x-slack-signature` + `x-slack-request-timestamp`) using `SLACK_SIGNING_SECRET` (custom-app path) **or**, when using the managed connector, validate via Slack's `team_id` + connector token round-trip. Plan: **start with the managed Slack connector path** (no signing secret, simpler UX) and gate writes by looking up the approval by `id` carried in the button `value`.
  - Update `pending_approvals` (status, decided_by mapped from Slack user via a new `slack_user_id` column on `user_roles`-adjacent table — simpler: store reviewer's Slack user id + name directly on the approval row as `decided_by_slack` text) and insert an `audit_logs` entry.
  - Call `chat.update` to replace the original message with a "Approved by … • timestamp" confirmation.

### UI changes

- **`Apps.tsx`**: add a "Slack channel for approvals" picker (channel dropdown populated from `conversations.list` via a small `slack-channels` edge function). Show "Connect Slack" button when the connector isn't linked.
- **`Approvals.tsx`**: badge each row with "via Slack" when `decided_by_slack` is set.
- **`Overview.tsx`**: add a small "Slack: connected to #agent-approvals" status pill.

### Connector wiring

- Use the `standard_connectors--connect` flow with `connector_id: slack` (bot token, default scopes: `chat:write`, `channels:read`, `groups:read`, `chat:write.customize`).
- All Slack API calls go through `https://connector-gateway.lovable.dev/slack/...` with `Authorization: Bearer ${LOVABLE_API_KEY}` + `X-Connection-Api-Key: ${SLACK_API_KEY}`.

---

## Part 3 — Out of scope for this round (proposed next)

To stay focused, **not** doing in this loop:
- MCP adapter (next iteration, defensive moat).
- Embedded interactive landing demo (recommend recording a 60s Loom first, embedding later).
- Email approvals (Slack first; email later).
- Per-app rule editor for "amount > X requires approval" (already partially possible via `approval_rules` table; UI work later).

---

## Technical summary

**Files to edit**
- `src/pages/Landing.tsx` — full hero + sections rewrite.
- `index.html` — title + meta.
- `src/pages/app/Apps.tsx` — Slack channel picker + connect prompt.
- `src/pages/app/Approvals.tsx` — show Slack-decision badges.
- `src/pages/app/Overview.tsx` — Slack status pill.
- `supabase/functions/v1-invoke/index.ts` — post Slack message on `requires_approval`.
- `repo-public/README.md` — light copy refresh (user pushes manually).

**Files to create**
- `supabase/functions/slack-interactivity/index.ts` — handle Approve/Deny clicks, update DB, edit Slack message.
- `supabase/functions/slack-channels/index.ts` — list workspace channels for the picker.
- `supabase/functions/_shared/slack.ts` — small helper for `chat.postMessage` / `chat.update` via the connector gateway.

**Schema migration**
- Add `slack_channel_id`, `slack_team_id` to `connected_apps`.
- Add `slack_message_ts`, `decided_by_slack` to `pending_approvals`.

**Connector**
- Link the Slack connector (`standard_connectors--connect`) — user picks workspace in the built-in picker.

**Risk / open question**
- Slack interactivity webhook URL must be reachable without JWT. The managed Lovable Slack connector does **not** support inbound interactivity webhooks (per connector docs). So for the Approve/Deny button round-trip we will need the user to either (a) install a tiny custom Slack app for interactivity only — we provide the manifest JSON — or (b) start with a "Approve in dashboard" link button (no custom app needed). I recommend shipping **(b) first** (single link button → opens `/app/approvals?id=…`) and wiring real in-Slack buttons in a follow-up once the user opts in to a custom app. This keeps round-one zero-friction.

---

## What you'll see when this ships

- New landing page that a security engineer instantly understands.
- One-click Slack connect on the Apps page.
- Every high-risk agent invoke posts a rich Slack message in the chosen channel with action, agent identity, payload, and an "Open approval" button.
- Decisions made in-dashboard update the Slack message in place.
- Spec lives on as the "open standard" credibility section, not the pitch.
