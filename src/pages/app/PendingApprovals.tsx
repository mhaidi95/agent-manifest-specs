import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Check, X } from "lucide-react";
import { toast } from "sonner";

type Approval = {
  id: string; action_name: string; agent_identity: string | null;
  payload: any; reason: string | null; status: string;
  created_at: string; expires_at: string;
  connected_apps?: { name: string };
};

export default function PendingApprovals() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"pending" | "approved" | "denied">("pending");
  const [items, setItems] = useState<Approval[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("pending_approvals")
      .select("*, connected_apps(name)")
      .eq("status", tab)
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data ?? []) as Approval[]);
  };
  useEffect(() => { if (user) load(); }, [user, tab]);

  const decide = async (id: string, decision: "approved" | "denied") => {
    const { error } = await supabase
      .from("pending_approvals")
      .update({ status: decision, decided_by: user!.id, decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }

    const item = items.find(i => i.id === id);
    if (item) {
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        action_name: item.action_name,
        agent_identity: item.agent_identity,
        status: decision === "approved" ? "success" : "blocked",
        payload: { approval_id: id, decision, original: item.payload },
      });
    }
    toast.success(`Action ${decision}`); load();
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pending approvals</h1>
        <p className="text-muted-foreground mt-1">Human-in-the-loop queue for high-risk agent actions.</p>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
        </TabsList>
      </Tabs>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">Nothing here</h3>
          <p className="text-sm text-muted-foreground mt-1">When an agent triggers a high-risk action, it'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <code className="font-mono text-sm font-semibold">{a.action_name}</code>
                {a.connected_apps?.name && <Badge variant="outline">{a.connected_apps.name}</Badge>}
                {a.reason && <Badge variant="secondary" className="text-xs">{a.reason}</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono mb-2">{a.agent_identity ?? "anonymous"}</div>
              {a.payload && (
                <pre className="p-2 rounded-md bg-secondary text-xs font-mono overflow-x-auto">{JSON.stringify(a.payload, null, 2)}</pre>
              )}
              {tab === "pending" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => decide(a.id, "approved")}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(a.id, "denied")}>
                    <X className="h-4 w-4 mr-1" /> Deny
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
