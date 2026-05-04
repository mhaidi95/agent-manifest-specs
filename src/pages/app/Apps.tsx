import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Sparkles, AppWindow, Trash2, Loader2, Slack } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

type App = {
  id: string;
  name: string;
  base_url: string;
  description: string | null;
  manifest: any;
  status: string;
  created_at: string;
  slack_channel_id: string | null;
  slack_channel_name: string | null;
};

type SlackChannel = { id: string; name: string; is_private: boolean };

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  base_url: z.string().trim().url().max(500),
  description: z.string().trim().min(10, "Describe what your app does (at least 10 chars)").max(2000),
});

export default function Apps() {
  const { user } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([]);

  const load = async () => {
    const { data } = await supabase.from("connected_apps").select("*").order("created_at", { ascending: false });
    setApps((data ?? []) as App[]);
  };

  const loadSlack = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("slack-channels");
      if (error) throw error;
      setSlackConnected(!!data?.connected);
      setSlackChannels(data?.channels ?? []);
    } catch {
      setSlackConnected(false);
      setSlackChannels([]);
    }
  };

  useEffect(() => { if (user) { load(); loadSlack(); } }, [user]);

  const create = async () => {
    const parsed = schema.safeParse({ name, base_url: baseUrl, description });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("connected_apps").insert({
      user_id: user!.id,
      name: parsed.data.name,
      base_url: parsed.data.base_url,
      description: parsed.data.description,
      status: "draft",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("App connected");
    setOpen(false); setName(""); setBaseUrl(""); setDescription("");
    load();
  };

  const generate = async (app: App) => {
    setGeneratingId(app.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-manifest", {
        body: { name: app.name, baseUrl: app.base_url, description: app.description },
      });
      if (error) throw error;
      if (!data?.manifest) throw new Error("No manifest returned");

      const manifest = data.manifest;

      // Save manifest + create actions
      await supabase.from("connected_apps").update({ manifest, status: "ready" }).eq("id", app.id);

      const actionRows = (manifest.actions ?? []).map((a: any) => ({
        user_id: user!.id,
        app_id: app.id,
        name: a.name,
        description: a.description,
        method: a.method,
        endpoint: a.endpoint,
        parameters: a.parameters ?? [],
        risk_level: a.risk_level ?? "low",
        requires_approval: !!a.requires_approval,
      }));
      if (actionRows.length) await supabase.from("agent_actions").insert(actionRows);

      const ruleRows = (manifest.approval_rules ?? []).map((r: any) => ({
        user_id: user!.id,
        app_id: app.id,
        name: r.name,
        condition: r.condition,
        threshold: r.threshold ?? null,
      }));
      if (ruleRows.length) await supabase.from("approval_rules").insert(ruleRows);

      const permRows = (manifest.permission_scopes ?? []).map((p: any) => ({
        user_id: user!.id,
        app_id: app.id,
        scope: p.scope,
      }));
      if (permRows.length) await supabase.from("permissions").insert(permRows);

      toast.success(`Generated ${actionRows.length} actions, ${permRows.length} permissions, ${ruleRows.length} approval rules`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setGeneratingId(null);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("connected_apps").delete().eq("id", id);
    toast.success("App removed");
    load();
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connected apps</h1>
          <p className="text-muted-foreground mt-1">The SaaS apps you're making agent-ready.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero hover:opacity-90"><Plus className="mr-2 h-4 w-4" /> Connect app</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Connect a new app</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>App name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Billing" />
              </div>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://app.acme.com" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does the app do? What can users do inside it? (e.g. manage subscriptions, refund orders, view invoices…)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={submitting} className="bg-gradient-hero hover:opacity-90">
                {submitting ? "Saving…" : "Connect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <AppWindow className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No apps yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Connect your first SaaS app to make it agent-readable.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {apps.map(app => (
            <div key={app.id} className="p-6 rounded-2xl border border-border bg-card hover:shadow-elegant transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">{app.name}</h3>
                  <a href={app.base_url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary truncate block">{app.base_url}</a>
                </div>
                <Badge variant={app.status === "ready" ? "default" : "secondary"} className={app.status === "ready" ? "bg-success text-success-foreground" : ""}>
                  {app.status}
                </Badge>
              </div>
              {app.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{app.description}</p>}
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => generate(app)} disabled={generatingId === app.id} className="bg-gradient-hero hover:opacity-90">
                  {generatingId === app.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                  {app.manifest ? "Regenerate" : "Generate manifest"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(app.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {app.manifest && (
                <details className="mt-4">
                  <summary className="text-xs font-mono text-muted-foreground cursor-pointer hover:text-foreground">View manifest.json</summary>
                  <pre className="mt-2 p-3 rounded-lg bg-secondary text-xs font-mono overflow-x-auto max-h-64">
                    {JSON.stringify(app.manifest, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
