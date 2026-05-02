import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { ArrowLeft, BookOpen, Zap, Shield, ScrollText, Github } from "lucide-react";

const sections = [
  { id: "quickstart", title: "5-minute quickstart", icon: Zap },
  { id: "manifest", title: "Anatomy of a manifest", icon: BookOpen },
  { id: "hosting", title: "Hosting & discovery", icon: Shield },
  { id: "validate", title: "Validate & badge", icon: ScrollText },
  { id: "runtime", title: "Runtime enforcement", icon: Shield },
  { id: "faq", title: "FAQ", icon: BookOpen },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/spec" className="hover:text-foreground transition-colors">Spec</Link>
            <Link to="/validator" className="hover:text-foreground transition-colors">Validator</Link>
            <Link to="/badge" className="hover:text-foreground transition-colors">Badge</Link>
            <Link to="/docs" className="text-foreground">Docs</Link>
          </nav>
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4">Docs · v1.0</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">AgentGate Docs</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          Everything you need to make your SaaS agent-ready — and govern what those agents are allowed to do.
        </p>

        <div className="grid md:grid-cols-[220px_1fr] gap-12">
          <aside className="hidden md:block">
            <nav className="sticky top-24 space-y-1 text-sm">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 py-2 px-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <s.icon className="h-4 w-4" /> {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="prose prose-slate max-w-none space-y-16">
            <section id="quickstart">
              <h2 className="text-2xl font-bold mb-4">5-minute quickstart</h2>
              <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
                <li><strong className="text-foreground">Generate a manifest.</strong> Sign up for <Link to="/auth?mode=signup" className="text-primary hover:underline">AgentGate</Link>, click "Connect app", describe what your app does, and the AI generator drafts a manifest with actions, scopes, and approval rules.</li>
                <li><strong className="text-foreground">Review & edit.</strong> Tighten descriptions, raise risk levels, add approval triggers for anything that touches money, customer data, or external sends.</li>
                <li><strong className="text-foreground">Host the manifest.</strong> Publish it at <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground text-sm">https://yourapp.com/.well-known/agent-manifest.json</code>.</li>
                <li><strong className="text-foreground">Validate.</strong> Drop your URL into the <Link to="/validator" className="text-primary hover:underline">validator</Link>.</li>
                <li><strong className="text-foreground">Show the badge.</strong> Grab the <Link to="/badge" className="text-primary hover:underline">Agent-Ready badge</Link> and paste it on your homepage.</li>
              </ol>
            </section>

            <section id="manifest">
              <h2 className="text-2xl font-bold mb-4">Anatomy of a manifest</h2>
              <p className="text-muted-foreground mb-4">A manifest is a single JSON file with five sections:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><code className="text-foreground font-mono">app</code> — name, URL, description.</li>
                <li><code className="text-foreground font-mono">actions[]</code> — what an agent can call. Each has an id, description, risk level, scopes, and parameters.</li>
                <li><code className="text-foreground font-mono">approval_rules[]</code> — conditions that escalate an action to require a human (e.g. <code>amount &gt; $500</code>).</li>
                <li><code className="text-foreground font-mono">agent_identity</code> — how agents authenticate (bearer token, mTLS, signed JWT).</li>
                <li><code className="text-foreground font-mono">audit</code> — what gets logged and how long it's retained.</li>
              </ul>
              <p className="mt-4 text-muted-foreground">See the full <Link to="/spec" className="text-primary hover:underline">spec</Link> and the <a href="/schema/manifest.v1.json" className="text-primary hover:underline">JSON schema</a>.</p>
            </section>

            <section id="hosting">
              <h2 className="text-2xl font-bold mb-4">Hosting & discovery</h2>
              <p className="text-muted-foreground mb-4">Manifests are discovered the same way <code>robots.txt</code> is — at a well-known path:</p>
              <pre className="rounded-2xl border border-border bg-card p-4 text-sm font-mono overflow-x-auto">GET https://yourapp.com/.well-known/agent-manifest.json</pre>
              <p className="mt-4 text-muted-foreground">Serve it with <code>Content-Type: application/json</code> and CORS open (<code>Access-Control-Allow-Origin: *</code>) so validators and agent runtimes can fetch it.</p>
            </section>

            <section id="validate">
              <h2 className="text-2xl font-bold mb-4">Validate & badge</h2>
              <p className="text-muted-foreground">Use the public <Link to="/validator" className="text-primary hover:underline">validator</Link> to check JSON syntax, required fields, snake_case ids, risk levels, and recommended fields. Once it's green, embed the <Link to="/badge" className="text-primary hover:underline">Agent-Ready badge</Link>.</p>
            </section>

            <section id="runtime">
              <h2 className="text-2xl font-bold mb-4">Runtime enforcement</h2>
              <p className="text-muted-foreground mb-4">A manifest is a contract. AgentGate is the enforcer.</p>
              <p className="text-muted-foreground mb-4">Point your agents at <code className="text-foreground font-mono">POST /v1/invoke</code> with their token. AgentGate verifies identity, checks scopes, evaluates approval rules, and writes an immutable audit row before anything reaches your real backend.</p>
              <pre className="rounded-2xl border border-border bg-card p-4 text-sm font-mono overflow-x-auto">{`curl -X POST https://your-org.agentgate.app/v1/invoke \\
  -H "Authorization: Bearer agt_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "refund_invoice",
    "params": { "invoice_id": "in_123", "amount_cents": 12000 }
  }'`}</pre>
            </section>

            <section id="faq">
              <h2 className="text-2xl font-bold mb-4">FAQ</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold">Do I need AgentGate to use the spec?</h3>
                  <p className="text-muted-foreground text-sm mt-1">No. The spec is MIT and tool-agnostic. AgentGate is one runtime that enforces it; you can build your own.</p>
                </div>
                <div>
                  <h3 className="font-semibold">What if my app already has an OpenAPI spec?</h3>
                  <p className="text-muted-foreground text-sm mt-1">Great — keep it. The Agent Manifest is a thinner, safety-focused layer on top: it describes <em>which</em> endpoints agents may call, at what risk, with what scopes and approvals. They complement each other.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Can I version manifests?</h3>
                  <p className="text-muted-foreground text-sm mt-1">Yes. <code>manifest_version</code> tracks the spec version. For your own app version, add a custom field or host versioned paths.</p>
                </div>
                <div>
                  <h3 className="font-semibold">How is this different from MCP?</h3>
                  <p className="text-muted-foreground text-sm mt-1">MCP is a transport protocol between agents and tools. The Agent Manifest is a public contract that any SaaS app can publish — independent of the transport. The two compose well.</p>
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-border bg-gradient-soft p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Contribute</h3>
              <p className="text-muted-foreground mb-5">The spec, schema, and examples live on GitHub.</p>
              <Button asChild>
                <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noreferrer noopener">
                  <Github className="h-4 w-4 mr-2" /> agent-manifest-specs
                </a>
              </Button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
