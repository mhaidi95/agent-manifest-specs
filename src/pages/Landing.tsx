import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Shield, FileText, Bot, CheckCircle2, Lock, Eye,
  GitBranch, Zap, AlertTriangle, ScrollText, KeyRound, Workflow,
  Github, Activity,
} from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "Every agent action, observed",
    desc: "A single proxy sits in front of every AI-driven request. Nothing reaches your app until AgentGate sees it, classifies it, and records it.",
  },
  {
    icon: Lock,
    title: "Every action, governed",
    desc: "Per-agent tokens, scoped permissions, default-deny. High-risk actions are paused mid-flight until a human approves.",
  },
  {
    icon: ScrollText,
    title: "Every event, audited",
    desc: "Immutable, signed audit logs of who (which agent) did what, when, and why — exportable for SOC 2, ISO 27001, EU AI Act, and your board.",
  },
];

const flow = [
  { icon: Bot, title: "Agent calls /v1/invoke", desc: "Your AI agents — internal or external — point at one endpoint." },
  { icon: KeyRound, title: "Token + scope check", desc: "AgentGate verifies the agent identity and confirms the action is in scope." },
  { icon: Workflow, title: "Approval rules fire", desc: "High-risk or high-value actions are paused for human review, automatically." },
  { icon: Activity, title: "Audited & forwarded", desc: "Result is logged immutably and (optionally) forwarded to your real backend." },
];

const risks = [
  { title: "Prompt injection in production", desc: "An attacker convinces your agent to wire $50k. Without a runtime gate, you find out from your bank." },
  { title: "Silent over-permissioned agents", desc: "Your agent has admin scope “just in case.” It deletes a customer record. Nobody knows which agent, which prompt, which version." },
  { title: "EU AI Act / SOC 2 evidence gaps", desc: "Auditors ask for agent action logs. You hand them a Slack thread and a `console.log`." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <Link to="/spec" className="hover:text-foreground transition-colors">Open spec</Link>
            <Link to="/validator" className="hover:text-foreground transition-colors">Validator</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <a
              href="https://github.com/agentgate/agent-manifest"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
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
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Now in private beta · Built on the open Agent Manifest spec
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              The <span className="text-gradient">runtime control plane</span><br/>
              for AI agents.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop AI agents from doing what they shouldn't. AgentGate sits between every agent and your app — enforcing scopes, requiring human approval for high-risk actions, and producing the audit trail your CISO and your auditors need.
            </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button size="lg" asChild className="bg-gradient-hero hover:opacity-90 shadow-elegant">
                <Link to="/auth?mode=signup">Start governing agents <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#demo">Watch the demo →</a>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/validator">Validate your manifest</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground justify-center">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> SOC 2-ready audit logs</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Default-deny scopes</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Human-in-the-loop approvals</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> EU AI Act evidence</div>
            </div>
          </div>

          {/* Visual: terminal-style flow card */}
          <div className="relative mt-16 max-w-4xl mx-auto animate-fade-in-slow">
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl border border-border bg-card shadow-elegant p-6 font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-2 text-muted-foreground">POST /v1/invoke</span>
              </div>
              <div className="space-y-2 text-foreground/80 leading-relaxed">
                <div><span className="text-muted-foreground">→</span> agent <span className="text-primary">agent://openai/operator</span> requests <span className="text-accent">refund_order</span> ($1,240)</div>
                <div><span className="text-success">✓</span> identity verified · token in scope · <span className="text-warning">amount &gt; threshold</span></div>
                <div><span className="text-warning">⏸</span> queued for human approval · <code>approval_id: ap_b7f2…</code></div>
                <div><span className="text-success">✓</span> approved by <span className="text-primary">finance@acme.com</span> in 42s</div>
                <div><span className="text-success">✓</span> forwarded · audit log <code>au_9d3e…</code> written</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo video */}
      <section id="demo" className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-elegant bg-card">
            <div className="absolute -inset-1 bg-gradient-hero opacity-20 blur-3xl rounded-3xl pointer-events-none" />
            <video
              className="relative w-full h-auto block"
              src="/video/intro.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="AgentGate product overview video"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">30-second overview · sound off</p>
        </div>
      </section>


      <section id="problem" className="py-20 md:py-28 bg-gradient-soft border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">The risk you can't see</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Your agents are already in production. Your governance isn't.</h2>
            <p className="mt-4 text-muted-foreground">
              Agentic features ship in weeks. The controls — identity, scope, approval, audit — usually ship in <em>quarters</em>, if at all. AgentGate closes the gap on day one.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {risks.map(r => (
              <div key={r.title} className="p-6 rounded-2xl border border-border bg-card">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Observe. Govern. Audit.</h2>
            <p className="mt-4 text-muted-foreground">One layer between every AI agent and every app you care about.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map(p => (
              <div key={p.title} className="group p-8 rounded-2xl border border-border bg-card hover:shadow-elegant hover:-translate-y-0.5 transition-all">
                <div className="h-12 w-12 rounded-xl bg-gradient-card flex items-center justify-center mb-5 group-hover:bg-gradient-hero transition-colors">
                  <p.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 md:py-28 bg-gradient-soft border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">How it works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Four steps. One endpoint. Total control.</h2>
            <p className="mt-4 text-muted-foreground">
              Point your agent at <code className="font-mono text-foreground">/v1/invoke</code>. We handle identity, policy, approval, and audit before anything touches your app.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {flow.map((s, i) => (
              <div key={s.title} className="relative p-6 rounded-2xl bg-card border border-border">
                <div className="text-xs font-mono text-muted-foreground mb-2">STEP {String(i + 1).padStart(2, "0")}</div>
                <div className="h-10 w-10 rounded-lg bg-gradient-card flex items-center justify-center mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">For CISOs and compliance leads</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">The evidence layer for the agentic enterprise.</h2>
              <p className="mt-4 text-muted-foreground">
                Regulators are catching up to AI agents fast. The EU AI Act, NIST AI RMF, and the next SOC 2 update all expect you to prove what your agents did and why. AgentGate makes that evidence a side effect of running the system.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Per-agent identity and revocable tokens",
                  "Tamper-evident, exportable audit logs",
                  "Pre-built mappings to SOC 2 CC7.2, ISO 27001 A.8.16, EU AI Act Art. 12",
                  "Two-person approval for high-risk operations",
                ].map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-elegant font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-2 text-muted-foreground">audit_log.ndjson</span>
              </div>
              <pre className="text-foreground/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`{
  "ts": "2026-05-01T22:14:08Z",
  "agent": "agent://openai/operator",
  "action": "refund_order",
  "params": { "amount": 124000 },
  "decision": "approved",
  "approver": "finance@acme.com",
  "policy": "amount > 50000 → human",
  "audit_id": "au_9d3e7b…"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Open spec */}
      <section className="py-20 md:py-28 bg-gradient-soft border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="outline" className="mb-4"><Github className="h-3 w-3 mr-1.5 inline" /> Open standard</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Built on the open <span className="text-gradient">Agent Manifest</span> spec.</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The category needs a standard, not a silo. We publish the Agent Manifest spec under MIT — anyone can implement it. AgentGate is the runtime that makes it enforceable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/spec"><FileText className="mr-2 h-4 w-4" /> View the spec</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noreferrer noopener">
                <Github className="mr-2 h-4 w-4" /> Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center shadow-elegant">
            <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Your agents are already running. Govern them before someone else has to.
              </h2>
              <p className="mt-4 text-primary-foreground/85">
                Wire up your first agent in under 10 minutes. Free for design partners.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth?mode=signup">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <a href="mailto:hello@agentgate.dev?subject=Design partner program">Talk to founders</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo className="text-base" />
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link to="/spec" className="hover:text-foreground transition-colors">Spec</Link>
            <Link to="/validator" className="hover:text-foreground transition-colors">Validator</Link>
            <Link to="/badge" className="hover:text-foreground transition-colors">Badge</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noreferrer noopener" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
          <p>© {new Date().getFullYear()} AgentGate · The runtime control plane for AI agents.</p>
        </div>
      </footer>
    </div>
  );
}
