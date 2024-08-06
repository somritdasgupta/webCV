// components/posts.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDate } from "../blog/utils";
import Tags from "./tags";

interface BlogPost {
  metadata: {
    title: string;
    publishedAt: string;
    tags?: string[];
  };
  slug: string;
}

interface BlogPostsProps {
  limit?: number;
  showTags?: boolean;
}

export function BlogPosts({
  limit = Infinity,
  showTags = true,
}: BlogPostsProps) {
  const [selectedTags, setSelectedTags] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/blog-posts")
      .then((response) => response.json())
      .then((data) => {
        setAllPosts(data.posts);
        setAllTags(data.tags);
      });
  }, []);

  const filteredPosts = useMemo(() => {
    if (!selectedTags) return allPosts;
    return allPosts.filter((post) =>
      post.metadata.tags?.includes(selectedTags)
    );
  }, [allPosts, selectedTags]);

  const sortedPosts = useMemo(() => {
    return filteredPosts
      .sort(
        (a, b) =>
          new Date(b.metadata.publishedAt).getTime() -
          new Date(a.metadata.publishedAt).getTime()
      )
      .slice(0, limit);
  }, [filteredPosts, limit]);

  const tagCounts = useMemo(() => {
    return allTags.reduce((acc, tag) => {
      acc[tag] = allPosts.filter((post) =>
        post.metadata.tags?.includes(tag)
      ).length;
      return acc;
    }, {} as { [key: string]: number });
  }, [allTags, allPosts]);

  if (allPosts.length === 0) {
    return <p className="mt-2 mb-2">Loading blog posts...</p>;
  }

  return (
    <div>
      {showTags && (
        <Tags
          tags={allTags}
          tagsCounts={tagCounts}
          selectedTags={selectedTags}
          onTagsSelect={setSelectedTags}
        />
      )}
      {sortedPosts.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4"
          href={`/blog/${post.slug}`}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
            <p className="font-bold w-[150px] tabular-nums">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="light-text-color dark:light-text-color">
              {post.metadata.title}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
