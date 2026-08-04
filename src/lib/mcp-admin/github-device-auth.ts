import { authEncryptionKey } from "./env";

const GITHUB_CLIENT_ID = "Ov23li98oVkx9PDOvktP";
const ADMIN_LOGIN = "somritdasgupta";
const SESSION_TTL_MS = 60 * 60 * 1000;

export interface DeviceAuthorization {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
}

interface GitHubUser { login: string }
interface SessionPayload { token: string; login: string; expiresAt: number }

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
};

async function encryptionKey(): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(authEncryptionKey()));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function createAuthorization(): Promise<DeviceAuthorization> {
  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, scope: "repo" }),
  });
  if (!response.ok) throw new Error(`GitHub authorization failed (${response.status}).`);
  const data = (await response.json()) as Record<string, unknown>;
  return {
    deviceCode: String(data.device_code ?? ""),
    userCode: String(data.user_code ?? ""),
    verificationUri: String(data.verification_uri ?? "https://github.com/login/device"),
    expiresIn: Number(data.expires_in ?? 900),
    interval: Number(data.interval ?? 5),
  };
}

async function exchangeDeviceCode(deviceCode: string): Promise<string | null> {
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
  if (data.error === "authorization_pending" || data.error === "slow_down") return null;
  if (!data.access_token) throw new Error(String(data.error_description ?? data.error ?? "GitHub did not issue a token."));
  return String(data.access_token);
}

async function githubUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`GitHub identity check failed (${response.status}).`);
  return response.json() as Promise<GitHubUser>;
}

async function seal(payload: SessionPayload): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    encoder.encode(JSON.stringify(payload)),
  );
  return `${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`;
}

async function unseal(handle: string): Promise<SessionPayload> {
  const [ivValue, ciphertextValue] = handle.split(".");
  if (!ivValue || !ciphertextValue) throw new Error("Invalid authorization handle.");
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64UrlToBytes(ivValue) },
      await encryptionKey(),
      base64UrlToBytes(ciphertextValue),
    );
    return JSON.parse(decoder.decode(plaintext)) as SessionPayload;
  } catch {
    throw new Error("Invalid or expired authorization handle. Run start_github_authorization again.");
  }
}

export async function completeAuthorization(deviceCode: string): Promise<string | null> {
  const token = await exchangeDeviceCode(deviceCode);
  if (!token) return null;
  const user = await githubUser(token);
  if (user.login.toLowerCase() !== ADMIN_LOGIN) {
    throw new Error(`Signed in as ${user.login}. Only ${ADMIN_LOGIN} can authorize publishing.`);
  }
  return seal({ token, login: user.login, expiresAt: Date.now() + SESSION_TTL_MS });
}

export async function authorizedGitHub(handle: string): Promise<{ token: string; login: string }> {
  const session = await unseal(handle);
  if (session.expiresAt <= Date.now()) throw new Error("Authorization expired. Run start_github_authorization again.");
  if (session.login.toLowerCase() !== ADMIN_LOGIN) throw new Error("This GitHub account cannot publish.");
  return { token: session.token, login: session.login };
}