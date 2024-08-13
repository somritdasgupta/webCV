// app/api/github-repos/route.ts

import { NextResponse } from "next/server";

const FILTERED_REPO_IDS = [
  818561625, 638619916, 694654420, 482468668, 620773103,
]; // Replace with actual IDs you want to include

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "GitHub personal access token is not defined" },
      { status: 500 }
    );
  }

  const response = await fetch(
    "https://api.github.com/users/somritdasgupta/repos",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }

  const repos = await response.json();

  // Filter repositories by IDs
  const filteredRepos = repos.filter((repo: any) =>
    FILTERED_REPO_IDS.includes(repo.id)
  );

  return NextResponse.json(filteredRepos);
}
