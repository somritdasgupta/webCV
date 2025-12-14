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

    // Process top repos to get detailed commit history with stats
    for (const repo of repos.slice(0, 10)) {
      try {
        // Get commits from this repo
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=20&author=somritdasgupta`,
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
            // Fetch detailed stats for all commits in this repo
            for (const commit of commits) {
              if (commit?.commit?.author?.date && commit?.sha && repo?.full_name) {
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
                      id: commit.sha || '',
                      repo: repo.full_name || '',
                      branch: repo.default_branch || 'main',
                      timestamp: commit.commit.author.date || new Date().toISOString(),
                      url: commit.html_url || '',
                      message: commit.commit.message || 'No message',
                      author: commit.commit.author.name || 'Unknown',
                      additions: detail.stats?.additions || 0,
                      deletions: detail.stats?.deletions || 0,
                      files: detail.files?.length || 0,
                    });
                  }
                } catch (error) {
                  // Fallback to basic commit data
                  allCommits.push({
                    id: commit.sha || '',
                    repo: repo.full_name || '',
                    branch: repo.default_branch || 'main',
                    timestamp: commit.commit.author.date || new Date().toISOString(),
                    url: commit.html_url || '',
                    message: commit.commit.message || 'No message',
                    author: commit.commit.author.name || 'Unknown',
                    additions: 0,
                    deletions: 0,
                    files: 0,
                  });
                }
              }
            }
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