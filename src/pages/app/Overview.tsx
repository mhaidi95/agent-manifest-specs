import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppWindow, Zap, Shield, GitBranch, ScrollText, ArrowRight, Sparkles, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoApp, type SeedResult } from "@/lib/seedDemo";
import { toast } from "sonner";

type Stats = { apps: number; actions: number; permissions: number; rules: number; logs: number };

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ apps: 0, actions: 0, permissions: 0, rules: 0, logs: 0 });
  const [seeding, setSeeding] = useState(false);
  const [seed, setSeed] = useState<SeedResult | null>(null);

  const loadStats = async () => {
    const tables = ["connected_apps", "agent_actions", "permissions", "approval_rules", "audit_logs"] as const;
    const counts = await Promise.all(tables.map(t =>
      supabase.from(t).select("*", { count: "exact", head: true }).then(r => r.count ?? 0)
    ));
    setStats({ apps: counts[0], actions: counts[1], permissions: counts[2], rules: counts[3], logs: counts[4] });
  };

  useEffect(() => { if (user) loadStats(); }, [user]);

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const result = await seedDemoApp(user.id);
      setSeed(result);
      await loadStats();
      toast.success("Demo app seeded — token shown below (copy now, it won't be shown again).");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to seed demo app");
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    { label: "Connected apps", value: stats.apps, icon: AppWindow, to: "/app/apps", color: "text-primary" },
    { label: "Agent actions", value: stats.actions, icon: Zap, to: "/app/actions", color: "text-accent" },
    { label: "Permissions", value: stats.permissions, icon: Shield, to: "/app/permissions", color: "text-success" },
    { label: "Approval rules", value: stats.rules, icon: GitBranch, to: "/app/approvals", color: "text-warning" },
    { label: "Audit log entries", value: stats.logs, icon: ScrollText, to: "/app/logs", color: "text-primary" },
  ];

  const curl = seed && `curl -X POST "${seed.proxyUrl}" \\
  -H "Authorization: Bearer ${seed.token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "agent://demo/beta-tester",
    "action": "${seed.actionName}",
    "params": { "ticket_id": "T-123" }
  }'`;

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

      {/* Beta walkthrough / seed */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-card flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">Beta walkthrough — test the runtime end-to-end</h2>
            <p className="text-sm text-muted-foreground mt-1">
              One click seeds a sample app, action, permission, and agent token so you can hit{" "}
              <code className="text-foreground">/v1/invoke</code> in your terminal within 30 seconds.
            </p>
            {!seed ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleSeed} disabled={seeding}>
                  {seeding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding…</> : <>Load demo app</>}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/getting-started">Read the 5-minute guide</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Demo app, action, permission, and token created.
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Your agent token (shown once):</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-secondary border border-border rounded px-3 py-2 font-mono break-all">{seed.token}</code>
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(seed.token); toast.success("Token copied"); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Try it now:</div>
                  <pre className="text-xs bg-secondary border border-border rounded p-3 font-mono overflow-x-auto whitespace-pre-wrap">{curl}</pre>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(curl!); toast.success("Curl copied"); }}>
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copy curl
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Then: change <code className="text-foreground">action</code> to <code className="text-foreground">delete_ticket</code> to see a 403, and check{" "}
                  <Link to="/app/logs" className="text-primary underline">Logs</Link> for the audit trail.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant">
        <h2 className="text-xl font-semibold">Connect your real app</h2>
        <p className="mt-1 text-primary-foreground/80 text-sm">When you're ready, swap the demo for your own manifest — or have our AI generate one from your OpenAPI spec.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link to="/app/apps">Connect an app <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
