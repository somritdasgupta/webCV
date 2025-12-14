import { NextResponse } from "next/server";

export const revalidate = 300; // 5 minutes

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not configured" },
      { status: 500 }
    );
  }

  const response = await fetch(
    "https://api.github.com/users/somritdasgupta/events/public?per_page=50",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token}`,
      },
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }

  const events = await response.json();

  // Filter only push events (commits)
  const commits = events
    .filter((event: any) => event.type === "PushEvent")
    .map((event: any) => ({
      id: event.id,
      repo: event.repo.name,
      branch: event.payload.ref.replace("refs/heads/", ""),
      commitCount: event.payload.commits.length,
      timestamp: event.created_at,
      url: `https://github.com/${event.repo.name}/commits/${event.payload.ref.replace("refs/heads/", "")}`,
    }));

  return NextResponse.json(commits);
}
