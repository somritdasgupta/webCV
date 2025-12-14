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

    for (const repo of repos.slice(0, 20)) {
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=50&author=somritdasgupta`,
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
              if (commit?.commit?.author?.date) {
                allCommits.push({
                  id: commit.sha,
                  repo: repo.full_name,
                  branch: repo.default_branch,
                  timestamp: commit.commit.author.date,
                  url: commit.html_url,
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

    return NextResponse.json(allCommits.slice(0, 200));
  } catch (error) {
    return NextResponse.json([]);
  }
}
