// AI manifest generator — turns a description of a SaaS app into a structured,
// machine-readable agent manifest (actions, permissions, approval rules).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, baseUrl, description } = await req.json();

    if (!name || !description) {
      return new Response(JSON.stringify({ error: "name and description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are an expert at translating human-centered SaaS interfaces into machine-readable manifests for AI agents.
Given a SaaS app, output a JSON manifest with:
- summary: 1-sentence description
- actions: list of {name, description, method (GET/POST/PUT/DELETE), endpoint, parameters[{name,type,required}], risk_level (low/medium/high), requires_approval (boolean)}
- permission_scopes: list of {scope, description}
- approval_rules: list of {name, condition, threshold (optional)}
Be concrete, safety-conscious, and exhaustive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `App name: ${name}\nBase URL: ${baseUrl ?? "n/a"}\nDescription:\n${description}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_manifest",
            description: "Emit the machine-readable agent manifest",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
                      endpoint: { type: "string" },
                      parameters: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            type: { type: "string" },
                            required: { type: "boolean" },
                          },
                          required: ["name", "type", "required"],
                        },
                      },
                      risk_level: { type: "string", enum: ["low", "medium", "high"] },
                      requires_approval: { type: "boolean" },
                    },
                    required: ["name", "description", "method", "endpoint", "parameters", "risk_level", "requires_approval"],
                  },
                },
                permission_scopes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { scope: { type: "string" }, description: { type: "string" } },
                    required: ["scope", "description"],
                  },
                },
                approval_rules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      condition: { type: "string" },
                      threshold: { type: "number" },
                    },
                    required: ["name", "condition"],
                  },
                },
              },
              required: ["summary", "actions", "permission_scopes", "approval_rules"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_manifest" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const manifest = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    return new Response(JSON.stringify({ manifest }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-manifest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
