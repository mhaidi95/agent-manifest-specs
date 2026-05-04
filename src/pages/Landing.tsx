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
    title: "See what your agents actually do",
    desc: "One proxy in front of every agent call. Nothing hits your backend until we've seen the request, classified it, and written it down.",
  },
  {
    icon: Lock,
    title: "Stop the calls that shouldn't ship",
    desc: "Each agent gets its own token and a tight set of scopes. Anything risky — refunds, deletes, big amounts — pauses until a human says yes.",
  },
  {
    icon: ScrollText,
    title: "Hand auditors a real log, not a Slack thread",
    desc: "Every decision is recorded with the agent, the action, the params, and who approved it. Export it for SOC 2, ISO 27001, or the EU AI Act.",
  },
];

const flow = [
  { icon: Bot, title: "Your agent hits one URL", desc: "Point any agent — internal, OpenAI, Anthropic, your own — at /v1/invoke." },
  { icon: KeyRound, title: "We check who it is", desc: "Token verified, agent identity confirmed, action checked against its allowed scopes." },
  { icon: Workflow, title: "Approval if needed", desc: "If a rule fires (amount > X, action = delete, etc.), the call waits for a human." },
  { icon: Activity, title: "Logged, then forwarded", desc: "The decision is written to the audit log. If approved, the call goes through to your backend." },
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
            <Link to="/getting-started" className="hover:text-foreground transition-colors">Try it</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <a
              href="https://github.com/mhaidi95/agent-manifest-specs"
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
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="container mx-auto relative px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              For platform &amp; security teams · private beta
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              The approval &amp; audit gateway<br/>
              for AI agents.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Block, approve, and log every risky agent action before it touches production. Drop-in proxy. Works in front of MCP servers, OpenAI Agents, Claude tools, or any HTTP API.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button size="lg" asChild className="shadow-elegant">
                <Link to="/getting-started">Watch a refund get approved <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?mode=signup">Start free</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground justify-center">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Per-agent tokens &amp; scopes</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Slack approvals</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Immutable audit log</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Open-source spec</div>
            </div>
          </div>

          {/* Visual: terminal-style flow card */}
          <div className="relative mt-16 max-w-3xl mx-auto animate-fade-in-slow">
            <div className="relative rounded-lg border border-border bg-card shadow-elegant overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-secondary/60">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">POST /v1/invoke</span>
              </div>
              <div className="p-5 font-mono text-xs space-y-1.5 text-foreground/85 leading-relaxed">
                <div><span className="text-muted-foreground">→</span> <span className="text-foreground">agent://openai/operator</span> wants <span className="text-warning">refund_order</span> · $1,240</div>
                <div><span className="text-success">✓</span> token ok · scope ok · <span className="text-warning">amount over $500 threshold</span></div>
                <div><span className="text-warning">⏸</span> waiting on a human · <span className="text-muted-foreground">ap_b7f2…</span></div>
                <div><span className="text-success">✓</span> approved by finance@acme.com · 42s</div>
                <div><span className="text-success">✓</span> forwarded to your API · logged as <span className="text-muted-foreground">au_9d3e…</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="problem" className="py-20 md:py-28 bg-gradient-soft border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">Why now</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Your team is being asked to turn agents on. Security is asking how.</h2>
            <p className="mt-4 text-muted-foreground">
              Most teams stop at read-only because the moment an agent can write, refund, delete, or message a customer — there's no clean way to approve it, restrict it, or prove what happened.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Agents are read-only because we can't approve writes", desc: "You want agents creating tickets, issuing refunds, updating CRM. You don't want them doing it without a human in the loop. Today there's no layer for that." },
              { title: "We're hand-rolling Slack approvals + audit tables", desc: "Every team builds the same thing: a proxy, a rules table, a Slack bot, an audit log. Brittle, owned by no one, and nobody trusts it after the engineer who built it leaves." },
              { title: "OAuth scopes control access, not behavior", desc: "Scopes can say 'this agent may refund.' They can't say 'unless the amount > $500, then ask Sarah.' Behavior-level policy is the gap." },
            ].map(r => (
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
            <h2 className="text-3xl md:text-4xl font-bold">Watch. Block. Prove.</h2>
            <p className="mt-4 text-muted-foreground">Three things, in front of every agent call.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold">One endpoint. Four checks.</h2>
            <p className="mt-4 text-muted-foreground">
              Your agents call <code className="font-mono text-foreground">/v1/invoke</code>. We do the boring-but-critical stuff before anything reaches your backend.
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

      {/* MCP adapter */}
      <section id="mcp" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">New · MCP adapter</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Plug Claude, Cursor, or any MCP client in directly.</h2>
              <p className="mt-4 text-muted-foreground">
                AgentGate also speaks the Model Context Protocol. Every action you've declared shows up as a real MCP tool — with the exact same scope checks, approval rules, and audit log. Drop one URL into Claude Desktop and you're done.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Tools auto-generated from your declared actions</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Risky tool calls pause for human approval — in Slack or in-app</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Same token, same logs, same governance as the HTTP gateway</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-elegant font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-2 text-muted-foreground">claude_desktop_config.json</span>
              </div>
              <pre className="text-foreground/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`{
  "mcpServers": {
    "agentgate": {
      "url": "https://agentgate.lovable.app/functions/v1/mcp",
      "headers": {
        "Authorization": "Bearer bai_..."
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}

      <section id="compliance" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">For security &amp; compliance</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">When the auditor asks, you have an answer.</h2>
              <p className="mt-4 text-muted-foreground">
                EU AI Act, NIST AI RMF, the next SOC 2 — they all want the same thing: proof of what your agents did, who let them, and when. With AgentGate, that proof is just a side effect of running the system.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "One token per agent. Revoke any of them in one click.",
                  "Every call logged with payload, decision, and approver.",
                  "Maps cleanly to SOC 2 CC7.2, ISO 27001 A.8.16, EU AI Act Art. 12.",
                  "Two-person approval for anything you flag as high-risk.",
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

      {/* Open spec — demoted credibility section */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="outline" className="mb-4"><Github className="h-3 w-3 mr-1.5 inline" /> Built on an open standard</Badge>
          <h2 className="text-2xl md:text-3xl font-bold">No proprietary lock-in.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
            AgentGate runs on the open Agent Manifest spec — MIT-licensed, vendor-neutral, governance-friendly. Your manifest works with any compliant runtime, not just ours.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button size="sm" variant="outline" asChild>
              <Link to="/spec"><FileText className="mr-2 h-3.5 w-3.5" /> Read the spec</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noreferrer noopener">
                <Github className="mr-2 h-3.5 w-3.5" /> View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* For beta testers */}
      <section id="beta" className="py-20 md:py-28 bg-gradient-soft border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">For beta testers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Skip the demo. Run the real thing.</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Six steps, about five minutes, all against the live system. You'll auth a real token, get a real allow, get a real deny, and read the audit log we wrote for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            {[
              { n: "01", t: "Sign up", d: "Email or Google. You land in the dashboard, no waitlist." },
              { n: "02", t: "Hit “Load demo app”", d: "We seed an app, an action, a permission, and a token." },
              { n: "03", t: "Curl /v1/invoke", d: "A real call. You'll get a 200 and an audit_id." },
              { n: "04", t: "Try a denied action", d: "Change the action name. Watch the 403 come back." },
              { n: "05", t: "Open Logs", d: "Both calls are there, with the full payload and decision." },
              { n: "06", t: "Plug in your own app", d: "When you're ready, swap the demo for your real manifest." },
            ].map(s => (
              <div key={s.n} className="p-5 rounded-lg border border-border bg-card">
                <div className="text-xs font-mono text-muted-foreground">STEP {s.n}</div>
                <div className="mt-1 font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="shadow-elegant">
              <Link to="/getting-started">Open the walkthrough <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth?mode=signup">Or just sign up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-12 md:p-16 text-center shadow-elegant border border-border">
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Your agents are running. Put something in front of them.
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                First agent wired up in under ten minutes. Free for design partners while we're in beta.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth?mode=signup">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <Link to="/getting-started">See the walkthrough</Link>
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
          <p>© {new Date().getFullYear()} AgentGate · A firewall for AI agents.</p>
        </div>
      </footer>
    </div>
  );
}
