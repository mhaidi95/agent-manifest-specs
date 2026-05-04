// Shared Slack helpers for AgentGate.
// All calls go through the Lovable connector gateway when SLACK_API_KEY is present.
// If the connector is not linked, helpers return { ok: false, error: "slack_not_connected" }
// so callers can degrade gracefully without throwing.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/slack/api";

function slackEnv() {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const slack = Deno.env.get("SLACK_API_KEY");
  if (!lovable || !slack) return null;
  return { lovable, slack };
}

export function isSlackConnected() {
  return !!slackEnv();
}

async function slackCall(path: string, body: Record<string, unknown>) {
  const env = slackEnv();
  if (!env) return { ok: false, error: "slack_not_connected" };
  const res = await fetch(`${GATEWAY_URL}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.lovable}`,
      "X-Connection-Api-Key": env.slack,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    return { ok: false, error: json?.error || `http_${res.status}`, raw: json };
  }
  return { ok: true, ...json };
}

export type ApprovalMessageInput = {
  channel: string;
  approvalId: string;
  appName: string;
  actionName: string;
  agentIdentity: string | null;
  payload: unknown;
  reason: string | null;
  appUrl: string; // dashboard URL to open the approval
};

export async function postApprovalMessage(i: ApprovalMessageInput) {
  const payloadPreview = (() => {
    try {
      const s = JSON.stringify(i.payload, null, 2);
      return s.length > 1500 ? s.slice(0, 1500) + "\n…(truncated)" : s;
    } catch {
      return String(i.payload ?? "");
    }
  })();

  return slackCall("chat.postMessage", {
    channel: i.channel,
    text: `Agent action awaiting approval: ${i.actionName}`, // fallback for notifications
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🛡️  Agent action awaiting approval" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*App*\n${i.appName}` },
          { type: "mrkdwn", text: `*Action*\n\`${i.actionName}\`` },
          { type: "mrkdwn", text: `*Agent*\n\`${i.agentIdentity ?? "anonymous"}\`` },
          { type: "mrkdwn", text: `*Reason*\n${i.reason ?? "—"}` },
        ],
      },
      payloadPreview
        ? {
            type: "section",
            text: { type: "mrkdwn", text: "*Payload*\n```" + payloadPreview + "```" },
          }
        : null,
      {
        type: "actions",
        elements: [
          {
            type: "button",
            style: "primary",
            text: { type: "plain_text", text: "Open in AgentGate" },
            url: i.appUrl,
          },
        ],
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Approval \`${i.approvalId}\` · expires in 24h` },
        ],
      },
    ].filter(Boolean),
  });
}

export async function listChannels() {
  return slackCall("conversations.list", {
    limit: 200,
    types: "public_channel,private_channel",
    exclude_archived: true,
  });
}
