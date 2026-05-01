import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Plus, Copy, Trash2, PlayCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Token = {
  id: string; label: string; token_prefix: string; agent_identity: string;
  allowed_scopes: string[]; revoked_at: string | null; last_used_at: string | null;
  created_at: string; app_id: string;
  app_name?: string;
};
type App = { id: string; name: string; manifest: any };

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function genToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `bai_${b64}`;
}

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/v1-invoke`;

export default function Tokens() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [open, setOpen] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", agent_identity: "agent://openai/operator", app_id: "", scopes: "" });

  // Playground state
  const [playOpen, setPlayOpen] = useState(false);
  const [playToken, setPlayToken] = useState<Token | null>(null);
  const [playTokenValue, setPlayTokenValue] = useState("");
  const [playAction, setPlayAction] = useState("");
  const [playParams, setPlayParams] = useState("{}");
  const [playLoading, setPlayLoading] = useState(false);
  const [playResponse, setPlayResponse] = useState<{ status: number; body: any } | null>(null);

  const load = async () => {
    const [{ data: t }, { data: a }] = await Promise.all([
      supabase.from("agent_tokens").select("*").order("created_at", { ascending: false }),
      supabase.from("connected_apps").select("id, name, manifest"),
    ]);
    const appMap = new Map((a ?? []).map((x: any) => [x.id, x.name]));
    setTokens(((t ?? []) as any[]).map(row => ({ ...row, app_name: appMap.get(row.app_id) })) as Token[]);
    setApps((a ?? []) as App[]);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    if (!form.label || !form.app_id) { toast.error("Label and app are required"); return; }
    const raw = genToken();
    const hash = await sha256(raw);
    const scopes = form.scopes.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("agent_tokens").insert({
      user_id: user!.id, app_id: form.app_id, label: form.label,
      token_hash: hash, token_prefix: raw.slice(0, 12),
      agent_identity: form.agent_identity, allowed_scopes: scopes,
    });
    if (error) { toast.error(error.message); return; }
    setNewToken(raw); load();
  };

  const revoke = async (id: string) => {
    await supabase.from("agent_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    toast.success("Token revoked"); load();
  };
  const remove = async (id: string) => {
    await supabase.from("agent_tokens").delete().eq("id", id);
    toast.success("Token deleted"); load();
  };

  const openPlayground = (t: Token) => {
    setPlayToken(t);
    setPlayTokenValue("");
    setPlayResponse(null);
    const app = apps.find(a => a.id === t.app_id);
    const firstAction = app?.manifest?.actions?.[0]?.name ?? "";
    setPlayAction(firstAction);
    setPlayParams("{}");
    setPlayOpen(true);
  };

  const sendPlayground = async () => {
    if (!playTokenValue.startsWith("bai_")) {
      toast.error("Paste the bai_ token you copied when creating it.");
      return;
    }
    let parsed: any;
    try { parsed = JSON.parse(playParams || "{}"); }
    catch { toast.error("Parameters must be valid JSON"); return; }

    setPlayLoading(true);
    setPlayResponse(null);
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bridgeai-token": playTokenValue.trim(),
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: playAction, parameters: parsed }),
      });
      const body = await res.json().catch(() => ({}));
      setPlayResponse({ status: res.status, body });
    } catch (e: any) {
      setPlayResponse({ status: 0, body: { error: e?.message ?? "Network error" } });
    } finally {
      setPlayLoading(false);
    }
  };

  const playApp = playToken ? apps.find(a => a.id === playToken.app_id) : null;
  const playActions: any[] = playApp?.manifest?.actions ?? [];

  const statusColor = (s: number) =>
    s >= 200 && s < 300 ? "bg-success text-success-foreground"
    : s === 202 ? "bg-warning text-warning-foreground"
    : s >= 400 ? "bg-destructive text-destructive-foreground"
    : "bg-secondary text-secondary-foreground";

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent tokens</h1>
          <p className="text-muted-foreground mt-1">Per-agent API keys for the <code className="font-mono text-foreground">/v1/invoke</code> runtime.</p>
        </div>
        <Button onClick={() => { setNewToken(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New token
        </Button>
      </div>

      {tokens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <KeyRound className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No tokens yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create one to let an agent call your app safely.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {tokens.map(t => (
            <div key={t.id} className="p-5 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  <code className="font-mono">{t.token_prefix}…</code> · {t.agent_identity}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {t.app_name && <Badge variant="outline" className="mr-2">{t.app_name}</Badge>}
                {t.allowed_scopes.length > 0 && <span>{t.allowed_scopes.length} scopes</span>}
              </div>
              {t.revoked_at ? (
                <Badge variant="destructive">revoked</Badge>
              ) : (
                <Badge className="bg-success text-success-foreground">active</Badge>
              )}
              {!t.revoked_at && (
                <>
                  <Button variant="default" size="sm" onClick={() => openPlayground(t)}>
                    <PlayCircle className="h-4 w-4 mr-1.5" /> Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => revoke(t.id)}>Revoke</Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => remove(t.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create token dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{newToken ? "Token created" : "Create agent token"}</DialogTitle>
            <DialogDescription>
              {newToken ? "This is the only time you'll see the full token." : "Configure scope and identity for the agent."}
            </DialogDescription>
          </DialogHeader>
          {newToken ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Copy this token now. You won't be able to see it again.</p>
              <div className="rounded-md bg-secondary p-3 font-mono text-xs break-all">{newToken}</div>
              <Button onClick={() => { navigator.clipboard.writeText(newToken); toast.success("Copied"); }} className="w-full">
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Label</Label>
                <Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Production – Operator" />
              </div>
              <div>
                <Label>App</Label>
                <Select value={form.app_id} onValueChange={v => setForm({ ...form, app_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select app" /></SelectTrigger>
                  <SelectContent>
                    {apps.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Agent identity</Label>
                <Input value={form.agent_identity} onChange={e => setForm({ ...form, agent_identity: e.target.value })} />
              </div>
              <div>
                <Label>Allowed scopes (comma-separated)</Label>
                <Input value={form.scopes} onChange={e => setForm({ ...form, scopes: e.target.value })} placeholder="orders:read, orders:write" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create}>Generate token</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Playground dialog */}
      <Dialog open={playOpen} onOpenChange={setPlayOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test request — {playToken?.label}</DialogTitle>
            <DialogDescription>
              Fire a sample call against <code className="font-mono">/v1/invoke</code>. Tokens are sent as <code className="font-mono">x-bridgeai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paste your <code className="font-mono">bai_</code> token</Label>
              <Input
                value={playTokenValue}
                onChange={e => setPlayTokenValue(e.target.value)}
                placeholder={`${playToken?.token_prefix ?? "bai_"}…`}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For security, the full token isn't stored — paste the one you copied when you created it.
              </p>
            </div>
            <div>
              <Label>Action</Label>
              <Select
                value={playAction}
                onValueChange={v => {
                  setPlayAction(v);
                  const a = playActions.find(x => x.name === v);
                  const sample: Record<string, any> = {};
                  (a?.parameters ?? []).forEach((p: any) => {
                    sample[p.name] = p.type === "number" ? 0 : p.type === "boolean" ? false : "example";
                  });
                  setPlayParams(JSON.stringify(sample, null, 2));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Pick an action" /></SelectTrigger>
                <SelectContent>
                  {playActions.map(a => (
                    <SelectItem key={a.name} value={a.name}>
                      {a.name} · <span className="text-muted-foreground">{a.risk_level}{a.requires_approval ? " · approval" : ""}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parameters (JSON)</Label>
              <Textarea
                value={playParams}
                onChange={e => setPlayParams(e.target.value)}
                rows={5}
                className="font-mono text-xs"
              />
            </div>
            <Button onClick={sendPlayground} disabled={playLoading} className="w-full">
              {playLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : <><PlayCircle className="h-4 w-4 mr-2" /> Send request</>}
            </Button>

            {playResponse && (
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Response</span>
                  <Badge className={statusColor(playResponse.status)}>HTTP {playResponse.status}</Badge>
                </div>
                <pre className="text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">
                  {JSON.stringify(playResponse.body, null, 2)}
                </pre>
                <p className="text-xs text-muted-foreground mt-3">
                  See <strong>Logs</strong> for the immutable audit entry, or <strong>Pending approvals</strong> if it was queued.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
