import { useState } from "react";
import { Check, ChevronDown, Plug, RefreshCw, ShieldCheck } from "lucide-react";
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
    <div className="w-full pb-16 space-y-12">
      <Seo title="MCP connections" description="Connect Claude, ChatGPT, Cursor or VS Code to Somrit Dasgupta’s site and owner-approved publishing tools." path="/mcp" />
      
      <header className="border-b border-border/40 pb-8 pt-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plug className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-wider">MCP connections</span>
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
          Somrit’s site, in your assistant.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-2xl">
          Read posts and projects. Or connect the owner’s publishing tools.
        </p>
      </header>

      <section className="space-y-8" aria-label="Connect an assistant">
        <Tabs value={mode} onValueChange={(value) => setMode(value === "admin" ? "admin" : "reader")}>
          <TabsList className="grid h-12 w-full sm:w-80 grid-cols-2 rounded-xl p-1 bg-muted/50">
            <TabsTrigger value="reader" className="rounded-lg font-medium transition-all">For readers</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-lg font-medium transition-all">For the owner</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 w-fit px-4 py-2.5 rounded-lg border border-border/40">
          {mode === "admin" ? <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> : <Check className="h-4 w-4 shrink-0 text-primary" />}
          <p>{mode === "admin" ? "Posts, drafts and resume links. Changes require owner approval." : "Public posts, repositories and activity. No sign-in required."}</p>
        </div>
        
        {/* The 'Copy server address' button and icons are inside this component */}
        <InstallOptions key={mode} mode={mode} />
      </section>

      {mode === "admin" && (
        <section className="border-b border-border/40 pb-10 space-y-6" aria-labelledby="approval-heading">
          <h2 id="approval-heading" className="text-base font-semibold text-foreground">Before a change is published</h2>
          <ol className="grid gap-6 text-sm text-muted-foreground sm:grid-cols-3">
            <li className="space-y-2">
              <span className="block font-mono text-xs font-semibold text-foreground">01 / Review</span>
              <p className="leading-relaxed">Ask for a draft and review its preview.</p>
            </li>
            <li className="space-y-2">
              <span className="block font-mono text-xs font-semibold text-foreground">02 / Approve</span>
              <p className="leading-relaxed">Enter the assistant’s code at <a href="https://github.com/login/device" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">GitHub</a>.</p>
            </li>
            <li className="space-y-2">
              <span className="block font-mono text-xs font-semibold text-foreground">03 / Confirm</span>
              <p className="leading-relaxed">The assistant checks approval and confirms the saved change.</p>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground/80 font-mono">Approval lasts one hour. Never share an authorization or session token.</p>
        </section>
      )}

      <details className="group rounded-2xl border border-border/40 bg-card transition-all">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-semibold text-foreground select-none">
          <span className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-foreground font-mono text-sm font-bold">
              {">_"}
            </div>
            Diagnostic Health Checks
          </span>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </summary>
        
        <div className="border-t border-border/40 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-base font-semibold text-foreground">Connection Status</h4>
              <p className="text-sm text-muted-foreground mt-1">Verify tools and server availability.</p>
            </div>
            <Button variant="outline" disabled={isChecking} onClick={check} className="gap-2 h-10 rounded-lg font-medium shadow-sm">
              <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking..." : "Check both servers"}
            </Button>
          </div>
          
          <div aria-live="polite" className="grid gap-4 sm:grid-cols-2">
            {results.length === 0 && !isChecking && (
              <div className="col-span-full rounded-xl border border-dashed border-border/40 p-8 text-center text-sm text-muted-foreground">
                Run diagnostics to see connection status.
              </div>
            )}
            {results.map((result, index) => (
              <div key={Object.values(CONNECTIONS)[index].name} className="rounded-xl border border-border/40 bg-background/50 p-5 flex flex-col justify-between gap-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-sm text-foreground">{Object.values(CONNECTIONS)[index].label}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium ${result.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${result.ok ? "bg-emerald-500" : "bg-destructive"}`}></span>
                    {result.ok ? "Online" : "Failed"}
                  </span>
                </div>
                {result.ok ? (
                  <p className="text-xs text-muted-foreground font-mono">{result.tools.length} tools available</p>
                ) : (
                  <p className="text-xs text-muted-foreground font-mono bg-destructive/5 p-2.5 rounded-lg border border-destructive/10">
                    {result.steps.find((item) => !item.ok)?.detail || "Unknown error"}
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
