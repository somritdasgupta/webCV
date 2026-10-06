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

  return <div className="container-wide min-w-0 max-w-4xl pb-16">
    <Seo title="MCP connections" description="Connect Claude, ChatGPT, Cursor or VS Code to Somrit Dasgupta’s site and owner-approved publishing tools." path="/mcp" />
    <header className="border-b border-border pb-8 pt-5 sm:pb-10">
      <div className="flex items-center gap-2 text-muted-foreground"><Plug className="h-4 w-4" /><span className="font-mono text-xs uppercase">MCP connections</span></div>
      <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Somrit’s site, in your assistant.</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">Read posts and projects. Or connect the owner’s publishing tools.</p>
    </header>

    <section className="py-8 sm:py-10" aria-label="Connect an assistant">
      <Tabs value={mode} onValueChange={(value) => setMode(value === "admin" ? "admin" : "reader")}>
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg p-1 sm:w-80">
          <TabsTrigger value="reader" className="min-h-10 rounded-lg">For readers</TabsTrigger>
          <TabsTrigger value="admin" className="min-h-10 rounded-lg">For the owner</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mb-7 mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        {mode === "admin" ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
        <p>{mode === "admin" ? "Posts, drafts and resume links. Changes require owner approval." : "Public posts, repositories and activity. No sign-in required."}</p>
      </div>
      <InstallOptions key={mode} mode={mode} />
    </section>

    {mode === "admin" && <section className="border-b border-border pb-8" aria-labelledby="approval-heading">
      <h2 id="approval-heading" className="text-base font-semibold">Before a change is published</h2>
      <ol className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
        <li><span className="mb-1 block font-mono text-xs text-foreground">01 / Review</span>Ask for a draft and review its preview.</li>
        <li><span className="mb-1 block font-mono text-xs text-foreground">02 / Approve</span>Enter the assistant’s code at <a href="https://github.com/login/device" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">GitHub</a>.</li>
        <li><span className="mb-1 block font-mono text-xs text-foreground">03 / Confirm</span>The assistant checks approval and confirms the saved change.</li>
      </ol>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">Approval lasts one hour. Never share an authorization or session token.</p>
    </section>}

    <details className="group border-b border-border py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">Connection checks<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
      <div className="mt-5">
        <Button variant="outline" disabled={isChecking} onClick={check} className="gap-2"><RefreshCw className="h-4 w-4" />{isChecking ? "Checking connections…" : "Check both servers"}</Button>
        <div aria-live="polite" className="mt-4 space-y-4">{results.map((result, index) => <div key={Object.values(CONNECTIONS)[index].name}>
          <p className={result.ok ? "text-sm text-success" : "text-sm text-destructive"}>{Object.values(CONNECTIONS)[index].label}: {result.ok ? `${result.tools.length} tools available` : "Connection failed"}</p>
          {!result.ok && <p className="mt-1 break-words text-xs text-muted-foreground">{result.steps.find((item) => !item.ok)?.detail}</p>}
        </div>)}</div>
      </div>
    </details>
  </div>;
}
