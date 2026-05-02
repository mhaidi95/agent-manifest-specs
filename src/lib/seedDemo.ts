import { supabase } from "@/integrations/supabase/client";

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function genToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `bai_${b64}`;
}

export type SeedResult = {
  appId: string;
  actionName: string;
  token: string;
  proxyUrl: string;
};

/**
 * Seeds a demo "Acme Helpdesk" app with one safe action (`get_ticket`),
 * a permission, and a fresh agent token. Returns the plaintext token
 * (shown once) plus the invoke URL so the user can immediately curl.
 */
export async function seedDemoApp(userId: string): Promise<SeedResult> {
  // 1. App
  const { data: app, error: appErr } = await supabase
    .from("connected_apps")
    .insert({
      user_id: userId,
      name: "Acme Helpdesk (demo)",
      base_url: "https://api.acme-helpdesk.example.com",
      description: "Auto-seeded demo app for the AgentGate beta walkthrough.",
      status: "active",
      manifest: {
        spec_version: "1.0",
        name: "Acme Helpdesk",
        actions: [{ name: "get_ticket", method: "GET", risk: "low" }],
      },
    })
    .select("id")
    .single();
  if (appErr || !app) throw appErr ?? new Error("app insert failed");

  // 2. Action
  const { data: action, error: actionErr } = await supabase
    .from("agent_actions")
    .insert({
      user_id: userId,
      app_id: app.id,
      name: "get_ticket",
      description: "Fetch a single helpdesk ticket by id (read-only, safe).",
      method: "GET",
      endpoint: "/tickets/:id",
      risk_level: "low",
      requires_approval: false,
      parameters: [{ name: "ticket_id", type: "string", required: true }],
    })
    .select("id")
    .single();
  if (actionErr || !action) throw actionErr ?? new Error("action insert failed");

  // 3. Permission (this is what /v1-invoke checks)
  const { error: permErr } = await supabase.from("permissions").insert({
    user_id: userId,
    app_id: app.id,
    action_id: action.id,
    scope: "tickets:read",
    enabled: true,
    allowed_agents: ["agent://demo/beta-tester"],
  });
  if (permErr) throw permErr;

  // 4. Token
  const plaintext = genToken();
  const hash = await sha256(plaintext);
  const { error: tokErr } = await supabase.from("agent_tokens").insert({
    user_id: userId,
    app_id: app.id,
    label: "Demo token",
    token_hash: hash,
    token_prefix: plaintext.slice(0, 8),
    agent_identity: "agent://demo/beta-tester",
    allowed_scopes: ["tickets:read"],
  });
  if (tokErr) throw tokErr;

  return {
    appId: app.id,
    actionName: "get_ticket",
    token: plaintext,
    proxyUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/v1-invoke`,
  };
}
