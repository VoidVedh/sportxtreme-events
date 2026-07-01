import { useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { useEvents } from "../hooks/useEvents";

const isRegistrationEnabled = (ev) => {
  if (ev.status && ev.status !== "upcoming") return false;

  if (ev.registration_deadline) {
    const deadline = new Date(ev.registration_deadline);
    const today = new Date();
    deadline.setHours(23, 59, 59, 999);
    if (today > deadline) return false;
  }

  return true;
};

function EventCard({ ev }) {
  const navigate = useNavigate();
  const title = ev.title || "Untitled Event";
  const location = ev.location || "";
  const date = ev.event_date
    ? new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const image = ev.image_url || null;
  const regEnabled = isRegistrationEnabled(ev);

  return (
    <div
      className="card-lift"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.01)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <div
        style={{
          height: 200,
          position: "relative",
          background: image
            ? `url(${image}) center/cover no-repeat`
            : "linear-gradient(135deg, #0d0000, #1a0505)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!image && (
          <div style={{ fontSize: "3rem", opacity: 0.18 }}>🏆</div>
        )}
      </div>

      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h3 className="bebas" style={{ fontSize: "1.35rem", letterSpacing: "0.03em", marginBottom: 12, color: "#FFFFFF" }}>
            {title}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {date && (
              <span style={{ fontSize: "0.8rem", color: C.gray, display: "inline-flex", alignItems: "center", gap: 6 }}>
                📅 {date}
              </span>
            )}
            {location && (
              <span style={{ fontSize: "0.8rem", color: C.gray, display: "inline-flex", alignItems: "center", gap: 6 }}>
                📍 {location}
              </span>
            )}
          </div>
        </div>

        {regEnabled && (
          <button
            className="red-btn"
            style={{ width: "100%", padding: "12px 0", fontSize: "0.85rem", letterSpacing: "0.05em", cursor: "pointer" }}
            onClick={() => navigate(`/register/${ev.id}`)}
          >
            REGISTER NOW
          </button>
        )}
      </div>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
      <div style={{ height: 200, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "24px" }}>
        <div style={{ height: 18, background: "rgba(255,255,255,0.05)", marginBottom: 12, borderRadius: 2, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 14, width: "60%", background: "rgba(255,255,255,0.03)", borderRadius: 2, animation: "pulse 1.5s ease-in-out infinite" }} />
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
          <div className="eyebrow">Upcoming Events</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            JOIN THE<br /><span style={{ color: C.red }}>NEXT EXPERIENCE</span>
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
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => <EventSkeleton key={i} />)}
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {events.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            border: "1px dashed rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.005)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: C.red, opacity: 0.8, marginBottom: 20 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="12" cy="16" r="1.5" />
          </svg>
          <p style={{ fontSize: "1.1rem", color: "#FFFFFF", fontWeight: 500, margin: "0 0 8px 0" }}>No upcoming events.</p>
          <p style={{ fontSize: "0.85rem", color: C.gray, margin: "0 0 24px 0", maxWidth: "280px" }}>
            Check back later! The administrator has not scheduled any upcoming events yet.
          </p>
        </div>
      )}
    </section>
  );
}
