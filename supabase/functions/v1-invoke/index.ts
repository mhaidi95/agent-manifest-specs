// /v1/invoke — runtime governance proxy for agent actions over HTTP.
// Thin wrapper around the shared governance pipeline.
import { adminClient, resolveToken, runInvoke } from "../_shared/governance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-bridgeai-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const sb = adminClient();

  // 1. Token (header or Bearer)
  const headerToken = req.headers.get("x-bridgeai-token");
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const rawToken = headerToken || bearer;
  const token = await resolveToken(sb, rawToken);
  if (!token) {
    return json(401, { error: "missing_or_invalid_token", hint: "Send `x-bridgeai-token: bai_...`" });
  }

  // 2. Body
  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "invalid_json" }); }
  const { action, payload, agent_identity_override } = body ?? {};
  if (!action || typeof action !== "string") {
    return json(400, { error: "missing_action" });
  }

  const outcome = await runInvoke({
    token,
    action,
    payload,
    agentIdentityOverride: agent_identity_override,
    source: "http",
    origin: req.headers.get("origin"),
  });

  if (outcome.kind === "blocked") {
    return json(outcome.httpStatus, { error: outcome.error, ...(outcome.details ?? {}) });
  }
  if (outcome.kind === "pending") {
    return json(202, {
      status: "pending_approval",
      approval_id: outcome.approvalId,
      reason: outcome.reason,
      slack_notified: outcome.slackPosted,
      message: "Action queued for human approval. Poll or subscribe for resolution.",
    });
  }
  return json(200, {
    status: "ok",
    action,
    agent: agent_identity_override || token.agent_identity,
    result: outcome.result,
  });
});
