// app/json/routes.ts
import { NextResponse } from "next/server";
import { baseUrl } from "app/sitemap";
import { getBlogPosts } from "app/blog/getBlogPosts";

interface Metadata {
  publishedAt: string;
  title: string;
  summary?: string;
  category?: string;
  author?: string;
  image?: string;
  enclosure?: {
    url: string;
    length: number;
    type: string;
  };
  tags?: string[];
}

interface Post {
  metadata: Metadata;
  slug: string;
  content?: string;
}

export async function GET() {
  let allBlogs: Post[] = await getBlogPosts();

  const jsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Somrit Dasgupta",
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/json`,
    language: "en-US",
    description: "Recent Content on Somrit Dasgupta's Blog",
    copyright: "© 2024 Somrit Dasgupta",
    updated: new Date().toISOString(),
    items: allBlogs
      .sort(
        (a, b) =>
          new Date(b.metadata.publishedAt).getTime() -
          new Date(a.metadata.publishedAt).getTime()
      )
      .map((post) => ({
        id: `${baseUrl}/blog/${post.slug}`,
        title: post.metadata.title,
        url: `${baseUrl}/blog/${post.slug}`,
        date_published: new Date(post.metadata.publishedAt).toISOString(),
        tags: post.metadata.tags || [], // Moved up
        content_text: post.content || "",
        content_html: post.content ? `<p>${post.content}</p>` : "",
        summary: post.metadata.summary || "",
        image: post.metadata.image,
        attachments: post.metadata.enclosure
          ? [
              {
                url: post.metadata.enclosure.url,
                mime_type: post.metadata.enclosure.type,
                size_in_bytes: post.metadata.enclosure.length,
              },
            ]
          : [],
        authors: post.metadata.author
          ? [{ name: post.metadata.author }]
          : undefined,
      })),
  };

  return NextResponse.json(jsonFeed, {
    headers: {
      "Content-Type": "application/feed+json",
    },
  });
}
