import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');

  if (!token) {
    return NextResponse.json({ commits: [], hasMore: false, total: 0 });
  }

  try {
    const reposResponse = await fetch(
      "https://api.github.com/users/somritdasgupta/repos?per_page=50&sort=updated",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!reposResponse.ok) {
      return NextResponse.json([]);
    }

    const repos = await reposResponse.json();
    const pageCommits: any[] = [];
    let totalFetched = 0;
    const targetCommits = page * perPage;
    
    // Calculate which repos and pages to fetch for this specific page
    const commitsPerRepo = 50;
    
    for (const repo of repos) {
      if (pageCommits.length >= perPage) break;
      
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=${commitsPerRepo}&author=somritdasgupta`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
              Authorization: `token ${token}`,
            },
            cache: 'no-store',
          }
        );

        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          if (Array.isArray(commits)) {
            commits.forEach((commit: any) => {
              if (commit && commit.sha && commit.commit && commit.commit.author && commit.commit.message) {
                totalFetched++;
                
                // Only include commits for the requested page
                if (totalFetched > (page - 1) * perPage && pageCommits.length < perPage) {
                  pageCommits.push({
                    id: commit.sha,
                    repo: repo.full_name,
                    branch: repo.default_branch || 'main',
                    timestamp: commit.commit.author.date,
                    url: commit.html_url,
                    message: commit.commit.message,
                    author: commit.commit.author.name || commit.commit.author.email || 'Unknown',
                    additions: 0,
                    deletions: 0,
                    files: 0,
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        continue;
      }
    }

    // Enhance current page commits with detailed stats
    for (let i = 0; i < pageCommits.length; i++) {
      const commit = pageCommits[i];
      try {
        const detailResponse = await fetch(
          `https://api.github.com/repos/${commit.repo}/commits/${commit.id}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
              Authorization: `token ${token}`,
            },
            cache: 'no-store',
          }
        );
        
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          if (detail.stats) {
            pageCommits[i].additions = detail.stats.additions || 0;
            pageCommits[i].deletions = detail.stats.deletions || 0;
            pageCommits[i].files = detail.files ? detail.files.length : 0;
          }
        }
      } catch (error) {
        continue;
      }
    }

    pageCommits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      commits: pageCommits,
      hasMore: pageCommits.length === perPage,
      page,
      perPage
    });
  } catch (error) {
    return NextResponse.json({ commits: [], hasMore: false, total: 0 });
  }
}