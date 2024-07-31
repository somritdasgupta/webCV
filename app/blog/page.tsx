import { BlogPosts } from "app/components/posts";

export const metadata = {
  title: "Blog",
  description: "Somrit's Blog.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-bold text-3xl mb-4 tracking-tight">My Blog</h1>
      <BlogPosts />
    </section>
  );
}
