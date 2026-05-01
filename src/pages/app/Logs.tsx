import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollText, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Log = {
  id: string; action_name: string; agent_identity: string | null; status: string;
  payload: any; created_at: string;
  connected_apps?: { name: string };
};

const statusColor: Record<string, string> = {
  success: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  blocked: "bg-destructive text-destructive-foreground",
  failed: "bg-destructive text-destructive-foreground",
};

export default function Logs() {
  const { user } = useAuth();
  const [items, setItems] = useState<Log[]>([]);

  const load = async () => {
    const { data } = await supabase.from("audit_logs").select("*, connected_apps(name)").order("created_at", { ascending: false }).limit(100);
    setItems((data ?? []) as Log[]);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const seedDemo = async () => {
    const { data: apps } = await supabase.from("connected_apps").select("id").limit(1);
    if (!apps?.length) { toast.error("Connect an app first"); return; }
    const samples = [
      { action_name: "list_orders", agent_identity: "agent://openai/gpt-5", status: "success", payload: { count: 23 } },
      { action_name: "refund_order", agent_identity: "agent://anthropic/claude", status: "pending", payload: { amount: 749, requires_approval: true } },
      { action_name: "delete_user", agent_identity: "agent://unknown", status: "blocked", payload: { reason: "scope_denied" } },
    ];
    await supabase.from("audit_logs").insert(samples.map(s => ({ ...s, user_id: user!.id, app_id: apps[0].id })));
    toast.success("Seeded demo log entries");
    load();
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit logs</h1>
          <p className="text-muted-foreground mt-1">Every agent action, with identity, payload, and outcome.</p>
        </div>
        <Button variant="outline" size="sm" onClick={seedDemo}><Sparkles className="mr-2 h-3.5 w-3.5" /> Seed demo data</Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <ScrollText className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No log entries yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Agent calls will appear here. Seed demo data to preview.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {items.map(l => (
              <div key={l.id} className="p-5 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${statusColor[l.status] ?? "bg-secondary"}`}>{l.status}</Badge>
                  <code className="font-mono text-sm font-semibold">{l.action_name}</code>
                  {l.connected_apps?.name && <Badge variant="outline" className="text-xs">{l.connected_apps.name}</Badge>}
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(l.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-mono">{l.agent_identity ?? "anonymous"}</span>
                </div>
                {l.payload && (
                  <pre className="mt-2 p-2 rounded-md bg-secondary text-xs font-mono overflow-x-auto">
                    {JSON.stringify(l.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
