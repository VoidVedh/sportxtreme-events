import { useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { useEvents } from "../hooks/useEvents";

const CAT_EMOJI = {
  CORPORATE: "🏏", MARATHON: "🏃", SCHOOL: "🎓",
  LEAGUE: "⚽", CYCLING: "🚴", AQUATIC: "🏊",
  DEFAULT: "🏆",
};

function EventCard({ ev, idx }) {
  const title        = ev.title || "Untitled Event";
  const category     = (ev.category || "EVENT").toUpperCase();
  const sport        = ev.sport || "—";
  const location     = ev.location || "";
  const date         = ev.event_date
    ? new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const participants = ev.participants || "";
  const image        = ev.image_url || null;
  const emoji        = CAT_EMOJI[category] || CAT_EMOJI.DEFAULT;

  return (
    <div
      className="card-lift"
      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}
    >
      <div
        style={{
          height: 160, position: "relative",
          background: image
            ? `url(${image}) center/cover no-repeat`
            : "linear-gradient(135deg, #0d0000, #1a0505)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {!image && (
          <div
            style={{
              fontSize: "4rem", opacity: 0.18,
              animation: `floatY ${3 + idx * 0.3}s ease-in-out infinite`,
              animationDelay: `${idx * 0.2}s`,
            }}
          >
            {emoji}
          </div>
        )}
        <div style={{ position: "absolute", top: 12, left: 12, background: C.red, padding: "3px 10px", fontFamily: "'Bebas Neue', cursive", fontSize: "0.68rem", letterSpacing: "0.1em" }}>
          {category}
        </div>
        {date && (
          <div style={{ position: "absolute", bottom: 10, right: 12, background: "rgba(0,0,0,0.6)", padding: "3px 10px", fontSize: "0.65rem", color: C.gray }}>
            {date}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 24px 24px" }}>
        <div className="bebas" style={{ fontSize: "1rem", letterSpacing: "0.03em", marginBottom: 10 }}>{title}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {participants && (
            <span style={{ fontSize: "0.73rem", color: C.gray }}>
              <span style={{ color: C.red }}>●</span> {participants} Participants
            </span>
          )}
          <span style={{ fontSize: "0.73rem", color: C.gray }}>● {sport}</span>
          {location && <span style={{ fontSize: "0.73rem", color: C.gray }}>📍 {location}</span>}
        </div>
      </div>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
      <div style={{ height: 160, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ height: 16, background: "rgba(255,255,255,0.05)", marginBottom: 12, borderRadius: 2, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 12, width: "60%", background: "rgba(255,255,255,0.03)", borderRadius: 2, animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const { events, loading, error } = useEvents({ limit: 6 });

  return (
    <section id="events" style={{ padding: "100px 5%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
        <div>
          <div className="eyebrow">Event Showcase</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            EVENTS WE&apos;VE<br /><span style={{ color: C.red }}>MADE LEGENDARY</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            id="events-view-gallery"
            className="out-btn"
            onClick={() => navigate("/gallery")}
          >
            VIEW GALLERY
          </button>
          <button
            id="events-view-all"
            className="out-btn"
            onClick={() => navigate("/events")}
          >
            VIEW ALL EVENTS
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "16px 20px", background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)", color: "#E50914", fontSize: "0.85rem", marginBottom: 24 }}>
          ⚠ Could not load events: {error}
        </div>
      )}

      {loading && (
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {events.map((ev, i) => (
            <EventCard key={ev.id} ev={ev} idx={i} />
          ))}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px", color: C.gray }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📅</div>
          <p style={{ fontSize: "1rem", marginBottom: 24 }}>No events found. Check back soon!</p>
          <button className="out-btn" onClick={() => navigate("/events")}>
            VIEW ALL EVENTS
          </button>
        </div>
      )}
    </section>
  );
}
