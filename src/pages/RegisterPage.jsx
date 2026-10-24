import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import QRCode from "qrcode";
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
  const [qrDataUrl, setQrDataUrl] = useState("");
  const errorSummaryRef = useRef(null);

  useEffect(() => {
    if (status.error && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [status.error]);

  // Generate QR Code purely in the client without external network calls
  useEffect(() => {
    if (ticket) {
      // Encode strictly the opaque checkin_token. Never encode PII (no name, email, phone).
      const token = ticket.checkin_token || ticket.registration_number || ticket.id;
      if (token) {
        QRCode.toDataURL(token, {
          width: 220,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        })
          .then((url) => setQrDataUrl(url))
          .catch((err) => {
            console.error("QR Code generation notice:", err);
          });
      }
    }
  }, [ticket]);

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
        const { data, error: rpcError } = await supabase.rpc("register_participant", {
          p_event_id: selectedEventId,
          p_name: cleanName,
          p_email: cleanEmail,
          p_phone: cleanPhone,
          p_age: parsedAge,
          p_tshirt_size: tshirtSize,
        });

        if (rpcError) throw rpcError;

        const res = Array.isArray(data) ? data[0] : data;
        if (res && res.success === false) {
          // Map stable RPC error codes to user-friendly messages
          switch (res.code) {
            case "DUPLICATE_REGISTRATION":
              throw new Error("You are already registered for this event with this email or phone.");
            case "EVENT_FULL":
              throw new Error("Registration is full. Maximum participant capacity reached.");
            case "EVENT_CLOSED":
            case "REGISTRATION_CLOSED":
              throw new Error("Registration deadline for this event has passed.");
            case "EVENT_EXPIRED":
              throw new Error("This event has already taken place.");
            case "EVENT_NOT_OPEN":
              throw new Error("Registration for this event is currently unavailable.");
            case "EVENT_NOT_FOUND":
              throw new Error("Selected event could not be found.");
            case "INVALID_NAME":
              throw new Error("Please enter a valid participant name (2–100 characters).");
            case "INVALID_EMAIL":
              throw new Error("Please enter a valid email address.");
            case "INVALID_PHONE":
              throw new Error("Please enter a valid phone number.");
            case "INVALID_AGE":
              throw new Error("Age must be between 1 and 120.");
            default:
              throw new Error(res.message || "Registration failed. Please check your details.");
          }
        }
        regResult = res;
      } catch (rpcErr) {
        const msg = rpcErr.message || "";
        if (
          msg.includes("already registered") ||
          msg.includes("capacity reached") ||
          msg.includes("Registration deadline") ||
          msg.includes("already taken place") ||
          msg.includes("currently unavailable") ||
          msg.includes("could not be found") ||
          msg.includes("valid participant name") ||
          msg.includes("valid email address") ||
          msg.includes("valid phone number")
        ) {
          throw rpcErr;
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
                qr_payload: null, // Never store PII in qr_payload
              },
            ])
            .select("id, registration_number, created_at")
            .single();

          if (insertError) {
            if (insertError.code === "23505" || insertError.message?.includes("unique")) {
              throw new Error("You are already registered for this event with this email or phone.");
            }
            throw insertError;
          }
          regResult = insertData;
        } else {
          throw rpcErr;
        }
      }

      setTicket({
        id: regResult.registration_id || regResult.id,
        registration_number: regResult.registration_number || `SX-${Date.now().toString().slice(-6)}`,
        checkin_token: regResult.check_in_token || regResult.checkin_token || regResult.id,
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
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Ticket verification QR Code"
                      width="190"
                      height="190"
                      style={{ width: "100%", height: "100%", display: "block" }}
                    />
                  ) : (
                    <div style={{ color: "#070707", fontFamily: "monospace", fontSize: "0.82rem", textAlign: "center" }}>
                      <strong>OFFICIAL PASS</strong><br />
                      {ticket.registration_number}
                    </div>
                  )}
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
                    {/* Bot detection honeypot field (hidden from real users) */}
                    <div style={{ display: "none" }} aria-hidden="true">
                      <label htmlFor="reg-honeypot">Leave blank</label>
                      <input
                        id="reg-honeypot"
                        name="reg_hp"
                        type="text"
                        tabIndex="-1"
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

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
