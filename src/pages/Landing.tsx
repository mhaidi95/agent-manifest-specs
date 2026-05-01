import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Shield, Zap, FileText, Users, Bot, CheckCircle2, Lock, GitBranch } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

const features = [
  { icon: Bot, title: "Agent-readable actions", desc: "Auto-generate a structured manifest of every action an AI agent can perform on your app." },
  { icon: Shield, title: "Granular permissions", desc: "Define scopes per action and per agent. Revoke instantly. Default-deny everywhere." },
  { icon: GitBranch, title: "Approval workflows", desc: "Require human approval for high-risk or high-value actions, automatically." },
  { icon: FileText, title: "Full audit logs", desc: "Every agent call, with payload, identity, and outcome — searchable and exportable." },
  { icon: Lock, title: "Safe by default", desc: "Risk-classified actions, rate limits, and signed agent identities baked in." },
  { icon: Zap, title: "AI-powered onboarding", desc: "Describe your app once. We generate the full agent manifest in seconds." },
];

const steps = [
  { n: "01", title: "Connect your app", desc: "Add your SaaS by name, URL, and a short description." },
  { n: "02", title: "Generate the manifest", desc: "Our AI emits a structured layer of actions, scopes, and approval rules." },
  { n: "03", title: "Let agents in — safely", desc: "AI agents now read your app, ask for permission, and leave a perfect audit trail." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <Link to="/spec" className="hover:text-foreground transition-colors">Spec</Link>
            <a href="#why" className="hover:text-foreground transition-colors">Why BridgeAI</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
            <Button asChild className="bg-gradient-hero hover:opacity-90 transition-opacity">
              <Link to="/auth?mode=signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="container mx-auto relative px-4 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                The agent-readable web is here
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Make your SaaS <span className="text-gradient">speak to AI agents</span>.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                Websites today speak to humans. BridgeAI transforms your app into a structured, safe, machine-readable layer — actions, permissions, approvals, and audit logs — so AI agents can use it without breaking it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="bg-gradient-hero hover:opacity-90 shadow-elegant">
                  <Link to="/auth?mode=signup">Start for free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#how">See how it works</a>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> SOC2-ready audit logs</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Default-deny permissions</div>
              </div>
            </div>
            <div className="relative animate-fade-in-slow">
              <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImg}
                alt="BridgeAI connects web apps to AI agents through a structured machine-readable layer"
                width={1536}
                height={1024}
                className="relative rounded-2xl shadow-elegant border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything an agent needs. Nothing you don't trust.</h2>
            <p className="mt-4 text-muted-foreground">A complete machine-readable layer on top of your existing app — without rewriting it.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elegant hover:-translate-y-0.5 transition-all">
                <div className="h-10 w-10 rounded-lg bg-gradient-card flex items-center justify-center mb-4 group-hover:bg-gradient-hero transition-colors">
                  <f.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 md:py-28 bg-gradient-soft border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">From human UI to agent API in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="p-8 rounded-2xl bg-card border border-border">
                <div className="text-sm font-mono text-primary font-semibold">{s.n}</div>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Built for the agentic era.</h2>
              <p className="mt-4 text-muted-foreground">AI agents are about to use the web on your users' behalf. Without a structured layer, every interaction is a brittle scrape and every action is a security risk.</p>
              <ul className="mt-6 space-y-3">
                {["Stop agents from breaking your forms", "Stop them from doing things they shouldn't", "Prove exactly what they did, when, and why"].map(t => (
                  <li key={t} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" /><span>{t}</span></li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-elegant font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-2 text-muted-foreground">manifest.json</span>
              </div>
              <pre className="text-foreground/80 leading-relaxed overflow-x-auto">
{`{
  "actions": [{
    "name": "refund_order",
    "method": "POST",
    "risk_level": "high",
    "requires_approval": true
  }],
  "permission_scopes": [
    "orders:read",
    "orders:refund"
  ],
  "approval_rules": [{
    "name": "Large refunds",
    "condition": "amount > threshold",
    "threshold": 500
  }]
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center shadow-elegant">
            <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">Ready to make your app agent-ready?</h2>
              <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">Sign up in 30 seconds. Generate your first manifest in under a minute.</p>
              <Button size="lg" variant="secondary" asChild className="mt-8">
                <Link to="/auth?mode=signup">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo className="text-base" />
          <p>© {new Date().getFullYear()} BridgeAI. The agent-readable web.</p>
        </div>
      </footer>
    </div>
  );
}
