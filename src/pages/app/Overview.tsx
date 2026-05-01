import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppWindow, Zap, Shield, GitBranch, ScrollText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Stats = { apps: number; actions: number; permissions: number; rules: number; logs: number };

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ apps: 0, actions: 0, permissions: 0, rules: 0, logs: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const tables = ["connected_apps", "agent_actions", "permissions", "approval_rules", "audit_logs"] as const;
      const counts = await Promise.all(tables.map(t =>
        supabase.from(t).select("*", { count: "exact", head: true }).then(r => r.count ?? 0)
      ));
      setStats({ apps: counts[0], actions: counts[1], permissions: counts[2], rules: counts[3], logs: counts[4] });
    })();
  }, [user]);

  const cards = [
    { label: "Connected apps", value: stats.apps, icon: AppWindow, to: "/app/apps", color: "text-primary" },
    { label: "Agent actions", value: stats.actions, icon: Zap, to: "/app/actions", color: "text-accent" },
    { label: "Permissions", value: stats.permissions, icon: Shield, to: "/app/permissions", color: "text-success" },
    { label: "Approval rules", value: stats.rules, icon: GitBranch, to: "/app/approvals", color: "text-warning" },
    { label: "Audit log entries", value: stats.logs, icon: ScrollText, to: "/app/logs", color: "text-primary" },
  ];

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Make your apps speak fluently to AI agents.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elegant hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <c.icon className={`h-5 w-5 ${c.color}`} />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="mt-4 text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant">
        <h2 className="text-xl font-semibold">Get started in 60 seconds</h2>
        <p className="mt-1 text-primary-foreground/80 text-sm">Connect your first app and let our AI generate a complete agent manifest.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link to="/app/apps">Connect an app <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
