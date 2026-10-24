import { useEffect } from "react";

/**
 * Updates head metadata dynamically per route without external dependencies.
 *
 * @param {Object} options
 * @param {string} options.title - Document title
 * @param {string} [options.description] - Meta description
 * @param {string} [options.canonical] - Canonical URL
 * @param {string} [options.ogImage] - Social share image URL
 * @param {string} [options.ogType] - Social share type (default 'website')
 */
export function useDocumentMeta({
  title,
  description,
  canonical,
  ogImage = "https://sportxtreme.com/og-image.jpg",
  ogType = "website",
}) {
  useEffect(() => {
    // 1. Update Document Title
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

    // 2. Primary Meta Tags
    if (description) {
      setMeta("name", "description", description);
    }

    // 3. Canonical Link
    if (canonical) {
      setLink("canonical", canonical);
    }

    // 4. Open Graph Tags
    if (title) {
      setMeta("property", "og:title", document.title);
    }
    if (description) {
      setMeta("property", "og:description", description);
    }
    if (canonical) {
      setMeta("property", "og:url", canonical);
    }
    if (ogImage) {
      setMeta("property", "og:image", ogImage);
    }
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", "SportXtreme Events");
    setMeta("property", "og:locale", "en_IN");

    // 5. Twitter Card Tags
    setMeta("name", "twitter:card", "summary_large_image");
    if (title) {
      setMeta("name", "twitter:title", document.title);
    }
    if (description) {
      setMeta("name", "twitter:description", description);
    }
    if (ogImage) {
      setMeta("name", "twitter:image", ogImage);
    }
  }, [title, description, canonical, ogImage, ogType]);
}
