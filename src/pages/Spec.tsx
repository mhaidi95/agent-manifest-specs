import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Github, Download, ExternalLink } from "lucide-react";

const exampleManifest = `{
  "manifest_version": "1.0",
  "app": {
    "name": "Acme Billing",
    "url": "https://acme.com",
    "description": "Subscription billing for SaaS"
  },
  "actions": [
    {
      "id": "list_invoices",
      "description": "List invoices for a customer",
      "risk": "low",
      "scopes": ["invoices:read"],
      "parameters": {
        "customer_id": { "type": "string", "required": true }
      }
    },
    {
      "id": "refund_invoice",
      "description": "Issue a refund on a paid invoice",
      "risk": "high",
      "scopes": ["invoices:write", "payments:refund"],
      "requires_approval": true,
      "parameters": {
        "invoice_id": { "type": "string", "required": true },
        "amount_cents": { "type": "integer", "required": true }
      }
    }
  ],
  "approval_rules": [
    {
      "when": { "action": "refund_invoice", "amount_cents": { "gt": 10000 } },
      "require": "human_approver"
    }
  ],
  "agent_identity": {
    "required": true,
    "verification": "bearer_token"
  },
  "audit": {
    "log_all": true,
    "retention_days": 365
  }
}`;

export default function Spec() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/spec" className="text-foreground">Spec</Link>
            <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </nav>
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">v1.0 — Draft</Badge>
          <Badge variant="outline">MIT Licensed</Badge>
          <Badge variant="outline">Open Standard</Badge>
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4">Agent Manifest Specification</h1>
        <p className="text-xl text-muted-foreground mb-8">
          An open standard for describing how AI agents can safely interact with web applications.
        </p>

        <div className="flex gap-3 mb-12">
          <Button asChild>
            <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" /> View on GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/schema/manifest.v1.json" download>
              <Download className="h-4 w-4 mr-2" /> Download JSON Schema
            </a>
          </Button>
        </div>

        <section className="prose prose-slate max-w-none mb-12">
          <h2 className="text-2xl font-bold mt-8 mb-3">Why this exists</h2>
          <p className="text-muted-foreground leading-relaxed">
            Today, AI agents interact with web apps the same way humans do — by clicking buttons and reading screens.
            This is fragile, slow, unsafe, and unauditable. The Agent Manifest is a small JSON document a SaaS app
            publishes to declare: <em>here are the actions agents can take, the permissions required, the rules for
            approval, and the audit guarantees we provide.</em>
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Think of it as <strong>OpenAPI for the agent economy</strong> — but with safety, identity, and governance
            built in from day one.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-3">Core principles</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Default-deny.</strong> Nothing is exposed unless explicitly declared.</li>
            <li><strong className="text-foreground">Risk-classified.</strong> Every action carries a low / medium / high risk level.</li>
            <li><strong className="text-foreground">Identity-aware.</strong> Agents must be cryptographically identified.</li>
            <li><strong className="text-foreground">Approval-ready.</strong> High-risk actions can require a human in the loop.</li>
            <li><strong className="text-foreground">Auditable.</strong> Every call is logged with identity, payload, and outcome.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Example manifest</h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-secondary/40 text-xs font-mono text-muted-foreground">
              acme-billing.manifest.json
            </div>
            <pre className="p-6 text-sm font-mono overflow-x-auto leading-relaxed">{exampleManifest}</pre>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Schema reference</h2>
          <div className="space-y-4">
            {[
              { field: "manifest_version", desc: "Spec version. Currently \"1.0\"." },
              { field: "app", desc: "Metadata about the app: name, URL, description." },
              { field: "actions[]", desc: "List of agent-callable actions, each with id, risk, scopes, and parameters." },
              { field: "approval_rules[]", desc: "Conditional rules that escalate an action to require human approval." },
              { field: "agent_identity", desc: "How agents must identify themselves (bearer token, mTLS, or signed JWT)." },
              { field: "audit", desc: "Audit log requirements: what to log, retention, export format." },
            ].map((row) => (
              <div key={row.field} className="flex gap-6 py-3 border-b border-border">
                <code className="font-mono text-sm font-semibold text-primary min-w-[180px]">{row.field}</code>
                <span className="text-sm text-muted-foreground">{row.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Adopt the spec</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Generate a manifest for your app (BridgeAI does this automatically, or write it by hand).</li>
            <li>Host it at <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground text-sm">/.well-known/agent-manifest.json</code>.</li>
            <li>Validate it against the JSON schema.</li>
            <li>Display the <em>"Agent-Ready"</em> badge on your site.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/30 p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Help shape v1.1</h3>
          <p className="text-muted-foreground mb-6">The spec is open-source and community-driven. Open an issue, propose a change, or contribute an example.</p>
          <Button asChild>
            <a href="https://github.com/mhaidi95/agent-manifest-specs" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" /> Contribute on GitHub
            </a>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border mt-20 py-10">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Agent Manifest Specification — Maintained by BridgeAI · MIT License
        </div>
      </footer>
    </div>
  );
}
