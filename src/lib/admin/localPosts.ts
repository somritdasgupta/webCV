/**
 * Locally-bundled MDX files (the ones already shipped in /content/blog).
 * Imported as raw strings so the editor can show & load them even when
 * GitHub is unreachable (PIN-only dev session, offline, rate-limited, etc.).
 */
const rawModules = import.meta.glob("/content/blog/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const OVERRIDES_KEY = "admin_local_post_overrides_v1";

const readOverrides = (): Record<string, string> => {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

const writeOverrides = (overrides: Record<string, string>) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
};

export interface LocalPost {
  /** filename, e.g. "hello-world.mdx" */
  name: string;
  /** repo-relative path, e.g. "content/blog/hello-world.mdx" */
  path: string;
  /** raw MDX content with frontmatter */
  content: string;
}

export const listLocalPosts = (): LocalPost[] =>
  Object.entries({ ...rawModules, ...Object.fromEntries(Object.entries(readOverrides()).map(([path, content]) => [`/${path}`, content])) })
    .map(([fullPath, content]) => {
      const name = fullPath.split("/").pop()!;
      const path = fullPath.replace(/^\//, "");
      return { name, path, content };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

export const readLocalPost = (path: string): string | null => {
  const repoPath = path.replace(/^\//, "");
  const override = readOverrides()[repoPath];
  if (override) return override;
  const key = path.startsWith("/") ? path : `/${path}`;
  return rawModules[key] ?? null;
};

export const writeLocalPostOverride = (path: string, content: string) => {
  const repoPath = path.replace(/^\//, "");
  writeOverrides({ ...readOverrides(), [repoPath]: content });
};