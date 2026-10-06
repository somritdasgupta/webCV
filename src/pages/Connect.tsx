import { useState } from "react";
import { Check, ChevronDown, Plug, RefreshCw, ShieldCheck, ArrowRight, Terminal, Sparkles } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMcpHealthCheck, type McpCheckResult } from "@/lib/mcpClient";
import { InstallOptions } from "@/features/mcp-setup/components/install-options";
import { CONNECTIONS, type ConnectionMode } from "@/features/mcp-setup/services/install-config";

export default function Connect() {
  const [mode, setMode] = useState<ConnectionMode>("reader");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<McpCheckResult[]>([]);

  const check = async () => {
    setIsChecking(true);
    try {
      setResults(await Promise.all(Object.values(CONNECTIONS).map((item) => runMcpHealthCheck(item.url))));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <Seo title="MCP connections" description="Connect Claude, ChatGPT, Cursor or VS Code to Somrit Dasgupta’s site and owner-approved publishing tools." path="/mcp" />
      
      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
          <Plug className="h-3.5 w-3.5" />
          <span>Model Context Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Somrit’s site, in your assistant.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
          Instantly connect your AI workspace to read posts and projects, or securely authorize publishing tools.
        </p>
      </header>

      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-10 shadow-xl space-y-8 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Select Access Profile
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Choose what your assistant is allowed to interact with.</p>
          </div>

          <Tabs value={mode} onValueChange={(value) => setMode(value === "admin" ? "admin" : "reader")}>
            <TabsList className="grid h-12 w-full sm:w-80 grid-cols-2 rounded-2xl p-1.5 bg-muted/80 shadow-inner">
              <TabsTrigger value="reader" className="rounded-xl font-medium text-xs sm:text-sm transition-all data-[state=active]:shadow-sm">For Readers</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-xl font-medium text-xs sm:text-sm transition-all data-[state=active]:shadow-sm">For Owner</TabsTrigger>
            </TabsList>
          </TabsList>
        </div>

        <div className={`flex items-start sm:items-center gap-3 p-4 rounded-2xl border transition-all ${mode === "admin" ? "bg-primary/5 border-primary/20 text-foreground" : "bg-muted/40 border-border/60 text-muted-foreground"}`}>
          {mode === "admin" ? <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5 sm:mt-0" /> : <Check className="h-5 w-5 shrink-0 text-primary mt-0.5 sm:mt-0" />}
          <div className="space-y-0.5 text-xs sm:text-sm">
            <span className="font-semibold block text-foreground">
              {mode === "admin" ? "Owner Publishing Mode Active" : "Public Read-Only Mode Active"}
            </span>
            <span>
              {mode === "admin" ? "Posts, drafts, and resume links. All changes require explicit owner approval." : "Public posts, code repositories, and activity streams. No sign-in required."}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <InstallOptions key={mode} mode={mode} />
        </div>
      </div>

      {mode === "admin" && (
        <section className="rounded-3xl border border-primary/30 bg-card/80 backdrop-blur-sm p-6 sm:p-10 shadow-xl space-y-6" aria-labelledby="approval-heading">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">Security Protocol</span>
            <h2 id="approval-heading" className="text-xl font-bold tracking-tight text-foreground">Before any change goes live</h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3 text-sm">
            <li className="rounded-2xl border border-border/60 bg-background/60 p-5 space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">01</div>
              <h3 className="font-semibold text-foreground">Review Draft</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">Ask your assistant for a draft and check the generated preview carefully.</p>
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/60 p-5 space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">02</div>
              <h3 className="font-semibold text-foreground">Approve on GitHub</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">Enter the assistant’s generated code at <a href="https://github.com/login/device" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary font-medium transition-colors">GitHub Device Login</a>.</p>
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/60 p-5 space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">03</div>
              <h3 className="font-semibold text-foreground">Confirm Save</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">The assistant verifies authorization and confirms the saved change.</p>
            </li>
          </ol>
          <div className="rounded-xl bg-muted/40 p-4 border border-border/40 flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <span>Security Note: Authorizations expire in one hour. Never share your private session or tokens.</span>
          </div>
        </section>
      )}

      <details className="group rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-8 transition-all">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold tracking-tight text-foreground select-none">
          <span className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-secondary text-foreground">
              <Terminal className="h-4 w-4" />
            </div>
            Diagnostic Health Checks
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
            <span>Verify servers</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
          </div>
        </summary>
        <div className="mt-6 pt-6 border-t border-border/60 space-y-5">
          <Button variant="outline" disabled={isChecking} onClick={check} className="gap-2.5 h-11 rounded-2xl font-medium w-full sm:w-auto shadow-sm">
            <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin text-primary" : ""}`} />
            {isChecking ? "Running diagnostic checks…" : "Check both servers now"}
          </Button>
          <div aria-live="polite" className="space-y-3">
            {results.map((result, index) => (
              <div key={Object.values(CONNECTIONS)[index].name} className="rounded-2xl border border-border/60 bg-background/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-sm">
                <span className="font-medium text-foreground">{Object.values(CONNECTIONS)[index].label}</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${result.ok ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${result.ok ? "bg-emerald-500" : "bg-destructive"}`}></span>
                    {result.ok ? `${result.tools.length} tools available` : "Connection failed"}
                  </span>
                </div>
                {!result.ok && (
                  <p className="w-full text-xs text-muted-foreground font-mono bg-destructive/5 p-2 rounded-xl border border-destructive/10 mt-1">
                    {result.steps.find((item) => !item.ok)?.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
