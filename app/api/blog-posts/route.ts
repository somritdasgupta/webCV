import { NextResponse } from "next/server";
import { getBlogPosts } from "../../blog/getBlogPosts";

// Revalidate every hour to ensure fresh content
export const revalidate = 3600;

// This handler will respond to GET requests to /api/blog-posts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tag = url.searchParams.get("tag");

  // Fetch all blog posts
  const posts = await getBlogPosts();

  // Filtering posts by the tag if it exists
  const filteredPosts = tag
    ? posts.filter((post) => post.metadata.tags?.includes(tag))
    : posts;

  // Getting all unique tags for the filtered posts
  const allTags = Array.from(
    new Set(filteredPosts.flatMap((post) => post.metadata.tags || []))
  );

  // Returns the filtered posts and tags as a JSON response
  return NextResponse.json({ posts: filteredPosts, tags: allTags });
}
