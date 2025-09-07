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
  const searchTerm = searchParams.get("search") || "";

  const filteredPosts = useMemo(() => {
    let filtered = allPosts;

    // Filter by tag
    if (tag) {
      filtered = filtered.filter((post) => post.metadata.tags?.includes(tag));
    }

    // Filter by search term
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.metadata.title.toLowerCase().includes(lowercaseSearch) ||
          post.metadata.tags?.some((tag) =>
            tag.toLowerCase().includes(lowercaseSearch)
          )
      );
    }

    return filtered;
  }, [allPosts, tag, searchTerm]);

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
    return sortedPosts.reduce(
      (acc, post) => {
        const year = new Date(post.metadata.publishedAt).getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(post);
        return acc;
      },
      {} as { [key: number]: BlogPost[] }
    );
  }, [sortedPosts, groupByYear]);

  const tagCounts = useMemo(() => {
    return allTags.reduce(
      (acc, tag) => {
        acc[tag] = allPosts.filter((post) =>
          post.metadata.tags?.includes(tag)
        ).length;
        return acc;
      },
      {} as { [key: string]: number }
    );
  }, [allTags, allPosts]);

  return (
    <div className="space-y-4">
      {showTags && (
        <div className="mb-6">
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
        </div>
      )}

      {/* No results message */}
      {filteredPosts.length === 0 && (tag || searchTerm) && (
        <div className="text-center py-12">
          <div className="text-[var(--text-p)] text-lg mb-4">
            No posts found {tag && `for tag "${tag}"`}{" "}
            {searchTerm && `matching "${searchTerm}"`}
          </div>
          <button
            onClick={() => {
              const newParams = new URLSearchParams();
              window.history.pushState({}, "", window.location.pathname);
            }}
            className="text-[var(--bronzer)] hover:underline font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredPosts.length > 0 && (
        <div className="space-y-4">
          {(tag || searchTerm) && (
            <div className="mb-6 text-sm text-[var(--text-p)] text-center">
              Showing {filteredPosts.length} post
              {filteredPosts.length !== 1 ? "s" : ""}
              {tag && ` tagged with "${tag}"`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}

          {groupByYear
            ? Object.entries(postsByYear)
                .map(([year, posts]) => (
                  <div key={year} className="mb-8">
                    <h1 className="text-2xl font-extrabold mb-6 text-center flex items-center justify-center border-dashed border-b-1 border-[var(--callout-border)] pb-4">
                      {year}
                    </h1>
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <Link
                          key={post.slug}
                          className="group block"
                          href={`/blog/${post.slug}`}
                        >
                          <div
                            className={`
                            bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-6 
                            border border-[var(--callout-border)] 
                            hover:bg-[var(--callout-bg)] 
                            hover:border-[var(--bronzer)]/40
                            transform hover:scale-[1.02] transition-all duration-500 ease-out
                            shadow-lg hover:shadow-2xl hover:shadow-[var(--bronzer)]/20
                          `}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <h3 className="text-lg font-semibold text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors duration-300 leading-snug">
                                {post.metadata.title}
                              </h3>
                              {showPublicationYear && (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--bronzer)]/20 text-[var(--bronzer)] border border-[var(--bronzer)]/30 backdrop-blur-sm">
                                    {formatDate(
                                      post.metadata.publishedAt,
                                      false
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

                            {post.metadata.tags &&
                              post.metadata.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {post.metadata.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--pill-color)] text-[var(--text-p)] border border-[var(--callout-border)]"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {post.metadata.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--pill-color)]/50 text-[var(--text-p)]/70">
                                      +{post.metadata.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
                .reverse()
            : sortedPosts.map((post) => (
                <Link
                  key={post.slug}
                  className="group block"
                  href={`/blog/${post.slug}`}
                >
                  <div
                    className={`
                    bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-6 
                    border border-[var(--callout-border)] 
                    hover:bg-[var(--callout-bg)] 
                    hover:border-[var(--bronzer)]/40
                    transform hover:scale-[1.02] transition-all duration-500 ease-out
                    shadow-lg hover:shadow-2xl hover:shadow-[var(--bronzer)]/20
                    ${showBorders ? "mb-4" : "mb-3"}
                  `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-lg font-semibold text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors duration-300 leading-snug">
                        {post.metadata.title}
                      </h3>
                      {showPublicationYear && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--bronzer)]/20 text-[var(--bronzer)] border border-[var(--bronzer)]/30 backdrop-blur-sm">
                            {formatDate(post.metadata.publishedAt, false)}
                          </span>
                        </div>
                      )}
                    </div>

                    {post.metadata.tags && post.metadata.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.metadata.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--pill-color)] text-[var(--text-p)] border border-[var(--callout-border)]"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.metadata.tags.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--pill-color)]/50 text-[var(--text-p)]/70">
                            +{post.metadata.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
        </div>
      )}
    </div>
  );
}

export function BlogPosts(
  props: Omit<BlogPostsProps, "initialPosts" | "initialTags">
) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog-posts");
        const data = await response.json();
        setPosts(data.posts);
        setTags(data.tags);
      } catch (error) {}
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
