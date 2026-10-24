import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

/**
 * Checks whether registration is currently open for an event
 * based on verified status and deadline fields in the database.
 */
export function getEventRegistrationStatus(event) {
  if (!event) return { isOpen: false, label: "Unavailable" };

  // Status check: if explicitly completed or cancelled
  if (event.status === "completed") {
    return { isOpen: false, label: "Completed" };
  }
  if (event.status === "cancelled") {
    return { isOpen: false, label: "Cancelled" };
  }

  // Registration deadline check
  if (event.registration_deadline) {
    const deadline = new Date(event.registration_deadline);
    const now = new Date();
    deadline.setHours(23, 59, 59, 999);
    if (now > deadline) {
      return { isOpen: false, label: "Registration Closed" };
    }
  }

  // If status is upcoming or ongoing and deadline hasn't passed
  return { isOpen: true, label: "Registration Open" };
}

export default function EventCard({ event }) {
  if (!event) return null;

  const { isOpen, label: statusLabel } = getEventRegistrationStatus(event);

  // Format date using Indian locale
  let formattedDate = null;
  if (event.event_date) {
    try {
      const parsedDate = new Date(event.event_date);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(parsedDate);
      }
    } catch {
      formattedDate = event.event_date;
    }
  }

  const title = event.title || event.name || "SportXtreme Event";
  const sport = event.sport || event.category || null;
  const location = event.location || null;
  const imageUrl = event.image_url || null;

  return (
    <article
      className="sx-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Event Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 200,
          background: "var(--sx-surface-2)",
          overflow: "hidden",
        }}
      >
        <SafeImage
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          fallbackIcon="🏅"
        />

        {/* Sport Tag & Status Badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {sport && (
            <span
              className="sx-badge sx-badge-red"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {sport}
            </span>
          )}

          <span
            className={`sx-badge ${isOpen ? "sx-badge-success" : "sx-badge-muted"}`}
            style={{
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              marginLeft: "auto",
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div
        style={{
          padding: "20px 22px 24px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3
            className="sx-display"
            style={{
              fontSize: "1.35rem",
              letterSpacing: "0.03em",
              lineHeight: 1.15,
              color: "var(--sx-text-primary)",
              marginBottom: 14,
            }}
          >
            {title}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: "0.82rem",
              color: "var(--sx-text-muted)",
              marginBottom: 20,
            }}
          >
            {formattedDate && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden="true">📅</span>
                <span>{formattedDate}</span>
              </div>
            )}

            {location && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden="true">📍</span>
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isOpen ? (
            <Link
              to={`/register/${event.id}`}
              className="sx-btn-primary"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.95rem",
              }}
            >
              REGISTER NOW →
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="sx-btn-secondary"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.95rem",
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            >
              {statusLabel.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
