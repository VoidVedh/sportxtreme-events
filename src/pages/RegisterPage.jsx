import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RegisterPage() {
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

  const [status, setStatus] = useState({ loading: false, success: false, error: "" });
  const [ticket, setTicket] = useState(null);

  // Fetch active events for dropdown selection
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, event_date, registration_deadline, max_participants")
          .order("event_date", { ascending: false });
        if (error) throw error;
        setEvents(data || []);
        if (!selectedEventId && data && data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setEventsLoading(false);
      }
    }
    fetchEvents();
  }, [selectedEventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    // Client-side validations
    if (!name.trim()) {
      setStatus({ loading: false, success: false, error: "Please enter your name." });
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setStatus({ loading: false, success: false, error: "Please enter a valid email address." });
      return;
    }
    if (!phone.trim()) {
      setStatus({ loading: false, success: false, error: "Please enter your phone number." });
      return;
    }
    // Validation
    if (!selectedEventId) {
      setStatus({ loading: false, success: false, error: "Please select an event." });
      return;
    }

    try {
      // Fetch selected event details for validation
      const selectedEvent = events.find(ev => ev.id === selectedEventId);
      if (selectedEvent) {
        // 1. Check registration deadline
        if (selectedEvent.registration_deadline) {
          const deadline = new Date(selectedEvent.registration_deadline);
          const today = new Date();
          deadline.setHours(23, 59, 59, 999);
          if (today > deadline) {
            setStatus({ loading: false, success: false, error: "Registration for this event has closed (deadline passed)." });
            return;
          }
        }

        // 2. Check maximum participant limit
        if (selectedEvent.max_participants) {
          const { count, error: countError } = await supabase
            .from("registrations")
            .select("id", { count: "exact", head: true })
            .eq("event_id", selectedEventId);
          
          if (!countError && count !== null && count >= selectedEvent.max_participants) {
            setStatus({ loading: false, success: false, error: "Registration is full. Maximum participant limit reached." });
            return;
          }
        }

        // 3. Prevent duplicate registrations for this event by checking the database
        const { data: existingReg, error: checkError } = await supabase
          .from("registrations")
          .select("id")
          .eq("event_id", selectedEventId)
          .eq("email", email.trim())
          .limit(1);

        if (checkError) {
          console.warn("Error checking for duplicate registration:", checkError.message);
        } else if (existingReg && existingReg.length > 0) {
          setStatus({ loading: false, success: false, error: "You are already registered for this event with this email address." });
          return;
        }
      }
      const payload = {
        event_id: selectedEventId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        age: age ? parseInt(age, 10) : null,
        tshirt_size: tshirtSize,
        status: "pending",
        qr_payload: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }
      };

      const { data, error } = await supabase
        .from("registrations")
        .insert([payload])
        .select("id, registration_number, created_at")
        .single();

      if (error) throw error;



      setTicket({
        id: data.id,
        registration_number: data.registration_number,
        name: name.trim(),
        email: email.trim(),
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
      console.error("Registration failed:", err);
      setStatus({
        loading: false,
        success: false,
        error: err.message || "Failed to submit registration. Please verify the registrations table exists."
      });
    }
  };

  const selectedEventDetails = events.find(ev => ev.id === selectedEventId);

  return (
    <div style={{ background: C.black, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <Navbar />

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
        <div
          style={{
            position: "absolute", right: "-2%", top: "50%", transform: "translateY(-50%)",
            fontFamily: "'Bebas Neue', cursive", fontSize: "20vw",
            color: "rgba(229,9,20,0.03)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
          }}
        >
          TICKET
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

        <div className="eyebrow" style={{ position: "relative" }}>Join the Action</div>
        <h1 className="bebas" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 0.9, position: "relative" }}>
          PARTICIPANT <span style={{ color: C.red }}>REGISTRATION</span>
        </h1>
        {selectedEventDetails && (
          <p style={{ color: C.red, marginTop: 12, fontSize: "1.1rem", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", position: "relative" }}>
            Registering for: {selectedEventDetails.title}
          </p>
        )}
      </div>

      <div style={{ padding: "60px 5% 100px", display: "flex", justifyContent: "center" }}>
        {status.success && ticket ? (
          /* TICKET VIEW (QR CODE RECEIVED) */
          <div
            id="printable-ticket"
            style={{
              width: "100%", maxWidth: 500,
              border: "1px solid rgba(229,9,20,0.3)",
              background: "rgba(255,255,255,0.02)",
              padding: "40px",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Red header border */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: C.red }} />

            <div className="bebas" style={{ fontSize: "1.8rem", letterSpacing: "0.04em", color: "#fff", marginBottom: 4 }}>
              REGISTRATION CONFIRMED
            </div>
            <div style={{ fontSize: "0.8rem", color: C.gray, marginBottom: 28 }}>
              Thank you for registering. Present this QR code at the check-in gate.
            </div>

            {/* QR Code Container */}
            <div
              style={{
                background: "#fff",
                padding: "20px",
                width: 240,
                height: 240,
                margin: "0 auto 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid rgba(229,9,20,0.1)",
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.id)}`}
                alt="Ticket QR Code"
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div className="bebas" style={{ fontSize: "1.4rem", color: C.red, letterSpacing: "0.05em", marginBottom: 18 }}>
              TICKET ID: {ticket.registration_number}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: C.gray }}>Participant Name:</span>
                <span style={{ fontWeight: 600 }}>{ticket.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: C.gray }}>Email Address:</span>
                <span style={{ fontWeight: 600 }}>{ticket.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: C.gray }}>Event Name:</span>
                <span style={{ fontWeight: 600, color: C.red }}>{ticket.eventTitle}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                <span style={{ color: C.gray }}>Event Date:</span>
                <span style={{ fontWeight: 600 }}>{ticket.eventDate}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <button
                className="red-btn"
                style={{ flex: 1, padding: "12px 0", fontSize: "0.85rem" }}
                onClick={() => window.print()}
              >
                🖨️ PRINT TICKET
              </button>
              <button
                className="out-btn"
                style={{ flex: 1, padding: "12px 0", fontSize: "0.85rem" }}
                onClick={() => navigate("/events")}
              >
                DONE
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div
            style={{
              width: "100%", maxWidth: 600,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)",
              padding: "40px 36px",
            }}
          >
            <h2 className="bebas" style={{ fontSize: "1.8rem", marginBottom: 24, letterSpacing: "0.04em" }}>
              ENTER PARTICIPANT DETAILS
            </h2>

            {status.error && (
              <div style={{ padding: "12px 16px", background: "rgba(229,9,20,0.1)", border: "1px solid #E50914", color: "#E50914", fontSize: "0.85rem", marginBottom: 20 }}>
                {status.error}
              </div>
            )}

            {eventsLoading ? (
              <div style={{ color: C.gray }}>Loading event configurations...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Event Select Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.75rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Select Event *
                  </label>
                  <select
                    className="form-f"
                    value={selectedEventId}
                    disabled={status.loading}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="">-- Choose an Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "TBD"})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: "0.75rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Full Name *
                    </label>
                    <input
                      className="form-f"
                      placeholder="Enter full name"
                      value={name}
                      disabled={status.loading}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: "0.75rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-f"
                      placeholder="e.g. +91 9999999999"
                      value={phone}
                      disabled={status.loading}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.75rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-f"
                    placeholder="Enter email address"
                    value={email}
                    disabled={status.loading}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: "0.75rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Age
                    </label>
                    <input
                      type="number"
                      className="form-f"
                      placeholder="Age"
                      value={age}
                      disabled={status.loading}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: "0.75rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      T-shirt Size *
                    </label>
                    <select
                      className="form-f"
                      value={tshirtSize}
                      disabled={status.loading}
                      onChange={(e) => setTshirtSize(e.target.value)}
                    >
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">Double Extra Large (XXL)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="red-btn"
                  style={{ width: "100%", padding: 16, marginTop: 12 }}
                  disabled={status.loading}
                >
                  {status.loading ? "REGISTERING..." : "CONFIRM REGISTRATION →"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
