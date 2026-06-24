import { useState, useEffect } from "react";
import { CONTACT_INFO, C } from "../data/content";
import { useModal } from "../context/ModalContext";

export default function Contact() {
  const [activeTab, setActiveTab] = useState("contact"); // "contact" or "proposal"
  const { activeModal, closeModal } = useModal();

  // When "proposal" modal is triggered, scroll here and switch tab
  useEffect(() => {
    if (activeModal === "proposal") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab("proposal");
      // brief delay then close "modal" so next trigger works
      setTimeout(() => closeModal(), 600);
    }
  }, [activeModal, closeModal]);

  // Contact Form State
  const [contactData, setContactData] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ loading: false, success: false, error: "" });

  // Proposal Form State
  const [proposalData, setProposalData] = useState({ companyName: "", eventType: "", participants: "", budget: "", description: "" });
  const [proposalStatus, setProposalStatus] = useState({ loading: false, success: false, error: "" });

  const switchTab = (tab) => {
    setActiveTab(tab);
    setContactStatus({ loading: false, success: false, error: "" });
    setProposalStatus({ loading: false, success: false, error: "" });
  };

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

    // Simulate API call with local state
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store in local storage for demo purposes
    const submission = {
      name: contactData.name.trim(),
      phone: contactData.phone.trim() || null,
      email: contactData.email.trim(),
      message: contactData.message.trim(),
      timestamp: new Date().toISOString(),
    };
    
    const existingSubmissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
    existingSubmissions.push(submission);
    localStorage.setItem('contact_submissions', JSON.stringify(existingSubmissions));

    setContactStatus({ loading: false, success: true, error: "" });
    setContactData({ name: "", phone: "", email: "", message: "" });
  };

  // Submit Proposal Form
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setProposalStatus({ loading: true, success: false, error: "" });

    // Validation
    if (!proposalData.companyName.trim()) {
      setProposalStatus({ loading: false, success: false, error: "Please enter your name or company name." });
      return;
    }
    if (!proposalData.eventType) {
      setProposalStatus({ loading: false, success: false, error: "Please select an event type." });
      return;
    }
    if (!proposalData.description.trim()) {
      setProposalStatus({ loading: false, success: false, error: "Please tell us about your event." });
      return;
    }

    // Simulate API call with local state
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store in local storage for demo purposes
    const submission = {
      company_name: proposalData.companyName.trim(),
      event_type: proposalData.eventType,
      participants: proposalData.participants.trim() || null,
      budget: proposalData.budget.trim() || null,
      description: proposalData.description.trim(),
      timestamp: new Date().toISOString(),
    };
    
    const existingSubmissions = JSON.parse(localStorage.getItem('proposal_submissions') || '[]');
    existingSubmissions.push(submission);
    localStorage.setItem('proposal_submissions', JSON.stringify(existingSubmissions));

    setProposalStatus({ loading: false, success: true, error: "" });
    setProposalData({ companyName: "", eventType: "", participants: "", budget: "", description: "" });
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
                      <a href="tel:+918976571622" className="flink" style={{ display: "inline-block", margin: 0 }}>+91 8976571622</a>
                      <br />
                      <a href="tel:+919136890309" className="flink" style={{ display: "inline-block", margin: 0 }}>+91 9136890309</a>
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
          {/* Tabs */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              onClick={() => switchTab("contact")}
              style={{
                background: "none", border: "none", padding: "10px 0", cursor: "pointer",
                color: activeTab === "contact" ? "#fff" : "rgba(255,255,255,0.4)",
                borderBottom: activeTab === "contact" ? `2px solid ${C.red}` : "2px solid transparent",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.05em",
                transition: "all 0.3s"
              }}
            >
              GENERAL INQUIRY
            </button>
            <button
              type="button"
              onClick={() => switchTab("proposal")}
              style={{
                background: "none", border: "none", padding: "10px 0", cursor: "pointer",
                color: activeTab === "proposal" ? "#fff" : "rgba(255,255,255,0.4)",
                borderBottom: activeTab === "proposal" ? `2px solid ${C.red}` : "2px solid transparent",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.05em",
                transition: "all 0.3s"
              }}
            >
              REQUEST A PROPOSAL
            </button>
          </div>

          {activeTab === "contact" ? (
            /* GENERAL INQUIRY (CONTACT FORM) */
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
          ) : (
            /* REQUEST A PROPOSAL (PROPOSAL FORM) */
            <form onSubmit={handleProposalSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {proposalStatus.success && (
                <div style={{ padding: "12px 16px", background: "rgba(37,211,102,0.1)", border: "1px solid #25D366", color: "#25D366", fontSize: "0.85rem" }}>
                  Proposal request submitted successfully!
                </div>
              )}
              {proposalStatus.error && (
                <div style={{ padding: "12px 16px", background: "rgba(229,9,20,0.1)", border: "1px solid #E50914", color: "#E50914", fontSize: "0.85rem" }}>
                  {proposalStatus.error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <input
                  className="form-f"
                  placeholder="Your Name / Company Name *"
                  value={proposalData.companyName}
                  disabled={proposalStatus.loading}
                  onChange={(e) => setProposalData({ ...proposalData, companyName: e.target.value })}
                />
                <select
                  className="form-f"
                  value={proposalData.eventType}
                  disabled={proposalStatus.loading}
                  onChange={(e) => setProposalData({ ...proposalData, eventType: e.target.value })}
                >
                  <option value="">Event Type *</option>
                  <option value="Corporate Sports League">Corporate Sports League</option>
                  <option value="School Championship">School Championship</option>
                  <option value="Marathon / Mass Event">Marathon / Mass Event</option>
                  <option value="Tournament Management">Tournament Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <input
                  className="form-f"
                  placeholder="Expected Number of Participants"
                  value={proposalData.participants}
                  disabled={proposalStatus.loading}
                  onChange={(e) => setProposalData({ ...proposalData, participants: e.target.value })}
                />
                <input
                  className="form-f"
                  placeholder="Expected Budget"
                  value={proposalData.budget}
                  disabled={proposalStatus.loading}
                  onChange={(e) => setProposalData({ ...proposalData, budget: e.target.value })}
                />
              </div>
              <textarea
                className="form-f"
                placeholder="Tell us about your event (requirements, sport preference, dates, etc.) *"
                style={{ height: 120, resize: "vertical" }}
                value={proposalData.description}
                disabled={proposalStatus.loading}
                onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
              />
              <button
                type="submit"
                className="red-btn"
                style={{ width: "100%", padding: 16 }}
                disabled={proposalStatus.loading}
              >
                {proposalStatus.loading ? "SUBMITTING..." : "SEND PROPOSAL REQUEST →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

