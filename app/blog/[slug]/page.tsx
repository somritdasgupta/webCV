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

      {/* Navigation */}
      <div className="mt-8 mb-12">
        {/* Navigation layout: back button left, tags right */}
        <div className="flex items-center justify-between gap-6">
          {/* Back button - styled to match tags */}
          <Link
            href="/blog"
            className="flex-shrink-0 px-3 py-1.5 -ml-3 rounded-full bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] hover:border-[var(--bronzer)] hover:bg-[var(--bronzer)]/10 hover:text-[var(--bronzer)] transition-all duration-200 flex items-center gap-1.5 group text-sm font-medium"
            title="Back to posts"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
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
            <span>Back</span>
          </Link>

          {/* Tags - right aligned and scrollable */}
          {post.metadata.tags && (
            <div className="flex-1 overflow-hidden max-w-md">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 justify-end">
                {post.metadata.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] hover:border-[var(--bronzer)] hover:bg-[var(--bronzer)]/10 hover:text-[var(--bronzer)] transition-all duration-200 whitespace-nowrap font-medium"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
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

            {/* Desktop: Date and Author */}
            <div className="hidden sm:flex sm:items-center sm:gap-6">
              <time className="text-sm font-medium text-[var(--bronzer)]">
                {formatDate(post.metadata.publishedAt)}
              </time>
              <AuthorInfo />
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
