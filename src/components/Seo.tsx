import { useEffect } from "react";
import { SITE, absUrl } from "@/site.config";

interface SeoProps {
  title?: string;
  description?: string;
  /** Path like "/blog/foo" — converted to absolute URL via BASE_URL. */
  path?: string;
  image?: string; // absolute or relative
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const upsertMeta = (selector: string, attr: string, attrValue: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const JSONLD_ID = "seo-jsonld";

export const Seo = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  author,
  jsonLd,
}: SeoProps) => {
  const fullTitle = title ? `${title} — ${SITE.shortName}` : SITE.title;
  const desc = description ?? SITE.description;
  const url = absUrl(path);
  const img = image
    ? image.startsWith("http")
      ? image
      : absUrl(image)
    : absUrl(SITE.ogImage);

  useEffect(() => {
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', "name", "description", desc);
    upsertLink("canonical", url);

    // Open Graph
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", desc);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:image"]', "property", "og:image", img);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE.name);
    upsertMeta('meta[property="og:locale"]', "property", "og:locale", SITE.locale);

    if (publishedTime) {
      upsertMeta(
        'meta[property="article:published_time"]',
        "property",
        "article:published_time",
        publishedTime,
      );
    }
    if (author) {
      upsertMeta('meta[property="article:author"]', "property", "article:author", author);
    }

    // Twitter
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", img);
    if (SITE.twitterHandle) {
      upsertMeta('meta[name="twitter:creator"]', "name", "twitter:creator", SITE.twitterHandle);
    }

    // JSON-LD
    const existing = document.getElementById(JSONLD_ID);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSONLD_ID;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [fullTitle, desc, url, img, type, publishedTime, author, jsonLd]);

  return null;
};
