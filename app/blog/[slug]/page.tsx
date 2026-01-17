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
import ShimmerText from "app/components/ShimmerText";
import ScaleIntro from "app/components/ScaleIntro";
import ScrollToTop from "app/components/ScrollToTop";

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
    other: {
      "fediverse:creator": "@somritdasgupta@mastodon.social",
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
    <article className="min-h-screen w-full">
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
      <ScaleIntro className="mt-8 mb-12" delay={0}>
        {/* Navigation layout: back button left, tags right */}
        <div className="flex items-center justify-between gap-6">
          {/* Back button - styled to match tags */}
          <Link
            href="/blog"
            className="shrink-0 px-3 py-0.5 rounded-full bg-(--callout-bg) border border-(--callout-border) text-(--text-p) hover:border-(--bronzer) hover:bg-(--bronzer)/10 hover:text-(--bronzer) transition-all duration-200 flex items-center gap-1.5 group text-sm font-medium"
            title="Back to posts"
          >
            <svg
              className="w-2 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
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
                    className="shrink-0 text-xs px-3 py-1 rounded-full bg-(--callout-bg) border border-(--callout-border) text-(--text-p) hover:border-(--bronzer) hover:bg-(--bronzer)/10 hover:text-(--bronzer) transition-all duration-200 whitespace-nowrap font-medium"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScaleIntro>

      {/* Article Header */}
      <header className="mb-12">
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-(--text-p)">
            {post.metadata.title}
          </h1>

          {post.metadata.summary && (
            <p className="text-lg md:text-xl text-(--text-p)/70 leading-relaxed">
              {post.metadata.summary}
            </p>
          )}

          {/* Meta Information */}
          <ScaleIntro className="flex flex-col gap-4 pt-4 border-t border-(--callout-border)/30" delay={200}>
            {/* Mobile: Date and Author side by side */}
            <div className="flex items-center justify-between sm:hidden">
              <time className="text-sm font-medium text-(--bronzer)">
                {formatDate(post.metadata.publishedAt)}
              </time>
              <AuthorInfo />
            </div>

            {/* Desktop: Date and Author */}
            <div className="hidden sm:flex sm:items-center sm:gap-6">
              <time className="text-sm font-medium text-(--bronzer)">
                {formatDate(post.metadata.publishedAt)}
              </time>
              <AuthorInfo />
            </div>
          </ScaleIntro>
        </div>
      </header>

      {/* Blog Header Visual */}
      <ScaleIntro className="mb-12" delay={400}>
        <BlogHeader />
      </ScaleIntro>

      {/* Article Content */}
      <main>
        <div className="prose w-full">
          <CustomMDX source={post.content} />
        </div>
      </main>

      {/* Article Footer */}
      <footer className="mt-16 pt-8 border-t border-(--callout-border)">
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
