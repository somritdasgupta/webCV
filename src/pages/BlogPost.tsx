import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { MDXProvider } from "@mdx-js/react";
import { Seo } from "@/components/Seo";
import { getPostBySlug, getPostMeta } from "@/lib/posts";
import { mdxComponents } from "@/components/mdx/mdxComponents";
import { AUTHOR, SITE, absUrl } from "@/site.config";
import { ArrowLeft, ArrowUpRight, Check, Copy, List, FileJson, Rss } from "lucide-react";
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

      {/* Reading-progress bar — fixed at very top, above nav (z-[60]) */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-border/30 pointer-events-none"
      >
        <div
          className="h-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.6)] transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
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

        {/* Prev / Next */}

        {(newer || older) && (
          <nav className="mt-20 grid gap-3 border-t border-border pt-8 sm:grid-cols-2 sm:gap-4">
            {newer ? (
              <Link
                to={`/blog/${newer.slug}`}
                className="group rounded-lg border border-border bg-surface-1/30 px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-surface-1"
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <ArrowLeft className="h-3 w-3" /> Newer
                </div>
                <div className="mt-1 truncate font-serif text-base group-hover:text-accent">
                  {newer.title}
                </div>
              </Link>
            ) : <span />}
            {older ? (
              <Link
                to={`/blog/${older.slug}`}
                className="group rounded-lg border border-border bg-surface-1/30 px-4 py-3 text-right transition-colors hover:border-foreground/30 hover:bg-surface-1"
              >
                <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Older <ArrowUpRight className="h-3 w-3" />
                </div>
                <div className="mt-1 truncate font-serif text-base group-hover:text-accent">
                  {older.title}
                </div>
              </Link>
            ) : <span />}
          </nav>
        )}

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <Link to="/blog" className="hover:text-foreground">← All posts</Link>
          <span className="font-mono">— {AUTHOR.name}</span>
        </footer>
      </article>
    </>
  );
};

export default BlogPost;
