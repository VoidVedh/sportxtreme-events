import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useEvents } from "../hooks/useEvents";
import SiteHeader from "../components/common/SiteHeader";
import SiteFooter from "../components/common/SiteFooter";
import SectionHeading from "../components/common/SectionHeading";
import EventCard from "../components/common/EventCard";
import EventCardSkeleton from "../components/common/EventCardSkeleton";
import "../styles/site.css";

export default function EventsPage() {
  useDocumentMeta({
    title: "All Events & Tournaments | SportXtreme Events",
    description:
      "Browse active sports tournaments, corporate cups, school championships, and upcoming marathons coordinated by SportXtreme Events.",
    canonical: "https://sportxtreme.com/events",
  });

  const { events, loading, error } = useEvents();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Extract distinct sports/categories from real event data
  const categories = ["All", ...new Set(events.map((ev) => ev.category || ev.sport).filter(Boolean))];

  // Filter and search against real fields only
  const filteredEvents = events.filter((ev) => {
    // Category filter
    if (filter !== "All") {
      const cat = (ev.category || ev.sport || "").toLowerCase();
      if (cat !== filter.toLowerCase()) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = (ev.title || ev.name || "").toLowerCase().includes(q);
      const matchSport = (ev.sport || "").toLowerCase().includes(q);
      const matchLocation = (ev.location || "").toLowerCase().includes(q);
      const matchCategory = (ev.category || "").toLowerCase().includes(q);
      return matchTitle || matchSport || matchLocation || matchCategory;
    }

    return true;
  });

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
              eyebrow="Competitions & Fixtures"
              title="ALL"
              accentTitle="EVENTS"
              description="Explore corporate leagues, school championships, open tournaments, and mass marathons across India."
            />
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section
          style={{
            padding: "20px 0",
            borderBottom: "1px solid var(--sx-border)",
            background: "var(--sx-bg)",
            position: "sticky",
            top: 72,
            zIndex: 800,
          }}
        >
          <div className="sx-container">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Category Pills */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                  maxWidth: "100%",
                }}
                role="tablist"
                aria-label="Event categories"
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

              {/* Search Field */}
              <div style={{ flex: "1 1 240px", maxWidth: 360, minWidth: 200 }}>
                <label htmlFor="event-search-input" className="sx-label" style={{ display: "none" }}>
                  Search Events
                </label>
                <input
                  id="event-search-input"
                  type="search"
                  className="sx-input"
                  placeholder="Search by title, sport, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "9px 14px", fontSize: "0.88rem" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ padding: "64px 0 100px" }}>
          <div className="sx-container">
            {/* Error State with Retry */}
            {error && (
              <div
                role="alert"
                style={{
                  background: "rgba(229, 9, 20, 0.1)",
                  border: "1px solid var(--sx-red)",
                  borderRadius: "var(--sx-radius-sm)",
                  padding: "24px",
                  textAlign: "center",
                  marginBottom: 32,
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>⚠️</div>
                <h3 className="sx-display" style={{ fontSize: "1.3rem", color: "var(--sx-red)", marginBottom: 8 }}>
                  COULD NOT LOAD EVENTS
                </h3>
                <p style={{ color: "var(--sx-text-muted)", fontSize: "0.9rem", marginBottom: 16 }}>
                  {error || "An error occurred while communicating with the database."}
                </p>
                <button
                  type="button"
                  className="sx-btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  Retry Loading
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: 28,
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && filteredEvents.length > 0 && (
              <>
                <div
                  style={{
                    color: "var(--sx-text-dim)",
                    fontSize: "0.82rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 24,
                  }}
                >
                  Showing {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""}
                  {filter !== "All" && ` • Category: ${filter}`}
                  {search.trim() && ` • Query: "${search}"`}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: 28,
                  }}
                >
                  {filteredEvents.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && !error && filteredEvents.length === 0 && (
              <div
                className="sx-card"
                style={{
                  textAlign: "center",
                  padding: "80px 24px",
                  background: "var(--sx-surface)",
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🔍</div>
                <h3 className="sx-display" style={{ fontSize: "1.8rem", marginBottom: 10 }}>
                  NO MATCHING EVENTS FOUND
                </h3>
                <p style={{ color: "var(--sx-text-muted)", maxWidth: 440, margin: "0 auto 24px", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {search.trim()
                    ? `No events matching "${search}". Try adjusting your keywords or category filter.`
                    : filter !== "All"
                    ? `No events currently listed under ${filter}.`
                    : "No events are scheduled at this time. Check back soon."}
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {filter !== "All" && (
                    <button
                      type="button"
                      className="sx-btn-secondary"
                      onClick={() => setFilter("All")}
                    >
                      Clear Category Filter
                    </button>
                  )}
                  {search.trim() && (
                    <button
                      type="button"
                      className="sx-btn-secondary"
                      onClick={() => setSearch("")}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
