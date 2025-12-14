import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json([]);
  }

  try {
    const reposResponse = await fetch(
      "https://api.github.com/users/somritdasgupta/repos?per_page=100&sort=updated",
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

    // Process all repos to get complete history
    for (const repo of repos) {
      try {
        // Get all commits from this repo
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=100&author=somritdasgupta`,
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
            // Get detailed stats for recent commits only to avoid rate limits
            const recentCommits = commits.slice(0, 3);
            const olderCommits = commits.slice(3);
            
            // Fetch detailed stats for recent commits
            for (const commit of recentCommits) {
              if (commit?.commit?.author?.date) {
                try {
                  const detailResponse = await fetch(
                    `https://api.github.com/repos/${repo.full_name}/commits/${commit.sha}`,
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
                    allCommits.push({
                      id: commit.sha,
                      repo: repo.full_name,
                      branch: repo.default_branch,
                      timestamp: commit.commit.author.date,
                      url: commit.html_url,
                      message: commit.commit.message,
                      author: commit.commit.author.name,
                      additions: detail.stats?.additions || 0,
                      deletions: detail.stats?.deletions || 0,
                      files: detail.files?.length || 0,
                    });
                  }
                } catch (error) {
                  // Fallback to basic commit data
                  allCommits.push({
                    id: commit.sha,
                    repo: repo.full_name,
                    branch: repo.default_branch,
                    timestamp: commit.commit.author.date,
                    url: commit.html_url,
                    message: commit.commit.message,
                    author: commit.commit.author.name,
                    additions: 0,
                    deletions: 0,
                    files: 0,
                  });
                }
              }
            }
            
            // Add older commits without detailed stats to avoid rate limits
            olderCommits.forEach((commit: any) => {
              if (commit?.commit?.author?.date) {
                allCommits.push({
                  id: commit.sha,
                  repo: repo.full_name,
                  branch: repo.default_branch,
                  timestamp: commit.commit.author.date,
                  url: commit.html_url,
                  message: commit.commit.message,
                  author: commit.commit.author.name,
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

    allCommits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(allCommits);
  } catch (error) {
    return NextResponse.json([]);
  }
}