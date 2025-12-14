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
            for (const commit of commits.slice(0, 10)) {
              if (commit?.commit?.author?.date) {
                try {
                  const commitDetailResponse = await fetch(
                    `https://api.github.com/repos/${repo.full_name}/commits/${commit.sha}`,
                    {
                      headers: {
                        Accept: "application/vnd.github.v3+json",
                        Authorization: `token ${token}`,
                      },
                      cache: 'no-store',
                    }
                  );
                  
                  if (commitDetailResponse.ok) {
                    const commitDetail = await commitDetailResponse.json();
                    allCommits.push({
                      id: commit.sha,
                      repo: repo.full_name,
                      branch: repo.default_branch,
                      timestamp: commit.commit.author.date,
                      url: commit.html_url,
                      message: commit.commit.message,
                      author: commit.commit.author.name,
                      additions: commitDetail.stats?.additions || 0,
                      deletions: commitDetail.stats?.deletions || 0,
                      files: commitDetail.files?.length || 0,
                    });
                  }
                } catch (error) {
                  continue;
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

    return NextResponse.json(allCommits.slice(0, 200));
  } catch (error) {
    return NextResponse.json([]);
  }
}
