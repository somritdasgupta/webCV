import { BlogPosts } from "app/components/posts";
import { Metadata } from "next";
import { baseUrl } from "../sitemap";

export const metadata: Metadata = {
  title: "Blog / Somrit Dasgupta",
  description: "Read my thoughts on the blog I write on my website.",
  openGraph: {
    title: "Blog / Somrit Dasgupta",
    description: "Read my thoughts on the blog I write on my website.",
    siteName: "Somrit Dasgupta",
    url: `${baseUrl}/blog`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/api/og?title=${encodeURIComponent(
          "hey, I'm Somrit / Read my Blog"
        )}`,
        width: 2400,
        height: 1260,
        alt: "Blog / Somrit Dasgupta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog / Somrit Dasgupta",
    description: "Read my thoughts on the blog I write on my website.",
    images: [
      `${baseUrl}/api/og?title=${encodeURIComponent(
        "hey, I'm Somrit / Read my Blog"
      )}`,
    ],
  },
};

export default function Page() {
  return (
    <section>
      <h1 className="bg-color font-bold text-3xl mb-4 tracking-tight">
        My Blog
      </h1>
      <BlogPosts />
    </section>
  );
}