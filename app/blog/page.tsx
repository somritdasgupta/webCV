import React, { Suspense } from "react";
import { BlogPosts } from "app/components/posts";
import { Metadata } from "next";
import { baseUrl } from "../sitemap";

export const metadata: Metadata = {
  title: "Somrit's Blog - Thoughts on Software, AI, and More",
  description:
    "Welcome to my blog! Here, I share my thoughts and experiences with software development, AI, and technology. Grab a cup of coffee and read my thoughts.",
  openGraph: {
    title: "Somrit's Blog - Thoughts on Software, AI, and More",
    description:
      "Welcome to my blog! Here, I share my thoughts and experiences with software development, AI, and technology. Grab a cup of coffee and read my thoughts.",
    siteName: "Somrit Dasgupta",
    url: `${baseUrl}/blog`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/api/og?title=${encodeURIComponent("Somrit's Blog")}`,
        width: 2400,
        height: 1260,
        alt: "Somrit's Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Somrit's Blog - Thoughts on Software, AI, and More",
    description:
      "Welcome to my blog! Here, I share my thoughts and experiences with software development, AI, and technology. Grab a cup of coffee and read my thoughts.",
    images: [`${baseUrl}/api/og?title=${encodeURIComponent("Somrit's Blog")}`],
  },
};

export default function Page() {
  return (
    <section>
      <h1 className="bg-color font-bold text-3xl mb-4 tracking-tight">
        My Blog
      </h1>
      <Suspense fallback={<p>Brewing the posts 🚀</p>}>
        <BlogPosts
          showTags={true}
          showBorders={false}
          showPublicationYear={true}
          groupByYear={true}
        />
      </Suspense>
    </section>
  );
}
