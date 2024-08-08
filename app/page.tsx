import Image from "next/image";
import displayImage from "../contents/images/somritdasgupta.jpg";
import { BlogPosts } from "./components/posts";
import Button from "./components/Button";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";

export default function Page() {
  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Text Section */}
        <div className="flex flex-col justify-center lg:pr-8 -ml-[16px]">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">
            hey, I'm Somrit 👋
          </h1>
          <p className="mb-8 tracking-tight">
            I am a person who loves to use technology and build something based
            on technology. Currently, I am learning more about docker and cloud
            technologies using generative AI. Though I hold a bachelor's in
            computer science & engineering, outside of coding, I'm a fan of
            football, to be specific an avid real madrid fanboy. Also, who
            doesn't love good jokes and memes?
          </p>
        </div>

        {/* Display Picture */}
        <div className="mb-4 relative flex items-center justify-center lg:justify-end">
          <div className="relative">
            <div className="w-[220px] h-[220px] border-3.5 border-yellow-600 rounded-full flex items-center justify-center image-container">
              <Image
                src={displayImage}
                alt="Somrit Dasgupta"
                width={205}
                height={205}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="mb-4 my-6 -ml-[16px]">
        <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center">
          Recent posts{" "}
          <ArrowTrendingUpIcon className="w-5 h-5 mb-1 mx-2 my-2 dark:text-color transition-colors" />
        </h2>
        <BlogPosts limit={4} showTags={false} />{" "}
        {/* Shows only my 4 recent blog posts */}
        <Button href="/blog" text="Read more" icon="right" />
      </div>
    </section>
  );
}
