import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const BADGE_URL = "https://agentgate.lovable.app/badge/agent-ready.svg";
const VALIDATOR_URL = "https://agentgate.lovable.app/validator";

const snippets = {
  html: `<a href="${VALIDATOR_URL}" target="_blank" rel="noopener">
  <img src="${BADGE_URL}" alt="Agent-Ready" height="28" />
</a>`,
  markdown: `[![Agent-Ready](${BADGE_URL})](${VALIDATOR_URL})`,
  jsx: `<a href="${VALIDATOR_URL}" target="_blank" rel="noopener noreferrer">
  <img src="${BADGE_URL}" alt="Agent-Ready" height={28} />
</a>`,
};

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-secondary/40 flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
        <Button size="sm" variant="ghost" onClick={copy} className="h-7">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

export default function BadgePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/spec" className="hover:text-foreground transition-colors">Spec</Link>
            <Link to="/validator" className="hover:text-foreground transition-colors">Validator</Link>
            <Link to="/badge" className="text-foreground">Badge</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          </nav>
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4">Free · MIT</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">The Agent-Ready badge</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
          Show the world your app speaks to AI agents safely. Drop the badge on your homepage, README, or pricing page — it links to the public validator so anyone can verify.
        </p>

        <div className="rounded-2xl border border-border bg-gradient-soft p-12 flex flex-col items-center gap-6 mb-10">
          <img src="/badge/agent-ready.svg" alt="Agent-Ready badge" height={56} className="h-14" />
          <p className="text-sm text-muted-foreground">Hosted at <code className="font-mono text-foreground">{BADGE_URL}</code></p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Embed it</h2>
        <div className="space-y-4 mb-12">
          <CodeBlock label="HTML" code={snippets.html} />
          <CodeBlock label="Markdown (README)" code={snippets.markdown} />
          <CodeBlock label="JSX / React" code={snippets.jsx} />
        </div>

        <h2 className="text-2xl font-bold mb-4">Earn the badge</h2>
        <ol className="space-y-3 text-muted-foreground list-decimal list-inside mb-10">
          <li>Publish a manifest at <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground text-sm">/.well-known/agent-manifest.json</code>.</li>
          <li>Run it through the <Link to="/validator" className="text-primary hover:underline">validator</Link> until it's green.</li>
          <li>Paste the snippet above.</li>
        </ol>

        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Want runtime enforcement, not just a badge?</h3>
          <p className="text-muted-foreground mb-6">AgentGate turns your manifest into live policy: identity, scopes, approvals, audit logs.</p>
          <Button asChild className="bg-gradient-hero hover:opacity-90"><Link to="/auth?mode=signup">Try AgentGate free</Link></Button>
        </div>
      </main>
    </div>
  );
}
