import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, AppWindow, KeyRound, Activity, ShieldCheck, ShieldX, Inbox, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

type Metrics = {
  total_users: number; new_users_7d: number; new_users_30d: number; active_users_7d: number;
  total_apps: number; total_actions: number; active_tokens: number;
  total_invokes: number; invokes_7d: number; invokes_24h: number;
  invokes_success: number; invokes_denied: number;
  approvals_pending: number; approvals_approved: number; approvals_denied: number;
  top_actions: { action_name: string; count: number }[];
  invokes_by_day: { day: string; count: number }[];
};

export default function AdminMetrics() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading || !isAdmin) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_admin_metrics");
      if (error) setError(error.message);
      else setMetrics(data as unknown as Metrics);
      setLoading(false);
    })();
  }, [roleLoading, isAdmin]);

  if (roleLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }
  if (!isAdmin) return <Navigate to="/app" replace />;

  const stats = metrics ? [
    { label: "Total users", value: metrics.total_users, sub: `+${metrics.new_users_7d} this week`, icon: Users },
    { label: "Active users (7d)", value: metrics.active_users_7d, sub: `${metrics.new_users_30d} signups in 30d`, icon: TrendingUp },
    { label: "Connected apps", value: metrics.total_apps, sub: `${metrics.total_actions} actions defined`, icon: AppWindow },
    { label: "Active tokens", value: metrics.active_tokens, sub: "Across all users", icon: KeyRound },
    { label: "Invocations (24h)", value: metrics.invokes_24h, sub: `${metrics.invokes_7d} in last 7d · ${metrics.total_invokes} all time`, icon: Activity },
    { label: "Allowed", value: metrics.invokes_success, sub: `${metrics.invokes_denied} denied`, icon: ShieldCheck },
    { label: "Pending approvals", value: metrics.approvals_pending, sub: `${metrics.approvals_approved} approved · ${metrics.approvals_denied} denied`, icon: Inbox },
    { label: "Denied calls", value: metrics.invokes_denied, sub: "Blocked by scope or rules", icon: ShieldX },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin metrics</h1>
            <Badge variant="outline" className="text-xs">Internal</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide usage. Visible only to admins.</p>
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
      {error && <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">{error}</div>}

      {metrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</span>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-3xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invocations · last 14 days</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.invokes_by_day.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-12 text-center">No invocations yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={metrics.invokes_by_day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top actions · last 30 days</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.top_actions.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-12 text-center">No actions invoked yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={metrics.top_actions} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <YAxis dataKey="action_name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={110} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
