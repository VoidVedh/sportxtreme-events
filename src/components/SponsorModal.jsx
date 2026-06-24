import { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import { C } from "../data/content";

export default function SponsorModal() {
  const { activeModal, closeModal } = useModal();
  const visible = activeModal === "sponsor";

  const [data, setData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    sponsorship_type: "",
    budget: "",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  // Lock body scroll when open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    if (!data.company_name.trim()) {
      setStatus({ loading: false, success: false, error: "Please enter your company / brand name." });
      return;
    }
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) {
      setStatus({ loading: false, success: false, error: "Please enter a valid email address." });
      return;
    }
    if (!data.sponsorship_type) {
      setStatus({ loading: false, success: false, error: "Please select a sponsorship type." });
      return;
    }

    // Simulate API call with local state
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store in local storage for demo purposes
    const submission = {
      company_name: data.company_name,
      event_type: `SPONSOR: ${data.sponsorship_type}`,
      participants: data.contact_person,
      budget: data.budget,
      description: `[Sponsor Inquiry] Contact: ${data.contact_person} | Email: ${data.email} | Phone: ${data.phone} | Message: ${data.message}`,
      timestamp: new Date().toISOString(),
    };
    
    const existingSubmissions = JSON.parse(localStorage.getItem('sponsor_submissions') || '[]');
    existingSubmissions.push(submission);
    localStorage.setItem('sponsor_submissions', JSON.stringify(existingSubmissions));

    setStatus({ loading: false, success: true, error: "" });
    setData({ company_name: "", contact_person: "", email: "", phone: "", sponsorship_type: "", budget: "", message: "" });
  };

  const inp = {
    className: "form-f",
    disabled: status.loading,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(229,9,20,0.2)",
          width: "100%", maxWidth: 580,
          maxHeight: "90vh", overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 36px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>For Brands & Sponsors</div>
            <h2 className="bebas" style={{ fontSize: "2rem", lineHeight: 1, color: "#fff" }}>
              BECOME A <span style={{ color: C.red }}>SPONSOR</span>
            </h2>
          </div>
          <button
            onClick={closeModal}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", cursor: "pointer",
              width: 32, height: 32, fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: 16,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            aria-label="Close sponsor modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 36px 36px" }}>
          {status.success ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎯</div>
              <h3 className="bebas" style={{ fontSize: "1.6rem", marginBottom: 12, color: "#25D366" }}>
                INQUIRY RECEIVED!
              </h3>
              <p style={{ color: C.gray, lineHeight: 1.7, marginBottom: 24 }}>
                Thanks for your interest in sponsoring SportXtreme Events.
                Our team will reach out to you within 24 hours.
              </p>
              <button className="red-btn" onClick={closeModal}>CLOSE →</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {status.error && (
                <div style={{ padding: "12px 16px", background: "rgba(229,9,20,0.1)", border: "1px solid #E50914", color: "#E50914", fontSize: "0.85rem" }}>
                  {status.error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <input {...inp} placeholder="Company / Brand Name *" value={data.company_name}
                  onChange={(e) => setData({ ...data, company_name: e.target.value })} />
                <input {...inp} placeholder="Contact Person" value={data.contact_person}
                  onChange={(e) => setData({ ...data, contact_person: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <input {...inp} type="email" placeholder="Email Address *" value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })} />
                <input {...inp} placeholder="Phone Number" value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <select {...inp} value={data.sponsorship_type}
                  onChange={(e) => setData({ ...data, sponsorship_type: e.target.value })}>
                  <option value="">Sponsorship Type *</option>
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="Co-Sponsor">Co-Sponsor</option>
                  <option value="Associate Sponsor">Associate Sponsor</option>
                  <option value="Category Sponsor">Category Sponsor</option>
                  <option value="In-Kind Sponsor">In-Kind Sponsor</option>
                  <option value="Other">Other</option>
                </select>
                <input {...inp} placeholder="Expected Budget (₹)" value={data.budget}
                  onChange={(e) => setData({ ...data, budget: e.target.value })} />
              </div>

              <textarea
                {...inp}
                className="form-f"
                placeholder="Tell us about your brand, sponsorship goals, or any specific requirements..."
                style={{ height: 110, resize: "vertical" }}
                value={data.message}
                onChange={(e) => setData({ ...data, message: e.target.value })}
              />

              <button
                type="submit"
                className="red-btn"
                style={{ width: "100%", padding: 16 }}
                disabled={status.loading}
              >
                {status.loading ? "SUBMITTING..." : "SEND SPONSORSHIP INQUIRY →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
