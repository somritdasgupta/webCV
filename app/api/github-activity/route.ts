import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json([]);
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
    const allCommits: any[] = [];

    // Process repos to get commit history with real data
    for (const repo of repos.slice(0, 8)) {
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=15&author=somritdasgupta`,
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
            // Add commits with basic data first, then enhance with stats
            commits.forEach((commit: any) => {
              if (commit && commit.sha && commit.commit && commit.commit.author && commit.commit.message) {
                allCommits.push({
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
            });
          }
        }
      } catch (error) {
        continue;
      }
    }

    // Now enhance recent commits with detailed stats (top 20 commits)
    const recentCommits = allCommits.slice(0, 20);
    for (let i = 0; i < recentCommits.length; i++) {
      const commit = recentCommits[i];
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
            allCommits[i].additions = detail.stats.additions || 0;
            allCommits[i].deletions = detail.stats.deletions || 0;
            allCommits[i].files = detail.files ? detail.files.length : 0;
          }
        }
      } catch (error) {
        // Keep basic data if detailed fetch fails
        continue;
      }
    }

    allCommits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(allCommits);
  } catch (error) {
    return NextResponse.json([]);
  }
}