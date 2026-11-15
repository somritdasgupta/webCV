import { defineMcp } from "@lovable.dev/mcp-js";
import authorInfo from "./tools/get-author-info";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import getGithubActivity from "./tools/get-github-activity";
import getRepos from "./tools/get-repos";

export default defineMcp({
  name: "somrit-webcv-mcp",
  title: "Somrit Dasgupta — Personal Site",
  version: "0.1.0",
  instructions:
    "Tools for exploring Somrit Dasgupta's personal site (somritdasgupta.in): read published blog posts, look up the author's bio and links, and inspect public GitHub activity and repositories. All data is public — no authentication required.",
  tools: [authorInfo, listBlogPosts, getBlogPost, getGithubActivity, getRepos],
});
