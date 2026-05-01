import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap } from "lucide-react";
import { toast } from "sonner";

type Action = {
  id: string; name: string; description: string | null; method: string; endpoint: string | null;
  risk_level: string; requires_approval: boolean; app_id: string;
  connected_apps?: { name: string };
};

const riskColor: Record<string, string> = {
  low: "bg-success text-success-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-destructive text-destructive-foreground",
};
const methodColor: Record<string, string> = {
  GET: "text-success border-success/30 bg-success/5",
  POST: "text-primary border-primary/30 bg-primary/5",
  PUT: "text-warning border-warning/30 bg-warning/5",
  PATCH: "text-warning border-warning/30 bg-warning/5",
  DELETE: "text-destructive border-destructive/30 bg-destructive/5",
};

export default function Actions() {
  const { user } = useAuth();
  const [items, setItems] = useState<Action[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("agent_actions")
      .select("*, connected_apps(name)")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Action[]);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const toggleApproval = async (a: Action) => {
    const { error } = await supabase.from("agent_actions").update({ requires_approval: !a.requires_approval }).eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Agent actions</h1>
        <p className="text-muted-foreground mt-1">Every action an AI agent can perform across your apps.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Zap className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No actions yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Connect an app and generate its manifest to populate actions.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {items.map(a => (
              <div key={a.id} className="p-5 flex items-start gap-4 hover:bg-secondary/40 transition-colors">
                <div className={`shrink-0 px-2 py-1 rounded-md text-xs font-mono font-semibold border ${methodColor[a.method] ?? methodColor.GET}`}>
                  {a.method}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{a.name}</h3>
                    <Badge variant="outline" className="text-xs">{a.connected_apps?.name}</Badge>
                    <Badge className={`text-xs ${riskColor[a.risk_level] ?? riskColor.low}`}>{a.risk_level} risk</Badge>
                  </div>
                  {a.endpoint && <code className="text-xs text-muted-foreground font-mono">{a.endpoint}</code>}
                  {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Approval</span>
                  <Switch checked={a.requires_approval} onCheckedChange={() => toggleApproval(a)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
