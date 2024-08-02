import { NextResponse } from 'next/server';
import { getBlogPosts } from '../../blog/utils';

export async function GET() {
  const posts = await getBlogPosts();
  return NextResponse.json(posts);
}
