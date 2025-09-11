import { useState, useEffect } from "react";

interface FeaturedProject {
  name: string;
  description: string;
  html_url: string;
  homepage?: string;
}

export function useFeaturedProject() {
  const [featuredProject, setFeaturedProject] =
    useState<FeaturedProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProject = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/github", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            featuredId: 917047238,
            includeDescription: true,
            includeTopics: false,
            includeName: true,
            includeHtmlUrl: true,
            includeHomepage: true,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setFeaturedProject(data);
          setError(null);
        } else {
          setError(data.error || "Failed to fetch featured project");
        }
      } catch (err) {
        setError("Failed to fetch featured project");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProject();
  }, []);

  return { featuredProject, error, loading };
}
