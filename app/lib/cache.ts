const CACHE_TTL = {
  BLOG_POST: 3600, // 1 hour
  BLOG_INDEX: 3600, // 1 hour
  HOME_PAGE: 21600, // 6 hours
  PROJECTS: 7200, // 2 hours
  OG_IMAGES: 86400, // 24 hours
  STATIC_ASSETS: 31536000, // 1 year
} as const;

export { CACHE_TTL };
