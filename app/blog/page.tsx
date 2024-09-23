import React, { Suspense } from "react";
import { BlogPosts } from "app/components/posts";
import { RiArrowRightUpLine } from "react-icons/ri";

export const metadata = {
  title: "Blog",
  description:
    "Read my blog on software technology to technical events, analysis and more. Grab your coffee and see what catches your eye.",
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
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        }
      >
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
