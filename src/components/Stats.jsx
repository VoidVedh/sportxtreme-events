import { useRef } from "react";
import { useCounter } from "../hooks/useCounter";
import { useInView }  from "../hooks/useInView";
import { C } from "../data/content";

export default function Stats() {
  const statsRef  = useRef(null);
  const statsInView = useInView(statsRef);

  const eventsC  = useCounter(150,   statsInView);
  const partC    = useCounter(50000, statsInView);
  const sportsC  = useCounter(15,    statsInView);
  const clientsC = useCounter(25,    statsInView);

  const STAT_ITEMS = [
    { val: eventsC,                      suf: "+", label: "Events Managed",    icon: "🏆" },
    { val: partC.toLocaleString("en-IN"), suf: "+", label: "Participants",       icon: "🤝" },
    { val: sportsC,                      suf: "+", label: "Sports Categories",  icon: "⚡" },
    { val: clientsC,                     suf: "+", label: "Corporate Clients",  icon: "🏢" },
  ];

  return (
    <section ref={statsRef} style={{ padding: "80px 5%" }}>
      <div
        className="g4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          background: "rgba(255,255,255,0.04)",
          gap: 1,
        }}
      >
        {STAT_ITEMS.map((stat, i) => (
          <div key={stat.label} style={{ background: C.black, padding: "48px 24px", textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: "1.3rem", marginBottom: 10 }}>{stat.icon}</div>
            <div className="bebas" style={{ fontSize: "3.5rem", color: C.red, lineHeight: 1 }}>
              {stat.val}{stat.suf}
            </div>
            <div style={{ color: C.gray, fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 8 }}>
              {stat.label}
            </div>
            {/* Animated bottom bar */}
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                background: C.red,
                transform: statsInView ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: `transform 1.2s ease ${i * 0.2}s`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
