import { useState, useEffect, useRef } from "react";
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
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const lastTriggerRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Fetch all gallery items from Supabase
  const fetchGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 4000)
      );
      const { data, error: dbError } = await Promise.race([
        supabase
          .from("gallery")
          .select("id, url, caption, category, event_name, created_at")
          .order("created_at", { ascending: false }),
        timeoutPromise,
      ]);

      if (dbError) throw dbError;
      setGallery(data || []);
    } catch (err) {
      console.warn("Gallery fetch notice:", err.message || err);
      setError(err.message || "Failed to load gallery images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filter items
  const filteredItems =
    filter === "All"
      ? gallery
      : gallery.filter((g) => (g.category || "").toLowerCase() === filter.toLowerCase());

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [filter]);

  // Modal open helper with trigger tracking
  const openModal = (item, e) => {
    lastTriggerRef.current = e?.currentTarget;
    setActiveModalItem(item);
  };

  const closeModal = () => {
    setActiveModalItem(null);
    setTimeout(() => {
      lastTriggerRef.current?.focus();
    }, 50);
  };

  // Keyboard navigation inside lightbox
  const currentModalIndex = activeModalItem
    ? filteredItems.findIndex((it) => it.id === activeModalItem.id)
    : -1;

  const navigateModal = (direction) => {
    if (currentModalIndex === -1 || filteredItems.length <= 1) return;
    const newIndex = (currentModalIndex + direction + filteredItems.length) % filteredItems.length;
    setActiveModalItem(filteredItems[newIndex]);
  };

  // Modal ESC & Arrow key listener & body scroll lock
  useEffect(() => {
    if (!activeModalItem) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowRight") {
        navigateModal(1);
      } else if (e.key === "ArrowLeft") {
        navigateModal(-1);
      } else if (e.key === "Tab" && modalRef.current) {
        // Focus trap
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModalItem, currentModalIndex, filteredItems]);

  // Extract distinct categories from actual gallery data
  const categories = [
    "All",
    ...new Set(gallery.map((g) => g.category).filter(Boolean)),
  ];

  const displayedItems = filteredItems.slice(0, visibleCount);

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

        {/* Category Filters */}
        {categories.length > 1 && (
          <section
            style={{
              padding: "20px 0",
              borderBottom: "1px solid var(--sx-border)",
              background: "rgba(10, 10, 10, 0.6)",
              position: "sticky",
              top: 72,
              zIndex: 100,
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="sx-container">
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  paddingBottom: 4,
                  scrollbarWidth: "none",
                }}
              >
                {categories.map((cat) => {
                  const active = filter.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilter(cat)}
                      className={active ? "sx-btn-primary" : "sx-btn-secondary"}
                      style={{
                        padding: "8px 18px",
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
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
            {/* Error & Retry State */}
            {error && (
              <div
                className="sx-card"
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "var(--sx-surface)",
                  marginBottom: 32,
                  border: "1px solid var(--sx-border-strong)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                <h3 className="sx-display" style={{ fontSize: "1.5rem", marginBottom: 8 }}>
                  COULD NOT LOAD GALLERY
                </h3>
                <p style={{ color: "var(--sx-text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
                  {error}
                </p>
                <button type="button" onClick={fetchGallery} className="sx-btn-primary">
                  TRY AGAIN ↻
                </button>
              </div>
            )}

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
            ) : displayedItems.length > 0 ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                  }}
                >
                  {displayedItems.map((item) => (
                    <div
                      key={item.id}
                      className="sx-card"
                      onClick={(e) => openModal(item, e)}
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
                          openModal(item, e);
                        }
                      }}
                      aria-label={`View photo: ${cleanCaption(item.caption)}`}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "16 / 10",
                          position: "relative",
                          overflow: "hidden",
                          background: "#0E0E0E",
                        }}
                      >
                        <SafeImage
                          src={item.thumbnail_url || item.url}
                          alt={cleanCaption(item.caption)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
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

                {/* Pagination "Load More" */}
                {visibleCount < filteredItems.length && (
                  <div style={{ textAlign: "center", marginTop: 48 }}>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="sx-btn-secondary"
                      style={{ padding: "14px 32px", fontSize: "0.95rem" }}
                    >
                      LOAD MORE PHOTOS (Showing {displayedItems.length} of {filteredItems.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              !error && (
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
              )
            )}
          </div>
        </section>
      </main>

      {/* Accessible Full-Size Modal Lightbox Preview */}
      {activeModalItem && (
        <div
          className="sx-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo preview: ${cleanCaption(activeModalItem.caption)}`}
        >
          <div
            ref={modalRef}
            className="sx-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: 960,
              overflow: "hidden",
            }}
          >
            {/* Anchored Modal Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 20,
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

            {/* Previous Image Arrow */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={() => navigateModal(-1)}
                aria-label="Previous photo"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "40%",
                  zIndex: 20,
                  background: "rgba(0, 0, 0, 0.65)",
                  border: "1px solid var(--sx-border)",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  transition: "background var(--sx-transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sx-red)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.65)")}
              >
                ‹
              </button>
            )}

            {/* Next Image Arrow */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={() => navigateModal(1)}
                aria-label="Next photo"
                style={{
                  position: "absolute",
                  right: 14,
                  top: "40%",
                  zIndex: 20,
                  background: "rgba(0, 0, 0, 0.65)",
                  border: "1px solid var(--sx-border)",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  transition: "background var(--sx-transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sx-red)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.65)")}
              >
                ›
              </button>
            )}

            <div style={{ maxHeight: "68vh", overflow: "hidden", background: "#000" }}>
              <SafeImage
                src={activeModalItem.url}
                alt={cleanCaption(activeModalItem.caption)}
                style={{
                  width: "100%",
                  maxHeight: "68vh",
                  objectFit: "contain",
                }}
                fallbackIcon="📸"
                priority
              />
            </div>

            <div style={{ padding: "20px 24px" }}>
              <h3 className="sx-display" style={{ fontSize: "1.4rem", marginBottom: 6 }}>
                {cleanCaption(activeModalItem.caption)}
              </h3>
              <div style={{ display: "flex", gap: 16, color: "var(--sx-text-muted)", fontSize: "0.82rem" }}>
                {activeModalItem.category && <span>Category: {activeModalItem.category}</span>}
                {activeModalItem.event_name && <span>Event: {activeModalItem.event_name}</span>}
                {filteredItems.length > 1 && (
                  <span style={{ marginLeft: "auto" }}>
                    {currentModalIndex + 1} of {filteredItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
