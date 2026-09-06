import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authorizedGitHub, createAuthorization, pollAuthorization } from "@/lib/mcp-admin/github-device-auth";

const githubAuthorization = {
  device_code: "private-device-credential-1234567890",
  user_code: "ABCD-EFGH",
  verification_uri: "https://github.com/login/device",
  expires_in: 900,
  interval: 5,
};

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe("GitHub device authorization", () => {
  beforeEach(() => {
    process.env.MCP_AUTH_ENCRYPTION_KEY = "test-key-with-enough-entropy";
  });

  afterEach(() => vi.restoreAllMocks());

  it("caps the approval window at three minutes and hides the device credential", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(githubAuthorization)));
    const result = await createAuthorization();
    expect(result.userCode).toBe("ABCD-EFGH");
    expect(result.expiresIn).toBe(180);
    expect(result.pollUntil).toBeTypeOf("string");
    expect(result.authorizationRequest).not.toContain(githubAuthorization.device_code);
  });

  it("reports pending without erroring while approval is outstanding", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(jsonResponse(githubAuthorization))
      .mockResolvedValue(jsonResponse({ error: "authorization_pending" })));
    const request = await createAuthorization();
    const status = await pollAuthorization(request.authorizationRequest, 0);
    expect(status.status).toBe("pending");
    expect(status.ownerSession).toBeNull();
    expect(status.timeRemaining).toBeGreaterThan(0);
  });

  it("returns an owner session as soon as GitHub reports approval", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(jsonResponse(githubAuthorization))
      .mockResolvedValueOnce(jsonResponse({ access_token: "github-token" }))
      .mockResolvedValueOnce(jsonResponse({ login: "somritdasgupta" })));
    const request = await createAuthorization();
    const status = await pollAuthorization(request.authorizationRequest);
    expect(status.status).toBe("approved");
    await expect(authorizedGitHub(status.ownerSession ?? "")).resolves.toEqual({ token: "github-token", login: "somritdasgupta" });
  });

  it("denies a non-owner GitHub account", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(jsonResponse(githubAuthorization))
      .mockResolvedValueOnce(jsonResponse({ access_token: "github-token" }))
      .mockResolvedValueOnce(jsonResponse({ login: "someone-else" })));
    const request = await createAuthorization();
    const status = await pollAuthorization(request.authorizationRequest);
    expect(status.status).toBe("denied");
    expect(status.ownerSession).toBeNull();
  });

  it("rejects the visible user code", async () => {
    await expect(pollAuthorization("ABCD-EFGH")).rejects.toThrow("Invalid or expired authorization handle");
  });
});
