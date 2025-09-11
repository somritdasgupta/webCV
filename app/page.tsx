"use client";

import { BlogPosts } from "./components/posts";
import Button from "./components/Button";
import BoxLoader from "./components/BoxLoader";
import HeroContent from "./components/HeroContent";
import SectionHeader from "./components/SectionHeader";
import ProjectCard from "./components/ProjectCard";
import { useFeaturedProject } from "./hooks/useFeaturedProject";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { HiArrowTrendingUp } from "react-icons/hi2";

export default function Home() {
  const { featuredProject, error, loading } = useFeaturedProject();

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center px-6 sm:px-8 lg:px-12 py-8 lg:py-0">
        <div className="max-w-7xl mx-auto w-full">
          <HeroContent isMobile />
          <HeroContent />
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-16 py-16">
        {/* Featured Project Section */}
        <div className="space-y-8">
          <SectionHeader
            title="Highlights"
            icon={
              <RiVerifiedBadgeLine className="inline w-8 h-8 ml-2 text-[var(--bronzer)]" />
            }
          />

          <div className="border-l-4 border-[var(--callout-border)] pl-6 py-4">
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
        <div className="space-y-8 pb-16">
          <SectionHeader
            title="Recent Posts"
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
      </div>
    </div>
  );
}
