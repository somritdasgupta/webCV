type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

export function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  const value = runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
  return value?.trim() || undefined;
}

export function authEncryptionKey(): string {
  const key = runtimeEnv("MCP_AUTH_ENCRYPTION_KEY");
  if (!key) throw new Error("MCP authoring authentication is not configured.");
  return key;
}
