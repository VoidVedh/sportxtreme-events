import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { supabase } from "../lib/supabase";
import SiteHeader from "../components/common/SiteHeader";
import SiteFooter from "../components/common/SiteFooter";
import SectionHeading from "../components/common/SectionHeading";
import { getEventRegistrationStatus } from "../components/common/EventCard";
import "../styles/site.css";

export default function RegisterPage() {
  useDocumentMeta({
    title: "Participant Registration | SportXtreme Events",
    description: "Official participant onboarding and ticket confirmation for SportXtreme Events.",
    canonical: "/register",
    ogImage: "/og-image.jpg",
  });

  const { eventId } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [eventsLoading, setEventsLoading] = useState(true);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [tshirtSize, setTshirtSize] = useState("M");
  const [honeypot, setHoneypot] = useState("");

  const [status, setStatus] = useState({ loading: false, success: false, error: "" });
  const [ticket, setTicket] = useState(null);
  const errorSummaryRef = useRef(null);

  useEffect(() => {
    if (status.error && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [status.error]);

  // Fetch active events once on mount
  useEffect(() => {
    let active = true;
    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, category, sport, description, location, participants, event_date, image_url, status")
          .order("event_date", { ascending: false });

        if (!active) return;
        if (error) throw error;
        setEvents(data || []);

        // If no eventId in URL, select first active event
        if (!eventId && data && data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      } catch (err) {
        console.warn("Error loading events for registration:", err.message || err);
      } finally {
        if (active) setEventsLoading(false);
      }
    }

    loadEvents();
    return () => {
      active = false;
    };
  }, [eventId]);

  // Sync selectedEventId if eventId URL parameter changes
  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [eventId]);

  const selectedEvent = events.find((ev) => ev.id === selectedEventId);
  const regStatus = getEventRegistrationStatus(selectedEvent);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    // Client-side validations with strict limits
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setStatus({ loading: false, success: false, error: "Please enter your name." });
      return;
    }
    if (cleanName.length > 100) {
      setStatus({ loading: false, success: false, error: "Name must be under 100 characters." });
      return;
    }

    if (!cleanEmail || !/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(cleanEmail)) {
      setStatus({ loading: false, success: false, error: "Please enter a valid email address." });
      return;
    }
    if (cleanEmail.length > 100) {
      setStatus({ loading: false, success: false, error: "Email must be under 100 characters." });
      return;
    }

    if (!cleanPhone) {
      setStatus({ loading: false, success: false, error: "Please enter your phone number." });
      return;
    }
    if (cleanPhone.length > 20) {
      setStatus({ loading: false, success: false, error: "Phone number must be under 20 characters." });
      return;
    }
    if (!/^[+0-9\s\-()]+$/.test(cleanPhone)) {
      setStatus({ loading: false, success: false, error: "Invalid phone number format." });
      return;
    }

    if (!selectedEventId) {
      setStatus({ loading: false, success: false, error: "Please select an event." });
      return;
    }

    if (!regStatus.isOpen) {
      setStatus({ loading: false, success: false, error: `Registration is not open: ${regStatus.label}.` });
      return;
    }

    let parsedAge = null;
    if (age.trim()) {
      parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
        setStatus({ loading: false, success: false, error: "Please enter a valid age between 1 and 120." });
        return;
      }
    }

    if (!["S", "M", "L", "XL", "XXL"].includes(tshirtSize)) {
      setStatus({ loading: false, success: false, error: "Please select a valid T-shirt size." });
      return;
    }

    if (honeypot) {
      // Bot trapped in honeypot
      setStatus({ loading: false, success: true, error: "" });
      return;
    }

    try {
      // 1. Try secure RPC first
      let regResult = null;
      try {
        const { data, error: rpcError } = await supabase
          .rpc("register_participant", {
            p_event_id: selectedEventId,
            p_name: cleanName,
            p_email: cleanEmail,
            p_phone: cleanPhone,
            p_age: parsedAge,
            p_tshirt_size: tshirtSize,
          })
          .single();

        if (rpcError) throw rpcError;
        regResult = data;
      } catch (rpcErr) {
        const msg = rpcErr.message || "";
        if (msg.includes("DUPLICATE_REGISTRATION") || msg.includes("already registered")) {
          throw new Error("You are already registered for this event with this email address or phone number.");
        }
        if (msg.includes("EVENT_CLOSED") || msg.includes("deadline")) {
          throw new Error("Registration for this event has closed.");
        }
        if (msg.includes("EVENT_FULL") || msg.includes("maximum participant")) {
          throw new Error("Registration is full. Maximum participant capacity reached.");
        }
        if (msg.includes("INVALID_INPUT")) {
          throw new Error(msg.replace("INVALID_INPUT:", "").trim());
        }

        // If RPC function does not exist in schema cache, fallback to direct insert
        if (
          msg.includes("Could not find the function") ||
          msg.includes("schema cache") ||
          msg.includes("does not exist")
        ) {
          console.warn("RPC not found on database, using direct insert fallback");
          const { data: insertData, error: insertError } = await supabase
            .from("registrations")
            .insert([
              {
                event_id: selectedEventId,
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                age: parsedAge,
                tshirt_size: tshirtSize,
                status: "pending",
                qr_payload: { name: cleanName, email: cleanEmail, phone: cleanPhone },
              },
            ])
            .select("id, registration_number, created_at")
            .single();

          if (insertError) {
            if (insertError.code === "23505" || insertError.message?.includes("unique")) {
              throw new Error("You are already registered for this event with this email address.");
            }
            throw insertError;
          }
          regResult = insertData;
        } else {
          throw rpcErr;
        }
      }

      setTicket({
        id: regResult.id,
        registration_number: regResult.registration_number || `SX-${Date.now().toString().slice(-6)}`,
        name: cleanName,
        email: cleanEmail,
        eventTitle: selectedEvent?.title || "SportXtreme Event",
        eventDate: selectedEvent?.event_date || "TBD",
      });

      setStatus({ loading: false, success: true, error: "" });
      setName("");
      setEmail("");
      setPhone("");
      setAge("");
      setTshirtSize("M");
    } catch (err) {
      console.warn("Registration processing note:", err.message || err);
      setStatus({
        loading: false,
        success: false,
        error: err.message || "Failed to submit registration. Please verify your details and try again.",
      });
    }
  };

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
              to="/events"
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
              ← BACK TO EVENTS
            </Link>

            <SectionHeading
              as="h1"
              eyebrow="Participant Onboarding"
              title="EVENT"
              accentTitle="REGISTRATION"
              description="Register as an individual athlete or corporate team participant. Present the verified ticket at check-in."
            />
          </div>
        </section>

        {/* Form or Ticket Content */}
        <section style={{ padding: "64px 0 100px" }}>
          <div className="sx-container" style={{ display: "flex", justifyContent: "center" }}>
            {status.success && ticket ? (
              /* ============================================================
                 CONFIRMED TICKET VIEW
                 ============================================================ */
              <div
                id="printable-ticket"
                className="sx-card"
                style={{
                  width: "100%",
                  maxWidth: 520,
                  padding: "40px 36px",
                  textAlign: "center",
                  background: "var(--sx-surface)",
                  border: "2px solid var(--sx-red-border)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "var(--sx-red)",
                  }}
                />

                <span className="sx-badge sx-badge-success" style={{ marginBottom: 14 }}>
                  REGISTRATION CONFIRMED
                </span>

                <h2
                  className="sx-display"
                  style={{ fontSize: "2rem", marginBottom: 6, color: "var(--sx-text-primary)" }}
                >
                  OFFICIAL EVENT TICKET
                </h2>
                <p style={{ color: "var(--sx-text-muted)", fontSize: "0.85rem", marginBottom: 28 }}>
                  Present this verification pass or registration ID at the gate.
                </p>

                {/* QR Code Container */}
                <div
                  style={{
                    background: "#FFFFFF",
                    padding: 16,
                    width: 220,
                    height: 220,
                    margin: "0 auto 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--sx-radius-sm)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.id)}`}
                    alt="Ticket QR Code"
                    width="190"
                    height="190"
                    style={{ width: "100%", height: "100%", display: "block" }}
                    onError={(e) => {
                      // Graceful fallback if QR server is unreachable or blocked by strict CSP
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector(".sx-qr-fallback")) {
                        const fallback = document.createElement("div");
                        fallback.className = "sx-qr-fallback";
                        fallback.style.color = "#070707";
                        fallback.style.fontFamily = "monospace";
                        fallback.style.fontSize = "0.78rem";
                        fallback.style.textAlign = "center";
                        fallback.innerHTML = `<strong>TICKET ID</strong><br/>${ticket.registration_number}`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>

                <div
                  className="sx-display"
                  style={{
                    fontSize: "1.45rem",
                    color: "var(--sx-red)",
                    letterSpacing: "0.06em",
                    marginBottom: 24,
                  }}
                >
                  ID: {ticket.registration_number}
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--sx-border)",
                    borderBottom: "1px solid var(--sx-border)",
                    padding: "20px 0",
                    marginBottom: 28,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    fontSize: "0.9rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--sx-text-muted)" }}>Participant:</span>
                    <strong style={{ color: "var(--sx-text-primary)" }}>{ticket.name}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--sx-text-muted)" }}>Email:</span>
                    <strong style={{ color: "var(--sx-text-primary)" }}>{ticket.email}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--sx-text-muted)" }}>Event:</span>
                    <strong style={{ color: "var(--sx-red)" }}>{ticket.eventTitle}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--sx-text-muted)" }}>Date:</span>
                    <strong style={{ color: "var(--sx-text-primary)" }}>{ticket.eventDate}</strong>
                  </div>
                </div>

                <div className="sx-ticket-actions" style={{ display: "flex", gap: 14 }}>
                  <button
                    type="button"
                    className="sx-btn-primary"
                    style={{ flex: 1, padding: "12px" }}
                    onClick={() => window.print()}
                  >
                    🖨️ PRINT TICKET
                  </button>
                  <button
                    type="button"
                    className="sx-btn-secondary"
                    style={{ flex: 1, padding: "12px" }}
                    onClick={() => navigate("/events")}
                  >
                    ALL EVENTS →
                  </button>
                </div>
              </div>
            ) : (
              /* ============================================================
                 REGISTRATION FORM
                 ============================================================ */
              <div
                className="sx-card"
                style={{
                  width: "100%",
                  maxWidth: 620,
                  padding: "40px 36px",
                  background: "var(--sx-surface)",
                }}
              >
                <h2
                  className="sx-display"
                  style={{ fontSize: "1.8rem", letterSpacing: "0.04em", marginBottom: 20 }}
                >
                  ENTER PARTICIPANT DETAILS
                </h2>

                {/* Event Status Banner if closed/completed */}
                {selectedEvent && !regStatus.isOpen && (
                  <div
                    role="alert"
                    style={{
                      background: "rgba(229, 9, 20, 0.1)",
                      border: "1px solid var(--sx-red)",
                      borderRadius: "var(--sx-radius-sm)",
                      padding: "16px",
                      color: "#ff6b6b",
                      fontSize: "0.88rem",
                      marginBottom: 24,
                    }}
                  >
                    <strong>Notice:</strong> Registration for {selectedEvent.title} is currently unavailable ({regStatus.label}).
                  </div>
                )}

                {status.error && (
                  <div
                    ref={errorSummaryRef}
                    id="reg-error-summary"
                    tabIndex="-1"
                    role="alert"
                    style={{
                      background: "rgba(229, 9, 20, 0.12)",
                      border: "1px solid var(--sx-red)",
                      borderRadius: "var(--sx-radius-sm)",
                      padding: "16px",
                      color: "#ff6b6b",
                      fontSize: "0.88rem",
                      marginBottom: 20,
                      outline: "none",
                    }}
                  >
                    {status.error}
                  </div>
                )}

                {eventsLoading ? (
                  <div style={{ color: "var(--sx-text-muted)", padding: "20px 0" }}>
                    Loading event configurations...
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Event Select Dropdown */}
                    <div className="sx-field">
                      <label htmlFor="reg-event-select" className="sx-label">
                        Select Target Event *
                      </label>
                      <select
                        id="reg-event-select"
                        className="sx-select"
                        value={selectedEventId}
                        disabled={status.loading}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                      >
                        <option value="">-- Choose an Event --</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} {ev.event_date ? `(${new Date(ev.event_date).toLocaleDateString("en-IN")})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 16,
                      }}
                    >
                      {/* Full Name */}
                      <div className="sx-field">
                        <label htmlFor="reg-name" className="sx-label">
                          Full Name *
                        </label>
                        <input
                          id="reg-name"
                          type="text"
                          className="sx-input"
                          placeholder="Athlete / Participant Name"
                          value={name}
                          disabled={status.loading || !regStatus.isOpen}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div className="sx-field">
                        <label htmlFor="reg-phone" className="sx-label">
                          Phone Number *
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          className="sx-input"
                          placeholder="+91 98765 43210"
                          value={phone}
                          disabled={status.loading || !regStatus.isOpen}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="sx-field">
                      <label htmlFor="reg-email" className="sx-label">
                        Email Address *
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        className="sx-input"
                        placeholder="athlete@example.com"
                        value={email}
                        disabled={status.loading || !regStatus.isOpen}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 16,
                      }}
                    >
                      {/* Age */}
                      <div className="sx-field">
                        <label htmlFor="reg-age" className="sx-label">
                          Age (Optional)
                        </label>
                        <input
                          id="reg-age"
                          type="number"
                          min="1"
                          max="120"
                          className="sx-input"
                          placeholder="e.g. 24"
                          value={age}
                          disabled={status.loading || !regStatus.isOpen}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>

                      {/* T-Shirt Size */}
                      <div className="sx-field">
                        <label htmlFor="reg-tshirt" className="sx-label">
                          Jersey / T-Shirt Size *
                        </label>
                        <select
                          id="reg-tshirt"
                          className="sx-select"
                          value={tshirtSize}
                          disabled={status.loading || !regStatus.isOpen}
                          onChange={(e) => setTshirtSize(e.target.value)}
                        >
                          <option value="S">S (Small)</option>
                          <option value="M">M (Medium)</option>
                          <option value="L">L (Large)</option>
                          <option value="XL">XL (Extra Large)</option>
                          <option value="XXL">XXL (Double Extra Large)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <button
                        type="submit"
                        className="sx-btn-primary"
                        disabled={status.loading || !regStatus.isOpen}
                        style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
                      >
                        {status.loading
                          ? "CONFIRMING REGISTRATION…"
                          : !regStatus.isOpen
                            ? regStatus.label.toUpperCase()
                            : "CONFIRM REGISTRATION & GET TICKET →"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Print stylesheet to ensure tickets print cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 600px !important;
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            padding: 30px !important;
          }
          #printable-ticket h2,
          #printable-ticket strong,
          #printable-ticket div,
          #printable-ticket span {
            color: #000 !important;
          }
          .sx-ticket-actions {
            display: none !important;
          }
        }
      `}</style>

      <SiteFooter />
    </div>
  );
}
