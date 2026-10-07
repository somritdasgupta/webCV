import { useState } from "react";
import { ArrowUpRight, Code2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONNECTIONS,
  connectionConfig,
  cursorInstallUrl,
  vscodeInstallUrl,
  type ConnectionMode,
} from "../services/install-config";

const CLIENTS = ["Claude", "ChatGPT", "Cursor", "VS Code"] as const;
type Client = (typeof CLIENTS)[number];

export default function InstallOptions({
  mode,
}: {
  mode: ConnectionMode;
}) {
  const [client, setClient] = useState<Client>("Claude");

  const connection = CONNECTIONS[mode];
  const isDirectInstall = client === "Cursor" || client === "VS Code";

  const download = () => {
    const blob = new Blob([connectionConfig(mode)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = connection.name + ".json";
    anchor.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="min-w-0">
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="group"
        aria-label="Choose an assistant"
      >
        {CLIENTS.map((item) => (
          <Button
            key={item}
            variant={item === client ? "secondary" : "outline"}
            aria-pressed={item === client}
            onClick={() => setClient(item)}
            className="h-12 rounded-lg"
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="mt-8 flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-xl font-semibold text-foreground">
            {isDirectInstall
              ? "Install in " + client
              : "Connect with " + client}
          </h2>

          {client === "Claude" && (
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>
                1. Open Settings → Connectors → Add custom connector.
              </li>

              <li>
                2. Paste the server address and add the connection.
              </li>
            </ol>
          )}

          {client === "ChatGPT" && (
            <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>
                1. In Settings → Apps → Advanced settings, enable Developer
                mode.
              </li>

              <li>
                2. Create an app with the server address. Select No
                authentication.
              </li>
            </ol>
          )}

          {isDirectInstall && (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Review and confirm the server in {client}.
            </p>
          )}

          {!isDirectInstall && (
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              {client} requires adding custom servers in Settings. Availability
              depends on your plan and workspace permissions.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {isDirectInstall ? (
            <Button asChild className="gap-2 rounded-lg">
              <a
                href={
                  client === "Cursor"
                    ? cursorInstallUrl(mode)
                    : vscodeInstallUrl(mode)
                }
              >
                <Download className="h-4 w-4" />
                Install in {client}
              </a>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="gap-2 rounded-lg"
            >
              <a
                href={
                  client === "Claude"
                    ? "https://claude.ai/settings/connectors"
                    : "https://chatgpt.com/#settings/Connectors"
                }
                target="_blank"
                rel="noreferrer"
              >
                Open {client}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-7 flex min-w-0 items-center gap-3 border-y border-border py-4">
        <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />

        <code className="min-w-0 flex-1 break-all text-xs leading-6 text-muted-foreground">
          {connection.url}
        </code>

        <Button
          size="icon"
          variant="ghost"
          onClick={download}
          aria-label="Download server configuration"
          title="Download server configuration"
          className="shrink-0"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}