/**
 * Minimal browser-side MCP (Streamable HTTP) client.
 *
 * Used by the /connect page to health-check the site's own MCP endpoint,
 * validate the handshake, and render the live tool list. Stateless: every
 * call opens a fresh session so a failed run can never wedge the UI.
 */

const PROTOCOL_VERSION = "2025-06-18";
const DEFAULT_TIMEOUT_MS = 12_000;

export interface McpToolInfo {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: { properties?: Record<string, unknown>; required?: string[] };
  annotations?: {
    readOnlyHint?: boolean;
    idempotentHint?: boolean;
    destructiveHint?: boolean;
    openWorldHint?: boolean;
  };
}

export interface McpServerInfo {
  name?: string;
  title?: string;
  version?: string;
}

export interface McpCheckStep {
  id: "reachable" | "initialize" | "tools";
  label: string;
  ok: boolean;
  detail: string;
  ms: number;
}

export interface McpCheckResult {
  ok: boolean;
  steps: McpCheckStep[];
  server?: McpServerInfo;
  instructions?: string;
  tools: McpToolInfo[];
  totalMs: number;
}

interface RpcOk<T> {
  result: T;
  sessionId: string | null;
}

const rpcBody = (method: string, params: unknown, id: number | null) => ({
  jsonrpc: "2.0" as const,
  ...(id === null ? {} : { id }),
  method,
  ...(params === undefined ? {} : { params }),
});

/** Parse either a plain JSON body or an SSE stream carrying one JSON-RPC frame. */
const parsePayload = (contentType: string, text: string): unknown => {
  if (contentType.includes("text/event-stream")) {
    const line = text
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim())
      .filter(Boolean)
      .pop();
    if (!line) throw new Error("Empty SSE response from server");
    return JSON.parse(line);
  }
  if (!text.trim()) return null;
  return JSON.parse(text);
};

async function rpc<T>(
  endpoint: string,
  method: string,
  params: unknown,
  opts: { sessionId?: string | null; notification?: boolean } = {},
): Promise<RpcOk<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Required by the MCP Streamable HTTP spec — servers 406 without it.
        Accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": PROTOCOL_VERSION,
        ...(opts.sessionId ? { "Mcp-Session-Id": opts.sessionId } : {}),
      },
      body: JSON.stringify(rpcBody(method, params, opts.notification ? null : 1)),
      signal: controller.signal,
    });

    const sessionId = res.headers.get("mcp-session-id") ?? opts.sessionId ?? null;
    const text = await res.text();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`);
    }
    if (opts.notification) return { result: undefined as T, sessionId };

    const payload = parsePayload(res.headers.get("content-type") ?? "", text) as
      | { result?: T; error?: { code: number; message: string } }
      | null;

    if (!payload) throw new Error("Server returned an empty response");
    if (payload.error) throw new Error(`${payload.error.message} (code ${payload.error.code})`);
    return { result: payload.result as T, sessionId };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(`Timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`);
    }
    throw e instanceof Error ? e : new Error(String(e));
  } finally {
    clearTimeout(timer);
  }
}

const step = (
  id: McpCheckStep["id"],
  label: string,
  ok: boolean,
  detail: string,
  started: number,
): McpCheckStep => ({ id, label, ok, detail, ms: Math.round(performance.now() - started) });

/**
 * Full health check: reachability -> initialize handshake -> tools/list.
 * Never throws; always resolves with a structured report.
 */
export async function runMcpHealthCheck(endpoint: string): Promise<McpCheckResult> {
  const t0 = performance.now();
  const steps: McpCheckStep[] = [];
  let server: McpServerInfo | undefined;
  let instructions: string | undefined;
  let tools: McpToolInfo[] = [];
  let sessionId: string | null = null;

  // 1 + 2: initialize doubles as the reachability probe.
  const tInit = performance.now();
  try {
    const { result, sessionId: sid } = await rpc<{
      protocolVersion?: string;
      serverInfo?: McpServerInfo;
      instructions?: string;
    }>(endpoint, "initialize", {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "webcv-connect-page", version: "1.0.0" },
    });
    sessionId = sid;
    server = result?.serverInfo;
    instructions = result?.instructions;
    steps.push(step("reachable", "Endpoint reachable", true, "HTTP 200", tInit));
    steps.push(
      step(
        "initialize",
        "Handshake",
        true,
        `${server?.title ?? server?.name ?? "server"} v${server?.version ?? "?"} · protocol ${result?.protocolVersion ?? PROTOCOL_VERSION}`,
        tInit,
      ),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const network = /Failed to fetch|NetworkError|timed out/i.test(msg);
    steps.push(step("reachable", "Endpoint reachable", !network, network ? msg : "HTTP reached", tInit));
    steps.push(step("initialize", "Handshake", false, msg, tInit));
    return { ok: false, steps, tools, totalMs: Math.round(performance.now() - t0) };
  }

  // Notify the server the handshake completed (ignore transport-level noise).
  try {
    await rpc(endpoint, "notifications/initialized", {}, { sessionId, notification: true });
  } catch {
    /* optional per spec */
  }

  // 3: tool discovery.
  const tTools = performance.now();
  try {
    const { result } = await rpc<{ tools?: McpToolInfo[] }>(endpoint, "tools/list", {}, { sessionId });
    tools = result?.tools ?? [];
    steps.push(
      step("tools", "Tool discovery", tools.length > 0, `${tools.length} tool${tools.length === 1 ? "" : "s"} advertised`, tTools),
    );
  } catch (e) {
    steps.push(step("tools", "Tool discovery", false, e instanceof Error ? e.message : String(e), tTools));
  }

  return {
    ok: steps.every((s) => s.ok),
    steps,
    server,
    instructions,
    tools,
    totalMs: Math.round(performance.now() - t0),
  };
}

export interface McpToolRunResult {
  ok: boolean;
  ms: number;
  text: string;
}

/** Invoke a single tool with empty/default arguments — used by "Validate". */
export async function runMcpTool(
  endpoint: string,
  name: string,
  args: Record<string, unknown> = {},
): Promise<McpToolRunResult> {
  const t0 = performance.now();
  try {
    const { sessionId } = await rpc<unknown>(endpoint, "initialize", {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "webcv-connect-page", version: "1.0.0" },
    });
    const { result } = await rpc<{
      isError?: boolean;
      content?: Array<{ type: string; text?: string }>;
    }>(endpoint, "tools/call", { name, arguments: args }, { sessionId });

    const text =
      result?.content
        ?.map((c) => (c.type === "text" ? c.text ?? "" : `[${c.type}]`))
        .join("\n")
        .trim() ?? "";
    return {
      ok: !result?.isError,
      ms: Math.round(performance.now() - t0),
      text: text || "(empty response)",
    };
  } catch (e) {
    return {
      ok: false,
      ms: Math.round(performance.now() - t0),
      text: e instanceof Error ? e.message : String(e),
    };
  }
}
