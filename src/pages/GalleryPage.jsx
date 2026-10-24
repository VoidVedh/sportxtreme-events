import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { supabase } from "../lib/supabase";
import SiteHeader from "../components/common/SiteHeader";
import SiteFooter from "../components/common/SiteFooter";
import SectionHeading from "../components/common/SectionHeading";
import SafeImage from "../components/common/SafeImage";
import "../styles/site.css";

function cleanCaption(caption) {
  if (!caption) return "SportXtreme Event";
  const trimmed = caption.trim();
  if (!trimmed) return "SportXtreme Event";
  const lower = trimmed.toLowerCase();
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.includes("whatsapp image") ||
    lower.startsWith("img_") ||
    lower.startsWith("img-") ||
    lower.startsWith("dsc") ||
    lower.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/) ||
    lower.match(/^[a-z0-9-_]+\.[a-z0-9]+$/)
  ) {
    return "SportXtreme Event";
  }
  return trimmed;
}

export default function GalleryPage() {
  useDocumentMeta({
    title: "Event Gallery | SportXtreme Events",
    description:
      "Visual archives and snapshots from tournaments, championships, and athletic events managed by SportXtreme Events.",
    canonical: "https://sportxtreme.com/gallery",
  });

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Fetch all gallery items from Supabase
  useEffect(() => {
    let active = true;
    async function fetchGallery() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (!active) return;
        if (!error && data) {
          setGallery(data);
        }
      } catch (err) {
        console.warn("Gallery fetch notice:", err.message || err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchGallery();
    return () => {
      active = false;
    };
  }, []);

  // Modal ESC key listener & body scroll lock
  useEffect(() => {
    if (!activeModalItem) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveModalItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModalItem]);

  // Extract distinct categories from actual gallery data
  const categories = [
    "All",
    ...new Set(gallery.map((g) => g.category).filter(Boolean)),
  ];

  const filteredItems = filter === "All"
    ? gallery
    : gallery.filter((g) => (g.category || "").toLowerCase() === filter.toLowerCase());

  return (
    <div className="sx-site">
      <a href="#main-content" className="sx-skip-link">
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content">
        {/* Banner */}
        <section
          style={{
            padding: "64px 0 40px",
            background: "var(--sx-bg-subtle)",
            borderBottom: "1px solid var(--sx-border)",
          }}
        >
          <div className="sx-container">
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--sx-text-muted)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontFamily: "var(--sx-font-display)",
                letterSpacing: "0.06em",
                marginBottom: 24,
                transition: "color var(--sx-transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sx-red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sx-text-muted)")}
            >
              ← BACK TO HOME
            </Link>

            <SectionHeading
              eyebrow="Visual Archives"
              title="EVENT"
              accentTitle="GALLERY"
              description="Moments of competitive excellence, team spirit, and podium finishes across our managed events."
            />
          </div>
        </section>

        {/* Category Filter Bar */}
        {categories.length > 1 && (
          <section
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--sx-border)",
              background: "var(--sx-bg)",
            }}
          >
            <div className="sx-container">
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
                role="tablist"
                aria-label="Gallery categories"
              >
                {categories.map((cat) => {
                  const isSelected = filter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setFilter(cat)}
                      style={{
                        background: isSelected ? "var(--sx-red)" : "var(--sx-surface)",
                        color: isSelected ? "#fff" : "var(--sx-text-secondary)",
                        border: "1px solid",
                        borderColor: isSelected ? "var(--sx-red)" : "var(--sx-border)",
                        borderRadius: "var(--sx-radius-sm)",
                        padding: "8px 16px",
                        fontFamily: "var(--sx-font-display)",
                        fontSize: "0.95rem",
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all var(--sx-transition-fast)",
                      }}
                    >
                      {cat.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Grid */}
        <section style={{ padding: "64px 0 100px" }}>
          <div className="sx-container">
            {loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="sx-skeleton"
                    style={{ height: 260, borderRadius: "var(--sx-radius-sm)" }}
                  />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 24,
                }}
              >
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="sx-card"
                    onClick={() => setActiveModalItem(item)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveModalItem(item);
                      }
                    }}
                    aria-label={`View photo: ${cleanCaption(item.caption)}`}
                  >
                    <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
                      <SafeImage
                        src={item.url}
                        alt={cleanCaption(item.caption)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        fallbackIcon="📸"
                      />
                      {item.category && (
                        <span
                          className="sx-badge sx-badge-red"
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                          }}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: "16px 18px", flexGrow: 1 }}>
                      <div
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: 600,
                          color: "var(--sx-text-primary)",
                          lineHeight: 1.4,
                          marginBottom: 4,
                        }}
                      >
                        {cleanCaption(item.caption)}
                      </div>
                      {item.event_name && (
                        <div style={{ fontSize: "0.78rem", color: "var(--sx-text-muted)" }}>
                          {item.event_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="sx-card"
                style={{
                  textAlign: "center",
                  padding: "80px 24px",
                  background: "var(--sx-surface)",
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>📸</div>
                <h3 className="sx-display" style={{ fontSize: "1.8rem", marginBottom: 10 }}>
                  NO GALLERY IMAGES AVAILABLE
                </h3>
                <p style={{ color: "var(--sx-text-muted)", maxWidth: 440, margin: "0 auto", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {filter !== "All"
                    ? `No images categorized under ${filter}.`
                    : "Event photographs will appear here once published by tournament coordinators."}
                </p>
                {filter !== "All" && (
                  <button
                    type="button"
                    className="sx-btn-secondary"
                    onClick={() => setFilter("All")}
                    style={{ marginTop: 20 }}
                  >
                    View All Categories
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Accessible Full-Size Modal Preview */}
      {activeModalItem && (
        <div
          className="sx-modal-overlay"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="sx-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: 900,
              overflow: "hidden",
            }}
          >
            {/* Anchored Modal Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalItem(null)}
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 10,
                background: "rgba(0, 0, 0, 0.75)",
                border: "1px solid var(--sx-border-strong)",
                color: "#fff",
                width: 38,
                height: 38,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                transition: "background var(--sx-transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sx-red)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.75)")}
            >
              ✕
            </button>

            <div style={{ maxHeight: "65vh", overflow: "hidden", background: "#000" }}>
              <SafeImage
                src={activeModalItem.url}
                alt={cleanCaption(activeModalItem.caption)}
                style={{
                  width: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                }}
                fallbackIcon="📸"
              />
            </div>

            <div style={{ padding: "24px 28px" }}>
              <h3 className="sx-display" style={{ fontSize: "1.5rem", marginBottom: 8 }}>
                {cleanCaption(activeModalItem.caption)}
              </h3>
              <div style={{ display: "flex", gap: 16, color: "var(--sx-text-muted)", fontSize: "0.85rem" }}>
                {activeModalItem.category && <span>Category: {activeModalItem.category}</span>}
                {activeModalItem.event_name && <span>Event: {activeModalItem.event_name}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
