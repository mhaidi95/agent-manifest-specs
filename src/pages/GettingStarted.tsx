import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Terminal, KeyRound, Shield, Zap, ScrollText, AppWindow } from "lucide-react";

const steps = [
  {
    n: 1,
    icon: KeyRound,
    title: "Create your account",
    desc: "Sign up with email or Google. You land directly in the dashboard — no waitlist.",
    cta: { label: "Sign up", to: "/auth?mode=signup" },
  },
  {
    n: 2,
    icon: AppWindow,
    title: "Load the demo app (one click)",
    desc: "From the dashboard Overview, hit “Load demo app”. We seed a sample app (Acme Helpdesk), one safe action (get_ticket), the permission rule, and a fresh agent token — everything you need to fire a real /v1/invoke call.",
    cta: { label: "Open dashboard", to: "/app" },
  },
  {
    n: 3,
    icon: Terminal,
    title: "Fire your first agent call",
    desc: "Copy the curl snippet shown after seeding and paste it in your terminal. The proxy verifies the token, checks the scope, and returns a 200 with an audit_id.",
    code: `curl -X POST "$AGENTGATE_URL" \\
  -H "Authorization: Bearer $AGENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "agent://demo/beta-tester",
    "action": "get_ticket",
    "params": { "ticket_id": "T-123" }
  }'`,
  },
  {
    n: 4,
    icon: Shield,
    title: "Try a blocked action",
    desc: "Change `action` to `delete_ticket` (an action you never granted) and re-run. You'll get a 403 with reason=scope_not_allowed — and a matching audit log row.",
  },
  {
    n: 5,
    icon: ScrollText,
    title: "Inspect the audit log",
    desc: "Open Logs in the dashboard. You'll see both calls — the success and the deny — with agent identity, action, decision, and full payload. That's your SOC 2 / EU AI Act evidence.",
    cta: { label: "View Logs", to: "/app/logs" },
  },
  {
    n: 6,
    icon: Zap,
    title: "Wire your real app",
    desc: "Replace the demo app: connect your manifest (or have our generator build one from your OpenAPI), define real actions and approval rules, and point your agent at /v1/invoke.",
    cta: { label: "Connect an app", to: "/app/apps" },
  },
];

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/spec" className="hover:text-foreground">Spec</Link>
            <Link to="/docs" className="hover:text-foreground">Docs</Link>
            <Link to="/validator" className="hover:text-foreground">Validator</Link>
          </nav>
          <Button asChild className="bg-gradient-hero hover:opacity-90">
            <Link to="/auth?mode=signup">Start free</Link>
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
        <Badge variant="outline" className="mb-4">For beta testers</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Try the whole thing in five minutes.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Six steps. All against the live system. You'll get a real allow, a real deny, and a real audit log to look at — no slideware, no fake data.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild className="bg-gradient-hero hover:opacity-90 shadow-elegant">
            <Link to="/auth?mode=signup">Start the walkthrough <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/app">I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24 max-w-4xl">
        <ol className="space-y-6">
          {steps.map(s => (
            <li key={s.n} className="relative p-6 md:p-8 rounded-2xl border border-border bg-card">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-card flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-muted-foreground">STEP {String(s.n).padStart(2, "0")}</div>
                  <h2 className="mt-1 text-xl font-semibold">{s.title}</h2>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{s.desc}</p>
                  {s.code && (
                    <pre className="mt-4 rounded-lg bg-secondary border border-border p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-foreground/80">
{s.code}
                    </pre>
                  )}
                  {s.cta && (
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link to={s.cta.to}>{s.cta.label} <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 p-6 rounded-2xl border border-border bg-gradient-soft">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            <div>
              <h3 className="font-semibold">Done? We'd love your feedback.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Email <a href="mailto:hello@agentgate.dev" className="text-primary underline">hello@agentgate.dev</a> with
                what worked, what didn't, and what you'd want from v2 of the spec.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
