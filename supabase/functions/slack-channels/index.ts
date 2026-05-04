// List Slack channels the connected workspace can post to.
// Used by the Apps page to populate the "approval channel" picker.
// Requires the user to be authenticated (verified in code).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { listChannels, isSlackConnected } from "../_shared/slack.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sb = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: claims } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
  if (!claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isSlackConnected()) {
    return new Response(JSON.stringify({ connected: false, channels: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await listChannels();
  if (!result.ok) {
    return new Response(JSON.stringify({ connected: true, error: result.error, channels: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const channels = ((result as any).channels ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    is_private: c.is_private,
    is_member: c.is_member,
  }));

  return new Response(JSON.stringify({ connected: true, channels }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
