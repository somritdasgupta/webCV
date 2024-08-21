import React, { Suspense } from "react";
import { BlogPosts } from "app/components/posts";

export const metadata = {
  title: "Blog",
  description: 'Grab a cup of coffee and read my thoughts that I write about software industries, technologies, and more.',
};

export default function Page() {
  return (
    <section>
      <h1 className="bg-color font-semibold text-3xl mb-4 tracking-tight">
        read my blog
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
