import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

interface BlogPostsProps {
  limit?: number;
}

export function BlogPosts({ limit = Infinity }: BlogPostsProps) {
  const allBlogs = getBlogPosts();

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .slice(0, limit) // Limit the number of posts
        .map((post) => (
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
