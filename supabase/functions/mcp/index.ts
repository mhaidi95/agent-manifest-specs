// /mcp — Model Context Protocol adapter for AgentGate.
//
// Exposes every declared agent_action of an app as an MCP tool. When an MCP
// client (Claude Desktop, OpenAI MCP, Cursor, etc.) calls a tool, the request
// runs through the same governance pipeline as /v1/invoke — scopes, approval
// rules, audit log — so the gateway works identically over HTTP and MCP.
//
// Auth: clients send `Authorization: Bearer bai_...` (an AgentGate token).
// Transport: Streamable HTTP (per MCP spec).
//
// MCP client config example:
//   {
//     "mcpServers": {
//       "agentgate": {
//         "url": "https://<project>.functions.supabase.co/mcp",
//         "headers": { "Authorization": "Bearer bai_..." }
//       }
//     }
//   }
import { Hono } from "npm:hono@4.6.14";
import { McpServer, StreamableHttpTransport } from "npm:mcp-lite@^0.10.0";
import {
  adminClient,
  listActionsForToken,
  resolveToken,
  runInvoke,
  type ResolvedToken,
} from "../_shared/governance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, mcp-session-id, mcp-protocol-version",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "mcp-session-id",
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractToken(req: Request): string {
  const auth = req.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-bridgeai-token") ?? "";
}

/** Convert AgentGate's stored parameter map into a JSON Schema object. */
function paramsToJsonSchema(parameters: unknown): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  if (parameters && typeof parameters === "object" && !Array.isArray(parameters)) {
    for (const [name, raw] of Object.entries(parameters as Record<string, any>)) {
      const def = raw && typeof raw === "object" ? raw : {};
      properties[name] = {
        type: def.type ?? "string",
        ...(def.description ? { description: def.description } : {}),
      };
      if (def.required) required.push(name);
    }
  }
  return {
    type: "object",
    properties,
    ...(required.length ? { required } : {}),
    additionalProperties: true,
  };
}

/** Build a fresh McpServer scoped to a single token's app. */
async function buildServerForToken(token: ResolvedToken) {
  const server = new McpServer({
    name: "agentgate",
    version: "1.0.0",
    description:
      "AgentGate — approval & audit gateway. Every tool call is scope-checked, optionally human-approved, and logged.",
  });

  const actions = await listActionsForToken(token);

  // Always expose a meta tool so clients can list actions even when none exist
  // yet, and humans inspecting the server see something useful.
  server.tool({
    name: "agentgate_list_actions",
    description: "List the agent actions this token can attempt to call.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            actions.map((a: any) => ({
              name: a.name,
              description: a.description,
              risk_level: a.risk_level,
              requires_approval: a.requires_approval,
            })),
            null,
            2,
          ),
        },
      ],
    }),
  });

  for (const action of actions as any[]) {
    server.tool({
      name: action.name,
      description:
        (action.description ?? `Invoke ${action.name}`) +
        ` · risk:${action.risk_level}` +
        (action.requires_approval ? " · requires human approval" : ""),
      inputSchema: paramsToJsonSchema(action.parameters),
      handler: async (input: unknown) => {
        const outcome = await runInvoke({
          token,
          action: action.name,
          payload: input ?? {},
          source: "mcp",
        });

        if (outcome.kind === "blocked") {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Blocked: ${outcome.error}${
                  outcome.details ? "\n" + JSON.stringify(outcome.details, null, 2) : ""
                }`,
              },
            ],
          };
        }
        if (outcome.kind === "pending") {
          return {
            content: [
              {
                type: "text",
                text:
                  `⏸ Awaiting human approval (${outcome.reason}).\n` +
                  `Approval ID: ${outcome.approvalId}\n` +
                  `Slack notified: ${outcome.slackPosted}` +
                  (outcome.slackError ? ` (error: ${outcome.slackError})` : ""),
              },
            ],
          };
        }
        return {
          content: [
            { type: "text", text: JSON.stringify(outcome.result, null, 2) },
          ],
        };
      },
    });
  }

  return server;
}

const app = new Hono();

app.options("/*", () => new Response("ok", { headers: corsHeaders }));

app.all("/*", async (c) => {
  const req = c.req.raw;

  const rawToken = extractToken(req);
  const sb = adminClient();
  const token = await resolveToken(sb, rawToken);
  if (!token) {
    return jsonResponse(401, {
      error: "missing_or_invalid_token",
      hint: "Send `Authorization: Bearer bai_...` (your AgentGate token).",
    });
  }

  const server = await buildServerForToken(token);
  const transport = new StreamableHttpTransport();
  const response = await transport.handleRequest(req, server);

  // Merge CORS headers onto the MCP response.
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

Deno.serve(app.fetch);
