import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { MDXProvider } from "@mdx-js/react";
import { Seo } from "@/components/Seo";
import { getPostBySlug, getPostMeta } from "@/lib/posts";
import { mdxComponents } from "@/components/mdx/mdxComponents";
import { AUTHOR, SITE, absUrl } from "@/site.config";
import { ArrowLeft, ArrowRight, ArrowUp, Check, Copy, List, FileJson, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const [progress, setProgress] = useState(0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? Math.min(100, (h.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  // Build TOC from the rendered article DOM (h2/h3) and inject ids.
  useEffect(() => {
    if (!articleRef.current) return;
    const headings = Array.from(
      articleRef.current.querySelectorAll<HTMLHeadingElement>("h2, h3"),
    );
    const seen = new Map<string, number>();
    const items: TocItem[] = headings.map((h) => {
      let id = slugify(h.textContent || "");
      if (!id) id = "section";
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      const finalId = n === 0 ? id : `${id}-${n}`;
      h.id = finalId;
      // give some scroll offset for the sticky bar
      h.style.scrollMarginTop = "96px";
      return { id: finalId, text: h.textContent || "", level: h.tagName === "H2" ? 2 : 3 };
    });
    setToc(items);

    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId((e.target as HTMLElement).id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [slug, post]);

  // Add a copy button to every <pre> code block in the rendered article.
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const pres = Array.from(root.querySelectorAll<HTMLPreElement>("pre"));
    const cleanups: Array<() => void> = [];
    pres.forEach((pre) => {
      if (pre.dataset.copyAttached === "1") return;
      pre.dataset.copyAttached = "1";
      // Make sure pre is a positioning context for the absolute button.
      const prevPos = pre.style.position;
      if (!prevPos) pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Copy code");
      btn.className =
        "code-copy-btn absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 opacity-0 backdrop-blur transition-all hover:border-white/30 hover:text-white group-hover:opacity-100 focus:opacity-100";
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>copy</span>`;

      // Make the parent figure (or pre) reveal the button on hover.
      const hoverHost = (pre.closest("figure") as HTMLElement) || pre;
      hoverHost.classList.add("group");

      const onClick = async () => {
        const code = pre.querySelector("code");
        const text = (code?.textContent ?? pre.textContent ?? "").replace(/\n$/, "");
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add("!opacity-100");
          const span = btn.querySelector("span");
          if (span) span.textContent = "copied";
          window.setTimeout(() => {
            if (span) span.textContent = "copy";
            btn.classList.remove("!opacity-100");
          }, 1400);
        } catch {
          /* ignore */
        }
      };
      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
        delete pre.dataset.copyAttached;
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [slug, post]);

  if (!post) return <Navigate to="/blog" replace />;

  const { Component, title, description, date, tags, readingTime } = post;

  // Prev / next navigation
  const all = getPostMeta();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const postUrl = absUrl(`/blog/${post.slug}`);

  const copyLink = async () => {
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const [copiedFmt, setCopiedFmt] = useState<"json" | "rss" | null>(null);
  const flashFmt = (f: "json" | "rss") => {
    setCopiedFmt(f);
    window.setTimeout(() => setCopiedFmt(null), 1600);
  };

  const getPlainText = () =>
    (articleRef.current?.innerText || "").trim();

  const copyAsJson = async () => {
    const payload = {
      title,
      description,
      slug: post.slug,
      url: postUrl,
      date,
      tags: tags ?? [],
      author: { name: AUTHOR.name, url: SITE.BASE_URL },
      readingTime,
      content: getPlainText(),
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    flashFmt("json");
  };

  const copyAsRss = async () => {
    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = articleRef.current?.innerHTML || "";
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escape(SITE.name)}</title>
  <link>${SITE.BASE_URL}</link>
  <description>${escape(SITE.description)}</description>
  <item>
    <title>${escape(title)}</title>
    <link>${postUrl}</link>
    <guid>${postUrl}</guid>
    <pubDate>${new Date(date).toUTCString()}</pubDate>
    <author>${escape(AUTHOR.name)}</author>
    <description>${escape(description)}</description>
    <content:encoded><![CDATA[${html}]]></content:encoded>
  </item>
</channel></rss>`;
    await navigator.clipboard.writeText(xml);
    flashFmt("rss");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: SITE.BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absUrl(`/blog/${post.slug}`),
    },
  };

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={`/blog/${post.slug}`}
        type="article"
        publishedTime={date}
        author={AUTHOR.name}
        jsonLd={jsonLd}
      />

      {/* Reading-progress bar — fixed at very top, above nav and iOS safe area */}
      <div
        aria-hidden
        className="fixed inset-x-0 z-[100] h-[3px] bg-foreground/10 pointer-events-none backdrop-blur-sm"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div
          className="h-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.7)] will-change-[width]"
          style={{ width: `${progress}%`, transition: "width 120ms linear" }}
        />
      </div>

      <article className="container-wide pt-6 pb-24 sm:pt-10">
        <Link
          to="/blog"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          All posts
        </Link>

        <header className="mt-8 mb-10 sm:mt-12 sm:mb-14">
          {/* compact meta line above title */}
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={date}>{formatDate(date)}</time>
            <span aria-hidden>·</span>
            <span>{readingTime} min read</span>
          </div>

          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>

          {tags && tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-surface-1/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
              <button
                type="button"
                onClick={copyLink}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "copied" : "copy link"}
              </button>
              <button
                type="button"
                onClick={copyAsJson}
                title="Copy this post as JSON"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {copiedFmt === "json" ? <Check className="h-3 w-3" /> : <FileJson className="h-3 w-3" />}
                {copiedFmt === "json" ? "copied" : "as json"}
              </button>
              <button
                type="button"
                onClick={copyAsRss}
                title="Copy this post as an RSS item"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {copiedFmt === "rss" ? <Check className="h-3 w-3" /> : <Rss className="h-3 w-3" />}
                {copiedFmt === "rss" ? "copied" : "as rss"}
              </button>
            </div>
          )}
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-20">
          <div>
            {/* Mobile/tablet TOC — collapsed by default, sits above the article */}
            {toc.length > 1 && (
              <details className="lg:hidden mb-8 rounded-lg border border-border bg-surface-1/40 group">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <List className="h-3 w-3" /> On this page · {toc.length}
                  </span>
                  <span className="text-[10px] transition-transform group-open:rotate-180">▾</span>
                </summary>
                <ul className="space-y-1 border-t border-border/60 px-2 py-2">
                  {toc.map((t) => (
                    <li key={t.id} className={cn(t.level === 3 && "pl-3")}>
                      <a
                        href={`#${t.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(t.id);
                          if (!el) return;
                          const y = el.getBoundingClientRect().top + window.scrollY - 88;
                          window.scrollTo({ top: y, behavior: "smooth" });
                          (e.currentTarget.closest("details") as HTMLDetailsElement)?.removeAttribute("open");
                        }}
                        className="block rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div
              ref={articleRef}
              className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-serif prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h3:mt-8 prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-transparent prose-pre:p-0"
            >
              <MDXProvider components={mdxComponents}>
                <Component />
              </MDXProvider>
            </div>
          </div>

          {toc.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <List className="h-3 w-3" /> On this page
                </p>
                <ul className="space-y-1.5 border-l border-border">
                  {toc.map((t) => (
                    <li key={t.id} className={cn(t.level === 3 && "pl-3")}>
                      <a
                        href={`#${t.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(t.id);
                          if (!el) return;
                          const y = el.getBoundingClientRect().top + window.scrollY - 88;
                          window.scrollTo({ top: y, behavior: "smooth" });
                          history.replaceState(null, "", `#${t.id}`);
                        }}
                        className={cn(
                          "-ml-px block border-l-2 px-3 py-1 text-xs transition-colors",
                          activeId === t.id
                            ? "border-accent text-foreground"
                            : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                        )}
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {/* Prev / Next — Older on the LEFT, Newer on the RIGHT (chronological) */}
        {(newer || older) && (
          <nav className="mt-20 grid gap-3 border-t border-border pt-8 sm:grid-cols-2 sm:gap-4">
            {older ? (
              <Link
                to={`/blog/${older.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface-1/30 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-surface-1 hover:shadow-md"
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Older
                </div>
                <div className="mt-1.5 truncate font-serif text-base group-hover:text-accent">
                  {older.title}
                </div>
              </Link>
            ) : <span className="hidden sm:block" />}
            {newer ? (
              <Link
                to={`/blog/${newer.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface-1/30 px-4 py-4 text-right transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-surface-1 hover:shadow-md sm:col-start-2"
              >
                <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Newer <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-1.5 truncate font-serif text-base group-hover:text-accent">
                  {newer.title}
                </div>
              </Link>
            ) : null}
          </nav>
        )}

        {/* Floating back-to-top — appears after some scroll */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className={cn(
            "fixed bottom-6 right-6 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-md backdrop-blur transition-all hover:border-foreground/40 hover:bg-surface-1",
            progress > 15 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
          )}
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">← All posts</Link>
          <span className="font-mono">— {AUTHOR.name}</span>
        </footer>
      </article>
    </>
  );
};

export default BlogPost;
