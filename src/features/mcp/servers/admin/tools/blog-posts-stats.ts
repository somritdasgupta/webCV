import { defineTool } from "@lovable.dev/mcp-js";
import { daysBetween, isPublic, loadCorpus, readerToken, tagFrequency, type PostRecord } from "../corpus";
import { optionalSessionField } from "../fields";
import { todayDateOnly } from "../mdx";
import { respond } from "../response";

type Frequency = "daily" | "weekly" | "bi-weekly" | "monthly" | "irregular";

/** Classify by median gap between consecutive published dates. */
function publishFrequency(dates: string[]): Frequency {
  if (dates.length < 3) return "irregular";
  const gaps = dates.slice(1).map((d, i) => daysBetween(dates[i], d)).sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)];
  if (median <= 2) return "daily";
  if (median <= 9) return "weekly";
  if (median <= 18) return "bi-weekly";
  if (median <= 40) return "monthly";
  return "irregular";
}

function buildStats(all: PostRecord[]) {
  const published = all.filter(isPublic);
  const dates = published.map((p) => p.date).filter(Boolean).sort();
  const reading = published.map((p) => p.readingTime);
  const words = published.reduce((sum, p) => sum + p.wordCount, 0);
  const perMonth: Record<string, number> = {};
  for (const d of dates) perMonth[d.slice(0, 7)] = (perMonth[d.slice(0, 7)] ?? 0) + 1;
  const freq = tagFrequency(published);
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
  const oldest = dates[0] ?? null;
  const newest = dates[dates.length - 1] ?? null;
  const avg = (n: number) => (published.length ? Math.round((n / published.length) * 10) / 10 : 0);
  return {
    total_posts: all.length,
    draft_count: all.filter((p) => p.draft).length,
    scheduled_count: all.filter((p) => p.scheduled).length,
    published_count: published.length,
    total_words: words,
    avg_words_per_post: avg(words),
    avg_reading_time: avg(reading.reduce((a, b) => a + b, 0)),
    min_reading_time: reading.length ? Math.min(...reading) : 0,
    max_reading_time: reading.length ? Math.max(...reading) : 0,
    oldest_post_date: oldest,
    newest_post_date: newest,
    date_range_days: oldest && newest ? daysBetween(oldest, newest) : 0,
    posts_per_month: perMonth,
    tag_frequency: freq,
    top_tags: top.slice(0, 10),
    most_used_tags: top.slice(0, 5).map((t) => t.tag),
    publish_frequency: publishFrequency(dates),
    last_published: newest,
    streak_current_days: newest ? daysBetween(newest, todayDateOnly()) : null,
  };
}

export default defineTool({
  name: "blog_posts_stats",
  title: "Blog statistics",
  description:
    "Aggregate statistics: counts, word totals, reading-time spread, posts per month, tag frequency, publishing cadence, and days since the last published post (streak_current_days). Content figures cover published posts; draft and scheduled counts need session_token to be complete.",
  inputSchema: { session_token: optionalSessionField },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token }) =>
    respond("blog_posts_stats", async () => {
      const token = await readerToken(session_token, false);
      const stats = buildStats(await loadCorpus(token));
      return {
        data: { ...stats, includes_unpublished: Boolean(token) },
        userMessage: `${stats.published_count} published posts, ${stats.total_words} words in total.`,
      };
    }),
});
