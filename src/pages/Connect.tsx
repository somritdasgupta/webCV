import { useState } from "react";
import {
  Check,
  ChevronDown,
  Plug,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMcpHealthCheck, type McpCheckResult } from "@/lib/mcpClient";
import { InstallOptions } from "@/features/mcp-setup/components/install-options";
import {
  CONNECTIONS,
  type ConnectionMode,
} from "@/features/mcp-setup/services/install-config";

export default function Connect() {
  const [mode, setMode] = useState<ConnectionMode>("reader");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<McpCheckResult[]>([]);

  const connections = Object.values(CONNECTIONS);

  const check = async () => {
    setIsChecking(true);

    try {
      const healthChecks = await Promise.all(
        connections.map((item) => runMcpHealthCheck(item.url)),
      );

      setResults(healthChecks);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-16">
        <Seo
          title="MCP connections"
          description="Connect Claude, ChatGPT, Cursor or VS Code to Somrit Dasgupta’s site and owner-approved publishing tools."
          path="/mcp"
        />

        <header className="border-b border-border/40 pb-10 pt-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Plug className="h-4 w-4" />

            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em]">
              MCP connections
            </span>
          </div>

          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Somrit’s site, in your assistant.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Connect Claude, ChatGPT, Cursor, or VS Code to read public
              content or access owner-approved publishing tools.
            </p>
          </div>
        </header>

        <section
          className="space-y-8"
          aria-label="Connect an assistant"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Connection mode
              </p>

              <Tabs
                value={mode}
                onValueChange={(value) => {
                  setMode(
                    value === "admin" ? "admin" : "reader",
                  );
                }}
                className="mt-4"
              >
                <TabsList className="grid h-11 w-full max-w-sm grid-cols-2 rounded-xl bg-muted/60 p-1">
                  <TabsTrigger
                    value="reader"
                    className="rounded-lg px-5 text-sm font-medium"
                  >
                    For readers
                  </TabsTrigger>

                  <TabsTrigger
                    value="admin"
                    className="rounded-lg px-5 text-sm font-medium"
                  >
                    For the owner
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="max-w-xl rounded-xl border border-border/40 bg-secondary/30 px-4 py-3">
              <div className="flex items-start gap-3">
                {mode === "admin" ? (
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                )}

                <p className="text-sm leading-6 text-muted-foreground">
                  {mode === "admin"
                    ? "Posts, drafts and resume links. Changes require owner approval."
                    : "Public posts, repositories and activity. No sign-in required."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm sm:p-6 lg:p-8">
            <InstallOptions
              key={mode}
              mode={mode}
            />
          </div>
        </section>

        {mode === "admin" && (
          <section
            className="border-y border-border/40 py-10"
            aria-labelledby="approval-heading"
          >
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Publishing flow
              </p>

              <h2
                id="approval-heading"
                className="mt-3 text-lg font-semibold text-foreground"
              >
                Before a change is published
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Publishing is intentionally gated so changes are reviewed and
                approved before they go live.
              </p>
            </div>

            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              <li className="space-y-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
                  01 / REVIEW
                </span>

                <h3 className="text-sm font-semibold text-foreground">
                  Review the draft
                </h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  Ask for a draft and review its preview before approving
                  anything.
                </p>
              </li>

              <li className="space-y-3 md:border-l md:border-border/40 md:pl-8">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
                  02 / APPROVE
                </span>

                <h3 className="text-sm font-semibold text-foreground">
                  Approve the request
                </h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  Enter the assistant’s code at{" "}
                  <a
                    href="https://github.com/login/device"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    GitHub
                  </a>
                  .
                </p>
              </li>

              <li className="space-y-3 md:border-l md:border-border/40 md:pl-8">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
                  03 / CONFIRM
                </span>

                <h3 className="text-sm font-semibold text-foreground">
                  Confirm the change
                </h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  The assistant checks approval and confirms the saved change.
                </p>
              </li>
            </ol>

            <p className="mt-8 border-t border-border/40 pt-5 font-mono text-[11px] leading-5 text-muted-foreground/80">
              Approval lasts one hour. Never share an authorization or session
              token.
            </p>
          </section>
        )}

        <section aria-labelledby="diagnostics-heading">
          <details className="group overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
            <summary className="cursor-pointer list-none select-none">
              <div className="flex items-center justify-between gap-6 px-5 py-5 sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/80 font-mono text-sm font-bold text-foreground">
                    {">_"}
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="diagnostics-heading"
                      className="text-sm font-semibold text-foreground sm:text-base"
                    >
                      Diagnostic health checks
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                      Verify tool availability and server connectivity.
                    </p>
                  </div>
                </div>

                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </div>
            </summary>

            <div className="border-t border-border/40 px-5 py-6 sm:px-6 lg:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Connection status
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    Run a live check against both MCP servers.
                  </p>
                </div>

                <Button
                  variant="outline"
                  disabled={isChecking}
                  onClick={check}
                  className="h-9 shrink-0 gap-2 rounded-lg px-4 text-sm font-medium"
                >
                  <RefreshCw
                    className={
                      isChecking
                        ? "h-4 w-4 animate-spin"
                        : "h-4 w-4"
                    }
                  />

                  {isChecking ? "Checking..." : "Check connections"}
                </Button>
              </div>

              <div
                aria-live="polite"
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                {results.length === 0 && !isChecking && (
                  <div className="col-span-full rounded-xl border border-dashed border-border/40 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No diagnostics run yet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Run a connection check to see the current server status.
                    </p>
                  </div>
                )}

                {results.map((result, index) => {
                  const connection = connections[index];

                  return (
                    <div
                      key={connection.name}
                      className="rounded-xl border border-border/40 bg-background/50 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {connection.label}
                          </p>

                          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            MCP server
                          </p>
                        </div>

                        <span
                          className={
                            result.ok
                              ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500"
                              : "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
                          }
                        >
                          <span
                            className={
                              result.ok
                                ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                : "h-1.5 w-1.5 rounded-full bg-destructive"
                            }
                          />

                          {result.ok ? "Online" : "Failed"}
                        </span>
                      </div>

                      <div className="mt-5 border-t border-border/30 pt-4">
                        {result.ok ? (
                          <p className="font-mono text-xs text-muted-foreground">
                            {result.tools.length} tools available
                          </p>
                        ) : (
                          <p className="rounded-lg border border-destructive/10 bg-destructive/5 p-3 font-mono text-xs leading-5 text-muted-foreground">
                            {result.steps.find(
                              (item) => !item.ok,
                            )?.detail || "Unknown error"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
