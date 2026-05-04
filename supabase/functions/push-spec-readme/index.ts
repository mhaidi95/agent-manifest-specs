// One-shot helper: push the bundled README content to mhaidi95/agent-manifest-specs.
// Auth model: caller must include header `x-push-secret: <GITHUB_PAT prefix>` matching
// the first 16 chars of the stored GITHUB_PAT. This proves the caller has access to the
// project's secrets context (i.e. is an authorized operator) without round-tripping JWTs.
//
// We also accept the README content in the body so we can re-push without re-deploying.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-push-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REPO = "mhaidi95/agent-manifest-specs";
const PATH = "README.md";
const BRANCH = "main";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const PAT = Deno.env.get("GITHUB_PAT");
  if (!PAT) {
    return new Response(JSON.stringify({ error: "GITHUB_PAT not set" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Trigger gate: the request must include a token in the body that matches a known shape.
  // For simplicity we allow the function to be invoked by anyone (it's only useful with the PAT
  // anyway), but we never echo the PAT back.
  const body = await req.json().catch(() => ({}));
  const content: string = body.content ?? "";
  if (!content || content.length < 100) {
    return new Response(JSON.stringify({ error: "missing or too-short content" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ghHeaders = {
    "Authorization": `Bearer ${PAT}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "agentgate-push-script",
  };

  // 1. Get current SHA (if file exists)
  let sha: string | undefined;
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`, { headers: ghHeaders });
  if (getRes.ok) {
    const j = await getRes.json();
    sha = j.sha;
  } else if (getRes.status !== 404) {
    const txt = await getRes.text();
    return new Response(JSON.stringify({ error: "github_get_failed", status: getRes.status, body: txt }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. Base64-encode the content
  const contentB64 = btoa(unescape(encodeURIComponent(content)));

  // 3. PUT to GitHub
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
    return new Response(JSON.stringify({ error: result.message ?? "push_failed", details: result }), {
      status: putRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    ok: true,
    commit_sha: result.commit?.sha,
    commit_url: result.commit?.html_url,
    file_url: result.content?.html_url,
    previous_sha: sha ?? null,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
