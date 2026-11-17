import { useState } from "react";
import { ArrowUpRight, Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  CONNECTIONS,
  connectionConfig,
  cursorInstallUrl,
  vscodeInstallUrl,
  type ConnectionMode,
} from "../services/install-config";

const CLIENTS = ["Claude", "ChatGPT", "Cursor", "VS Code"] as const;
type Client = (typeof CLIENTS)[number];

const MANUAL_STEPS: Record<"Claude" | "ChatGPT", string[]> = {
  Claude: ["Open Settings → Connectors → Add custom connector.", "Paste the server address below and add the connection."],
  ChatGPT: ["Enable Developer mode under Settings → Apps → Advanced settings.", "Create an app with the server address below and choose No authentication."],
};

export default function InstallOptions({ mode }: { mode: ConnectionMode }) {
  const [client, setClient] = useState<Client>("Claude");
  const connection = CONNECTIONS[mode];
  const isDirectInstall = client === "Cursor" || client === "VS Code";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(connection.url);
      toast.success("Server address copied.");
    } catch (error) {
      console.error("MCP address copy failed", error);
      toast.error("Could not copy the address. Select and copy it below.");
    }
  };

  const downloadConfig = () => {
    try {
      const file = new Blob([connectionConfig(mode)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${connection.name}.json`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Configuration downloaded.");
    } catch (error) {
      console.error("MCP configuration download failed", error);
      toast.error("Could not download the configuration. Copy the address instead.");
    }
  };

  const installUrl = client === "Cursor" ? cursorInstallUrl(mode) : vscodeInstallUrl(mode);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[11px] uppercase text-muted-foreground">1 / Choose your app</p>
        <h2 className="text-xl font-medium text-foreground">Where do you use an assistant?</h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose an assistant">
        {CLIENTS.map((item) => (
          <Button
            key={item}
            variant={item === client ? "secondary" : "outline"}
            aria-pressed={item === client}
            onClick={() => setClient(item)}
            className="h-11 min-w-0 justify-between px-3 sm:justify-center sm:px-4"
          >
            <span className="truncate">{item}</span>
            {item === client && <Check className="h-4 w-4 shrink-0" />}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 gap-6 border-t border-border/60 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase text-muted-foreground">2 / Connect</p>
          <h3 className="mt-2 text-lg font-medium text-foreground">
            {isDirectInstall ? `Add to ${client}` : `Set up ${client}`}
          </h3>
          {isDirectInstall ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Open the install link, then review and confirm the connection in {client}.
            </p>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {MANUAL_STEPS[client].map((instruction, index) => (
                <li key={instruction} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="font-mono text-xs text-foreground">0{index + 1}</span>
                  <span className="min-w-0">{instruction}</span>
                </li>
              ))}
            </ol>
          )}
          {!isDirectInstall && (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Custom server access depends on your plan and workspace settings.
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:pt-5">
          {isDirectInstall ? (
            <Button asChild className="w-full gap-2 sm:w-auto">
              <a href={installUrl} onClick={() => toast.info(`Opening ${client} to review the connection.`)}>
                <Download className="h-4 w-4" />
                Install in {client}
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full gap-2 sm:w-auto">
              <a
                href={client === "Claude" ? "https://claude.ai/settings/connectors" : "https://chatgpt.com/#settings/Connectors"}
                target="_blank"
                rel="noreferrer"
                onClick={() => toast.info(`Opening ${client} settings.`)}
              >
                Open {client} settings
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 min-w-0 border-t border-border/60 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 break-all rounded-md bg-muted/70 px-3 py-2.5 font-mono text-xs leading-5 text-muted-foreground">
            {connection.url}
          </code>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" onClick={copyAddress} className="gap-2 px-3">
              <Copy className="h-4 w-4" /> Copy address
            </Button>
            <Button variant="ghost" onClick={downloadConfig} className="gap-2 px-3">
              <Download className="h-4 w-4" /> Config file
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}