import { useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  runMcpHealthCheck,
  type McpCheckResult,
} from "@/features/mcp/client/client";
import { CONNECTIONS } from "../services/install-config";

const connections = Object.values(CONNECTIONS);

export default function ConnectionDiagnostics() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<McpCheckResult[]>([]);

  const checkConnections = async () => {
    setIsChecking(true);
    try {
      setResults(await Promise.all(connections.map(({ url }) => runMcpHealthCheck(url))));
    } catch (error) {
      console.error("MCP connection check failed", error);
      toast.error("Could not complete the connection check. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section aria-labelledby="connection-status-heading" className="border-y border-border/60 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="connection-status-heading" className="text-sm font-medium text-foreground">
            Connection status
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Check server access and available tools.</p>
        </div>
        <Button variant="outline" onClick={checkConnections} disabled={isChecking} className="w-full gap-2 sm:w-auto">
          <RefreshCw className={isChecking ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {isChecking ? "Checking…" : "Run check"}
        </Button>
      </div>

      <div className="mt-4 grid gap-0 sm:grid-cols-2 sm:gap-5" aria-live="polite">
        {connections.map((connection, index) => {
          const result = results[index];
          const failedStep = result?.steps.find((step) => !step.ok);
          const status = isChecking ? "Checking" : !result ? "Not checked" : result.ok ? "Online" : /timed out/i.test(failedStep?.detail ?? "") ? "Timed out" : "Unavailable";
          const isCrossOriginPreview = new URL(connection.url).origin !== window.location.origin;
          const detail = result?.ok
            ? `${result.tools.length} tools · ${result.totalMs} ms`
            : failedStep?.detail === "Failed to fetch" && isCrossOriginPreview
              ? "This preview cannot check the production server. Open the published guide to test it."
              : failedStep?.detail ?? (result ? "No details were returned." : "Run a check to test this server.");

          return (
            <div key={connection.name} className="flex min-w-0 items-start justify-between gap-3 border-t border-border/50 py-3 sm:first:border-t-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{connection.label}</p>
                <p className="mt-1 break-words text-xs leading-5 text-muted-foreground" role={result && !result.ok ? "status" : undefined}>
                  {detail}
                </p>
              </div>
              <span className={result?.ok ? "inline-flex shrink-0 items-center gap-1.5 text-xs text-success" : result && !isChecking ? "inline-flex shrink-0 items-center gap-1.5 text-xs text-destructive" : "inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"}>
                {result?.ok ? <Check className="h-3.5 w-3.5" /> : result && !isChecking ? <X className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}