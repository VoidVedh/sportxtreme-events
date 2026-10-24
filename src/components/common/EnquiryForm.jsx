import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { SITE_CONFIG } from "../../config/siteContent";

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "Tournament",
    participants: "",
    message: "",
    hp_website: "", // Honeypot field for anti-spam bots
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const validate = () => {
    const errs = {};
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();
    const cleanMessage = formData.message.trim();

    if (!cleanName) {
      errs.name = "Please enter your name.";
    } else if (cleanName.length > 100) {
      errs.name = "Name must be under 100 characters.";
    }

    if (!cleanEmail) {
      errs.email = "Please enter your email address.";
    } else if (!/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(cleanEmail)) {
      errs.email = "Please enter a valid email address.";
    } else if (cleanEmail.length > 100) {
      errs.email = "Email must be under 100 characters.";
    }

    if (cleanPhone) {
      if (cleanPhone.length > 20) {
        errs.phone = "Phone number must be under 20 characters.";
      } else if (!/^[+0-9\s\-()]+$/.test(cleanPhone)) {
        errs.phone = "Please enter a valid phone number.";
      }
    }

    if (!cleanMessage) {
      errs.message = "Please describe your event requirements.";
    } else if (cleanMessage.length > 1000) {
      errs.message = "Message must be under 1000 characters.";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Bot detection via honeypot
    if (formData.hp_website) {
      // Silently exit
      setStatus({ loading: false, success: true, error: "" });
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const el = document.getElementById(`enquiry-${firstField}`);
      if (el) el.focus();
      return;
    }

    setErrors({});
    setStatus({ loading: true, success: false, error: "" });

    try {
      const cleanName = formData.name.trim();
      const cleanEmail = formData.email.trim();
      const cleanPhone = formData.phone.trim() || null;
      const cleanMessage = formData.message.trim();
      const eventType = formData.eventType;
      const participants = formData.participants.trim() || "Not specified";

      const detailedMessage = `[Event Type: ${eventType}] [Estimated Participants: ${participants}]\n\n${cleanMessage}`;

      // Insert directly into contacts table using anon key
      const { error: dbError } = await supabase.from("contacts").insert([
        {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          message: detailedMessage,
        },
      ]);

      if (dbError) throw dbError;

      setStatus({ loading: false, success: true, error: "" });
      setFormData({
        name: "",
        phone: "",
        email: "",
        eventType: "Tournament",
        participants: "",
        message: "",
        hp_website: "",
      });
    } catch (err) {
      console.warn("Enquiry submission notice:", err.message || err);
      setStatus({
        loading: false,
        success: false,
        error: "Unable to submit inquiry at this moment. Please contact us directly via WhatsApp or Email below.",
      });
    }
  };

  return (
    <div
      className="sx-card"
      style={{
        padding: "36px 32px",
        background: "var(--sx-surface)",
        border: "1px solid var(--sx-border-strong)",
      }}
    >
      <h3
        className="sx-display"
        style={{
          fontSize: "1.7rem",
          letterSpacing: "0.04em",
          color: "var(--sx-text-primary)",
          marginBottom: 8,
        }}
      >
        PLAN AN EVENT WITH SPORTXTREME
      </h3>
      <p style={{ color: "var(--sx-text-muted)", fontSize: "0.88rem", marginBottom: 28, lineHeight: 1.5 }}>
        Tell us about your event format, dates, or sporting requirements. Our team will review and connect with you.
      </p>

      {status.success ? (
        <div
          role="status"
          style={{
            background: "rgba(37, 211, 102, 0.12)",
            border: "1px solid #25D366",
            borderRadius: "var(--sx-radius-sm)",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>✅</div>
          <h4 className="sx-display" style={{ fontSize: "1.4rem", color: "#25D366", marginBottom: 8 }}>
            INQUIRY SUBMITTED SUCCESSFULLY
          </h4>
          <p style={{ color: "var(--sx-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Thank you for reaching out. A SportXtreme coordinator will review your requirements and respond shortly.
          </p>
          <button
            type="button"
            className="sx-btn-secondary"
            onClick={() => setStatus({ loading: false, success: false, error: "" })}
            style={{ marginTop: 18 }}
          >
            Submit Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot anti-spam field (hidden from real users) */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="hp_website">Leave empty</label>
            <input
              id="hp_website"
              name="hp_website"
              type="text"
              tabIndex="-1"
              autoComplete="off"
              value={formData.hp_website}
              onChange={(e) => setFormData({ ...formData, hp_website: e.target.value })}
            />
          </div>

          {status.error && (
            <div
              role="alert"
              style={{
                background: "rgba(229, 9, 20, 0.12)",
                border: "1px solid var(--sx-red)",
                borderRadius: "var(--sx-radius-sm)",
                padding: "16px",
                color: "#ff6b6b",
                fontSize: "0.88rem",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              {status.error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {/* Name */}
            <div className="sx-field">
              <label htmlFor="enquiry-name" className="sx-label">
                Full Name *
              </label>
              <input
                id="enquiry-name"
                type="text"
                className="sx-input"
                placeholder="Your name or organization"
                value={formData.name}
                disabled={status.loading}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "enquiry-name-error" : undefined}
              />
              {errors.name && (
                <span id="enquiry-name-error" className="sx-field-error">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="sx-field">
              <label htmlFor="enquiry-email" className="sx-label">
                Email Address *
              </label>
              <input
                id="enquiry-email"
                type="email"
                className="sx-input"
                placeholder="name@company.com"
                value={formData.email}
                disabled={status.loading}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "enquiry-email-error" : undefined}
              />
              {errors.email && (
                <span id="enquiry-email-error" className="sx-field-error">
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {/* Phone */}
            <div className="sx-field">
              <label htmlFor="enquiry-phone" className="sx-label">
                Phone Number
              </label>
              <input
                id="enquiry-phone"
                type="tel"
                className="sx-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                disabled={status.loading}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "enquiry-phone-error" : undefined}
              />
              {errors.phone && (
                <span id="enquiry-phone-error" className="sx-field-error">
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Event Category / Type */}
            <div className="sx-field">
              <label htmlFor="enquiry-type" className="sx-label">
                Event Category
              </label>
              <select
                id="enquiry-type"
                className="sx-select"
                value={formData.eventType}
                disabled={status.loading}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="Tournament">Tournament (Cricket / Football / Badminton)</option>
                <option value="Corporate League">Corporate Sports League</option>
                <option value="School Championship">School / College Championship</option>
                <option value="Marathon / Run">Marathon & Mass Event</option>
                <option value="Venue & Gate Operations">Venue Setup & Gate Check-in</option>
                <option value="Other">Other Sports Initiative</option>
              </select>
            </div>
          </div>

          {/* Expected Participants */}
          <div className="sx-field">
            <label htmlFor="enquiry-participants" className="sx-label">
              Estimated Participants
            </label>
            <input
              id="enquiry-participants"
              type="text"
              className="sx-input"
              placeholder="e.g. 50–100 players, 500 runners, 16 teams"
              value={formData.participants}
              disabled={status.loading}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            />
          </div>

          {/* Message */}
          <div className="sx-field">
            <label htmlFor="enquiry-message" className="sx-label">
              Event Details & Scope *
            </label>
            <textarea
              id="enquiry-message"
              className="sx-textarea"
              placeholder="Tell us about the desired date, sports, venues, or special logistics..."
              value={formData.message}
              disabled={status.loading}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: null });
              }}
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "enquiry-message-error" : undefined}
            />
            {errors.message && (
              <span id="enquiry-message-error" className="sx-field-error">
                {errors.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="sx-btn-primary"
            disabled={status.loading}
            style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
          >
            {status.loading ? "SUBMITTING INQUIRY…" : "SUBMIT EVENT INQUIRY →"}
          </button>
        </form>
      )}
    </div>
  );
}
