import Link from 'next/link';
import { formatDate, getBlogPosts } from 'app/blog/utils';

interface BlogPostsProps {
  limit?: number;
}

export function BlogPosts({ limit = Infinity }: BlogPostsProps) {
  const allBlogs = getBlogPosts();

  if (allBlogs.length === 0) {
    return <p>Waiting for the first blog post to hit.</p>;
  }

  const sortedBlogs = allBlogs
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
    .slice(0, limit); // Limits the number of posts, incase I implement pagination in future

  return (
    <div>
      {sortedBlogs.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4"
          href={`/blog/${post.slug}`}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
            <p className="font-semibold light-text-color dark:light-text-color w-[140px] tabular-nums">
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
