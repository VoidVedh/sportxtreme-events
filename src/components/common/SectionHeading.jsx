/**
 * Standardized Section Heading Component
 *
 * @param {Object} props
 * @param {string} props.eyebrow - Small uppercase prefix
 * @param {string} props.title - Primary headline
 * @param {string} [props.accentTitle] - Highlighted headline suffix in brand red
 * @param {string} [props.description] - Descriptive paragraph
 * @param {"left"|"center"} [props.align="left"] - Text alignment
 */
export default function SectionHeading({
  eyebrow,
  title,
  accentTitle,
  description,
  align = "left",
  as: HeadingTag = "h2",
}) {
  const isCenter = align === "center";

  return (
    <div
      style={{
        marginBottom: 44,
        textAlign: isCenter ? "center" : "left",
        maxWidth: isCenter ? 720 : "100%",
        marginLeft: isCenter ? "auto" : undefined,
        marginRight: isCenter ? "auto" : undefined,
      }}
    >
      {eyebrow && (
        <div>
          <span
            className="sx-eyebrow"
            style={{
              justifyContent: isCenter ? "center" : "flex-start",
            }}
          >
            {eyebrow}
          </span>
        </div>
      )}

      <HeadingTag
        className="sx-display"
        style={{
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
          color: "var(--sx-text-primary)",
          marginBottom: description ? 16 : 0,
        }}
      >
        {title}
        {accentTitle && (
          <>
            {" "}
            <span style={{ color: "var(--sx-red)" }}>{accentTitle}</span>
          </>
        )}
      </HeadingTag>

      {description && (
        <p
          style={{
            color: "var(--sx-text-secondary)",
            fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
            lineHeight: 1.65,
            maxWidth: 640,
            marginLeft: isCenter ? "auto" : 0,
            marginRight: isCenter ? "auto" : 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
