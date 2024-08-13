import { NextResponse } from "next/server";
import { getBlogPosts } from "../../blog/getBlogPosts";

export async function GET() {
  const posts = await getBlogPosts();
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.metadata.tags || []))
  );
  return NextResponse.json({ posts, tags: allTags });
}
