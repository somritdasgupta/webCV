import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { AUTHOR, SITE, GITHUB } from "@/site.config";
import { ArrowUpRight, Github, Linkedin, Star, GitFork, ExternalLink } from "lucide-react";
import { XLogo } from "@/components/icons/XLogo";
import { getPostMeta } from "@/lib/posts";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const recent = getPostMeta().slice(0, 4);

  // Featured repo — fetched directly by name (unauthenticated).
  const featured = useQuery({
    queryKey: ["gh-featured", GITHUB.featured],
    queryFn: async () => {
      const res = await fetch(`https://api.github.com/repos/${GITHUB.featured}`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error(`GitHub: ${res.status}`);
      return res.json() as Promise<{
        name: string;
        full_name: string;
        description: string | null;
        html_url: string;
        homepage: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        topics?: string[];
      }>;
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR.name,
    url: SITE.BASE_URL,
    jobTitle: AUTHOR.role,
    description: AUTHOR.bio,
    sameAs: [AUTHOR.links.github, AUTHOR.links.twitter, AUTHOR.links.linkedin],
  };

  return (
    <>
      <Seo path="/" jsonLd={jsonLd} />

      {/* Hero + Featured — two columns on desktop, stacked on mobile */}
      <section className="container-wide pt-10 pb-16 sm:pt-24 sm:pb-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Left: greeting */}
          <div className="min-w-0">
            <p className="mb-5 font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
              Engineer, Hobbyist, Discerning
            </p>
            <h1 className="fluid-h1 font-serif text-balance">
              Hi, I'm{" "}
              <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {AUTHOR.name.split(" ")[0]}
              </span>
              <span className="text-accent">.</span>
            </h1>
            <p className="mt-7 max-w-2xl fluid-lead leading-relaxed text-muted-foreground text-pretty">
              I work across the stack — TypeScript, React, Node, Python, Go, and AWS.
              I build backend systems and AI tools, share what I learn, and keep most of my work open source.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/blog"
                className="group inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-all duration-300 ease-out-expo hover:gap-2.5"
              >
                Read the blog
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/activity"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                See activity
              </Link>
              <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-muted-foreground">
                <a href={AUTHOR.links.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="rounded-sm p-1 transition-colors hover:text-foreground">
                  <Github className="h-4 w-4" />
                </a>
                <a href={AUTHOR.links.twitter} target="_blank" rel="noreferrer noopener" aria-label="Twitter" className="rounded-sm p-1 transition-colors hover:text-foreground">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href={AUTHOR.links.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="rounded-sm p-1 transition-colors hover:text-foreground">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: featured project card */}
          <div className="min-w-0 lg:pl-6 lg:border-l lg:border-border/60">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                featured project
              </h2>
              {featured.data?.html_url && (
                <a
                  href={featured.data.html_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  on GitHub →
                </a>
              )}
            </div>

            {featured.isLoading && (
              <div className="h-44 animate-pulse rounded-xl border border-border bg-surface-1/40" />
            )}

            {featured.data && (
              <a
                href={featured.data.homepage || featured.data.html_url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block rounded-xl border border-border bg-surface-1/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-surface-1 hover:shadow-elev-md sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-2xl tracking-tight transition-colors group-hover:text-accent sm:text-[28px]">
                      {featured.data.name}
                    </h3>
                    {featured.data.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {featured.data.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {featured.data.language && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      {featured.data.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5" /> {featured.data.stargazers_count}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GitFork className="h-3.5 w-3.5" /> {featured.data.forks_count}
                  </span>
                  {featured.data.topics && featured.data.topics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {featured.data.topics.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Recent posts — full width band, no sidebar */}
      {recent.length > 0 && (
        <section className="container-wide border-t border-border/60 pt-12 pb-28 sm:pt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              recent writing
            </h2>
            <Link
              to="/blog"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              all posts →
            </Link>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {recent.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/blog/${p.slug}`}
                  className="group relative grid grid-cols-[1fr_auto] items-baseline gap-4 py-6 pl-4 pr-2 -mx-2 rounded-md transition-colors hover:bg-surface-1/60 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:gap-8 sm:pl-5 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[2px] before:-translate-y-1/2 before:rounded-r-full before:bg-accent before:opacity-0 before:transition-opacity group-hover:before:opacity-100"
                >
                  <h3 className="font-serif text-xl leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                    {p.title}
                  </h3>
                  <p className="hidden truncate text-sm leading-relaxed text-muted-foreground sm:block">
                    {p.description}
                  </p>
                  <time className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default Home;
