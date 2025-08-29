import { getBlogPosts } from "./blog/getBlogPosts";
import { baseUrl } from "./lib/constants";

export default async function sitemap() {
  try {
    // Get blog posts directly instead of fetching from API
    const blogPosts = await getBlogPosts();

    // Generate sitemap URLs for blog posts
    const blogs = blogPosts.map(
      (post: { slug: string; metadata: { publishedAt: string } }) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.metadata.publishedAt,
        priority: 0.6,
        changefreq: "monthly",
      })
    );

    // Generate sitemap URLs for static routes
    const routes = ["/", "/blog", "/projects"].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString().split("T")[0],
      priority: route === "/" ? 1.0 : 0.7,
      changefreq: route === "/" ? "daily" : "weekly",
    }));

    return [...routes, ...blogs];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [];
  }
}
