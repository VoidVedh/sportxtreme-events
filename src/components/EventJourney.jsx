import { useState } from "react";
import { JOURNEY, C } from "../data/content";

export default function EventJourney() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section style={{ padding: "100px 5%", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>The Process</div>
        <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
          YOUR EVENT <span style={{ color: C.red }}>JOURNEY</span>
        </h2>
      </div>

      <div style={{ position: "relative" }}>
        {/* Connector line (desktop only) */}
        <div
          className="dn-mob"
          style={{
            position: "absolute", top: 26, left: "5%", right: "5%", height: 2,
            background: `linear-gradient(90deg, ${C.red}, rgba(229,9,20,0.12))`,
            zIndex: 0,
          }}
        />

        {/* Steps */}
        <div
          className="jgrid"
          style={{ display: "grid", gridTemplateColumns: `repeat(${JOURNEY.length}, 1fr)`, gap: 8, position: "relative", zIndex: 1 }}
        >
          {JOURNEY.map((step, i) => (
            <div
              key={step.n}
              onClick={() => setActiveStep(i)}
              style={{ textAlign: "center", padding: "0 6px", cursor: "pointer" }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  border: `2px solid ${i <= activeStep ? C.red : "rgba(255,255,255,0.15)"}`,
                  background: i === activeStep ? C.red : i < activeStep ? "rgba(229,9,20,0.1)" : C.black,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
                  color: i === activeStep ? C.white : i <= activeStep ? C.red : C.gray,
                  transition: "all 0.3s",
                }}
              >
                {step.n}
              </div>

              <div
                className="bebas"
                style={{ fontSize: "0.82rem", letterSpacing: "0.06em", marginBottom: 6, color: i === activeStep ? C.white : C.gray, transition: "color 0.3s" }}
              >
                {step.title}
              </div>
              <div style={{ fontSize: "0.67rem", color: C.gray, lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active step detail panel */}
      <div
        style={{
          marginTop: 40,
          border: "1px solid rgba(229,9,20,0.25)",
          background: "rgba(229,9,20,0.04)",
          padding: "24px 32px",
          display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
          transition: "all 0.4s",
        }}
      >
        <div className="bebas" style={{ fontSize: "3.5rem", color: C.red, opacity: 0.45, lineHeight: 1 }}>
          {JOURNEY[activeStep].n}
        </div>
        <div>
          <div className="bebas" style={{ fontSize: "1.5rem", marginBottom: 4 }}>{JOURNEY[activeStep].title}</div>
          <div style={{ color: C.gray, fontSize: "0.88rem" }}>{JOURNEY[activeStep].desc}</div>
        </div>
      </div>
    </section>
  );
}
