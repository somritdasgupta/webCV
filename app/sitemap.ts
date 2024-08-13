export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "";

export default async function sitemap() {
  try {
    const response = await fetch(`${baseUrl}/api/blog-posts`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract posts from the response
    const blogPosts = data.posts;

    // Ensure blogPosts is an array
    if (!Array.isArray(blogPosts)) {
      console.error("Fetched blog posts is not an array:", blogPosts);
      return [];
    }

    // Generate sitemap URLs for blog posts
    const blogs = blogPosts.map(
      (post: { slug: string; metadata: { publishedAt: string } }) => ({
        url: `${baseUrl}/${post.slug.replace(/^\//, "")}`,
        lastModified: post.metadata.publishedAt,
        priority: 0.6,
        changefreq: "monthly",
      })
    );

    // Generate sitemap URLs for static routes
    const routes = ["/", "/blog", "/projects"].map((route) => ({
      url: `${baseUrl}${route.replace(/\/$/, "")}`,
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
