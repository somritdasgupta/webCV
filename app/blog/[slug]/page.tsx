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
    <section className="py-2">
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
      <Button href="/blog" text="Back to posts" icon="left" />
      <div>
        <div className="mb-2">
          <h1 className="text-2xl font-semibold lg:text-3xl mb-3">
            {post.metadata.title}
          </h1>
          {post.metadata.tags && (
            <div className="flex flex-wrap gap-2 mb-4 md:hidden">
              {post.metadata.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="bg-[var(--pill-color)] hover:scale-105 custom-topic-pill text-sm transition-colors duration-300"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 mb-4 gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4 text-sm font-medium">
            <p className="!text-[var(--bronzer)]">
              {formatDate(post.metadata.publishedAt)}
            </p>
            <div className="hidden sm:block">
              <ShareButtons
                title={post.metadata.title}
                url={currentUrl}
                slug={post.slug}
              />
            </div>
            <div className="block sm:hidden">
              <AuthorInfo />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <AuthorInfo />
            </div>
            {post.metadata.tags && (
              <div className="hidden md:flex flex-wrap gap-2">
                {post.metadata.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="bg-[var(--pill-color)] hover:scale-105 custom-topic-pill text-sm transition-colors duration-300"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <BlogHeader />
        <article className="prose max-w-none">
          <CustomMDX source={post.content} />
        </article>

        <div className="mt-8 pt-4 border-t border-[var(--callout-border)]">
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
        <Signature />
      </div>
    </section>
  );
}
