import { NextResponse } from "next/server";

const FILTERED_REPO_IDS = [
  917047238, 818561625, 482468668, 638619916, 946629942, 620773103,
];

export async function POST(request: Request) {
  const {
    featuredId,
    includeDescription = true,
    includeTopics = true,
    includeName = true,
    includeHtmlUrl = true,
    includeHomepage = true, // Add this parameter
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

  // Filter and sort repositories
  const filteredRepos = repos
    .filter((repo: any) => FILTERED_REPO_IDS.includes(repo.id))
    .sort((a: any, b: any) => {
      // Sort by creation date (newest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

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
      if (includeHomepage && featuredRepo.homepage)
        responseRepo.homepage = featuredRepo.homepage;
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
    if (includeHomepage && repo.homepage) responseRepo.homepage = repo.homepage;
    return responseRepo;
  });

  return NextResponse.json(responseRepos);
}
