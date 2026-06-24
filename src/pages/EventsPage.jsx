import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { useEvents } from "../hooks/useEvents";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CAT_EMOJI = {
  CORPORATE: "🏏", MARATHON: "🏃", SCHOOL: "🎓",
  LEAGUE: "⚽", CYCLING: "🚴", AQUATIC: "🏊",
  DEFAULT: "🏆",
};

function EventCard({ ev, idx }) {
  const title        = ev.title    || ev.name || "Untitled Event";
  const category     = (ev.category || ev.cat || "EVENT").toUpperCase();
  const sport        = ev.sport    || "—";
  const location     = ev.location || "";
  const participants = ev.participants || ev.n || "";
  const image        = ev.image_url || null;
  const emoji        = CAT_EMOJI[category] || CAT_EMOJI.DEFAULT;

  const date = ev.event_date
    ? new Date(ev.event_date).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : ev.ed || "";

  return (
    <article
      className="card-lift"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.01)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image / thumbnail */}
      <div
        style={{
          height: 200, position: "relative",
          background: image
            ? `url(${image}) center/cover no-repeat`
            : "linear-gradient(135deg, #0d0000, #1a0505)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {!image && (
          <div
            style={{
              fontSize: "5rem", opacity: 0.15,
              animation: `floatY ${3 + (idx % 4) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(idx % 4) * 0.2}s`,
            }}
          >
            {emoji}
          </div>
        )}
        <div
          style={{
            position: "absolute", top: 14, left: 14,
            background: C.red, padding: "4px 12px",
            fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.1em",
          }}
        >
          {category}
        </div>
        {date && (
          <div
            style={{
              position: "absolute", bottom: 12, right: 14,
              background: "rgba(0,0,0,0.7)", padding: "4px 12px",
              fontSize: "0.68rem", color: C.gray, backdropFilter: "blur(4px)",
            }}
          >
            📅 {date}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "22px 26px 28px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 className="bebas" style={{ fontSize: "1.15rem", letterSpacing: "0.04em", color: "#fff", lineHeight: 1.2 }}>
          {title}
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 4 }}>
          {sport && (
            <span style={{ fontSize: "0.75rem", color: C.gray }}>
              <span style={{ color: C.red }}>⚡</span> {sport}
            </span>
          )}
          {participants && (
            <span style={{ fontSize: "0.75rem", color: C.gray }}>
              <span style={{ color: C.red }}>●</span> {participants} Participants
            </span>
          )}
          {location && (
            <span style={{ fontSize: "0.75rem", color: C.gray }}>
              📍 {location}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function EventSkeleton() {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
      <div style={{ height: 200, background: "rgba(255,255,255,0.03)" }} />
      <div style={{ padding: "22px 26px 28px" }}>
        <div style={{ height: 18, background: "rgba(255,255,255,0.05)", marginBottom: 14, borderRadius: 2 }} />
        <div style={{ height: 13, width: "70%", background: "rgba(255,255,255,0.03)", borderRadius: 2 }} />
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "Corporate", "Marathon", "School", "League", "Cycling", "Aquatic"];

export default function EventsPage() {
  const navigate   = useNavigate();
  const { events, loading, error } = useEvents();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = filter === "All"
    ? events
    : events.filter((ev) => {
        const cat = (ev.category || ev.cat || "").toLowerCase();
        return cat === filter.toLowerCase();
      });

  const searched = search.trim()
    ? filtered.filter((ev) => {
        const query = search.toLowerCase();
        return (
          (ev.title || "").toLowerCase().includes(query) ||
          (ev.sport || "").toLowerCase().includes(query) ||
          (ev.location || "").toLowerCase().includes(query) ||
          (ev.category || "").toLowerCase().includes(query)
        );
      })
    : filtered;

  return (
    <div style={{ background: C.black, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero banner */}
      <div
        style={{
          paddingTop: 120, paddingBottom: 64,
          paddingLeft: "5%", paddingRight: "5%",
          background: `radial-gradient(ellipse 60% 60% at 60% 50%, rgba(229,9,20,0.08) 0%, transparent 70%), ${C.black}`,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark */}
        <div
          style={{
            position: "absolute", right: "-2%", top: "50%", transform: "translateY(-50%)",
            fontFamily: "'Bebas Neue', cursive", fontSize: "20vw",
            color: "rgba(229,9,20,0.03)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
          }}
        >
          EVENTS
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            padding: "8px 18px", fontSize: "0.78rem", letterSpacing: "0.1em",
            fontFamily: "'Bebas Neue', cursive",
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 28,
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          ← BACK
        </button>

        <div className="eyebrow" style={{ position: "relative" }}>Our Event Portfolio</div>
        <h1 className="bebas" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 0.9, position: "relative" }}>
          ALL EVENTS<br /><span style={{ color: C.red }}>WE&apos;VE DELIVERED</span>
        </h1>
        <p style={{ color: C.gray, marginTop: 20, maxWidth: 520, lineHeight: 1.75, position: "relative" }}>
          From intimate school championships to city-scale marathons — every event we&apos;ve managed,
          every story we&apos;ve helped write.
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          padding: "0 5%",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", overflowX: "auto", gap: 0,
          background: "rgba(255,255,255,0.01)",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`sport-tab${filter === cat ? " on" : ""}`}
            onClick={() => setFilter(cat)}
            id={`events-filter-${cat.toLowerCase()}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ padding: "20px 5%", background: "rgba(255,255,255,0.01)" }}>
        <input
          type="text"
          placeholder="Search events by name, sport, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-f"
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "0.9rem",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: "60px 5% 100px" }}>
        {/* Error banner */}
        {error && (
          <div style={{
            padding: "14px 20px", marginBottom: 32,
            background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)",
            color: C.red, fontSize: "0.85rem",
          }}>
            ⚠ Could not load events: {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
          </div>
        )}

        {/* Events grid */}
        {!loading && searched.length > 0 && (
          <>
            <p style={{ color: C.gray, fontSize: "0.8rem", marginBottom: 28, letterSpacing: "0.1em" }}>
              SHOWING {searched.length} EVENT{searched.length !== 1 ? "S" : ""}
              {filter !== "All" ? ` · ${filter.toUpperCase()}` : ""}
              {search.trim() ? ` · Search: "${search}"` : ""}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {searched.map((ev, i) => (
                <EventCard key={ev.id || ev.title || i} ev={ev} idx={i} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && searched.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 20 }}>📅</div>
            <h2 className="bebas" style={{ fontSize: "2rem", marginBottom: 12 }}>
              NO EVENTS FOUND
            </h2>
            <p style={{ color: C.gray, marginBottom: 32 }}>
              {search.trim()
                ? `No events matching "${search}". Try a different search term.`
                : filter !== "All"
                ? `No ${filter} events yet. Try a different category.`
                : "No events available yet. Check back soon!"}
            </p>
            {filter !== "All" && (
              <button className="out-btn" onClick={() => setFilter("All")}>
                VIEW ALL EVENTS
              </button>
            )}
            {search.trim() && (
              <button className="out-btn" onClick={() => setSearch("")} style={{ marginLeft: 12 }}>
                CLEAR SEARCH
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
