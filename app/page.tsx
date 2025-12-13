"use client";

import { BlogPosts } from "./components/posts";
import Button from "./components/Button";
import BoxLoader from "./components/BoxLoader";
import HeroContent from "./components/HeroContent";
import SectionHeader from "./components/SectionHeader";
import ProjectCard from "./components/ProjectCard";
import BookmarksPreview from "./components/BookmarksPreview";
import { useFeaturedProject } from "./hooks/useFeaturedProject";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { HiArrowTrendingUp, HiOutlineBookmark } from "react-icons/hi2";

export default function Home() {
  const { featuredProject, error, loading } = useFeaturedProject();

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <div className="min-h-[40vh] lg:min-h-screen flex items-center justify-center py-6 lg:py-0">
        <HeroContent />
      </div>

      {/* Content Sections */}
      <div className="space-y-6 lg:space-y-24 py-2 lg:py-16">
        {/* Featured Project Section */}
        <div className="space-y-4 lg:space-y-8">
          <SectionHeader
            title="highlights"
            icon={
              <RiVerifiedBadgeLine className="inline w-8 h-8 ml-2 text-[var(--bronzer)]" />
            }
          />

          <div className="relative rounded-2xl border border-[var(--callout-border)] bg-gradient-to-br from-[var(--callout-bg)] to-transparent p-6 lg:p-8">
            {error && (
              <div className="text-center p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-[var(--text-p)]">
                  Check out my{" "}
                  <a
                    href="https://github.com/somritdasgupta"
                    className="text-[var(--bronzer)] hover:text-[var(--bronzer)]/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub profile
                  </a>{" "}
                  for all my projects.
                </p>
              </div>
            )}

            {featuredProject ? (
              <ProjectCard project={featuredProject} />
            ) : (
              <BoxLoader />
            )}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div className="space-y-4 lg:space-y-8">
          <SectionHeader
            title="recent"
            icon={
              <HiArrowTrendingUp className="inline w-8 h-8 ml-2 text-[var(--bronzer)]" />
            }
          />

          <div>
            <BlogPosts
              limit={3}
              showTags={false}
              showBorders={true}
              showPublicationYear={true}
            />
            <div className="mt-12 text-center">
              <Button href="/blog" text="Explore All Posts" icon="right" />
            </div>
          </div>
        </div>

        {/* Bookmarks Preview Section */}
        <div className="space-y-4 lg:space-y-8 pb-8 lg:pb-16">
          <SectionHeader
            title="bookmarked"
            icon={
              <HiOutlineBookmark className="inline w-8 h-8 ml-2 text-[var(--bronzer)]" />
            }
          />

          <div>
            <BookmarksPreview />
            <div className="mt-8 text-center">
              <Button
                href="/bookmarks"
                text="View All Bookmarks"
                icon="right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
