import { useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, Loader2, Plug, RefreshCw } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { SITE } from "@/site.config";
import { runMcpHealthCheck, type McpCheckResult } from "@/lib/mcpClient";

const ENDPOINTS = [
  { label: "Read the site", url: `${SITE.BASE_URL}/mcp/read`, detail: "Public posts, projects and activity. No approval needed." },
  { label: "Manage the blog", url: `${SITE.BASE_URL}/mcp/admin`, detail: "Write, edit and schedule posts. Owner approval is required before changes." },
] as const;
type Client = "Claude" | "ChatGPT" | "Other";

function CopyUrl({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy the MCP address", error);
    }
  };
  return <Button size="icon" variant="ghost" onClick={copy} aria-label={`Copy ${label} address`} title={`Copy ${label} address`} className="h-9 w-9 shrink-0">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>;
}

function Endpoint({ endpoint }: { endpoint: typeof ENDPOINTS[number] }) {
  return <div className="min-w-0 border-b border-border py-5 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:items-center sm:gap-5">
    <div className="min-w-0">
      <h3 className="font-semibold text-foreground">{endpoint.label}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{endpoint.detail}</p>
    </div>
    <div className="mt-3 flex min-w-0 items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1 sm:mt-0">
      <code className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-foreground" title={endpoint.url}>{endpoint.url}</code>
      <CopyUrl url={endpoint.url} label={endpoint.label} />
    </div>
  </div>;
}

const STEPS: Record<Client, string[]> = {
  Claude: ["Open Settings → Connectors → Add custom connector.", "Paste the address for reading or blog management above, then connect.", "Ask Claude to read a post or prepare a draft. Approve the GitHub code only when making a change."],
  ChatGPT: ["Open Settings → Connectors → Advanced and enable Developer mode.", "In a chat, choose Developer mode → Add sources → Connect more, then paste an address above.", "Ask ChatGPT to read a post or prepare a draft. Approve the GitHub code only when making a change."],
  Other: ["Add a remote MCP server using Streamable HTTP transport.", "Paste either address above. Add both if you need reading and publishing.", "For blog changes, review the preview, then approve the GitHub device code shown by your assistant."],
};

export default function Connect() {
  const [client, setClient] = useState<Client>("Claude");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<McpCheckResult[] | null>(null);
  const check = async () => {
    setChecking(true);
    try {
      setResults(await Promise.all(ENDPOINTS.map((endpoint) => runMcpHealthCheck(endpoint.url))));
    } finally {
      setChecking(false);
    }
  };
  return <div className="container-wide min-w-0 pb-24">
    <Seo title="MCP guide" description="Connect an assistant to Somrit Dasgupta's public site and owner-approved blog tools." path="/mcp" />
    <header className="border-b border-border pb-10 pt-5">
      <div className="flex items-center gap-2 text-accent"><Plug className="h-5 w-5" /><span className="font-mono text-xs uppercase">MCP guide</span></div>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">Connect an assistant</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Use the public address to read this site. Use the blog address to prepare and publish posts with owner approval.</p>
    </header>

    <section className="border-b border-border py-9" aria-labelledby="addresses-heading">
      <h2 id="addresses-heading" className="text-2xl font-semibold">1. Copy an address</h2>
      <div className="mt-4 border-t border-border">{ENDPOINTS.map((endpoint) => <Endpoint key={endpoint.url} endpoint={endpoint} />)}</div>
    </section>

    <section className="border-b border-border py-9" aria-labelledby="setup-heading">
      <h2 id="setup-heading" className="text-2xl font-semibold">2. Add it to your assistant</h2>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Assistant">
        {(["Claude", "ChatGPT", "Other"] as const).map((item) => <Button key={item} variant={client === item ? "secondary" : "ghost"} size="sm" onClick={() => setClient(item)} aria-pressed={client === item}>{item}</Button>)}
      </div>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">{STEPS[client].map((step, index) => <li key={step} className="flex min-w-0 gap-3 text-sm leading-6 text-muted-foreground"><span className="font-mono text-accent">0{index + 1}</span><span>{step}</span></li>)}</ol>
    </section>

    <section className="border-b border-border py-9" aria-labelledby="publish-heading">
      <h2 id="publish-heading" className="text-2xl font-semibold">Publishing a post</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Ask your assistant to draft a post and show the preview. Once you approve the draft, it will show a GitHub device code. Enter that code at <a className="inline-flex items-center gap-1 break-all text-foreground underline underline-offset-4" href="https://github.com/login/device" target="_blank" rel="noreferrer">github.com/login/device <ExternalLink className="h-3 w-3 shrink-0" /></a>. Your assistant checks approval until GitHub confirms it, then publishes and verifies the change. The authorization lasts one hour. Never share a session token.</p>
    </section>

    <section className="py-9" aria-labelledby="status-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 id="status-heading" className="text-2xl font-semibold">Connection status</h2><p className="mt-2 text-sm text-muted-foreground">Check whether both addresses respond and list their available tools.</p></div>
        <Button variant="outline" onClick={check} disabled={checking} className="gap-2">{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Check connections</Button>
      </div>
      {results && <div className="mt-5 divide-y divide-border border-y border-border">{results.map((result, index) => <div key={ENDPOINTS[index].label} className="min-w-0 py-4">
        <p className={result.ok ? "font-medium text-success" : "font-medium text-destructive"}>{ENDPOINTS[index].label}: {result.ok ? `${result.tools.length} tools available` : "Connection failed"}</p>
        {!result.ok && <p className="mt-1 break-words text-sm text-muted-foreground">{result.steps.find((step) => !step.ok)?.detail}</p>}
        {result.ok && <details className="mt-2 group"><summary className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground">View tools <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><ul className="mt-3 grid gap-2 sm:grid-cols-2">{result.tools.map((tool) => <li key={tool.name} className="min-w-0 text-xs"><code className="break-all font-mono text-foreground">{tool.name}</code>{tool.description && <p className="mt-1 text-muted-foreground">{tool.description}</p>}</li>)}</ul></details>}
      </div>)}</div>}
    </section>
  </div>;
}
