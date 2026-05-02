import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Globe, FileJson } from "lucide-react";

type Result = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary?: { actions: number; high_risk: number; requires_approval: number };
};

const REQUIRED_TOP = ["manifest_version", "app", "actions"];

function validateManifest(raw: string): Result {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e: any) {
    return { valid: false, errors: [`Invalid JSON: ${e.message}`], warnings: [] };
  }

  for (const k of REQUIRED_TOP) if (!(k in parsed)) errors.push(`Missing required field: "${k}"`);

  if (parsed.manifest_version && parsed.manifest_version !== "1.0")
    errors.push(`manifest_version must be "1.0" (got "${parsed.manifest_version}")`);

  if (parsed.app) {
    if (!parsed.app.name) errors.push(`app.name is required`);
    if (!parsed.app.url) errors.push(`app.url is required`);
    else if (!/^https?:\/\//.test(parsed.app.url)) errors.push(`app.url must be a valid http(s) URL`);
  }

  let highRisk = 0;
  let needsApproval = 0;
  if (Array.isArray(parsed.actions)) {
    if (parsed.actions.length === 0) warnings.push(`actions[] is empty — agents will have nothing to call`);
    parsed.actions.forEach((a: any, i: number) => {
      const p = `actions[${i}]`;
      if (!a.id) errors.push(`${p}.id is required`);
      else if (!/^[a-z][a-z0-9_]*$/.test(a.id)) errors.push(`${p}.id must be snake_case (got "${a.id}")`);
      if (!a.description) errors.push(`${p}.description is required`);
      if (!["low", "medium", "high"].includes(a.risk)) errors.push(`${p}.risk must be low|medium|high`);
      if (a.risk === "high") {
        highRisk++;
        if (!a.requires_approval) warnings.push(`${p} ("${a.id}") is high risk but doesn't require_approval`);
      }
      if (a.requires_approval) needsApproval++;
    });
  } else if (parsed.actions) {
    errors.push(`actions must be an array`);
  }

  if (!parsed.agent_identity) warnings.push(`agent_identity not declared — agents won't be authenticated`);
  if (!parsed.audit) warnings.push(`audit not declared — no audit guarantees stated`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      actions: Array.isArray(parsed.actions) ? parsed.actions.length : 0,
      high_risk: highRisk,
      requires_approval: needsApproval,
    },
  };
}

export default function Validator() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const runValidate = (raw: string) => setResult(validateManifest(raw));

  const fetchAndValidate = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      let target = url.trim();
      if (!/^https?:\/\//.test(target)) target = `https://${target}`;
      // try /.well-known if user gave bare domain
      const u = new URL(target);
      if (u.pathname === "/" || u.pathname === "") {
        target = `${u.origin}/.well-known/agent-manifest.json`;
      }
      const res = await fetch(target);
      if (!res.ok) {
        setResult({ valid: false, errors: [`Fetch failed: ${res.status} ${res.statusText} from ${target}`], warnings: [] });
        return;
      }
      const raw = await res.text();
      setText(raw);
      runValidate(raw);
    } catch (e: any) {
      setResult({ valid: false, errors: [`Could not fetch manifest: ${e.message}. (CORS may block direct browser fetch — paste it instead.)`], warnings: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/spec" className="hover:text-foreground transition-colors">Spec</Link>
            <Link to="/validator" className="text-foreground">Validator</Link>
            <Link to="/badge" className="hover:text-foreground transition-colors">Badge</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          </nav>
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-6 py-16">
        <Badge variant="outline" className="mb-4">Free tool · No login</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Manifest Validator</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
          Paste an Agent Manifest, or point us at any site that hosts one at <code className="font-mono text-foreground text-sm">/.well-known/agent-manifest.json</code>.
        </p>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <label className="text-sm font-medium mb-2 block flex items-center gap-2"><Globe className="h-4 w-4" /> Validate from URL</label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourapp.com  (we'll auto-append /.well-known/agent-manifest.json)"
              onKeyDown={(e) => e.key === "Enter" && fetchAndValidate()}
            />
            <Button onClick={fetchAndValidate} disabled={loading} className="bg-gradient-hero hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch & validate"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <label className="text-sm font-medium mb-2 block flex items-center gap-2"><FileJson className="h-4 w-4" /> Or paste manifest JSON</label>
          <Textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='{ "manifest_version": "1.0", "app": { ... }, "actions": [ ... ] }'
            className="font-mono text-xs"
          />
          <div className="mt-3 flex gap-2">
            <Button onClick={() => runValidate(text)} disabled={!text.trim()} className="bg-gradient-hero hover:opacity-90">Validate</Button>
            <Button variant="ghost" onClick={() => { setText(""); setResult(null); }}>Clear</Button>
          </div>
        </div>

        {result && (
          <div className={`rounded-2xl border p-6 ${result.valid ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.valid
                ? <CheckCircle2 className="h-6 w-6 text-success" />
                : <XCircle className="h-6 w-6 text-destructive" />}
              <h2 className="text-xl font-semibold">
                {result.valid ? "Valid manifest" : `${result.errors.length} error${result.errors.length === 1 ? "" : "s"}`}
              </h2>
            </div>

            {result.summary && result.valid && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-card border border-border p-3">
                  <div className="text-2xl font-semibold">{result.summary.actions}</div>
                  <div className="text-xs text-muted-foreground">actions declared</div>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <div className="text-2xl font-semibold">{result.summary.high_risk}</div>
                  <div className="text-xs text-muted-foreground">high-risk</div>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <div className="text-2xl font-semibold">{result.summary.requires_approval}</div>
                  <div className="text-xs text-muted-foreground">need approval</div>
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-semibold mb-2 text-destructive">Errors</div>
                <ul className="space-y-1 text-sm font-mono">
                  {result.errors.map((e, i) => <li key={i} className="text-destructive">• {e}</li>)}
                </ul>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2 text-warning">Warnings</div>
                <ul className="space-y-1 text-sm font-mono">
                  {result.warnings.map((w, i) => <li key={i} className="text-warning">• {w}</li>)}
                </ul>
              </div>
            )}

            {result.valid && (
              <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-3">
                <Button asChild className="bg-gradient-hero hover:opacity-90"><Link to="/badge">Get the Agent-Ready badge →</Link></Button>
                <Button variant="outline" asChild><Link to="/auth?mode=signup">Enforce it at runtime with AgentGate</Link></Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
