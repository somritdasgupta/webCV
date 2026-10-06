import { SITE } from "@/site.config";

export type ConnectionMode = "reader" | "admin";
export const CONNECTIONS = {
  reader: { name: "somrit-webcv", label: "Read the site", url: `${SITE.BASE_URL}/mcp/read` },
  admin: { name: "somrit-webcv-admin", label: "Manage the site", url: `${SITE.BASE_URL}/mcp/admin` },
} as const;

export function cursorInstallUrl(mode: ConnectionMode): string {
  const { name, url } = CONNECTIONS[mode];
  const config = btoa(JSON.stringify({ url }));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encodeURIComponent(config)}`;
}

export function vscodeInstallUrl(mode: ConnectionMode): string {
  const { name, url } = CONNECTIONS[mode];
  return `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name, type: "http", url }))}`;
}

export function connectionConfig(mode: ConnectionMode): string {
  const { name, url } = CONNECTIONS[mode];
  return JSON.stringify({ mcpServers: { [name]: { url } } }, null, 2);
}