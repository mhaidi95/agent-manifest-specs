import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Token = {
  id: string; label: string; token_prefix: string; agent_identity: string;
  allowed_scopes: string[]; revoked_at: string | null; last_used_at: string | null;
  created_at: string; app_id: string;
  app_name?: string;
};
type App = { id: string; name: string };

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function genToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `bai_${b64}`;
}

export default function Tokens() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [open, setOpen] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", agent_identity: "agent://openai/operator", app_id: "", scopes: "" });

  const load = async () => {
    const [{ data: t }, { data: a }] = await Promise.all([
      supabase.from("agent_tokens").select("*").order("created_at", { ascending: false }),
      supabase.from("connected_apps").select("id, name"),
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
                <Button variant="outline" size="sm" onClick={() => revoke(t.id)}>Revoke</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => remove(t.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{newToken ? "Token created" : "Create agent token"}</DialogTitle>
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
    </div>
  );
}
