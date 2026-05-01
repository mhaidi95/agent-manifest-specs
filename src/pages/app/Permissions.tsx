import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { toast } from "sonner";

type Permission = {
  id: string; scope: string; enabled: boolean;
  connected_apps?: { name: string };
};

export default function Permissions() {
  const { user } = useAuth();
  const [items, setItems] = useState<Permission[]>([]);

  const load = async () => {
    const { data } = await supabase.from("permissions").select("*, connected_apps(name)").order("created_at", { ascending: false });
    setItems((data ?? []) as Permission[]);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const toggle = async (p: Permission) => {
    const { error } = await supabase.from("permissions").update({ enabled: !p.enabled }).eq("id", p.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground mt-1">Permission scopes available to AI agents. Default-deny.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No permissions yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate a manifest from the Apps page to populate permission scopes.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map(p => (
            <div key={p.id} className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between">
              <div className="min-w-0">
                <code className="font-mono text-sm font-semibold">{p.scope}</code>
                <div className="mt-1"><Badge variant="outline" className="text-xs">{p.connected_apps?.name}</Badge></div>
              </div>
              <Switch checked={p.enabled} onCheckedChange={() => toggle(p)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
