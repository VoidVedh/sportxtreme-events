import { useState, useEffect } from "react";
import { CONTACT_INFO, C } from "../data/content";
import { useModal } from "../context/ModalContext";
import { supabase } from "../lib/supabase";

export default function Contact() {
  // Contact Form State
  const [contactData, setContactData] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ loading: false, success: false, error: "" });

  // WhatsApp click handler
  const handleWhatsApp = () => {
    window.open("https://wa.me/918976571622", "_blank");
  };

  // Submit Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, success: false, error: "" });

    // Validation
    if (!contactData.name.trim()) {
      setContactStatus({ loading: false, success: false, error: "Please enter your name." });
      return;
    }
    if (!contactData.email.trim() || !/\S+@\S+\.\S+/.test(contactData.email)) {
      setContactStatus({ loading: false, success: false, error: "Please enter a valid email address." });
      return;
    }
    if (!contactData.message.trim()) {
      setContactStatus({ loading: false, success: false, error: "Please enter your message." });
      return;
    }

    const { error } = await supabase.from("contacts").insert([{
      name: contactData.name.trim(),
      phone: contactData.phone.trim() || null,
      email: contactData.email.trim(),
      message: contactData.message.trim(),
    }]);

    if (error) {
      setContactStatus({ loading: false, success: false, error: "Failed to send message. Please try again." });
      return;
    }

    setContactStatus({ loading: false, success: true, error: "" });
    setContactData({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <section id="contact" style={{ padding: "100px 5%", background: "rgba(255,255,255,0.012)", position: "relative", overflow: "hidden" }}>
      {/* Background watermark */}
      <div
        style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "18vw",
          color: "rgba(229,9,20,0.02)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}
      >
        CONTACT
      </div>

      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
        {/* Left — info */}
        <div>
          <div className="eyebrow">Get In Touch</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 0.92, marginBottom: 24 }}>
            READY TO CREATE<br /><span style={{ color: C.red }}>CHAMPIONS</span><br />TOGETHER?
          </h2>
          <p style={{ color: C.gray, lineHeight: 1.8, marginBottom: 48, maxWidth: 400 }}>
            Let&apos;s talk about your next sporting event. Whether it&apos;s a school championship or a city marathon,
            we&apos;re ready to make it extraordinary.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {CONTACT_INFO.map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 44, height: 44, flexShrink: 0,
                    border: "1px solid rgba(229,9,20,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: C.red, textTransform: "uppercase", marginBottom: 4 }}>
                    {c.label}
                  </div>
                  {c.label === "Call Us" ? (
                    <div style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                      <a href="tel:+918976571622" className="flink" style={{ display: "block", margin: "0 0 4px 0" }}>+91 89765 71622</a>
                      <a href="tel:+919136890309" className="flink" style={{ display: "block", margin: 0 }}>+91 91368 90309</a>
                    </div>
                  ) : c.label === "Email" ? (
                    <div style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                      <a href="mailto:sportxtremeevents@gmail.com" className="flink" style={{ display: "inline-block", margin: 0 }}>{c.val}</a>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>{c.val}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsApp}
            style={{
              marginTop: 32, background: "#25D366", color: "#fff", border: "none",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
              padding: "13px 28px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            💬 CHAT ON WHATSAPP
          </button>
        </div>

        {/* Right — form tab container */}
        <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "40px 36px", background: "rgba(255,255,255,0.01)" }}>
          <h3 className="bebas" style={{ fontSize: "1.5rem", marginBottom: 24, letterSpacing: "0.05em" }}>
            GENERAL INQUIRY
          </h3>
          <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {contactStatus.success && (
              <div style={{ padding: "12px 16px", background: "rgba(37,211,102,0.1)", border: "1px solid #25D366", color: "#25D366", fontSize: "0.85rem" }}>
                Message sent successfully! We will get back to you shortly.
              </div>
            )}
            {contactStatus.error && (
              <div style={{ padding: "12px 16px", background: "rgba(229,9,20,0.1)", border: "1px solid #E50914", color: "#E50914", fontSize: "0.85rem" }}>
                {contactStatus.error}
              </div>
            )}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input
                className="form-f"
                placeholder="Your Name *"
                value={contactData.name}
                disabled={contactStatus.loading}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
              />
              <input
                type="tel"
                className="form-f"
                placeholder="Your Phone"
                value={contactData.phone}
                disabled={contactStatus.loading}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
              />
            </div>
            <input
              className="form-f"
              placeholder="Your Email *"
              type="email"
              value={contactData.email}
              disabled={contactStatus.loading}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
            />
            <textarea
              className="form-f"
              placeholder="Your Message *"
              style={{ height: 120, resize: "vertical" }}
              value={contactData.message}
              disabled={contactStatus.loading}
              onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
            />
            <button
              type="submit"
              className="red-btn"
              style={{ width: "100%", padding: 16 }}
              disabled={contactStatus.loading}
            >
              {contactStatus.loading ? "SENDING..." : "SEND MESSAGE →"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
