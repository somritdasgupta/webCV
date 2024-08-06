import React from 'react';
import Link from 'next/link';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

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

const RelatedPosts: React.FC<RelatedPostsProps> = ({ currentPostTags, allPosts, currentPostSlug }) => {
  // Filtering related posts based on my allocated tags
  const relatedPosts = allPosts
    .filter(post => 
      post.slug !== currentPostSlug && 
      post.metadata.tags?.some(tag => currentPostTags.includes(tag))
    )
    .slice(0, 3); // Limiting to 3 related posts

  // If no related posts are available, selecting a random post (excluding the current one)
  if (relatedPosts.length === 0) {
    const otherPosts = allPosts.filter(post => post.slug !== currentPostSlug);
    const randomPost = otherPosts[Math.floor(Math.random() * otherPosts.length)];

    if (randomPost) {
      return (
        <div className="mt-8 border-t border-gray-600 pt-4">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            Other posts
            <ArrowPathRoundedSquareIcon className="w-6 h-5 ml-1 mt-1" />
          </h2>
          <Link href={`/blog/${randomPost.slug}`} className="block mb-0">
            <div className="post-title-container">
              <div className="post-title-text">
                {randomPost.metadata.title}
              </div>
            </div>
          </Link>
        </div>
      );
    }

    return null; // Returns nothing if no other posts are available
  }

  return (
    <div className="mt-4 border-t border-neutral-600 pt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        Related posts
        <ArrowPathRoundedSquareIcon className="w-6 h-5 ml-1 mt-1" />
      </h2>
      <div className="space-y-4">
        {relatedPosts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block mb-0">
            <div className="post-title-container">
              <div className="post-title-text">
                {post.metadata.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
