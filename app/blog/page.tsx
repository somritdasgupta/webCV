import React from "react";
import { BlogPosts } from "app/components/posts";
import { RiArrowRightUpLine } from "react-icons/ri";
import { SearchFilter } from "../components/SearchFilter";

export const revalidate = 3600;

export const metadata = {
  title: "Blog - Somrit Dasgupta",
  description:
    "Technical blog covering software development, web technologies, AI/ML, cloud computing, and programming insights. Stay updated with the latest tech trends and tutorials.",
  openGraph: {
    title: "Blog - Somrit Dasgupta",
    description: "Technical blog covering software development, web technologies, AI/ML, and programming insights.",
    type: "website",
  },
};

const FeedLinks = () => (
  <div className="flex space-x-2 ml-4 mt-2 text-xs">
    <a
      href="/rss"
      className="flex items-center font-medium text-violet-400 hover:scale-105 transition-all duration-300 ease"
    >
      <RiArrowRightUpLine className="animate-pulse" />
      <span>RSS</span>
    </a>
    <a
      href="/json"
      className="flex items-center font-medium text-violet-400 hover:scale-105 transition-all duration-300 ease"
    >
      <RiArrowRightUpLine className="animate-pulse" />
      <span>JSON</span>
    </a>
  </div>
);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Somrit Dasgupta's Blog",
            description: "Technical blog covering software development, web technologies, AI/ML, and programming insights",
            author: {
              "@type": "Person",
              name: "Somrit Dasgupta",
            },
          }),
        }}
      />
      <section>
      <div className="flex items-center mb-4">
        <h1 className="bg-color font-extrabold text-3xl tracking-tight">
          read my blog
        </h1>
        <FeedLinks />
      </div>

      <p className="mt-4 !text-[var(--text-p)]/80 mb-4">
        This is the place where I share my insights and opinions on software
        technology, technical events, analysis and more. Grab your coffee and
        explore the posts that I've written over time and I hope you find them
        interesting.{" "}
      </p>

      <div className="mb-6">
        <SearchFilter />
      </div>

      <BlogPosts
        showTags={true}
        showBorders={false}
        showPublicationYear={true}
        groupByYear={true}
      />
    </section>
    </>
  );
}
