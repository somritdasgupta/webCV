import { NextRequest } from "next/server";
import { getBlogPosts } from "app/blog/getBlogPosts";
import { formatDate } from "app/blog/utils";
import { getGravatarUrl } from "app/lib/gravatar";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const theme = searchParams.get("theme") || "light";
  const orientation = searchParams.get("orientation") || "landscape";
  const width =
    searchParams.get("width") || (orientation === "landscape" ? "700" : "450");
  const height =
    searchParams.get("height") || (orientation === "landscape" ? "380" : "480");

  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }

  const posts = await getBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://somrit.vercel.app";
  const postUrl = `${baseUrl}/blog/${slug}`;

  // Get Gravatar URL - consistent for both themes - force actual Gravatar
  const gravatarUrl = getGravatarUrl(
    "thesomritdasgupta@gmail.com",
    64,
    "retro"
  );

  // Extract first paragraph or summary
  const summary =
    post.metadata.summary ||
    post.content
      .split("\n")
      .find((line) => line.trim().length > 50)
      ?.substring(0, 150) + "..." ||
    "Read this interesting blog post...";

  // Define theme colors - modern Vercel-like glassy design
  const colors =
    theme === "dark"
      ? {
          bg: "#000000",
          cardBg: "rgba(17, 17, 17, 0.8)",
          headerBg: "rgba(24, 24, 27, 0.8)",
          text: "#ffffff",
          textSecondary: "#a1a1aa",
          textMuted: "#71717a",
          border: "rgba(255, 255, 255, 0.1)",
          borderHover: "rgba(255, 255, 255, 0.2)",
          accent: "#0070f3",
          accentHover: "#0061d5",
          tagBg: "rgba(39, 39, 42, 0.8)",
          tagText: "#e4e4e7",
          gradient:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
        }
      : {
          bg: "#ffffff",
          cardBg: "rgba(255, 255, 255, 0.8)",
          headerBg: "rgba(248, 250, 252, 0.8)",
          text: "#0f172a",
          textSecondary: "#475569",
          textMuted: "#64748b",
          border: "rgba(0, 0, 0, 0.08)",
          borderHover: "rgba(0, 0, 0, 0.12)",
          accent: "#0070f3",
          accentHover: "#0061d5",
          tagBg: "rgba(241, 245, 249, 0.8)",
          tagText: "#475569",
          gradient:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
        };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metadata.title} - Embed</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      border-radius: 24px;
      overflow: hidden;
      background: ${colors.bg};
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      background: ${colors.bg};
      color: ${colors.text};
      margin: 0;
      padding: 0;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 24px;
    }
    
    .embed-card {
      width: ${width.includes("%") ? width : width + "px"};
      height: ${height}px;
      margin: 0;
      background: ${colors.cardBg};
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid ${colors.border};
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 
        0 0 0 1px rgba(255, 255, 255, 0.05),
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .embed-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${colors.bg};
      z-index: 0;
      border-radius: 24px;
    }
    
    .embed-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${colors.gradient};
      z-index: 1;
      border-radius: 24px;
    }
    
    .embed-card:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 20px 40px -10px rgba(0, 0, 0, 0.15),
        0 15px 20px -10px rgba(0, 0, 0, 0.1);
      border-color: ${colors.borderHover};
    }
    
    .card-header {
      background: ${colors.headerBg};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid ${colors.border};
      padding: ${orientation === "landscape" ? "20px 24px" : "24px"};
      position: relative;
      z-index: 3;
    }
    
    .author-section {
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      z-index: 1;
    }
    
    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid ${colors.border};
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .author-fallback {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${colors.gradient};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      color: white;
      border: 2px solid ${colors.border};
    }
    
    .author-info h4 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: ${colors.text};
      letter-spacing: -0.01em;
    }
    
    .author-info p {
      font-size: 14px;
      opacity: 0.8;
      margin: 0;
      color: ${colors.textSecondary};
      font-weight: 400;
      letter-spacing: 0.005em;
    }
    
    .card-content {
      padding: ${orientation === "landscape" ? "24px 28px" : "28px"};
      background: ${colors.cardBg};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      position: relative;
      z-index: 3;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .post-title {
      font-size: ${orientation === "landscape" ? "22px" : "24px"};
      font-weight: 700;
      margin-bottom: ${orientation === "landscape" ? "12px" : "16px"};
      color: ${colors.text};
      line-height: 1.3;
      letter-spacing: -0.025em;
      text-rendering: optimizeLegibility;
    }
    
    .post-summary {
      color: ${colors.textSecondary};
      font-size: ${orientation === "landscape" ? "15px" : "16px"};
      line-height: 1.6;
      margin-bottom: ${orientation === "landscape" ? "20px" : "24px"};
      font-weight: 400;
      letter-spacing: -0.01em;
    }
    
    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${orientation === "landscape" ? "18px" : "22px"};
      font-size: ${orientation === "landscape" ? "13px" : "14px"};
      color: ${colors.textMuted};
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    
    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .tag {
      background: ${colors.tagBg};
      color: ${colors.tagText};
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.025em;
      border: 1px solid ${colors.border};
      transition: all 0.2s ease;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .tag:hover {
      background: ${colors.accent};
      color: white;
      transform: translateY(-1px);
      border-color: ${colors.accent};
    }
    
    .read-more-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${colors.accent};
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .read-more-btn:hover {
      background: ${colors.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 112, 243, 0.3);
    }
    
    .read-more-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .read-more-btn:hover::before {
      left: 100%;
    }
    
    .read-more-btn:hover {
      background: ${colors.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 112, 243, 0.3);
    }
    
    .arrow {
      transition: transform 0.3s ease;
      font-weight: bold;
    }
    
    .read-more-btn:hover .arrow {
      transform: translateX(3px);
    }
    
    .powered-by {
      text-align: center;
      padding: 12px 20px;
      background: ${colors.headerBg};
      border-top: 1px solid ${colors.border};
      font-size: 11px;
      color: ${colors.textMuted};
      opacity: 0.8;
      font-weight: 500;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .powered-by a {
      color: ${colors.accent};
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s ease;
    }
    
    .powered-by a:hover {
      opacity: 0.8;
    }
    
    @media (max-width: 480px) {
      body {
        padding: 0;
      }
      
      .embed-card {
        border-radius: 24px;
        min-height: 100%;
      }
      
      .card-header {
        padding: 16px;
      }
      
      .card-content {
        padding: 20px;
      }
      
      .post-title {
        font-size: 20px;
      }
      
      .post-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .author-avatar, .author-fallback {
        width: 36px;
        height: 36px;
      }
    }
  </style>
</head>
<body>
  <div class="embed-card">
    <div class="card-header">
      <div class="author-section">
        <img 
          src="${gravatarUrl}" 
          alt="Somrit Dasgupta" 
          class="author-avatar"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="author-fallback" style="display: none;">SD</div>
        <div class="author-info">
          <h4>Somrit Dasgupta</h4>
          <p>Engineer x Extraordinaire</p>
        </div>
      </div>
    </div>
    
    <div class="card-content">
      <h2 class="post-title">${post.metadata.title}</h2>
      <p class="post-summary">${summary}</p>
      
      <div class="post-meta">
        <span>${formatDate(post.metadata.publishedAt)}</span>
        ${
          post.metadata.tags
            ? `
        <div class="tags">
          ${post.metadata.tags
            .slice(0, 3)
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("")}
        </div>
        `
            : ""
        }
      </div>
      
      <a href="${postUrl}" target="_blank" rel="noopener noreferrer" class="read-more-btn">
        Read Full Post
        <span class="arrow">→</span>
      </a>
    </div>
    
    <div class="powered-by">
      Powered by <a href="${baseUrl}" target="_blank" rel="noopener noreferrer">Somrit's Blog</a>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "X-Frame-Options": "ALLOWALL",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
