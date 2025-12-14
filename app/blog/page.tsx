import React, { Suspense } from "react";
import { BlogPosts } from "app/components/posts";
import { RiArrowRightUpLine } from "react-icons/ri";
import { SearchFilter } from "../components/SearchFilter";
import BoxLoader from "../components/BoxLoader";

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
      <Suspense fallback={<div className="flex justify-center py-8"><BoxLoader /></div>}>
        <SearchFilter />

        <BlogPosts
          showTags={true}
          showBorders={false}
          showPublicationYear={true}
          groupByYear={true}
        />
      </Suspense>
    </section>
    </>
  );
}
