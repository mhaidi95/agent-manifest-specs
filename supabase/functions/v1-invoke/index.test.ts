// Automated test suite for /v1-invoke
// Exercises every declared action and asserts both HTTP responses and audit log rows.
//
// Setup:
//   - Uses an existing test app + actions seeded for user 577e4c92-...
//   - Mints a fresh token per run (sha256-hashed, inserted via service role)
//   - Seeds the permission/approval rows the suite needs
//   - Cleans up token + suite-scoped rows at the end
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INVOKE_URL = `${SUPABASE_URL}/functions/v1/v1-invoke`;

const APP_ID = "b41f79ae-a8d1-4de4-abfa-539a10217b49";
const USER_ID = "577e4c92-6ac2-4bb9-aa02-f7f18424cc47";
const AGENT = "agent://test/suite-runner";

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ---- One-time setup: mint token + ensure permissions exist ----
const RAW_TOKEN = `bai_suite_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
const TOKEN_HASH = await sha256(RAW_TOKEN);
let TOKEN_ID = "";
let SUITE_START = new Date().toISOString();

async function setup() {
  SUITE_START = new Date().toISOString();
  const { data, error } = await sb.from("agent_tokens").insert({
    user_id: USER_ID,
    app_id: APP_ID,
    label: "test-suite",
    token_hash: TOKEN_HASH,
    token_prefix: RAW_TOKEN.slice(0, 12),
    agent_identity: AGENT,
    allowed_scopes: ["users:read", "users:write"],
  }).select("id").single();
  if (error) throw error;
  TOKEN_ID = data!.id;

  // Make sure list_users has a satisfied scope and get_user has an unsatisfied one
  // (matches the topology validated earlier; idempotent: ignore conflicts)
  await sb.from("permissions").upsert([
    { user_id: USER_ID, app_id: APP_ID, action_id: await actionId("list_users"), scope: "users:read", enabled: true },
    { user_id: USER_ID, app_id: APP_ID, action_id: await actionId("get_user"),   scope: "users:admin", enabled: true },
  ], { onConflict: "id" });
}

const actionIdCache = new Map<string, string>();
async function actionId(name: string) {
  if (actionIdCache.has(name)) return actionIdCache.get(name)!;
  const { data } = await sb.from("agent_actions").select("id").eq("app_id", APP_ID).eq("name", name).single();
  actionIdCache.set(name, data!.id);
  return data!.id;
}

async function teardown() {
  await sb.from("agent_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", TOKEN_ID);
  // Remove suite audit rows + pending approvals to keep prod data clean
  await sb.from("audit_logs").delete().eq("agent_identity", AGENT).gte("created_at", SUITE_START);
  await sb.from("pending_approvals").delete().eq("agent_identity", AGENT).gte("created_at", SUITE_START);
}

async function invoke(action: string, payload: unknown = null, token = RAW_TOKEN) {
  const res = await fetch(INVOKE_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-bridgeai-token": token },
    body: JSON.stringify({ action, payload }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function lastAudit(action: string) {
  const { data } = await sb
    .from("audit_logs")
    .select("status, payload, action_name")
    .eq("agent_identity", AGENT)
    .eq("action_name", action)
    .gte("created_at", SUITE_START)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0];
}

// ---- The suite ----
await setup();

try {
  // ── Auth branch ────────────────────────────────────────────────
  Deno.test("auth: missing token → 401", async () => {
    const res = await fetch(INVOKE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "list_users" }),
    });
    await res.text();
    assertEquals(res.status, 401);
  });

  Deno.test("auth: forged token → 401", async () => {
    const { status, body } = await invoke("list_users", null, "bai_forged_xxx");
    assertEquals(status, 401);
    assertEquals(body.error, "token_revoked_or_unknown");
  });

  // ── Default-deny ──────────────────────────────────────────────
  Deno.test("default-deny: undeclared action → 404 + blocked audit", async () => {
    const { status, body } = await invoke("drop_database");
    assertEquals(status, 404);
    assertEquals(body.error, "action_not_declared");
    const log = await lastAudit("drop_database");
    assertEquals(log?.status, "blocked");
    assertEquals((log?.payload as any).reason, "action_not_declared");
  });

  // ── Scope enforcement ─────────────────────────────────────────
  Deno.test("scope: list_users (users:read granted) → 200 + success audit", async () => {
    const { status, body } = await invoke("list_users", { limit: 5 });
    assertEquals(status, 200);
    assertEquals(body.status, "ok");
    const log = await lastAudit("list_users");
    assertEquals(log?.status, "success");
  });

  Deno.test("scope: get_user (users:admin missing) → 403 scope_denied + blocked audit", async () => {
    const { status, body } = await invoke("get_user", { id: "u_1" });
    assertEquals(status, 403);
    assertEquals(body.error, "scope_denied");
    assert(body.required.includes("users:admin"));
    const log = await lastAudit("get_user");
    assertEquals(log?.status, "blocked");
    assertEquals((log?.payload as any).reason, "scope_denied");
  });

  // ── Approval branch (action-level requires_approval=true) ─────
  for (const action of ["delete_user", "grant_admin", "suspend_user"]) {
    Deno.test(`approval: ${action} (high-risk) → 202 pending + pending audit`, async () => {
      const { status, body } = await invoke(action, { id: "u_42" });
      assertEquals(status, 202);
      assertEquals(body.status, "pending_approval");
      assert(body.approval_id, "expected approval_id in response");
      const log = await lastAudit(action);
      assertEquals(log?.status, "pending");
      assertEquals((log?.payload as any).approval_id, body.approval_id);
    });
  }

  // ── Threshold-based approval rule (refund > 100) ──────────────
  Deno.test("rule: refund_customer (any amount, action.requires_approval=true) → 202 pending", async () => {
    // refund_customer has requires_approval=true at action level, so it always queues
    const { status, body } = await invoke("refund_customer", { amount: 250, customer_id: "c_9" });
    assertEquals(status, 202);
    assertEquals(body.status, "pending_approval");
    const log = await lastAudit("refund_customer");
    assertEquals(log?.status, "pending");
    // Verify the queued approval preserved the payload
    const { data: approval } = await sb
      .from("pending_approvals")
      .select("payload, status, action_name")
      .eq("id", body.approval_id)
      .single();
    assertEquals(approval?.action_name, "refund_customer");
    assertEquals((approval?.payload as any).amount, 250);
  });

  // ── Medium-risk action with no permission row + no approval ───
  Deno.test("pass-through: reset_password (medium, no perms, no approval) → 200 success", async () => {
    const { status, body } = await invoke("reset_password", { id: "u_5" });
    assertEquals(status, 200);
    assertEquals(body.status, "ok");
    const log = await lastAudit("reset_password");
    assertEquals(log?.status, "success");
  });

  // ── Validation ────────────────────────────────────────────────
  Deno.test("validation: missing action → 400", async () => {
    const res = await fetch(INVOKE_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-bridgeai-token": RAW_TOKEN },
      body: JSON.stringify({ payload: {} }),
    });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(body.error, "missing_action");
  });

  Deno.test("validation: bad JSON → 400", async () => {
    const res = await fetch(INVOKE_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-bridgeai-token": RAW_TOKEN },
      body: "{not json",
    });
    const body = await res.json();
    assertEquals(res.status, 400);
    assertEquals(body.error, "invalid_json");
  });

  Deno.test("method: GET → 405", async () => {
    const res = await fetch(INVOKE_URL, {
      method: "GET",
      headers: { "x-bridgeai-token": RAW_TOKEN },
    });
    await res.text();
    assertEquals(res.status, 405);
  });

  // ── Cleanup runs as the final test so it always executes after all assertions ──
  Deno.test({
    name: "cleanup: revoke token + clear suite rows",
    sanitizeOps: false,
    sanitizeResources: false,
    fn: async () => { await teardown(); },
  });
} catch (e) {
  await teardown();
  throw e;
}
