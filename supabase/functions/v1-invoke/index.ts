// /v1/invoke — runtime governance proxy for agent actions.
// Flow: validate token → resolve action → enforce permissions → enforce approval rules
//       → (forward or queue) → write audit log → return structured result.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { postApprovalMessage, isSlackConnected } from "../_shared/slack.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-bridgeai-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // 1. Extract token (header or Authorization: Bearer)
  const headerToken = req.headers.get("x-bridgeai-token");
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const rawToken = headerToken || bearer;
  if (!rawToken || !rawToken.startsWith("bai_")) {
    return json(401, { error: "missing_or_invalid_token", hint: "Send `x-bridgeai-token: bai_...`" });
  }

  // 2. Parse body
  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "invalid_json" }); }
  const { action, payload, agent_identity_override } = body ?? {};
  if (!action || typeof action !== "string") {
    return json(400, { error: "missing_action" });
  }

  // 3. Resolve token
  const tokenHash = await sha256(rawToken);
  const { data: tokenRows, error: tokenErr } = await sb.rpc("lookup_active_token", { _hash: tokenHash });
  if (tokenErr || !tokenRows || tokenRows.length === 0) {
    return json(401, { error: "token_revoked_or_unknown" });
  }
  const token = tokenRows[0];
  const agentIdentity = agent_identity_override || token.agent_identity;

  // helper to write audit log + return
  const audit = async (status: string, extra: Record<string, unknown> = {}) => {
    await sb.from("audit_logs").insert({
      user_id: token.user_id,
      app_id: token.app_id,
      action_name: action,
      agent_identity: agentIdentity,
      status,
      payload: { input: payload ?? null, token_label: token.label, ...extra },
    });
    await sb.from("agent_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", token.id);
  };

  // 4. Resolve the action definition
  const { data: actionDef } = await sb
    .from("agent_actions")
    .select("*")
    .eq("app_id", token.app_id)
    .eq("name", action)
    .maybeSingle();

  if (!actionDef) {
    await audit("blocked", { reason: "action_not_declared" });
    return json(404, { error: "action_not_declared", action });
  }

  // 5. Permission check — token must have any required scope
  const { data: perms } = await sb
    .from("permissions")
    .select("scope, allowed_agents, enabled")
    .eq("app_id", token.app_id)
    .eq("action_id", actionDef.id)
    .eq("enabled", true);

  const requiredScopes = (perms ?? []).map((p: any) => p.scope);
  if (requiredScopes.length > 0) {
    const granted = token.allowed_scopes ?? [];
    const ok = requiredScopes.every((s: string) => granted.includes(s));
    if (!ok) {
      await audit("blocked", { reason: "scope_denied", required: requiredScopes, granted });
      return json(403, { error: "scope_denied", required: requiredScopes, granted });
    }
  }

  // 6. Per-agent allow-list (if any permission row restricts agents)
  for (const p of perms ?? []) {
    const allowed = (p as any).allowed_agents ?? [];
    if (allowed.length > 0 && !allowed.includes(agentIdentity)) {
      await audit("blocked", { reason: "agent_not_allowed", agent: agentIdentity });
      return json(403, { error: "agent_not_allowed", agent: agentIdentity });
    }
  }

  // 7. Approval rules — global flag on action OR matching rule
  let needsApproval = !!actionDef.requires_approval;
  let approvalReason = needsApproval ? "action_requires_approval" : "";

  if (!needsApproval) {
    const { data: rules } = await sb
      .from("approval_rules")
      .select("*")
      .eq("app_id", token.app_id)
      .eq("enabled", true);

    for (const rule of rules ?? []) {
      // Simple condition matching: condition is a field name in payload, threshold is numeric
      const field = (rule as any).condition;
      const threshold = (rule as any).threshold;
      if (field && payload && typeof payload === "object") {
        const value = Number((payload as any)[field]);
        if (!Number.isNaN(value) && threshold != null && value >= Number(threshold)) {
          needsApproval = true;
          approvalReason = `rule:${(rule as any).name}`;
          break;
        }
      }
    }
  }

  if (needsApproval) {
    const { data: approval } = await sb
      .from("pending_approvals")
      .insert({
        user_id: token.user_id,
        app_id: token.app_id,
        token_id: token.id,
        action_name: action,
        agent_identity: agentIdentity,
        payload: payload ?? null,
        reason: approvalReason,
        status: "pending",
      })
      .select()
      .single();

    // Best-effort: post to Slack if the app has a configured channel and the connector is linked.
    let slackPosted = false;
    let slackError: string | null = null;
    if (approval && isSlackConnected()) {
      const { data: app } = await sb
        .from("connected_apps")
        .select("name, slack_channel_id")
        .eq("id", token.app_id)
        .maybeSingle();
      if (app?.slack_channel_id) {
        const origin = req.headers.get("origin") || "https://agentgate.lovable.app";
        const dashUrl = `${origin}/app/approvals?id=${approval.id}`;
        try {
          const res = await postApprovalMessage({
            channel: app.slack_channel_id,
            approvalId: approval.id,
            appName: app.name,
            actionName: action,
            agentIdentity,
            payload: payload ?? null,
            reason: approvalReason,
            appUrl: dashUrl,
          });
          if (res.ok) {
            slackPosted = true;
            await sb
              .from("pending_approvals")
              .update({
                slack_message_ts: (res as any).ts ?? null,
                slack_channel_id: app.slack_channel_id,
              })
              .eq("id", approval.id);
          } else {
            slackError = (res as any).error ?? "unknown";
          }
        } catch (e) {
          slackError = (e as Error).message;
        }
      }
    }

    await audit("pending", {
      approval_id: approval?.id,
      reason: approvalReason,
      slack_posted: slackPosted,
      slack_error: slackError,
    });
    return json(202, {
      status: "pending_approval",
      approval_id: approval?.id,
      reason: approvalReason,
      slack_notified: slackPosted,
      message: "Action queued for human approval. Poll or subscribe for resolution.",
    });
  }

  // 8. Forward (in v1 we simulate — Phase 2.5 will add real upstream HTTP forwarding)
  const result = {
    simulated: true,
    action,
    note: "BridgeAI v1 returns a simulated success. Connect a real endpoint to forward to your app.",
  };

  await audit("success", { result });

  return json(200, {
    status: "ok",
    action,
    agent: agentIdentity,
    result,
  });
});
