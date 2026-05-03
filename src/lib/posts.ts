import { ComponentType } from "react";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string; // ISO
  tags?: string[];
  cover?: string;
  draft?: boolean;
  readingTime?: number; // minutes
}

export interface PostModule {
  default: ComponentType;
  frontmatter: PostFrontmatter;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostMeta {
  Component: ComponentType;
}

/**
 * Eagerly import all MDX posts in /content/blog at build time.
 * Drop a new .mdx file there and it appears automatically.
 */
const modules = import.meta.glob<PostModule>("/content/blog/*.mdx", { eager: true });

const wordsPerMinute = 220;

const computeReadingTime = (mod: PostModule): number => {
  // crude estimate: count words in compiled component is impossible at runtime,
  // so fall back to frontmatter or a sensible default.
  return mod.frontmatter.readingTime ?? 3;
};

const slugFromPath = (path: string) =>
  path.split("/").pop()!.replace(/\.mdx$/, "").toLowerCase();

const allPosts: Post[] = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = slugFromPath(path);
    return {
      slug,
      Component: mod.default,
      ...mod.frontmatter,
      readingTime: computeReadingTime(mod),
    };
  })
  // Hide drafts AND posts with a future `date` (= scheduled).
  .filter((p) => !p.draft && +new Date(p.date) <= Date.now())
  .sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const getAllPosts = (): Post[] => allPosts;

export const getPostMeta = (): PostMeta[] =>
  allPosts.map(({ Component: _c, ...m }) => m);

export const getPostBySlug = (slug: string): Post | undefined =>
  allPosts.find((p) => p.slug === slug);

export { wordsPerMinute };
