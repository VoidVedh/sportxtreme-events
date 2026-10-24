import { useState } from "react";

/**
 * Robust image wrapper with automatic error handling, lazy loading, and placeholder fallback.
 *
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} props.alt - Required for accessibility and SEO
 * @param {string} [props.className]
 * @param {Object} [props.style]
 * @param {number|string} [props.width]
 * @param {number|string} [props.height]
 * @param {boolean} [props.priority=false] - If true, eager loads (for hero); otherwise lazy loads
 * @param {string} [props.fallbackIcon="🏆"]
 */
export default function SafeImage({
  src,
  alt,
  className = "",
  style = {},
  width,
  height,
  priority = false,
  fallbackIcon = "🏆",
  ...rest
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`sx-image-fallback ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111111, #1a1a1a)",
          color: "rgba(255, 255, 255, 0.25)",
          width: width || "100%",
          height: height || "100%",
          minHeight: 120,
          ...style,
        }}
        role="img"
        aria-label={alt || "Image placeholder"}
      >
        <span style={{ fontSize: "2.4rem", userSelect: "none" }}>{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setHasError(true)}
      className={className}
      style={{
        objectFit: "cover",
        display: "block",
        width: width || "100%",
        height: height || "100%",
        ...style,
      }}
      {...rest}
    />
  );
}
