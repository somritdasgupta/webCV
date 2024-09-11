"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPosts } from "./components/posts";
import Button from "./components/Button";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { TbBrandGithub } from "react-icons/tb";
import { RiVerifiedBadgeLine } from "react-icons/ri";

export default function Home() {
  const [featuredProject, setFeaturedProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProject = async () => {
      try {
        const response = await fetch("/api/github", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            featuredId: 818561625,
            includeDescription: true,
            includeTopics: false,
            includeName: true,
            includeHtmlUrl: true,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setFeaturedProject(data);
        } else {
          setError(data.error || "Failed to fetch featured project");
        }
      } catch (err) {
        setError("Failed to fetch featured project");
      }
    };

    fetchFeaturedProject();
  }, []);

  return (
    <div className="min-h-screen w-full py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 blur-3xl rounded-full opacity-25 transition-colors duration-1000 animate-tilt"></div>
            <Image
              src="/somritdasgupta.jpg"
              alt="Photo of Somrit Dasgupta"
              width={220}
              height={220}
              className="relative rounded-full border-3 border-[var(--bronzer)]/70"
              priority
            />
          </div>
          <h1 className="mt-8 text-[var(--text-p)] text-4xl sm:text-5xl font-black tracking-tight">
            <span className="relative block overflow-hidden group h-[1.1em] w-[100vw]">
              {" "}
              <span className="block transition-tranform duration-500 ease group-hover:translate-y-[-120%]">
                hey, I'm Somrit
              </span>
              <span className="block absolute inset-0 transition-transform duration-500 ease translate-y-full group-hover:translate-y-0">
                @somritdasgupta
              </span>
            </span>
          </h1>
          <div className="mt-4 text-lg sm:text-xl max-w-5xl w-full">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300 whitespace-normal break-words">
              I'm an{" "}
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                engineer
              </span>
              , and likes to{" "}
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                experiment
              </span>{" "}
              with newer technologies. I initially developed an interest on
              web-development while working on my projects, also integrating it's
              backend solutions. But recently, I've been exploring how
              generative AI can{" "}
              <Link
                href="/blog/developers-copilot"
                className="underline decoration-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                simplify
              </Link>{" "}
              development tasks, especially with RAG (Retrieval-Augmented
              Generation) and it seems pretty amazing.
            </p>
            <p className="mt-6 leading-relaxed text-gray-700 dark:text-gray-300 whitespace-normal break-words">
              I earned a{" "}
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                b.tech
              </span>{" "}
              in computer science & engineering which further pushed my
              interest. Besides, I'm a fan of football—specifically, an
              avid{" "}
              <Link
                href="https://youtu.be/Yc-7IQqcqeM?si=NlGyQFjCBYPeMnUU&t=9"
                className="underline decoration-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                real madrid
              </Link>{" "}
              fanboy. Also, who doesn't love good jokes and{" "}
              <Link
                href="https://www.reddit.com/r/memes/"
                className="underline decoration-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                memes
              </Link>
              ?
            </p>
            <p className="mt-6 leading-relaxed font-semibold whitespace-normal break-words">
              Here is my personal website, so feel free to check it out ❤️
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          <h2 className="text-2xl text-[var(--text-p)] sm:text-3xl font-extrabold text-center  flex items-center justify-center">
            Highlights
            <RiVerifiedBadgeLine className="w-6 h-6 ml-2 text-[var(--bronzer)] animate-pulse" />
          </h2>
          <div className="bg-white/10 dark:bg-gray-500/5 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-gray-200/20 dark:border-gray-700/20">
            {error && <p className="text-red-500">{error}</p>}
            {featuredProject ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {featuredProject.name}
                </h3>
                <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
                  {featuredProject.description}
                </p>
                <a
                  href={featuredProject.html_url}
                  className="font-black hover:text-[var(--bronzer)] inline-flex items-center"
                >
                  <TbBrandGithub className="w-4 h-4 mr-1" />
                  Github
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="space-y-4">
          <h2 className="text-2xl text-[var(--text-p)] sm:text-3xl font-extrabold text-center flex items-center justify-center">
            Recent Posts
            <HiArrowTrendingUp className="w-6 h-6 ml-2 text-[var(--bronzer)] animate-pulse" />
          </h2>
          <div className="text-md sm:text-lg bg-white/10 dark:bg-gray-500/5 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-gray-200/20 dark:border-gray-700/20">
            <BlogPosts
              limit={3}
              showTags={false}
              showBorders={true}
              showPublicationYear={true}
            />
            <div className="mt-8 -mb-4 flex font-black">
              <Button href="/blog" text="View All Posts" icon="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
