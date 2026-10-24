import { useEffect } from "react";
import { SITE_URL } from "../config/siteContent";

/**
 * Updates head metadata dynamically per route without external dependencies.
 *
 * @param {Object} options
 * @param {string} options.title - Document title
 * @param {string} [options.description] - Meta description
 * @param {string} [options.canonical] - Canonical URL (absolute or relative path)
 * @param {string} [options.ogImage] - Social share image URL
 * @param {string} [options.ogType] - Social share type (default 'website')
 * @param {Object} [options.jsonLd] - Optional schema.org JSON-LD structured data
 */
export function useDocumentMeta({
  title,
  description,
  canonical,
  ogImage = "/og-image.jpg",
  ogType = "website",
  jsonLd = null,
}) {
  useEffect(() => {
    // 1. Resolve absolute URLs using SITE_URL
    const resolveUrl = (pathOrUrl) => {
      if (!pathOrUrl) return "";
      if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
        return pathOrUrl;
      }
      const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
      return `${SITE_URL}${cleanPath}`;
    };

    const resolvedCanonical = resolveUrl(canonical);
    const resolvedOgImage = resolveUrl(ogImage);

    // 2. Update Document Title
    const baseTitle = "SportXtreme Events";
    if (title) {
      document.title = title.includes(baseTitle) ? title : `${title} | ${baseTitle}`;
    }

    // Helper: set or create <meta> attribute
    const setMeta = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper: set or create <link> tag
    const setLink = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // 3. Primary Meta Tags
    if (description) {
      setMeta("name", "description", description);
    }

    // 4. Canonical Link
    if (resolvedCanonical) {
      setLink("canonical", resolvedCanonical);
    }

    // 5. Open Graph Tags
    if (title) {
      setMeta("property", "og:title", document.title);
    }
    if (description) {
      setMeta("property", "og:description", description);
    }
    if (resolvedCanonical) {
      setMeta("property", "og:url", resolvedCanonical);
    }
    if (resolvedOgImage) {
      setMeta("property", "og:image", resolvedOgImage);
    }
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", "SportXtreme Events");
    setMeta("property", "og:locale", "en_IN");

    // 6. Twitter Card Tags
    setMeta("name", "twitter:card", "summary_large_image");
    if (title) {
      setMeta("name", "twitter:title", document.title);
    }
    if (description) {
      setMeta("name", "twitter:description", description);
    }
    if (resolvedOgImage) {
      setMeta("name", "twitter:image", resolvedOgImage);
    }

    // 7. Schema.org JSON-LD Structured Data
    let scriptTag = document.getElementById("sx-jsonld");
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "sx-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up jsonLd tag on route unmount if necessary
      const tag = document.getElementById("sx-jsonld");
      if (tag && !jsonLd) tag.remove();
    };
  }, [title, description, canonical, ogImage, ogType, jsonLd]);
}
