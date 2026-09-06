import { authEncryptionKey } from "./env";

const GITHUB_CLIENT_ID = "Ov23li98oVkx9PDOvktP";
const ADMIN_LOGIN = "somritdasgupta";
const SESSION_TTL_MS = 60 * 60 * 1000;

/** Approval window advertised to the assistant, in seconds. */
export const APPROVAL_WINDOW_SECONDS = 180;
/** Longest a single status call blocks while long-polling GitHub, in ms. */
const MAX_LONG_POLL_MS = 20_000;

export interface DeviceAuthorization {
  authorizationRequest: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  pollUntil: string;
  interval: number;
}

export type AuthorizationState = "pending" | "approved" | "denied" | "expired";

export interface AuthorizationStatus {
  status: AuthorizationState;
  ownerSession: string | null;
  timeRemaining: number;
  detail: string;
}

interface GitHubUser { login: string }
interface AuthorizationPayload { purpose: "github-device"; deviceCode: string; expiresAt: number; interval: number }
interface SessionPayload { purpose: "owner-session"; token: string; login: string; expiresAt: number }

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function encryptionKey(): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(authEncryptionKey()));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function seal(payload: AuthorizationPayload | SessionPayload): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    encoder.encode(JSON.stringify(payload)),
  );
  return `${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`;
}

async function unseal<T extends AuthorizationPayload | SessionPayload>(handle: string): Promise<T> {
  const [ivValue, ciphertextValue] = handle.split(".");
  if (!ivValue || !ciphertextValue) throw new Error("Invalid or expired authorization handle. Run authenticate_for_blog_posting again.");
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64UrlToBytes(ivValue) as Uint8Array<ArrayBuffer> },
      await encryptionKey(),
      base64UrlToBytes(ciphertextValue) as Uint8Array<ArrayBuffer>,
    );
    return JSON.parse(decoder.decode(plaintext)) as T;
  } catch {
    throw new Error("Invalid or expired authorization handle. Run authenticate_for_blog_posting again.");
  }
}

export async function createAuthorization(): Promise<DeviceAuthorization> {
  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, scope: "repo" }),
  });
  if (!response.ok) throw new Error(`GitHub authorization failed (${response.status}).`);
  const data = (await response.json()) as Record<string, unknown>;
  const deviceCode = String(data.device_code ?? "");
  if (!deviceCode) throw new Error("GitHub did not return an authorization request.");

  const interval = Math.max(Number(data.interval ?? 5), 2);
  const expiresIn = Math.min(Number(data.expires_in ?? APPROVAL_WINDOW_SECONDS), APPROVAL_WINDOW_SECONDS);
  const expiresAt = Date.now() + expiresIn * 1000;

  return {
    authorizationRequest: await seal({ purpose: "github-device", deviceCode, expiresAt, interval }),
    userCode: String(data.user_code ?? ""),
    verificationUri: String(data.verification_uri ?? "https://github.com/login/device"),
    expiresIn,
    pollUntil: new Date(expiresAt).toISOString(),
    interval,
  };
}

type ExchangeResult =
  | { state: "approved"; token: string }
  | { state: "pending" }
  | { state: "denied"; detail: string }
  | { state: "expired"; detail: string };

async function exchangeDeviceCode(deviceCode: string): Promise<ExchangeResult> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }),
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (data.access_token) return { state: "approved", token: String(data.access_token) };

  const error = String(data.error ?? "authorization_pending");
  const detail = String(data.error_description ?? error);
  if (error === "authorization_pending" || error === "slow_down") return { state: "pending" };
  if (error === "expired_token") return { state: "expired", detail: "The approval window closed before GitHub confirmed it." };
  return { state: "denied", detail };
}

async function githubUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`GitHub identity check failed (${response.status}).`);
  return response.json() as Promise<GitHubUser>;
}

const secondsLeft = (expiresAt: number) => Math.max(0, Math.round((expiresAt - Date.now()) / 1000));

/**
 * Long-poll GitHub for approval.
 *
 * The call blocks for up to MAX_LONG_POLL_MS so an assistant normally needs a
 * single follow-up call: approval is picked up as soon as GitHub reports it,
 * without the user ever confirming manually.
 */
export async function pollAuthorization(authorizationRequest: string, maxWaitMs = MAX_LONG_POLL_MS): Promise<AuthorizationStatus> {
  const request = await unseal<AuthorizationPayload>(authorizationRequest);
  if (request.purpose !== "github-device" || !request.deviceCode) {
    throw new Error("Invalid authorization request. Call authenticate_for_blog_posting once and reuse its authorization_request.");
  }

  const deadline = Math.min(Date.now() + maxWaitMs, request.expiresAt);
  const intervalMs = Math.max(request.interval, 2) * 1000;

  for (;;) {
    if (Date.now() >= request.expiresAt) {
      return { status: "expired", ownerSession: null, timeRemaining: 0, detail: "The approval window closed. Start authentication once more." };
    }

    const result = await exchangeDeviceCode(request.deviceCode);
    if (result.state === "approved") {
      const user = await githubUser(result.token);
      if (user.login.toLowerCase() !== ADMIN_LOGIN) {
        return { status: "denied", ownerSession: null, timeRemaining: 0, detail: `Signed in as ${user.login}. Only ${ADMIN_LOGIN} can author posts.` };
      }
      const ownerSession = await seal({ purpose: "owner-session", token: result.token, login: user.login, expiresAt: Date.now() + SESSION_TTL_MS });
      return { status: "approved", ownerSession, timeRemaining: 0, detail: "Owner verified. Resume the pending authoring request now." };
    }
    if (result.state === "denied" || result.state === "expired") {
      return { status: result.state, ownerSession: null, timeRemaining: secondsLeft(request.expiresAt), detail: result.detail };
    }
    if (Date.now() + intervalMs >= deadline) {
      return {
        status: "pending",
        ownerSession: null,
        timeRemaining: secondsLeft(request.expiresAt),
        detail: "Waiting for GitHub approval. Call check_auth_status again with the same authorization_request.",
      };
    }
    await sleep(intervalMs);
  }
}

export async function authorizedGitHub(handle: string): Promise<{ token: string; login: string }> {
  const session = await unseal<SessionPayload>(handle);
  if (session.purpose !== "owner-session") throw new Error("Invalid owner session.");
  if (session.expiresAt <= Date.now()) throw new Error("Authorization expired. Run authenticate_for_blog_posting again.");
  if (session.login.toLowerCase() !== ADMIN_LOGIN) throw new Error("This GitHub account cannot publish.");
  return { token: session.token, login: session.login };
}
