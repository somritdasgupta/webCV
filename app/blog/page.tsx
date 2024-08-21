import React, { Suspense } from "react";
import { BlogPosts } from "app/components/posts";

export const metadata = {
  title: "Somrit Dasgupta's Blog - Thoughts on Software, AI, and More",
  description: 'Grab a cup of coffee and read my thoughts on software development, technology, and more.',
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
