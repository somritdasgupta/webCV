import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { getPostMeta } from "@/lib/posts";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });

const BlogIndex = () => {
  const posts = getPostMeta();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesTag = !activeTag || p.tags?.includes(activeTag);
      if (!matchesTag) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, activeTag]);

  return (
    <>
      <Seo
        title="Blog"
        description="Notes on engineering, tools, and the things I'm building."
        path="/blog"
      />

      <section className="container-wide pt-12 pb-8 sm:pt-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Writing</p>
        <h1 className="fluid-h1 font-serif">Blog.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Notes, write-ups, and work-in-progress ideas. {posts.length} {posts.length === 1 ? "post" : "posts"} so far.
        </p>
      </section>

      {/* Search + tag filters */}
      <section className="container-wide pb-6">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
                  !activeTag
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                all
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag(t === activeTag ? null : t)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
                    activeTag === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-wide pb-24">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-1/30 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No posts match your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTag(null);
              }}
              className="mt-3 text-xs text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <PostsByYear posts={filtered} />
        )}
      </section>
    </>
  );
};

/** Group posts by year and render each group with a year header + cards. */
const PostsByYear = ({
  posts,
}: {
  posts: ReturnType<typeof getPostMeta>;
}) => {
  const groups = useMemo(() => {
    const map = new Map<string, typeof posts>();
    posts.forEach((p) => {
      const y = String(new Date(p.date).getFullYear());
      const arr = map.get(y) ?? [];
      arr.push(p);
      map.set(y, arr);
    });
    return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [posts]);

  return (
    <div className="space-y-12">
      {groups.map(([year, items]) => (
        <section key={year}>
          {/* Year header */}
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">{year}</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {items.length} {items.length === 1 ? "post" : "posts"}
            </span>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>

          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/blog/${p.slug}`}
                  className={cn(
                    "group relative block rounded-xl border border-border/60 bg-surface-1/30 px-4 py-4 sm:px-5 sm:py-5",
                    "transition-all duration-300 ease-out-expo",
                    "hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-surface-1 hover:shadow-elev-md",
                    // Left accent bar — appears on hover, matches old-site vibe
                    "before:absolute before:inset-y-3 before:left-0 before:w-[2px] before:rounded-r-full before:bg-accent",
                    "before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
                  )}
                >
                  <h3 className="font-serif text-lg leading-snug tracking-tight transition-colors group-hover:text-accent sm:text-xl">
                    {p.title}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <time>{formatDate(p.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{p.readingTime} min read</span>
                  </div>

                  {p.description && (
                    <p className="mt-2 hidden text-sm leading-relaxed text-muted-foreground sm:block">
                      {p.description}
                    </p>
                  )}

                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {p.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border/60 bg-background/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {p.tags.length > 3 && (
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                          +{p.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default BlogIndex;
