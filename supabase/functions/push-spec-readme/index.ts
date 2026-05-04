// One-shot helper: push repo-public/README.md content to mhaidi95/agent-manifest-specs.
// Admin-only. Reads GITHUB_PAT secret, never returns it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REPO = "mhaidi95/agent-manifest-specs";
const PATH = "README.md";
const BRANCH = "main";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth: must be signed in and admin
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: claims } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
  const uid = claims?.claims?.sub;
  if (!uid) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

  const { data: isAdmin } = await sb.rpc("has_role", { _user_id: uid, _role: "admin" });
  if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });

  const PAT = Deno.env.get("GITHUB_PAT");
  if (!PAT) return new Response(JSON.stringify({ error: "GITHUB_PAT not set" }), { status: 500, headers: corsHeaders });

  // Body must include the README content (base64-encoded by caller, or raw text)
  const body = await req.json().catch(() => ({}));
  const content: string = body.content ?? "";
  if (!content) return new Response(JSON.stringify({ error: "missing content" }), { status: 400, headers: corsHeaders });

  const ghHeaders = {
    "Authorization": `Bearer ${PAT}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "agentgate-push-script",
  };

  // 1. Get existing SHA (if any)
  let sha: string | undefined;
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: ghHeaders });
  if (getRes.ok) {
    const j = await getRes.json();
    sha = j.sha;
  }

  // 2. Base64 encode
  const contentB64 = btoa(unescape(encodeURIComponent(content)));

  // 3. PUT
  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "docs: align README with new positioning (approval & audit gateway)",
      content: contentB64,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  const result = await putRes.json();
  if (!putRes.ok) {
    return new Response(JSON.stringify({ error: result.message ?? "push failed", details: result }), {
      status: putRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    ok: true,
    commit_sha: result.commit?.sha,
    commit_url: result.commit?.html_url,
    file_url: result.content?.html_url,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
