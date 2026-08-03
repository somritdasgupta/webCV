import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  RefreshCw,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { SITE } from "@/site.config";
import { cn } from "@/lib/utils";
import {
  runMcpHealthCheck,
  runMcpTool,
  type McpCheckResult,
  type McpToolInfo,
  type McpToolRunResult,
} from "@/lib/mcpClient";

/**
 * Endpoints are advertised on the site's own origin (`/mcp`, `/mcp/admin`) and
 * reverse-proxied to the edge functions by vercel.json. Clients never see the
 * backend host, and the URL survives any future move of the runtime.
 *
 * The direct function URL stays as a health-check fallback: preview builds run
 * on a host without those rewrites, so probing the pretty URL there would show
 * a false outage.
 */
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const DIRECT_URL = `https://${projectRef}.supabase.co/functions/v1/mcp`;
const READ_URL = `${SITE.BASE_URL}/mcp`;
const WRITE_URL = `${SITE.BASE_URL}/mcp/admin`;

/* ---------------------------------------------------------------- primitives */

const CopyButton = ({ value, id }: { value: string; id: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      aria-label={copied ? "Copied" : "Copy"}
      data-id={id}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const CodeBlock = ({ code, lang, id }: { code: string; lang?: string; id: string }) => (
  <div className="not-prose relative overflow-hidden rounded-xl border border-border bg-[#0d1117]">
    <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        {lang ?? "text"}
      </span>
      <div className="[&_button]:h-7 [&_button]:w-7 [&_button]:border-white/15 [&_button]:bg-white/5 [&_button]:text-white/60 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
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

const Section = ({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="mt-12 first:mt-0">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
        {hint && <p className="mt-1.5 text-sm text-muted-foreground/80">{hint}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

/* ------------------------------------------------------------------ endpoint */

const Endpoint = ({
  label,
  url,
  note,
  id,
}: {
  label: string;
  url: string;
  note: string;
  id: string;
}) => (
  <div className="rounded-xl border border-border bg-card/50 p-4">
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {id === "read" ? "public" : "oauth"}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground">
        {url}
      </code>
      <CopyButton value={url} id={id} />
    </div>
    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{note}</p>
  </div>
);

/* -------------------------------------------------------------------- status */

const StatusStrip = ({
  result,
  running,
  onRun,
}: {
  result: McpCheckResult | null;
  running: boolean;
  onRun: () => void;
}) => {
  const state = running ? "checking" : result ? (result.ok ? "ok" : "down") : "idle";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card/50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            state === "ok" && "bg-emerald-500",
            state === "down" && "bg-red-500",
            (state === "idle" || state === "checking") && "animate-pulse bg-muted-foreground/60",
          )}
        />
        {state === "ok" ? "Operational" : state === "down" ? "Degraded" : "Checking…"}
      </span>
      {result && (
        <>
          <span className="font-mono text-[11px] text-muted-foreground">
            {result.server?.version ? `v${result.server.version}` : "—"} · {result.tools.length} tools ·{" "}
            {result.totalMs}ms
          </span>
          <div className="hidden items-center gap-3 sm:flex">
            {result.steps.map((s) => (
              <span
                key={s.id}
                className={cn(
                  "font-mono text-[11px]",
                  s.ok ? "text-muted-foreground" : "text-red-500",
                )}
                title={s.detail}
              >
                {s.ok ? "✓" : "✕"} {s.label.toLowerCase()}
              </span>
            ))}
          </div>
        </>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={onRun}
        disabled={running}
        className="ml-auto h-7 gap-1.5 px-2 text-xs"
      >
        {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        Re-check
      </Button>
      {result && !result.ok && (
        <p className="w-full font-mono text-[11px] text-red-500">
          {result.steps.find((s) => !s.ok)?.detail}
        </p>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------- tools */

const argsFor = (t: McpToolInfo): Record<string, unknown> => {
  const required = t.inputSchema?.required ?? [];
  const out: Record<string, unknown> = {};
  for (const key of required) out[key] = key === "slug" ? "hello-world" : "";
  return out;
};

const ToolRow = ({ tool, endpoint }: { tool: McpToolInfo; endpoint: string }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<McpToolRunResult | null>(null);
  const params = Object.keys(tool.inputSchema?.properties ?? {});

  return (
    <li className="border-b border-border/60 last:border-0">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          <code className="truncate font-mono text-[13px] text-foreground">{tool.name}</code>
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            {tool.title}
          </span>
        </button>
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

/* --------------------------------------------------------------------- setup */

const CLIENTS = ["Claude", "ChatGPT", "Terminal"] as const;
type Client = (typeof CLIENTS)[number];

const claudeConfig = JSON.stringify(
  {
    mcpServers: {
      somritdasgupta: { type: "http", url: READ_URL },
      "somritdasgupta-admin": { type: "http", url: WRITE_URL },
    },
  },
  null,
  2,
);

const cliCommand = `npx -y mcp-remote ${READ_URL}`;

const curlProbe = `curl -sS -X POST ${READ_URL} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

const SetupBody = ({ client }: { client: Client }) => {
  if (client === "Claude")
    return (
      <div className="space-y-4">
        <ol className="space-y-2 text-sm text-foreground/90">
          <li>
            1. Settings → Connectors →{" "}
            <a
              className="underline underline-offset-4"
              href="https://claude.ai/customize/connectors?modal=add-custom-connector"
              target="_blank"
              rel="noreferrer"
            >
              Add custom connector
            </a>
            .
          </li>
          <li>2. Paste the endpoint, save, and approve the sign-in if you added the authoring one.</li>
        </ol>
        <CodeBlock code={claudeConfig} lang="claude_desktop_config.json" id="claude" />
      </div>
    );

  if (client === "ChatGPT")
    return (
      <ol className="space-y-2 text-sm text-foreground/90">
        <li>
          1. Settings → Connectors → Advanced → enable <strong>Developer mode</strong>.
        </li>
        <li>2. In the composer, open + → Developer mode.</li>
        <li>3. Add sources → Connect more → name it and paste the endpoint.</li>
        <li>4. Ask: “list the latest blog posts from this site”.</li>
      </ol>
    );

  return (
    <div className="space-y-4">
      <CodeBlock code={cliCommand} lang="bash" id="cli" />
      <CodeBlock code={curlProbe} lang="bash" id="curl" />
    </div>
  );
};

/* ---------------------------------------------------------------------- page */

const Connect = () => {
  const [result, setResult] = useState<McpCheckResult | null>(null);
  const [running, setRunning] = useState(false);
  const [probe, setProbe] = useState(READ_URL);
  const [client, setClient] = useState<Client>("Claude");

  const check = useCallback(async () => {
    setRunning(true);
    let res = await runMcpHealthCheck(READ_URL);
    let endpoint = READ_URL;
    // Preview hosts have no /mcp rewrite — fall back to the runtime URL so the
    // page reports the server's real state rather than a routing artefact.
    if (!res.ok) {
      const direct = await runMcpHealthCheck(DIRECT_URL);
      if (direct.ok) {
        res = direct;
        endpoint = DIRECT_URL;
      }
    }
    setProbe(endpoint);
    setResult(res);
    setRunning(false);
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return (
    <div className="container-wide max-w-3xl pb-24">
      <Seo
        title="Connect an AI assistant"
        description="Connect ChatGPT, Claude, or any MCP client to this site. Live status, tool list, and setup steps."
        path="/connect"
      />

      <header className="mb-10 max-w-2xl">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Model Context Protocol
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Connect an AI assistant
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          This site exposes itself as tools. Point any MCP client at the endpoint and it can read
          posts, activity, and author info — or, with a sign-in, write to the blog.
        </p>
      </header>

      <Section title="Endpoints">
        <div className="grid gap-3 sm:grid-cols-2">
          <Endpoint
            id="read"
            label="Read"
            url={READ_URL}
            note="Open to everyone. Read-only tools over public data — no sign-in."
          />
          <Endpoint
            id="write"
            label="Author"
            url={WRITE_URL}
            note="Create, update, and delete posts. Opens a sign-in and consent screen; only the owner's account passes."
          />
        </div>
      </Section>

      <Section title="Status">
        <StatusStrip result={result} running={running} onRun={check} />
      </Section>

      <Section
        title="Tools"
        hint={result?.instructions}
        action={
          <span className="font-mono text-[11px] text-muted-foreground">
            {result?.tools.length ?? 0} advertised
          </span>
        }
      >
        {!result?.tools.length ? (
          <p className="rounded-xl border border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
            {running ? "Discovering tools…" : "No tools discovered."}
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card/50">
            {result.tools.map((t) => (
              <ToolRow key={t.name} tool={t} endpoint={probe} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Setup"
        action={
          <div className="flex rounded-lg border border-border p-0.5">
            {CLIENTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClient(c)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs transition-colors",
                  client === c
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        }
      >
        <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-5">
          <SetupBody client={client} />
        </div>
      </Section>

      <p className="mt-10 text-xs text-muted-foreground">
        Built on the{" "}
        <a
          className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noreferrer"
        >
          Model Context Protocol <ExternalLink className="h-3 w-3" />
        </a>
        .
      </p>
    </div>
  );
};

export default Connect;
