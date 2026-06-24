import { SERVICES, WHY_ITEMS, C } from "../data/content";

export default function Services() {
  return (
    <>
      {/* ═══ WHY SPORTXTREME ═══ */}
      <section style={{ padding: "100px 5%", background: "rgba(255,255,255,0.012)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Why Choose Us</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            THE SPORTXTREME<br /><span style={{ color: C.red }}>ADVANTAGE</span>
          </h2>
        </div>
        <div
          className="g3"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}
        >
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="wcard">
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>{item.icon}</div>
              <div className="bebas" style={{ fontSize: "1.1rem", letterSpacing: "0.05em", marginBottom: 12 }}>{item.title}</div>
              <p style={{ color: C.gray, fontSize: "0.83rem", lineHeight: 1.72 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ OUR SERVICES ═══ */}
      <section id="services" style={{ padding: "100px 5%", background: "rgba(255,255,255,0.012)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>What We Do</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            OUR <span style={{ color: C.red }}>SERVICES</span>
          </h2>
        </div>
        <div
          className="g3"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}
        >
          {SERVICES.map((s) => (
            <div key={s.title} className="card-lift" style={{ background: C.black, padding: "32px 28px", border: "none" }}>
              <div
                style={{
                  width: 48, height: 48,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem",
                  background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)",
                  marginBottom: 20,
                  clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))",
                }}
              >
                {s.icon}
              </div>
              <div style={{ width: 40, height: 2, background: C.red, marginBottom: 18 }} />
              <div className="bebas" style={{ fontSize: "1.05rem", letterSpacing: "0.04em", marginBottom: 10 }}>{s.title}</div>
              <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.72 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
