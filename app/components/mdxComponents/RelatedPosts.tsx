import React from "react";
import Link from "next/link";
import { TiFlash } from "react-icons/ti";

interface RelatedPost {
  metadata: {
    title: string;
    tags?: string[];
  };
  slug: string;
}

interface RelatedPostsProps {
  currentPostTags: string[];
  allPosts: RelatedPost[];
  currentPostSlug: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

const RelatedPosts: React.FC<RelatedPostsProps> = ({
  currentPostTags,
  allPosts,
  currentPostSlug,
}) => {
  const relatedPosts = allPosts
    .filter(
      (post) =>
        post.slug !== currentPostSlug &&
        post.metadata.tags?.some((tag) => currentPostTags.includes(tag))
    )
    .slice(0, 3);

  const shuffledRelatedPosts = shuffleArray(relatedPosts);

  if (shuffledRelatedPosts.length === 0) {
    const otherPosts = allPosts.filter((post) => post.slug !== currentPostSlug);
    const randomPost =
      otherPosts[Math.floor(Math.random() * otherPosts.length)];

    if (randomPost) {
      return (
        <div className="mb-8 pt-4">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-[var(--text-color)]">
            Other posts
            <TiFlash className="w-6 h-6 ml-2 text-[var(--bronzer)] mt-0.5" />
          </h2>
          <Link
            href={`/blog/${randomPost.slug}`}
            className="block mb-0 text-[var(--text-color)] hover:bg-[var(--bronzer)]/10 rounded-lg transition-colors duration-300"
          >
            <div className="bg-[var(--post-title-bg)] border border-[var(--post-title-border)] text-[var(--post-title-color)] backdrop-blur-md rounded-lg p-3 text-base">
              {randomPost.metadata.title}
            </div>
          </Link>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="mb-8 pt-4">
      <h2 className="text-2xl font-semibold mb-4 flex items-center text-[var(--text-color)]">
        Related posts
        <TiFlash className="w-6 h-6 ml-1 text-[var(--bronzer)] mt-1 animate-pulse" />
      </h2>
      <div className="space-y-4">
        {shuffledRelatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block mb-0 text-[var(--text-color)] hover:bg-[var(--bronzer)]/10 rounded-lg transition-colors duration-300"
          >
            <div className="bg-[var(--post-title-bg)] border border-[var(--post-title-border)] text-[var(--post-title-color)] backdrop-blur-md rounded-lg p-3 text-base">
              {post.metadata.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
