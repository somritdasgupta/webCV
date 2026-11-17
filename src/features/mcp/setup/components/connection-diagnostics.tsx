import { useState } from "react";
import { Check, ChevronDown, RefreshCw, X } from "lucide-react";
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
    <details className="group border-y border-border/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">Connection status</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Check that both MCP endpoints are reachable.
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-border/50 pb-5 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            The check performs a handshake and reads each server’s tool list.
          </p>
          <Button
            variant="outline"
            onClick={checkConnections}
            disabled={isChecking}
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className={isChecking ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            {isChecking ? "Checking…" : "Run check"}
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
          {results.map((result, index) => (
            <div key={connections[index].name} className="flex min-w-0 items-center justify-between gap-3 border-t border-border/50 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {connections[index].label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result.ok ? `${result.tools.length} tools · ${result.totalMs} ms` : result.steps.find((step) => !step.ok)?.detail ?? "Check failed"}
                </p>
              </div>
              <span className={result.ok ? "inline-flex shrink-0 items-center gap-1.5 text-xs text-success" : "inline-flex shrink-0 items-center gap-1.5 text-xs text-destructive"}>
                {result.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                {result.ok ? "Online" : "Unavailable"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}