/**
 * SINGLE SOURCE OF TRUTH for site-wide config.
 *
 * To change the production domain, set ONE thing:
 *   VITE_SITE_URL="https://your-domain.com"   in .env (no trailing slash)
 *
 * That value flows everywhere automatically:
 *   - SEO meta tags (canonical, og:url, twitter)         via <Seo />
 *   - JSON-LD structured data                            via <Seo />
 *   - Static index.html canonical & og:url               via vite plugin
 *   - public/robots.txt sitemap line                     via vite plugin
 *   - Any code that calls absUrl(path)
 *
 * The fallback below is only used when VITE_SITE_URL is not set.
 */
const ENV_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) || "";

export const SITE = {
  /** Resolved at build time. Override with VITE_SITE_URL. NO trailing slash. */
  BASE_URL: (ENV_BASE_URL || "https://somritdasgupta.in").replace(/\/$/, ""),
  name: "Somrit Dasgupta",
  shortName: "Somrit",
  title: "Somrit Dasgupta — Engineer x Extraordinaire",
  description:
    "Personal site of Somrit Dasgupta. Blogs, contributions and live activities from GitHub.",
  locale: "en_US",
  twitterHandle: "@somritdasgupta",
  ogImage: "/og.png",
  themeColor: "#0a0a0a",
} as const;

export const AUTHOR = {
  name: "Somrit Dasgupta",
  role: "Engineer, Hobbyist",
  bio: "I build software, write about what I learn, and ship in public — much of it open source.",
  email: "hello@somritdasgupta.in",
  links: {
    github: "https://github.com/somritdasgupta",
    twitter: "https://twitter.com/somritdasgupta",
    linkedin: "https://www.linkedin.com/in/somritdasgupta",
  },
} as const;

/**
 * GitHub config.
 * - username: GitHub user to fetch from
 * - repoIdAllowlist: numeric repo IDs to show (most precise — survives renames)
 * - repoAllowlist: owner/name strings as a fallback match
 * - pinned: optional fixed order on top (owner/name)
 *
 * Filter logic: a repo is shown if its ID is in repoIdAllowlist
 * OR its full_name matches repoAllowlist. Empty arrays = show all.
 */
export const GITHUB = {
  username: "somritdasgupta",
  repoIdAllowlist: [
    1062808930, 1071044727, 917047238, 818561625, 482468668, 638619916,
    946629942, 620773103,
  ] as number[],
  repoAllowlist: [] as string[],
  pinned: ["somritdasgupta/cogent-x"] as string[],
  /** Featured repo shown on the home page (owner/name). */
  featured: "somritdasgupta/cogent-x",
  /** Max commits to show on the activity feed. */
  maxCommits: 30,
} as const;

export const NAV = [
  { href: "/", label: "about" },
  { href: "/blog", label: "blog" },
  { href: "/activity", label: "activity" },
] as const;

/**
 * Admin / writing UI config.
 * GitHub OAuth Device Flow — client_id is PUBLIC and safe to ship in code.
 *
 * Setup (one-time):
 *   1. github.com/settings/developers → New OAuth App
 *   2. App name: "somritdasgupta.in admin", Homepage: your site URL
 *   3. Authorization callback URL: any value (Device Flow ignores it)
 *   4. Enable "Device Flow" in the app settings
 *   5. Paste the Client ID below.
 *
 * The repo info is where new posts get committed.
 */
export const ADMIN = {
  /** GitHub OAuth App Client ID (public, safe to commit). */
  githubClientId: "Ov23li98oVkx9PDOvktP",
  /** Repo where blog MDX files live. */
  repo: {
    owner: "somritdasgupta",
    name: "somritdasgupta.in",
    branch: "main",
    /** Folder inside the repo where MDX posts go. */
    contentDir: "content/blog",
  },
  /**
   * Public CORS proxy for the GitHub Device Flow endpoints
   * (github.com/login/* lacks CORS headers).
   * Swap for your own deployed proxy when ready.
   */
  corsProxy: "https://corsproxy.io/?",
  /**
   * Backup local-only login for dev / preview when GitHub Device Flow is awkward.
   * Format is `username:PIN`. PIN must be 4 digits.
   * This grants UI access (read editor, preview) ONLY — committing posts still
   * requires GitHub sign-in because we need a real token to call the API.
   */
  devUsername: "somrit",
  devPin: "2106",
} as const;

/** Resolve any path to an absolute URL using BASE_URL. */
export const absUrl = (path = "/"): string => {
  const base = SITE.BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};
