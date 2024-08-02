export default async function sitemap() {
  try {
    const response = await fetch(`${baseUrl}/api/blog-posts`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
    }

    const blogPosts = await response.json();

    const blogs = blogPosts.map((post: { slug: string; metadata: { publishedAt: string } }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    }));

    const routes = ['', '/blog', '/projects'].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    }));

    return [...routes, ...blogs];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}

export const baseUrl = 'https://somrit.vercel.app';
