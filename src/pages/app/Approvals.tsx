import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GitBranch } from "lucide-react";
import { toast } from "sonner";

type Rule = {
  id: string; name: string; condition: string; threshold: number | null; enabled: boolean;
  connected_apps?: { name: string };
};

export default function Approvals() {
  const { user } = useAuth();
  const [items, setItems] = useState<Rule[]>([]);

  const load = async () => {
    const { data } = await supabase.from("approval_rules").select("*, connected_apps(name)").order("created_at", { ascending: false });
    setItems((data ?? []) as Rule[]);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const toggle = async (r: Rule) => {
    const { error } = await supabase.from("approval_rules").update({ enabled: !r.enabled }).eq("id", r.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Approval rules</h1>
        <p className="text-muted-foreground mt-1">When agents must wait for a human before acting.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <GitBranch className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No rules yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate a manifest to seed approval rules automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(r => (
            <div key={r.id} className="p-5 rounded-2xl border border-border bg-card flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{r.name}</h3>
                  <Badge variant="outline" className="text-xs">{r.connected_apps?.name}</Badge>
                  {r.threshold !== null && <Badge className="bg-warning text-warning-foreground text-xs">threshold: {r.threshold}</Badge>}
                </div>
                <code className="block mt-1 text-xs text-muted-foreground font-mono">if ({r.condition}) → require approval</code>
              </div>
              <Switch checked={r.enabled} onCheckedChange={() => toggle(r)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
