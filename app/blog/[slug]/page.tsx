import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { formatDate, getBlogPosts } from 'app/blog/utils';
import Button from 'app/components/Button';
import dynamic from 'next/dynamic';
import Signature from 'app/components/signature';

// Ensure the base URL is correctly defined in your .env.local
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://somrit.vercel.app';

// Dynamically import components with client-side rendering
const FootnoteProvider = dynamic(() => import('../../components/FootnoteContext').then(mod => mod.FootnoteProvider), { ssr: false });
const Footnote = dynamic(() => import('../../components/Footnote').then(mod => mod.Footnote), { ssr: false });
const FootnoteList = dynamic(() => import('../../components/FootnoteList').then(mod => mod.FootnoteList), { ssr: false });


export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const posts = await getBlogPosts();
  const post = posts.find((post) => post.slug === params.slug);
  if (!post) {
    return {};
  }

  const { title, publishedAt: publishedTime, summary: description, image } = post.metadata;
  const ogImage = image ? image : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Somrit Dasgupta',
            },
          }),
        }}
      />
      <Button href="/blog" text="Back to posts" icon="left" />
      <h1 className="title font-bold text-3xl">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <FootnoteProvider>
        <article className="prose">
          <CustomMDX source={post.content} />
          {/* Ensure footnotes are properly added in the content */}
        </article>
      </FootnoteProvider>
      <Signature/>
      <Button href="/blog" text="Back to posts" icon="left" />
    </section>
  );
}
