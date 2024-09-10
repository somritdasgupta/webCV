"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDate } from "../blog/utils";
import Tags from "./tags";
import { useSearchParams } from "next/navigation";

interface BlogPost {
  metadata: {
    title: string;
    publishedAt: string;
    tags?: string[];
  };
  slug: string;
}

interface BlogPostsProps {
  initialPosts: BlogPost[];
  initialTags: string[];
  limit?: number;
  showTags?: boolean;
  showBorders?: boolean;
  showPublicationYear?: boolean;
  groupByYear?: boolean;
}

function ClientBlogPosts({
  initialPosts,
  initialTags,
  limit = Infinity,
  showTags = true,
  showBorders = true,
  showPublicationYear = true,
  groupByYear = false,
}: BlogPostsProps) {
  const [allPosts] = useState<BlogPost[]>(initialPosts);
  const [allTags] = useState<string[]>(initialTags);

  const searchParams = useSearchParams();
  const tag = searchParams.get("tag") || "";

  const filteredPosts = useMemo(() => {
    if (!tag) return allPosts;
    return allPosts.filter((post) => post.metadata.tags?.includes(tag));
  }, [allPosts, tag]);

  const sortedPosts = useMemo(() => {
    return filteredPosts
      .sort(
        (b, a) =>
          new Date(a.metadata.publishedAt).getTime() -
          new Date(b.metadata.publishedAt).getTime()
      )
      .slice(0, limit);
  }, [filteredPosts, limit]);

  const postsByYear = useMemo(() => {
    if (!groupByYear) return sortedPosts;
    return sortedPosts.reduce((acc, post) => {
      const year = new Date(post.metadata.publishedAt).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    }, {} as { [key: number]: BlogPost[] });
  }, [sortedPosts, groupByYear]);

  const tagCounts = useMemo(() => {
    return allTags.reduce((acc, tag) => {
      acc[tag] = allPosts.filter((post) =>
        post.metadata.tags?.includes(tag)
      ).length;
      return acc;
    }, {} as { [key: string]: number });
  }, [allTags, allPosts]);

  return (
    <div>
      {showTags && (
        <Tags
          tags={allTags}
          tagsCounts={tagCounts}
          selectedTags={tag}
          onTagsSelect={(selectedTag) => {
            const newParams = new URLSearchParams(window.location.search);
            if (selectedTag) {
              newParams.set("tag", selectedTag);
            } else {
              newParams.delete("tag");
            }
            const newUrl = `${
              window.location.pathname
            }?${newParams.toString()}`;
            window.history.pushState({}, "", newUrl);
          }}
        />
      )}
      {groupByYear
        ? Object.entries(postsByYear)
            .map(([year, posts]) => (
              <div key={year} className="mb-8">
                <h1 className="text-2xl font-bold mb-4 flex items-center border-dashed border-b-1 border-[var(--callout-border)]">
                  {year}
                </h1>
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    className={`flex flex-col mb-2 mt-2 ${
                      showBorders
                        ? "border-dashed border-slate-600 border-b pb-4"
                        : ""
                    }`}
                    href={`/blog/${post.slug}`}
                  >
                    <div className="w-full flex flex-col md:flex-row hover:bg-[var(--bronzer)]/10 rounded-md transition duration-500 ease py-2 space-x-0 md:space-x-2">
                      {showPublicationYear && (
                        <p className="font-bold !text-[var(--bronzer)] w-[150px] tabular-nums">
                          {formatDate(post.metadata.publishedAt, false)}
                        </p>
                      )}
                      <p>{post.metadata.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ))
            .reverse()
        : sortedPosts.map((post) => (
            <Link
              key={post.slug}
              className={`flex flex-col space-y-1 mb-4 ${
                showBorders ? "border-dashed border-[var(--bronzer)]/50 border-b pb-4" : ""
              }`}
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col hover:bg-[var(--bronzer)]/10 rounded-md transition duration-500 ease md:flex-row space-x-0 md:space-x-2">
                {showPublicationYear && (
                  <p className="font-bold !text-[var(--bronzer)] w-[150px] tabular-nums">
                    {formatDate(post.metadata.publishedAt, false)}
                  </p>
                )}
                <p>{post.metadata.title}</p>
              </div>
            </Link>
          ))}
    </div>
  );
}

export function BlogPosts(props: Omit<BlogPostsProps, 'initialPosts' | 'initialTags'>) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog-posts");
        const data = await response.json();
        setPosts(data.posts);
        setTags(data.tags);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, []);

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <ClientBlogPosts initialPosts={posts} initialTags={tags} {...props} />;
}