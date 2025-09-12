import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate } from "app/blog/utils";
import Button from "app/components/Button";
import { getBlogPosts } from "../getBlogPosts";
import RelatedPosts from "app/components/mdxComponents/RelatedPosts";
import Link from "next/link";
import Signature from "app/components/mdxComponents/Signature";
import { BlogHeader } from "app/components/mdxComponents/BlogHeader";
import { ReadingProgress } from "app/components/ReadingProgress";
import { ShareButtons } from "app/components/ShareButtons";
import { AuthorInfo } from "app/components/AuthorInfo";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://somrit.vercel.app";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const posts = await getBlogPosts();
  const post = posts.find((post) => post.slug === params.slug);
  if (!post) {
    return {};
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  const ogImageUrl = image
    ? `${baseUrl}${image}`
    : `${baseUrl}/api/og?title=${encodeURIComponent(
        title
      )}&date=${encodeURIComponent(publishedTime || "")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Somrit Dasgupta",
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          type: "image/png",
          width: 630,
          height: 630,
          url: ogImageUrl,
          alt: title,
        },
      ],
    },
  };
}

export default async function Blog({ params }: { params: { slug: string } }) {
  const posts = await getBlogPosts();
  const post = posts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const currentUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <article className="min-h-screen">
      <ReadingProgress />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `${baseUrl}/og?title=${encodeURIComponent(
                  post.metadata.title
                )}`,
            url: currentUrl,
            author: {
              "@type": "Person",
              name: "Somrit Dasgupta",
            },
          }),
        }}
      />

      {/* Navigation - Mobile vs Desktop */}
      <div className="mb-8">
        {/* Mobile Navigation */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/blog"
              className="p-2 rounded-lg hover:bg-[var(--nav-pill)] transition-colors duration-200 text-[var(--text-p)] hover:text-[var(--bronzer)] flex items-center justify-center"
              title="Back to posts"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>

            {post.metadata.tags && (
              <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                {post.metadata.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-1 rounded border text-[var(--text-p)] border-[var(--callout-border)] hover:border-[var(--bronzer)] transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:block">
          <Button href="/blog" text="Back to posts" icon="left" />
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-12">
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[var(--text-p)]">
            {post.metadata.title}
          </h1>

          {post.metadata.summary && (
            <p className="text-lg md:text-xl text-[var(--text-p)]/70 leading-relaxed">
              {post.metadata.summary}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-col gap-4 pt-4 border-t border-[var(--callout-border)]/30">
            {/* Mobile: Date and Author side by side */}
            <div className="flex items-center justify-between sm:hidden">
              <time className="text-sm font-medium text-[var(--bronzer)]">
                {formatDate(post.metadata.publishedAt)}
              </time>
              <AuthorInfo />
            </div>

            {/* Desktop: Date, Author, and Tags */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <time className="text-sm font-medium text-[var(--bronzer)]">
                  {formatDate(post.metadata.publishedAt)}
                </time>
                <AuthorInfo />
              </div>

              {post.metadata.tags && (
                <div className="flex flex-wrap gap-2">
                  {post.metadata.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-xs px-2 py-1 rounded border text-[var(--text-p)] border-[var(--callout-border)] hover:border-[var(--bronzer)] transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Blog Header Visual */}
      <div className="mb-12">
        <BlogHeader />
      </div>

      {/* Article Content */}
      <main>
        <div
          className="prose prose-lg md:prose-xl max-w-none 
                        prose-headings:text-[var(--text-p)] 
                        prose-headings:tracking-tight
                        prose-p:text-[var(--text-p)]/85 
                        prose-p:leading-relaxed
                        prose-p:text-base md:prose-p:text-lg
                        prose-a:text-[var(--bronzer)] 
                        prose-a:decoration-2 
                        prose-a:underline-offset-4
                        prose-strong:text-[var(--text-p)]
                        prose-code:text-[var(--bronzer)]
                        prose-code:bg-[var(--callout-border)]/20
                        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-blockquote:border-l-[var(--bronzer)]
                        prose-blockquote:text-[var(--text-p)]/80
                        prose-ul:text-[var(--text-p)]/85
                        prose-ol:text-[var(--text-p)]/85
                        prose-li:text-base md:prose-li:text-lg
                        prose-li:leading-relaxed
                        prose-img:rounded-xl prose-img:shadow-lg
                        prose-hr:border-[var(--callout-border)]"
        >
          <CustomMDX source={post.content} />
        </div>
      </main>

      {/* Article Footer */}
      <footer className="mt-16 pt-8 border-t border-[var(--callout-border)]">
        <div className="mb-8">
          <ShareButtons
            title={post.metadata.title}
            url={currentUrl}
            slug={post.slug}
          />
        </div>

        <RelatedPosts
          currentPostTags={post.metadata.tags || []}
          allPosts={posts}
          currentPostSlug={post.slug}
        />

        <div className="mt-12">
          <Signature />
        </div>
      </footer>
    </article>
  );
}
