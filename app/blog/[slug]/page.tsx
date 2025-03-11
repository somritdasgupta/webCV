import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate } from "app/blog/utils";
import Button from "app/components/Button";
import { getBlogPosts } from "../getBlogPosts";
import RelatedPosts from "app/components/mdxComponents/RelatedPosts";
import Link from "next/link";
import Signature from "app/components/mdxComponents/Signature";
import { BlogHeader } from "app/components/mdxComponents/BlogHeader";

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

  return (
    <section className="py-2">
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
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Somrit Dasgupta",
            },
          }),
        }}
      />
      <Button href="/blog" text="Back to posts" icon="left" />
      <div>
        <h1 className="text-2xl font-semibold mb-2 lg:text-3xl">
          {post.metadata.title}
        </h1>
        <div className="flex justify-between items-center mt-2 mb-4 text-sm font-medium">
          <p className="!text-[var(--bronzer)]">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </div>
        {post.metadata.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
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
        <BlogHeader />
        <article className="prose max-w-none">
          <CustomMDX source={post.content} />
        </article>
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
