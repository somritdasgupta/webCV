import { NextResponse } from "next/server";

const FILTERED_REPO_IDS = [
  818561625, 638619916, 694654420, 482468668, 620773103,
]; // Replace with actual IDs you want to include

export async function POST(request: Request) {
  const {
    featuredId,
    includeDescription = true,
    includeTopics = true,
    includeName = true,
    includeHtmlUrl = true,
  } = await request.json();

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

  if (featuredId && FILTERED_REPO_IDS.includes(Number(featuredId))) {
    const featuredRepo = filteredRepos.find(
      (repo: any) => repo.id === Number(featuredId)
    );
    if (featuredRepo) {
      const responseRepo: any = {};
      if (includeName) responseRepo.name = featuredRepo.name;
      if (includeDescription)
        responseRepo.description = featuredRepo.description;
      if (includeTopics) responseRepo.topics = featuredRepo.topics;
      if (includeHtmlUrl) responseRepo.html_url = featuredRepo.html_url;

      return NextResponse.json(responseRepo);
    }
    return NextResponse.json({});
  }

  const responseRepos = filteredRepos.map((repo: any) => {
    const responseRepo: any = {};
    if (includeName) responseRepo.name = repo.name;
    if (includeDescription) responseRepo.description = repo.description;
    if (includeTopics) responseRepo.topics = repo.topics;
    if (includeHtmlUrl) responseRepo.html_url = repo.html_url;
    return responseRepo;
  });

  return NextResponse.json(responseRepos);
}
