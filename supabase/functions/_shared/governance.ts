// Shared AgentGate governance pipeline.
// Used by both /v1/invoke (HTTP) and /mcp (Model Context Protocol) so every
// agent action — no matter the surface — goes through the same checks:
//   resolve token → resolve action → enforce scopes → enforce approval rules
//   → (forward or queue) → write audit log.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { postApprovalMessage, isSlackConnected } from "./slack.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

export async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export type ResolvedToken = {
  id: string;
  user_id: string;
  app_id: string;
  agent_identity: string;
  allowed_scopes: string[] | null;
  label: string;
};

export async function resolveToken(
  sb: SupabaseClient,
  rawToken: string,
): Promise<ResolvedToken | null> {
  if (!rawToken || !rawToken.startsWith("bai_")) return null;
  const tokenHash = await sha256(rawToken);
  const { data, error } = await sb.rpc("lookup_active_token", { _hash: tokenHash });
  if (error || !data || data.length === 0) return null;
  return data[0] as ResolvedToken;
}

export type InvokeOutcome =
  | { kind: "blocked"; httpStatus: number; error: string; details?: Record<string, unknown> }
  | {
      kind: "pending";
      approvalId: string;
      reason: string;
      slackPosted: boolean;
      slackError: string | null;
    }
  | { kind: "ok"; result: Record<string, unknown> };

export type InvokeArgs = {
  token: ResolvedToken;
  action: string;
  payload: unknown;
  agentIdentityOverride?: string | null;
  /** Surface the call came from — recorded in audit log for filtering. */
  source: "http" | "mcp";
  /** Used to build a dashboard link in the Slack approval message. */
  origin?: string | null;
};

/**
 * Run the full governance pipeline for a single action. Writes its own audit
 * log entry and updates `agent_tokens.last_used_at` on every call.
 */
export async function runInvoke(args: InvokeArgs): Promise<InvokeOutcome> {
  const sb = adminClient();
  const { token, action, payload, source } = args;
  const agentIdentity = args.agentIdentityOverride || token.agent_identity;

  const audit = async (status: string, extra: Record<string, unknown> = {}) => {
    await sb.from("audit_logs").insert({
      user_id: token.user_id,
      app_id: token.app_id,
      action_name: action,
      agent_identity: agentIdentity,
      status,
      payload: { input: payload ?? null, token_label: token.label, source, ...extra },
    });
    await sb.from("agent_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", token.id);
  };

  // 1. Resolve action
  const { data: actionDef } = await sb
    .from("agent_actions")
    .select("*")
    .eq("app_id", token.app_id)
    .eq("name", action)
    .maybeSingle();

  if (!actionDef) {
    await audit("blocked", { reason: "action_not_declared" });
    return { kind: "blocked", httpStatus: 404, error: "action_not_declared", details: { action } };
  }

  // 2. Permissions
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
      return {
        kind: "blocked",
        httpStatus: 403,
        error: "scope_denied",
        details: { required: requiredScopes, granted },
      };
    }
  }

  for (const p of perms ?? []) {
    const allowed = (p as any).allowed_agents ?? [];
    if (allowed.length > 0 && !allowed.includes(agentIdentity)) {
      await audit("blocked", { reason: "agent_not_allowed", agent: agentIdentity });
      return {
        kind: "blocked",
        httpStatus: 403,
        error: "agent_not_allowed",
        details: { agent: agentIdentity },
      };
    }
  }

  // 3. Approval rules
  let needsApproval = !!actionDef.requires_approval;
  let approvalReason = needsApproval ? "action_requires_approval" : "";

  if (!needsApproval) {
    const { data: rules } = await sb
      .from("approval_rules")
      .select("*")
      .eq("app_id", token.app_id)
      .eq("enabled", true);

    for (const rule of rules ?? []) {
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

    let slackPosted = false;
    let slackError: string | null = null;
    if (approval && isSlackConnected()) {
      const { data: app } = await sb
        .from("connected_apps")
        .select("name, slack_channel_id")
        .eq("id", token.app_id)
        .maybeSingle();
      if (app?.slack_channel_id) {
        const origin = args.origin || "https://agentgate.lovable.app";
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

    return {
      kind: "pending",
      approvalId: approval?.id ?? "",
      reason: approvalReason,
      slackPosted,
      slackError,
    };
  }

  // 4. Forward (simulated in v1)
  const result = {
    simulated: true,
    action,
    note: "AgentGate v1 returns a simulated success. Connect a real endpoint to forward to your app.",
  };
  await audit("success", { result });
  return { kind: "ok", result };
}

/**
 * List all declared actions for a token's app. Used by the MCP adapter to
 * advertise tools to MCP clients.
 */
export async function listActionsForToken(token: ResolvedToken) {
  const sb = adminClient();
  const { data, error } = await sb
    .from("agent_actions")
    .select("name, description, parameters, risk_level, requires_approval")
    .eq("app_id", token.app_id)
    .order("name", { ascending: true });
  if (error) return [];
  return data ?? [];
}
