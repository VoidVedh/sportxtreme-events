import { TECH_FEATURES, C } from "../data/content";

export default function Technology() {
  return (
    <section style={{ padding: "100px 5%", background: "linear-gradient(180deg, rgba(229,9,20,0.035) 0%, transparent 100%)" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>Technology First</div>
        <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
          POWERING EVENTS WITH<br /><span style={{ color: C.red }}>TECHNOLOGY</span>
        </h2>
      </div>

      <div
        className="g2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          maxWidth: 800,
          margin: "0 auto"
        }}
      >
        {TECH_FEATURES.map((tech) => (
          <div
            key={tech.title}
            className="tech-card"
            style={{
              borderColor: tech.hot ? "rgba(229,9,20,0.3)"   : "rgba(255,255,255,0.06)",
              background:  tech.hot ? "rgba(229,9,20,0.06)"  : "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: 14 }}>{tech.icon}</div>
            <div className="bebas" style={{ fontSize: "1.1rem", letterSpacing: "0.05em", marginBottom: 10 }}>{tech.title}</div>
            <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.7 }}>{tech.desc}</p>
            {tech.hot && (
              <div style={{ marginTop: 14, fontSize: "0.68rem", color: C.red, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                ★ Most Used Feature
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
