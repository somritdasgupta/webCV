import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { useGithubRepos, useGithubCommits, type GhCommit } from "@/lib/github";
import { GITHUB } from "@/site.config";
import { Star, GitFork, ExternalLink, GitCommit, Calendar, Code2, Tag, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "projects" | "commits";

const langColor = (lang: string | null): string => {
  const map: Record<string, string> = {
    TypeScript: "bg-accent",
    JavaScript: "bg-warning",
    Python: "bg-success",
    Go: "bg-primary",
    Rust: "bg-accent",
    Java: "bg-warning",
    Ruby: "bg-destructive",
    HTML: "bg-accent",
    CSS: "bg-primary",
    Shell: "bg-success",
  };
  return (lang && map[lang]) || "bg-muted-foreground";
};

const relTime = (iso: string): string => {
  const diff = (Date.now() - +new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
};

const ProjectsView = () => {
  const { data, isLoading, error } = useGithubRepos();
  if (isLoading) return <SkeletonGrid />;
  if (error) return <ErrorMsg msg="Couldn't load repositories. GitHub may be rate-limiting unauthenticated requests — try again in a bit." />;
  if (!data || data.length === 0)
    return <p className="py-12 text-center text-muted-foreground">No projects to show.</p>;

  const totalStars = data.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = data.reduce((sum, r) => sum + r.forks_count, 0);
  const languages = Array.from(new Set(data.map((r) => r.language).filter(Boolean)));
  const pinned = new Set(GITHUB.pinned.map((p) => p.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "repos", value: data.length, icon: Code2 },
          { label: "stars", value: totalStars, icon: Star },
          { label: "forks", value: totalForks, icon: GitFork },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-surface-1/40 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-1.5 text-muted-foreground sm:gap-2">
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.18em]">{label}</span>
            </div>
            <div className="mt-1.5 font-serif text-2xl leading-none sm:mt-2 sm:text-3xl">{value}</div>
          </div>
        ))}
      </div>

      <ul className="grid gap-3 lg:grid-cols-2">
        {data.map((r) => (
          <li key={r.id}>
          <a
            href={r.homepage || r.html_url}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex h-full flex-col rounded-lg border border-border bg-surface-1/35 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-surface-1 hover:shadow-elev-md sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-2xl leading-tight tracking-tight transition-colors group-hover:text-accent">
                    {r.name}
                  </h3>
                  {pinned.has(r.full_name.toLowerCase()) && (
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                      pinned
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{r.full_name}</p>
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-muted-foreground">
              {r.description || "No description added yet."}
            </p>

            {r.topics && r.topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.topics.slice(0, 4).map((topic) => (
                  <span key={topic} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    <Tag className="h-2.5 w-2.5" /> {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-[11px] text-muted-foreground">
              {r.language && (
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", langColor(r.language))} />
                  {r.language}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> {r.stargazers_count}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3 w-3" /> {r.forks_count}
              </span>
              {r.homepage && (
                <span className="inline-flex items-center gap-1">
                  <Globe2 className="h-3 w-3" /> live
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" /> {relTime(r.pushed_at)}
              </span>
            </div>
          </a>
        </li>
      ))}
      </ul>

      {languages.length > 0 && (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Languages: {languages.join(" · ")}
        </p>
      )}
    </div>
  );
};

/**
 * Commits view.
 *
 * Pulls per-repo commits across the allowlisted repos (not the limited
 * /events feed) so we can show a full history. Groups by day for easy
 * scanning, with a "Load more" button to reveal older batches.
 */
const PAGE_SIZE = 40;

const groupByDay = (commits: GhCommit[]): Array<{ day: string; items: GhCommit[] }> => {
  const buckets = new Map<string, GhCommit[]>();
  for (const c of commits) {
    const day = new Date(c.date).toLocaleDateString("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!buckets.has(day)) buckets.set(day, []);
    buckets.get(day)!.push(c);
  }
  return Array.from(buckets, ([day, items]) => ({ day, items }));
};

const CommitsView = () => {
  const { data, isLoading, error } = useGithubCommits(40);
  const [shown, setShown] = useState(PAGE_SIZE);

  const visible = useMemo(() => (data ? data.slice(0, shown) : []), [data, shown]);
  const grouped = useMemo(() => groupByDay(visible), [visible]);

  if (isLoading) return <SkeletonList />;
  if (error)
    return (
      <ErrorMsg msg="Couldn't load commits. GitHub may be rate-limiting unauthenticated requests — try again in a bit." />
    );
  if (!data || data.length === 0)
    return <p className="py-12 text-center text-muted-foreground">No commits to show.</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <span className="font-mono text-foreground">{visible.length}</span> of{" "}
          <span className="font-mono text-foreground">{data.length}</span> commits
        </span>
      </div>

      {grouped.map(({ day, items }) => (
        <section key={day}>
          <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {day}
          </h3>
          <ol className="space-y-2">
            {items.map((c) => (
              <li
                key={`${c.repo}-${c.sha}`}
                className="group flex gap-3 rounded-lg border border-border/60 bg-surface-1/40 p-3 transition-colors hover:bg-surface-1 sm:p-4"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                  <GitCommit className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate text-sm text-foreground transition-colors group-hover:text-accent"
                  >
                    {c.message.split("\n")[0]}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    <a
                      href={`https://github.com/${c.repo}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-foreground"
                    >
                      {c.repo}
                    </a>
                    <span>·</span>
                    <span>{c.branch}</span>
                    <span>·</span>
                    <span>{c.sha.slice(0, 7)}</span>
                    <span>·</span>
                    <span>{relTime(c.date)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {shown < data.length && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setShown((s) => s + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1/60 px-4 py-2 text-sm text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-surface-1"
          >
            Load {Math.min(PAGE_SIZE, data.length - shown)} more
          </button>
        </div>
      )}
    </div>
  );
};

const SkeletonGrid = () => (
  <ul className="divide-y divide-border/60 border-y border-border/60">
    {Array.from({ length: 6 }).map((_, i) => (
      <li key={i} className="py-5">
        <div className="h-12 w-full animate-pulse rounded-md bg-surface-1/40" />
      </li>
    ))}
  </ul>
);
const SkeletonList = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-surface-1/40" />
    ))}
  </div>
);
const ErrorMsg = ({ msg }: { msg: string }) => (
  <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
    {msg}
  </div>
);

const Activity = () => {
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <>
      <Seo
        title="Activity"
        description="My GitHub projects and recent commits, pulled live."
        path="/activity"
      />

      <section className="container-wide pt-12 pb-10 sm:pt-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Building</p>
        <h1 className="fluid-h1 font-serif">
          Projects & activity.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Pulled live from GitHub. Filtered to the repos I actually care about.
        </p>
      </section>

      <section className="container-wide pb-24">
        <div className="mb-8 inline-flex items-center gap-1 rounded-lg border border-border bg-surface-1/60 p-1">
          {(["projects", "commits"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "relative rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-300 ease-out-expo",
                tab === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "projects" ? "Projects" : "Commits"}
            </button>
          ))}
        </div>

        <div key={tab} className="animate-fade-up">
          {tab === "projects" ? <ProjectsView /> : <CommitsView />}
        </div>
      </section>
    </>
  );
};

export default Activity;
