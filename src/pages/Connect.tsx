import { useCallback, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Github,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE } from "@/site.config";
import {
  runMcpHealthCheck,
  runMcpTool,
  type McpCheckResult,
  type McpToolInfo,
  type McpToolRunResult,
} from "@/lib/mcpClient";

const READ_URL = `${SITE.BASE_URL}/mcp/read`;
const AUTHOR_URL = `${SITE.BASE_URL}/mcp/admin`;

type ServerKind = "read" | "author";
type ClientKind = "Claude" | "ChatGPT" | "Terminal";

const SERVERS = {
  read: {
    label: "Public reader",
    summary: "Blog posts, activity, repositories, and author information.",
    url: READ_URL,
  },
  author: {
    label: "Owner authoring",
    summary: "Create, edit, schedule, draft, and delete posts after GitHub verification.",
    url: AUTHOR_URL,
  },
} as const;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="ghost" size="icon" onClick={copy} aria-label={`Copy ${label}`} className="h-9 w-9 shrink-0">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

function EndpointCard({ kind }: { kind: ServerKind }) {
  const server = SERVERS[kind];
  return (
    <article className="border-t border-border py-5 first:border-t-0 lg:border-l lg:border-t-0 lg:px-6 lg:first:border-l-0 lg:first:pl-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {kind === "read" ? <ShieldCheck className="h-4 w-4 text-success" /> : <Github className="h-4 w-4 text-accent" />}
            <h3 className="text-base font-semibold text-foreground">{server.label}</h3>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">{server.summary}</p>
        </div>
        <span className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground">
          {kind === "read" ? "No auth" : "Device flow"}
        </span>
      </div>
      <div className="mt-4 flex min-w-0 items-center gap-1 rounded-lg border border-border bg-background p-1.5">
        <code className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-foreground">{server.url}</code>
        <CopyButton value={server.url} label={`${server.label} endpoint`} />
      </div>
    </article>
  );
}

function StatusCard({ kind, result, isRunning, onCheck }: {
  kind: ServerKind;
  result: McpCheckResult | null;
  isRunning: boolean;
  onCheck: (kind: ServerKind) => void;
}) {
  const server = SERVERS[kind];
  const isHealthy = result?.ok === true;
  const failedStep = result?.steps.find((item) => !item.ok);

  return (
    <div className="flex min-h-28 flex-col justify-between border-t border-border py-5 first:border-t-0 sm:border-l sm:border-t-0 sm:px-5 sm:first:border-l-0 sm:first:pl-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{server.label}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {isRunning ? "Checking endpoint…" : result ? `${result.tools.length} tools · ${result.totalMs}ms` : "Not checked"}
          </p>
        </div>
        <span className={cn(
          "flex items-center gap-1.5 text-xs font-medium",
          isHealthy ? "text-success" : result ? "text-destructive" : "text-muted-foreground",
        )}>
          <span className={cn("h-2 w-2 rounded-full bg-muted-foreground", isHealthy && "bg-success", result && !isHealthy && "bg-destructive", isRunning && "animate-pulse")} />
          {isHealthy ? "Operational" : result ? "Issue found" : "Ready"}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="line-clamp-2 text-xs text-destructive">{failedStep?.detail}</p>
        <Button variant="outline" size="sm" disabled={isRunning} onClick={() => onCheck(kind)} className="ml-auto gap-2">
          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Check
        </Button>
      </div>
    </div>
  );
}

function defaultArguments(tool: McpToolInfo): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const key of tool.inputSchema?.required ?? []) {
    output[key] = key === "slug" ? "hello-world" : key === "confirm" ? true : "";
  }
  return output;
}

function ToolItem({ tool, endpoint }: { tool: McpToolInfo; endpoint: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [run, setRun] = useState<McpToolRunResult | null>(null);
  const parameters = Object.keys(tool.inputSchema?.properties ?? {});

  const test = async () => {
    setIsOpen(true);
    setIsRunning(true);
    setRun(await runMcpTool(endpoint, tool.name, defaultArguments(tool)));
    setIsRunning(false);
  };

  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex min-h-14 items-center gap-2 px-3 sm:px-4">
        <Button variant="ghost" onClick={() => setIsOpen((value) => !value)} className="min-w-0 flex-1 justify-start gap-2 px-1">
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !isOpen && "-rotate-90")} />
          <code className="truncate font-mono text-xs sm:text-sm">{tool.name}</code>
          <span className="hidden truncate text-xs font-normal text-muted-foreground md:inline">{tool.title}</span>
        </Button>
        {run && <span className={cn("font-mono text-[10px]", run.ok ? "text-success" : "text-destructive")}>{run.ok ? "PASS" : "FAIL"}</span>}
        <Button variant="outline" size="sm" disabled={isRunning} onClick={test} className="gap-1.5">
          {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Test</span>
        </Button>
      </div>
      {isOpen && (
        <div className="space-y-3 border-t border-border bg-secondary/30 px-4 py-4 sm:pl-11">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{tool.description}</p>
          {parameters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {parameters.map((parameter) => (
                <code key={parameter} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  {parameter}{tool.inputSchema?.required?.includes(parameter) ? " *" : ""}
                </code>
              ))}
            </div>
          )}
          {run && <pre className="max-h-56 overflow-auto rounded-lg bg-foreground p-3 font-mono text-xs leading-5 text-background"><code className="whitespace-pre-wrap break-words">{run.text.slice(0, 4000)}</code></pre>}
        </div>
      )}
    </li>
  );
}

const claudeConfig = JSON.stringify({
  mcpServers: {
    "somrit-webcv": { type: "http", url: READ_URL },
    "somrit-webcv-admin": { type: "http", url: AUTHOR_URL },
  },
}, null, 2);

function SetupPanel({ client }: { client: ClientKind }) {
  if (client === "Terminal") {
    const command = `npx -y mcp-remote ${READ_URL}`;
    return <div className="flex items-center gap-2 rounded-lg bg-foreground p-3 text-background"><Terminal className="h-4 w-4 shrink-0" /><code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs">{command}</code><CopyButton value={command} label="terminal command" /></div>;
  }

  const steps = client === "Claude"
    ? ["Open Settings → Connectors and add a custom connector.", "Paste either endpoint. Connecting itself requires no login.", "Ask for an authoring action. Approve GitHub Device Flow when the assistant presents it."]
    : ["Enable Developer mode in Settings → Connectors → Advanced.", "From the composer, choose Developer mode → Add sources → Connect more.", "Paste either endpoint, then request an authoring action normally."];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <ol className="space-y-4">
        {steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="font-mono text-xs text-foreground">0{index + 1}</span><span>{step}</span></li>)}
      </ol>
      {client === "Claude" && <pre className="max-h-64 overflow-auto rounded-lg bg-foreground p-4 font-mono text-xs leading-5 text-background"><code>{claudeConfig}</code></pre>}
    </div>
  );
}

export default function Connect() {
  const [results, setResults] = useState<Record<ServerKind, McpCheckResult | null>>({ read: null, author: null });
  const [running, setRunning] = useState<ServerKind | "all" | null>(null);
  const [activeServer, setActiveServer] = useState<ServerKind>("author");
  const [client, setClient] = useState<ClientKind>("ChatGPT");

  const check = useCallback(async (kind: ServerKind) => {
    setRunning(kind);
    const result = await runMcpHealthCheck(SERVERS[kind].url);
    setResults((current) => ({ ...current, [kind]: result }));
    setRunning(null);
  }, []);

  const checkAll = useCallback(async () => {
    setRunning("all");
    const [read, author] = await Promise.all([runMcpHealthCheck(READ_URL), runMcpHealthCheck(AUTHOR_URL)]);
    setResults({ read, author });
    setRunning(null);
  }, []);

  const tools = results[activeServer]?.tools ?? [];
  const toolSummary = useMemo(() => tools.length ? `${tools.length} tools discovered` : "Run a check to discover tools", [tools.length]);

  return (
    <div className="container-wide pb-24">
      <Seo title="MCP connections" description="Connect an AI assistant to Somrit's WebCV for verified reading and GitHub-backed blog authoring." path="/mcp" />

      <header className="grid gap-8 border-b border-border pb-10 pt-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,.8fr)] lg:items-end">
        <div className="max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase text-accent">Agent integrations</p>
          <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground sm:text-5xl">A direct, verifiable path from chat to code.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Read the public site or manage blog content through GitHub. Authoring is only reported as complete after the committed file is read back and verified.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Button onClick={checkAll} disabled={running !== null} className="gap-2">
            {running === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Verify both servers
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer">MCP specification <ExternalLink className="h-4 w-4" /></a>
          </Button>
        </div>
      </header>

      <section className="py-10" aria-labelledby="endpoints-heading">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase text-muted-foreground">01 / Connect</p><h2 id="endpoints-heading" className="mt-2 text-2xl font-semibold text-foreground">Choose an endpoint</h2></div></div>
        <div className="border-y border-border lg:grid lg:grid-cols-2"><EndpointCard kind="read" /><EndpointCard kind="author" /></div>
      </section>

      <section className="grid gap-8 border-y border-border py-10 lg:grid-cols-[minmax(18rem,.7fr)_minmax(0,1.3fr)]" aria-labelledby="workflow-heading">
        <div>
          <p className="font-mono text-xs uppercase text-muted-foreground">02 / Author</p>
          <h2 id="workflow-heading" className="mt-2 text-2xl font-semibold text-foreground">One request, one continuous flow</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">The assistant must retain your request through verification and may only claim success with a verified commit SHA.</p>
        </div>
        <ol className="grid gap-5 sm:grid-cols-3">
          {["Ask to create, update, schedule, or delete a post.", "Approve the GitHub code shown in chat. No login is required when adding the server.", "The original action resumes and returns a verified GitHub commit."].map((step, index) => (
            <li key={step} className="border-l border-border pl-4"><span className="font-mono text-xs text-accent">0{index + 1}</span><p className="mt-2 text-sm leading-6 text-foreground">{step}</p></li>
          ))}
        </ol>
      </section>

      <section className="py-10" aria-labelledby="status-heading">
        <div className="mb-6"><p className="font-mono text-xs uppercase text-muted-foreground">03 / Verify</p><h2 id="status-heading" className="mt-2 text-2xl font-semibold text-foreground">Live server checks</h2></div>
        <div className="border-y border-border sm:grid sm:grid-cols-2"><StatusCard kind="read" result={results.read} isRunning={running === "read" || running === "all"} onCheck={check} /><StatusCard kind="author" result={results.author} isRunning={running === "author" || running === "all"} onCheck={check} /></div>
      </section>

      <section className="grid gap-8 border-y border-border py-10 lg:grid-cols-[16rem_minmax(0,1fr)]" aria-labelledby="tools-heading">
        <div>
          <p className="font-mono text-xs uppercase text-muted-foreground">04 / Inspect</p>
          <h2 id="tools-heading" className="mt-2 text-2xl font-semibold text-foreground">Tool catalog</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{toolSummary}. Rich authoring includes a component discovery tool for supported MDX blocks.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(["read", "author"] as const).map((kind) => <Button key={kind} variant={activeServer === kind ? "default" : "outline"} size="sm" onClick={() => setActiveServer(kind)} className="gap-2"><Wrench className="h-3.5 w-3.5" />{kind === "read" ? "Reader" : "Author"}</Button>)}
          </div>
        </div>
        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
          {tools.length ? <ul>{tools.map((tool) => <ToolItem key={tool.name} tool={tool} endpoint={SERVERS[activeServer].url} />)}</ul> : <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center"><Wrench className="mb-3 h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground">Check the {SERVERS[activeServer].label.toLowerCase()} server to load its tools.</p></div>}
        </div>
      </section>

      <section className="py-10" aria-labelledby="setup-heading">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs uppercase text-muted-foreground">05 / Setup</p><h2 id="setup-heading" className="mt-2 text-2xl font-semibold text-foreground">Client instructions</h2></div><div className="flex overflow-x-auto rounded-lg border border-border p-1">{(["ChatGPT", "Claude", "Terminal"] as const).map((item) => <Button key={item} variant={client === item ? "secondary" : "ghost"} size="sm" onClick={() => setClient(item)}>{item}</Button>)}</div></div>
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6"><SetupPanel client={client} /></div>
      </section>
    </div>
  );
}