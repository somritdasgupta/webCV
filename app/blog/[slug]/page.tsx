import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate } from "app/blog/utils";
import Button from "app/components/Button";
import dynamic from "next/dynamic";
import Signature from "app/components/signature";
import { getBlogPosts } from "../getBlogPosts";
import RelatedPosts from "app/components/RelatedPosts"; // Update this path if necessary

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://somrit.vercel.app";

// Dynamically import components with client-side rendering
const FootnoteProvider = dynamic(
  () =>
    import("../../components/FootnoteContext").then(
      (mod) => mod.FootnoteProvider
    ),
  { ssr: false }
);
const Footnote = dynamic(
  () => import("../../components/Footnote").then((mod) => mod.Footnote),
  { ssr: false }
);
const FootnoteList = dynamic(
  () => import("../../components/FootnoteList").then((mod) => mod.FootnoteList),
  { ssr: false }
);

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
    : `${baseUrl}/api/og?title=${encodeURIComponent(title)}`;

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
          url: ogImageUrl,
          width: 2400,
          height: 1260,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
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
    <section>
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
      <h1 className="title font-bold text-2xl">{post.metadata.title}</h1>
      <div className="flex justify-between items-center mt-2 mb-4 ml-0.5 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      {post.metadata.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.metadata.tags.map((tag) => (
            <span key={tag} className="custom-topic-pill">
              {tag}
            </span>
          ))}
        </div>
      )}
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
      <RelatedPosts
        currentPostTags={post.metadata.tags || []}
        allPosts={posts}
        currentPostSlug={post.slug}
      />
      <Signature />
    </section>
  );
}
