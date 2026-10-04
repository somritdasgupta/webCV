import { useQuery } from "@tanstack/react-query";
import bundled from "../../content/site.json";
import { ADMIN } from "@/site.config";

/**
 * Site settings live in `content/site.json` in the content repo so the manual
 * editor and the MCP authoring server edit the same file. The site reads the
 * live copy from the raw CDN and falls back to the bundled one.
 */
export interface SiteSettings {
  resumeUrl: string;
}

export const SITE_SETTINGS_PATH = "content/site.json";
export const BUNDLED_SETTINGS: SiteSettings = bundled;

const RAW_URL = `https://raw.githubusercontent.com/${ADMIN.repo.owner}/${ADMIN.repo.name}/${ADMIN.repo.branch}/${SITE_SETTINGS_PATH}`;

export function isValidResumeUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const response = await fetch(`${RAW_URL}?t=${Date.now()}`);
  if (!response.ok) return BUNDLED_SETTINGS;
  const data = (await response.json()) as Partial<SiteSettings>;
  return data.resumeUrl && isValidResumeUrl(data.resumeUrl) ? { resumeUrl: data.resumeUrl } : BUNDLED_SETTINGS;
}

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60_000,
    placeholderData: BUNDLED_SETTINGS,
    meta: { silent: true },
  });

export const serializeSettings = (settings: SiteSettings) => `${JSON.stringify(settings, null, 2)}\n`;
