"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowTrendingUpIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { BlogPosts } from "./components/posts";
import Button from "./components/Button";
import displayImage from "../public/somritdasgupta.jpg";

export default function Page() {
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
    <section className="py-4 lg:py-6">
      <div className="flex flex-col lg:flex-row lg:gap-24 items-start">
        {/* Profile Section */}
        <div className="flex-none lg:w-1/4 flex flex-col items-center lg:items-start">
          <div className="relative mb-12 bg-transparent">
            <Image
              src={displayImage}
              alt="Somrit Dasgupta"
              width={220}
              height={220}
              className="rounded-full shadow-lg"
            />
          </div>
          <div className="w-full mb-8 lg:hidden">
            <h1 className="text-3xl font-bold mb-8 tracking-tight text-center lg:text-left">
              hey, I'm Somrit 👋
            </h1>
            <p className="text-gray-300 mt-4 mb-4 tracking-tight">
              I’m an engineer and likes to work and experiment with modern
              technologies. I have experience with frontend development as well
              as integrating the backend solutions. I’m also experimenting on
              how generative AI can simplify development tasks, especially with
              RAG (Retrieval-Augmented Generation) and till now it seems pretty
              promising.
            </p>
            <p className="text-gray-300 tracking-tight">
              Though I hold a bachelor's in computer science & engineering,
              outside of all technical stuffs, I'm a fan of football, to be
              specific an avid real madrid fanboy. Also, who doesn't love good
              jokes and memes?
            </p>
          </div>

          <div className="w-full mb-4">
            <h2 className="text-xl font-bold mb-4 lg:text-center">
              Featured Project ✦
            </h2>
            {error && <p className="text-red-500">{error}</p>}
            {featuredProject ? (
              <div className="border-2 border-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-semibold mb-2">
                  {featuredProject.name}
                </h3>
                {featuredProject.description && (
                  <p className="text-xs text-gray-400 mb-4">
                    {featuredProject.description}
                  </p>
                )}
                <a
                  href={featuredProject.html_url}
                  className="font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center"
                >
                  Github
                  <CommandLineIcon className="w-4 h-4 ml-1" />
                </a>
                {featuredProject.topics && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {featuredProject.topics.map(
                      (topic: string, index: number) => (
                        <span key={index} className="custom-topic-pill">
                          {topic}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 mb-2 lg:text-center">
                Doing the heavy lifting 🚀
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 lg:w-4/5">
          <div className="w-full mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold mb-4 tracking-tight text-center lg:text-left">
              hey, I'm Somrit 👋
            </h1>
            <p className="text-gray-300 mb-4">
              I’m an engineer and likes to work and experiment with modern
              technologies. I have experience with frontend development as well
              as integrating the backend solutions. I’m also experimenting on
              how generative AI can simplify development tasks, especially with
              RAG (Retrieval-Augmented Generation) and till now it seems pretty
              promising.
            </p>
            <p className="text-gray-300">
              Though I hold a bachelor's in computer science & engineering,
              outside of all technical stuffs, I'm a fan of football, to be
              specific an avid real madrid fanboy. Also, who doesn't love good
              jokes and memes?
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2 lg:mb-2 flex items-center">
              Recent Posts
              <ArrowTrendingUpIcon className="w-6 h-6 ml-2 text-neutral-500" />
            </h2>
            <BlogPosts limit={3} showTags={false} />
            <div className="mt-6">
              <Button href="/blog" text="View All Posts" icon="right" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
