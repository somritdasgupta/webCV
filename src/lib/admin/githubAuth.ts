/**
 * GitHub OAuth Device Flow — fully client-side.
 *
 * Why a CORS proxy: GitHub's `/login/device/code` and `/login/oauth/access_token`
 * endpoints don't return CORS headers, so a direct browser fetch is blocked.
 * We route through a configurable proxy (default: corsproxy.io).
 *
 * The token is stored in localStorage. It scopes to whatever you requested
 * (we ask for `repo` so we can commit MDX files).
 */
import { ADMIN } from "@/site.config";

const TOKEN_KEY = "admin_gh_token_v1";
const USER_KEY = "admin_gh_user_v1";
const DEV_KEY = "admin_dev_session_v1";

export interface GhUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

/**
 * Resolve a GitHub OAuth endpoint to a same-origin URL when possible.
 * In production (Vercel) we use the rewrites in vercel.json:
 *   /gh/login/device/code            -> https://github.com/login/device/code
 *   /gh/login/oauth/access_token     -> https://github.com/login/oauth/access_token
 * Same-origin = no CORS preflight, no third-party proxy outage risk.
 *
 * In local dev (vite, localhost) those rewrites don't exist, so we fall back
 * to the configured public CORS proxy.
 */
const proxied = (url: string) => {
  const isBrowser = typeof window !== "undefined";
  const host = isBrowser ? window.location.hostname : "";
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

  if (isBrowser && !isLocal) {
    // Map github.com/login/* -> /gh/login/* on our own origin.
    const u = new URL(url);
    if (u.hostname === "github.com" && u.pathname.startsWith("/login/")) {
      return `${window.location.origin}/gh${u.pathname}${u.search}`;
    }
  }
  return `${ADMIN.corsProxy}${encodeURIComponent(url)}`;
};

/** Step 1: get a device + user code. Show user_code to the user. */
export async function requestDeviceCode(): Promise<DeviceCode> {
  if (!ADMIN.githubClientId) {
    throw new Error(
      "Missing githubClientId in src/site.config.ts → ADMIN. Create a GitHub OAuth App with Device Flow enabled.",
    );
  }
  const res = await fetch(proxied("https://github.com/login/device/code"), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: ADMIN.githubClientId, scope: "repo" }),
  });
  if (!res.ok) throw new Error(`Device code request failed: ${res.status}`);
  return res.json();
}

/** Step 2: poll until the user authorizes. Returns access_token. */
export async function pollForToken(
  device_code: string,
  intervalSec: number,
  signal?: AbortSignal,
): Promise<string> {
  let interval = Math.max(intervalSec, 5) * 1000;
  while (true) {
    if (signal?.aborted) throw new Error("aborted");
    await new Promise((r) => setTimeout(r, interval));
    const res = await fetch(
      proxied("https://github.com/login/oauth/access_token"),
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: ADMIN.githubClientId,
          device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      },
    );
    const data = await res.json();
    if (data.access_token) return data.access_token as string;
    if (data.error === "authorization_pending") continue;
    if (data.error === "slow_down") {
      interval += 5000;
      continue;
    }
    throw new Error(data.error_description || data.error || "Unknown auth error");
  }
}

export async function fetchUser(token: string): Promise<GhUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
  return res.json();
}

export const auth = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DEV_KEY);
  },
  getCachedUser: (): GhUser | null => {
    const v = localStorage.getItem(USER_KEY);
    return v ? (JSON.parse(v) as GhUser) : null;
  },
  setCachedUser: (u: GhUser) => localStorage.setItem(USER_KEY, JSON.stringify(u)),

  /** Local dev session — UI-only, no GitHub token. */
  isDevSession: (): boolean => localStorage.getItem(DEV_KEY) === "1",
  setDevSession: (on: boolean) => {
    if (on) localStorage.setItem(DEV_KEY, "1");
    else localStorage.removeItem(DEV_KEY);
  },
  /** Either GitHub-authenticated OR a local dev session. */
  hasAnySession: (): boolean =>
    !!localStorage.getItem(TOKEN_KEY) || localStorage.getItem(DEV_KEY) === "1",
};
