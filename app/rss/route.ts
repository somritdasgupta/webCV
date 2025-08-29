import { getBlogPosts } from "app/blog/getBlogPosts";
import { baseUrl } from "app/lib/constants";
import MarkdownIt from "markdown-it"; // Added Markdown parser

// Initialize Markdown parser
const markdownParser = new MarkdownIt();

interface Metadata {
  publishedAt: string;
  title: string;
  summary?: string;
  category?: string;
  author?: string;
  image?: string;
  enclosure?: {
    url: string;
    length: number;
    type: string;
  };
  tags?: string[];
}

interface Post {
  metadata: Metadata;
  slug: string;
  content?: string;
}

export async function GET() {
  let allBlogs: Post[] = await getBlogPosts();

  // Generate RSS Feed
  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Somrit Dasgupta</title>
      <link>${baseUrl}</link>
      <description>Recent Content on Somrit Dasgupta's Blog</description>
      <language>en-us</language>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <ttl>1440</ttl>
      <atom:link href="https://somrit.vercel.app/rss" rel="self" type="application/rss+xml" />
      <copyright>© ${new Date().getFullYear()} Somrit Dasgupta</copyright>
      <generator>Somrit Dasgupta's RSS Generator</generator>
      ${allBlogs
        .sort(
          (a, b) =>
            new Date(b.metadata.publishedAt).getTime() -
            new Date(a.metadata.publishedAt).getTime()
        )
        .map((post) => {
          const title = escapeXml(post.metadata.title);
          const link = `${baseUrl}/blog/${post.slug}`;
          const description = escapeXml(post.metadata.summary || "");
          const pubDate = new Date(post.metadata.publishedAt).toUTCString();
          const guid = `${baseUrl}/blog/${post.slug}`;
          const category = post.metadata.category
            ? `<category>${escapeXml(post.metadata.category)}</category>`
            : "";
          const author = post.metadata.author
            ? `<dc:creator>${escapeXml(post.metadata.author)}</dc:creator>`
            : "";
          const content = post.content
            ? `<content:encoded><![CDATA[${markdownParser.render(post.content)}]]></content:encoded>`
            : ""; // Convert Markdown to HTML
          const image = post.metadata.image
            ? `<media:thumbnail url="${escapeXml(post.metadata.image)}" />`
            : "";
          const enclosure = post.metadata.enclosure
            ? `<enclosure url="${escapeXml(
                post.metadata.enclosure.url
              )}" length="${post.metadata.enclosure.length}" type="${escapeXml(
                post.metadata.enclosure.type
              )}" />`
            : "";
          const tags = post.metadata.tags
            ? post.metadata.tags
                .map((tag) => `<category>${escapeXml(tag)}</category>`)
                .join("")
            : ""; // Tags

          return `<item>
            <title>${title}</title>
            <link>${link}</link>
            <description>${description}</description>
            <pubDate>${pubDate}</pubDate>
            <guid>${guid}</guid>
            ${category}
            ${author}
            ${tags}
            ${content}
            ${image}
            ${enclosure}
          </item>`;
        })
        .join("")}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

// Utility function to escape XML special characters
function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
