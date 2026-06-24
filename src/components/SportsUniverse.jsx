import { useState } from "react";
import { SPORTS_CATS, C } from "../data/content";
import { scrollToSection } from "../lib/scroll";

export default function SportsUniverse() {
  const [activeCat, setActiveCat] = useState("outdoor");
  const cat = SPORTS_CATS[activeCat];

  return (
    <section id="sports-universe" style={{ padding: "100px 5%", position: "relative", overflow: "hidden" }}>
      {/* Background X watermark */}
      <div
        style={{
          position: "absolute", left: "-5%", top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "35vw",
          color: "rgba(229,9,20,0.02)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}
      >
        X
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>Our Sports Universe</div>
        <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
          EVERY SPORT.<br /><span style={{ color: C.red }}>EVERY SCALE.</span>
        </h2>
        <p style={{ color: C.gray, marginTop: 20, maxWidth: 480, margin: "20px auto 0", lineHeight: 1.7 }}>
          From intimate indoor tournaments to city-scale marathons — we have the expertise to manage
          any sporting event at any level.
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        {Object.entries(SPORTS_CATS).map(([key, c]) => (
          <button
            key={key}
            className={`sport-tab ${activeCat === key ? "on" : ""}`}
            onClick={() => setActiveCat(key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.06)", borderTop: "none",
          background: "rgba(255,255,255,0.01)", position: "relative", zIndex: 1,
        }}
      >
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Description side */}
          <div style={{ padding: "48px 40px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{cat.emoji}</div>
            <h3 className="bebas" style={{ fontSize: "2.2rem", marginBottom: 16 }}>{cat.label}</h3>
            <p style={{ color: C.gray, lineHeight: 1.75, marginBottom: 28 }}>{cat.desc}</p>
            <button
              type="button"
              className="red-btn"
              style={{ fontSize: "0.85rem", padding: "12px 24px" }}
              onClick={() => scrollToSection("services")}
            >
              EXPLORE THIS CATEGORY →
            </button>
          </div>

          {/* Sport list */}
          <div style={{ padding: "48px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {cat.list.map((sport, i) => (
                <div
                  key={sport}
                  className={`sport-item${i === 0 ? " active" : ""}`}
                >
                  <div className={`bebas sport-label`} style={{ fontSize: "0.95rem", letterSpacing: "0.05em" }}>
                    {sport}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
