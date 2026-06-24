import { SPONSOR_BENEFITS, C } from "../data/content";
import { useModal } from "../context/ModalContext";

export default function Sponsors() {
  const { openModal } = useModal();

  return (
    <section
      id="sponsors"
      style={{
        padding: "100px 5%",
        background: "rgba(229,9,20,0.025)",
        borderTop:    "1px solid rgba(229,9,20,0.08)",
        borderBottom: "1px solid rgba(229,9,20,0.08)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>For Brands &amp; Sponsors</div>
        <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
          SPONSOR AN EVENT.<br /><span style={{ color: C.red }}>OWN A MOMENT.</span>
        </h2>
      </div>

      <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {SPONSOR_BENEFITS.map((item) => (
          <div key={item.title} className="card-lift" style={{ padding: "28px 24px", border: "1px solid rgba(255,255,255,0.06)", background: C.black }}>
            <div style={{ fontSize: "1.7rem", marginBottom: 12 }}>{item.icon}</div>
            <div className="bebas" style={{ fontSize: "1.05rem", letterSpacing: "0.05em", marginBottom: 10 }}>{item.title}</div>
            <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.7 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <button
          id="sponsors-become-sponsor"
          className="red-btn"
          onClick={() => openModal("sponsor")}
        >
          BECOME A SPONSOR →
        </button>
      </div>
    </section>
  );
}
