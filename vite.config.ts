import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

/**
 * Replaces `%SITE_URL%` placeholder in index.html and `public/robots.txt`
 * with the value of `VITE_SITE_URL` (or the default fallback). One env var
 * → every static URL on the site.
 */
const siteUrlPlugin = (siteUrl: string): Plugin => {
  const url = siteUrl.replace(/\/$/, "");
  return {
    name: "site-url-injector",
    transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", url),
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: ${url}/sitemap.xml
`,
      });

      // Build sitemap.xml from static routes + MDX posts in /content/blog.
      const blogDir = path.resolve(__dirname, "content/blog");
      const staticRoutes = ["/", "/blog", "/activity", "/cv"];
      const today = new Date().toISOString().slice(0, 10);

      type Entry = { loc: string; lastmod: string };
      const entries: Entry[] = staticRoutes.map((r) => ({
        loc: `${url}${r}`,
        lastmod: today,
      }));

      try {
        const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
        for (const file of files) {
          const slug = file.replace(/\.mdx$/, "").toLowerCase();
          const raw = fs.readFileSync(path.join(blogDir, file), "utf-8");
          const dateMatch = raw.match(/date:\s*["']([^"']+)["']/);
          const draftMatch = raw.match(/draft:\s*true/);
          const date = dateMatch?.[1] ?? today;
          if (draftMatch) continue;
          if (+new Date(date) > Date.now()) continue;
          entries.push({
            loc: `${url}/blog/${slug}`,
            lastmod: new Date(date).toISOString().slice(0, 10),
          });
        }
      } catch {
        // no blog dir — skip
      }

      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        entries
          .map(
            (e) =>
              `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`,
          )
          .join("\n") +
        `\n</urlset>\n`;

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: xml,
      });
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const SITE_URL = env.VITE_SITE_URL || "https://somritdasgupta.in";
  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    {
      enforce: "pre" as const,
      ...mdx({
        providerImportSource: "@mdx-js/react",
        development: false,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [
            rehypePrettyCode,
            {
              // Always render code blocks with a dark theme — looks
              // intentional in both light and dark site modes.
              theme: "github-dark-default",
              keepBackground: false,
              defaultLang: "plaintext",
            },
          ],
        ],
      }),
    },
    react(),
    siteUrlPlugin(SITE_URL),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  };
});
