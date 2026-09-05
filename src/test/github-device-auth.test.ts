import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authorizedGitHub, completeAuthorization, createAuthorization } from "@/lib/mcp-admin/github-device-auth";

const githubAuthorization = {
  device_code: "private-device-credential-1234567890",
  user_code: "ABCD-EFGH",
  verification_uri: "https://github.com/login/device",
  expires_in: 900,
  interval: 5,
};

describe("GitHub device authorization", () => {
  beforeEach(() => {
    process.env.MCP_AUTH_ENCRYPTION_KEY = "test-key-with-enough-entropy";
  });

  afterEach(() => vi.restoreAllMocks());

  it("keeps the private device credential inside an opaque request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(githubAuthorization), { status: 200 })));
    const result = await createAuthorization();
    expect(result.userCode).toBe("ABCD-EFGH");
    expect(result.authorizationRequest).not.toContain(githubAuthorization.device_code);
  });

  it("reuses the same request while GitHub approval is pending", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(githubAuthorization), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "authorization_pending" }), { status: 200 })));
    const request = await createAuthorization();
    await expect(completeAuthorization(request.authorizationRequest)).resolves.toBeNull();
  });

  it("creates an owner session after approval", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(githubAuthorization), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "github-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ login: "somritdasgupta" }), { status: 200 })));
    const request = await createAuthorization();
    const session = await completeAuthorization(request.authorizationRequest);
    expect(session).toBeTypeOf("string");
    await expect(authorizedGitHub(session ?? "")).resolves.toEqual({ token: "github-token", login: "somritdasgupta" });
  });

  it("rejects the visible user code", async () => {
    await expect(completeAuthorization("ABCD-EFGH")).rejects.toThrow("Invalid or expired authorization handle");
  });
});