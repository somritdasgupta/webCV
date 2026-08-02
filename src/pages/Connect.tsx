import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Loader2,
  LockKeyhole,
  Play,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  runMcpHealthCheck,
  runMcpTool,
  type McpCheckResult,
  type McpToolInfo,
  type McpToolRunResult,
} from "@/lib/mcpClient";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const MCP_URL = `https://${projectRef}.supabase.co/functions/v1/mcp`;
const MCP_ADMIN_URL = `https://${projectRef}.supabase.co/functions/v1/mcp-admin`;

/* ---------------------------------------------------------------- primitives */

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  }, []);
  return { copied, copy };
};

const CopyButton = ({ value, id }: { value: string; id: string }) => {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value, id)}
      aria-label={copied === id ? "Copied" : "Copy"}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {copied === id ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

/** Dark, wrapping, copyable code block — matches the blog code experience. */
const CodeBlock = ({ code, lang, id }: { code: string; lang?: string; id: string }) => (
  <div className="not-prose group relative overflow-hidden rounded-xl border border-border bg-[#0d1117]">
    <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        {lang ?? "text"}
      </span>
      <div className="[&_button]:border-white/15 [&_button]:bg-white/5 [&_button]:text-white/60 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
        <CopyButton value={code} id={id} />
      </div>
    </div>
    <pre className="overflow-x-auto px-4 py-3">
      <code className="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-[#e6edf3]">
        {code}
      </code>
    </pre>
  </div>
);

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-[12px] font-medium text-foreground">
      {n}
    </span>
    <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
  </li>
);

const Card = ({
  title,
  icon: Icon,
  href,
  action,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-elev-sm backdrop-blur-sm sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </h2>
      {action}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
    {children}
  </section>
);

const Dot = ({ ok }: { ok: boolean | null }) => (
  <span
    className={cn(
      "inline-block h-2 w-2 shrink-0 rounded-full",
      ok === null ? "bg-muted-foreground/50" : ok ? "bg-emerald-500" : "bg-red-500",
    )}
  />
);

/* ------------------------------------------------------------------- health */

const HealthPanel = ({
  result,
  running,
  onRun,
}: {
  result: McpCheckResult | null;
  running: boolean;
  onRun: () => void;
}) => (
  <Card
    title="Server health"
    icon={Activity}
    action={
      <Button size="sm" variant="outline" onClick={onRun} disabled={running} className="gap-1.5">
        {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        {running ? "Checking" : "Verify connection"}
      </Button>
    }
  >
    {!result && !running && (
      <p className="text-sm text-muted-foreground">
        Run a live check against the endpoint: reachability, MCP handshake, and tool discovery.
      </p>
    )}
    {running && !result && (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Contacting the MCP server…
      </p>
    )}
    {result && (
      <div className="space-y-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
            result.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
          )}
        >
          <Dot ok={result.ok} />
          <span className="font-medium">{result.ok ? "Operational" : "Degraded"}</span>
          <span className="ml-auto font-mono text-[11px] opacity-70">{result.totalMs}ms</span>
        </div>

        <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border">
          {result.steps.map((s) => (
            <li key={s.id} className="flex items-start gap-3 px-3 py-2.5">
              {s.ok ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="break-words font-mono text-[11px] text-muted-foreground">{s.detail}</div>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{s.ms}ms</span>
            </li>
          ))}
        </ul>

        {result.instructions && (
          <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {result.instructions}
          </p>
        )}
      </div>
    )}
  </Card>
);

/* -------------------------------------------------------------------- tools */

const argsFor = (t: McpToolInfo): Record<string, unknown> => {
  // Validation runs read-only tools with no arguments; tools that require an
  // argument get a safe sample so the call is still meaningful.
  const required = t.inputSchema?.required ?? [];
  if (required.length === 0) return {};
  const out: Record<string, unknown> = {};
  for (const key of required) out[key] = key === "slug" ? "hello-world" : "";
  return out;
};

const ToolRow = ({
  tool,
  endpoint,
}: {
  tool: McpToolInfo;
  endpoint: string;
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<McpToolRunResult | null>(null);

  const params = Object.keys(tool.inputSchema?.properties ?? {});
  const destructive = tool.annotations?.destructiveHint;

  return (
    <li className="border-b border-border/60 last:border-0">
      <div className="flex flex-wrap items-center gap-2 px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
          />
          <code className="truncate font-mono text-[13px] text-foreground">{tool.name}</code>
          <span
            className={cn(
              "hidden shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[10px] sm:inline",
              destructive
                ? "border-red-500/30 text-red-500"
                : tool.annotations?.readOnlyHint
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-border text-muted-foreground",
            )}
          >
            {destructive ? "write" : tool.annotations?.readOnlyHint ? "read-only" : "mutating"}
          </span>
        </button>
        <div className="flex items-center gap-2">
          {run && (
            <span className={cn("font-mono text-[11px]", run.ok ? "text-emerald-500" : "text-red-500")}>
              {run.ok ? "pass" : "fail"} · {run.ms}ms
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setOpen(true);
              setRun(await runMcpTool(endpoint, tool.name, argsFor(tool)));
              setBusy(false);
            }}
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Test
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-2 px-3 pb-3 pl-9">
          <p className="text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
          {params.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {params.map((p) => (
                <span
                  key={p}
                  className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {p}
                  {tool.inputSchema?.required?.includes(p) ? "*" : "?"}
                </span>
              ))}
            </div>
          )}
          {run && (
            <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-[#0d1117] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#e6edf3]">
              <code className="whitespace-pre-wrap break-words">{run.text.slice(0, 4000)}</code>
            </pre>
          )}
        </div>
      )}
    </li>
  );
};

/* --------------------------------------------------------------------- page */

const claudeConfig = JSON.stringify(
  { mcpServers: { "somrit-webcv": { type: "http", url: MCP_URL } } },
  null,
  2,
);
const cliCommand = `npx -y mcp-remote ${MCP_URL}`;
const curlProbe = `curl -sS -X POST ${MCP_URL} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

const Connect = () => {
  const [result, setResult] = useState<McpCheckResult | null>(null);
  const [running, setRunning] = useState(false);
  const [validating, setValidating] = useState(false);

  const check = useCallback(async () => {
    setRunning(true);
    setResult(await runMcpHealthCheck(MCP_URL));
    setRunning(false);
  }, []);

  // Auto health-check on first paint so the page is never stale.
  useEffect(() => {
    void check();
  }, [check]);

  const validateAll = useCallback(async () => {
    if (!result?.tools.length) return;
    setValidating(true);
    // Sequential: keeps GitHub's unauthenticated rate limit happy and avoids
    // hammering the edge function with parallel cold starts.
    for (const t of result.tools) {
      if (t.annotations?.destructiveHint) continue;
      await runMcpTool(MCP_URL, t.name, argsFor(t));
    }
    await check();
    setValidating(false);
  }, [result, check]);

  return (
    <div className="container-wide max-w-3xl pb-24">
      <Seo
        title="Connect an AI assistant"
        description="Connect ChatGPT or Claude to this site's MCP server. Live health check, tool list, and setup steps."
        path="/connect"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Connect an AI assistant
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          This site runs a Model Context Protocol server. Point ChatGPT, Claude, or any MCP client at
          the endpoint below and it can browse posts, activity, and author info as tools.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Dot ok={running ? null : result ? result.ok : null} />
          MCP server URL
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground sm:text-sm">
            {MCP_URL}
          </code>
          <CopyButton value={MCP_URL} id="url" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Paste this into your assistant's connector settings. No sign-in required — every tool is
          read-only and serves public data.
        </p>
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
          Authoring server (owner only)
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground sm:text-sm">
            {MCP_ADMIN_URL}
          </code>
          <CopyButton value={MCP_ADMIN_URL} id="admin-url" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A second, OAuth-protected server that can create, update, and delete blog posts. Adding it
          opens a sign-in and consent screen; only the site owner's account is allowed through, so
          this endpoint is safe to leave public.
        </p>
      </section>


      <div className="grid gap-5 sm:gap-6">
        <HealthPanel result={result} running={running} onRun={check} />

        <Card
          title="Tools"
          icon={Wrench}
          action={
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={validating || running || !result?.tools.length}
              onClick={validateAll}
            >
              {validating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {validating ? "Validating" : "Validate all"}
            </Button>
          }
        >
          {!result?.tools.length ? (
            <p className="text-sm text-muted-foreground">
              {running ? "Discovering tools…" : "No tools discovered. Run the health check above."}
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border">
              {result.tools.map((t) => (
                <ToolRow key={t.name} tool={t} endpoint={MCP_URL} />
              ))}
            </ul>
          )}
        </Card>

        <Card title="ChatGPT" href="https://chatgpt.com/#settings/Connectors/Advanced">
          <ol className="space-y-3">
            <Step n={1}>
              Open <span className="font-mono text-[12px]">Settings → Connectors → Advanced</span> and
              enable <strong>Developer mode</strong>.
            </Step>
            <Step n={2}>
              In the composer, open the <strong>+</strong> menu and turn on <strong>Developer mode</strong>.
            </Step>
            <Step n={3}>
              Choose <strong>Add sources → Connect more</strong>, name the connector, and paste the URL.
            </Step>
            <Step n={4}>Ask it something like "list the latest blog posts from this site".</Step>
          </ol>
        </Card>

        <Card title="Claude" href="https://claude.ai/customize/connectors?modal=add-custom-connector">
          <ol className="mb-4 space-y-3">
            <Step n={1}>
              Open <span className="font-mono text-[12px]">Settings → Connectors → Add custom connector</span>.
            </Step>
            <Step n={2}>Name it, paste the URL, and save.</Step>
          </ol>
          <p className="mb-2 text-xs text-muted-foreground">
            Claude Desktop / Code — add to <span className="font-mono">claude_desktop_config.json</span>:
          </p>
          <CodeBlock code={claudeConfig} lang="json" id="claude-config" />
        </Card>

        <Card title="Terminal">
          <p className="mb-2 text-xs text-muted-foreground">Bridge the server into any stdio MCP client:</p>
          <CodeBlock code={cliCommand} lang="bash" id="cli" />
          <p className="mb-2 mt-4 text-xs text-muted-foreground">Or probe it directly:</p>
          <CodeBlock code={curlProbe} lang="bash" id="curl" />
        </Card>
      </div>
    </div>
  );
};

export default Connect;
