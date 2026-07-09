import { C } from "../data/content";
import { scrollToSection } from "../lib/scroll";

const CORNER_POSITIONS = [
  { top: -1,    left:  -1 },
  { top: -1,    right: -1 },
  { bottom: -1, left:  -1 },
  { bottom: -1, right: -1 },
];

const ABOUT_SPORTS = ["Cricket","Football","Marathon","Swimming","Badminton","Basketball","Cyclothon","& More…"];

const VM_ITEMS = [
  { label: "OUR VISION", text: "A professional sports event company delivering premium experiences that inspire excellence and community engagement.", accent: true  },
  { label: "OUR MISSION", text: "Professional event solutions combining strategic planning, flawless execution, technology, and creativity for every event.",    accent: false },
];

export default function About() {
  return (
    <section id="about" style={{ padding: "100px 5%", position: "relative", overflow: "hidden" }}>
      {/* Background watermark */}
      <div
        style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "26vw",
          color: "rgba(229,9,20,0.02)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}
      >
        ABOUT
      </div>

      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
        {/* Left — copy */}
        <div>
          <div className="eyebrow">Who We Are</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", lineHeight: 0.92, marginBottom: 24 }}>
            PROFESSIONAL<br />SPORTS<br /><span style={{ color: C.red }}>EVENT COMPANY</span>
          </h2>
          <p style={{ color: C.gray, lineHeight: 1.8, marginBottom: 18 }}>
            SportXtreme Events is a full-service sports event management company dedicated to crafting
            memorable, professionally managed, result-driven sporting experiences.
          </p>
          <p style={{ color: "rgba(161,161,170,0.7)", lineHeight: 1.8, fontSize: "0.9rem", marginBottom: 36 }}>
            From corporate leagues to school championships and marathons — we bring precision, professional logistics, and passion to every event.
          </p>

          <div style={{ display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
            {VM_ITEMS.map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1, minWidth: 180,
                  borderLeft: `2px solid ${item.accent ? C.red : "rgba(255,255,255,0.15)"}`,
                  paddingLeft: 16,
                }}
              >
                <div className="bebas" style={{ fontSize: "0.8rem", color: item.accent ? C.red : C.white, letterSpacing: "0.1em", marginBottom: 6 }}>
                  {item.label}
                </div>
                <p style={{ fontSize: "0.78rem", color: C.gray, lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
          <button
            id="about-learn-more"
            className="red-btn"
            onClick={() => scrollToSection("about-details")}
          >
            LEARN MORE ABOUT US
          </button>
        </div>

        {/* Right — info card */}
        <div style={{ position: "relative" }} id="about-details">
          <div
            style={{
              border: "1px solid rgba(229,9,20,0.15)",
              background: "rgba(229,9,20,0.03)",
              padding: 48,
              position: "relative",
            }}
          >
            {/* Corner ticks */}
            {CORNER_POSITIONS.map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute", width: 20, height: 20,
                  borderTop:    i < 2      ? `2px solid ${C.red}` : "none",
                  borderBottom: i >= 2     ? `2px solid ${C.red}` : "none",
                  borderLeft:   i === 0 || i === 2 ? `2px solid ${C.red}` : "none",
                  borderRight:  i === 1 || i === 3 ? `2px solid ${C.red}` : "none",
                  ...pos,
                }}
              />
            ))}

            <div className="bebas" style={{ fontSize: "5.5rem", color: C.red, lineHeight: 1, opacity: 0.5, marginBottom: 18 }}>SX</div>
            <div className="bebas" style={{ fontSize: "1.3rem", marginBottom: 12 }}>SPORTXTREME EVENTS</div>
            <div style={{ color: C.gray, fontSize: "0.82rem", marginBottom: 28, lineHeight: 1.6 }}>
              Where Every Game Becomes a Grand Event
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {ABOUT_SPORTS.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: C.gray }}>
                  <div style={{ width: 4, height: 4, background: C.red, borderRadius: "50%", flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Years badge */}
          <div
            style={{
              position: "absolute", bottom: -18, right: -18,
              background: C.red, padding: "18px 20px", textAlign: "center",
              animation: "glowPulse 4s ease-in-out infinite",
            }}
          >
            <div className="bebas" style={{ fontSize: "1.8rem", lineHeight: 1 }}>2025</div>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.08em", lineHeight: 1.4, marginTop: 4 }}>
              FOUNDED IN
            </div>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div style={{ marginTop: 80, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 64 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Executive Leadership</div>
          <h3 className="bebas" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", lineHeight: 1 }}>
            OUR <span style={{ color: C.red }}>TEAM</span>
          </h3>
        </div>

        <div className="g2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32, maxWidth: 800, margin: "0 auto" }}>
          {/* Card 1 */}
          <div className="card-lift" style={{ border: "1px solid rgba(255,255,255,0.06)", background: C.black, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* Image Placeholder */}
            <div style={{ width: 140, height: 140, borderRadius: "50%", background: "rgba(229,9,20,0.05)", border: `1px solid rgba(229,9,20,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: "3rem" }}>
              👤
            </div>
            <h4 className="bebas" style={{ fontSize: "1.4rem", letterSpacing: "0.03em", marginBottom: 4 }}>Co-Founder</h4>
            <div style={{ fontSize: "0.75rem", color: C.red, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontWeight: "bold" }}>Co-Founder & Director of Operations</div>
            <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.6 }}>
              Oversees event logistics, planning, and partner relations to ensure flawless execution.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card-lift" style={{ border: "1px solid rgba(255,255,255,0.06)", background: C.black, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* Image Placeholder */}
            <div style={{ width: 140, height: 140, borderRadius: "50%", background: "rgba(229,9,20,0.05)", border: `1px solid rgba(229,9,20,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: "3rem" }}>
              👤
            </div>
            <h4 className="bebas" style={{ fontSize: "1.4rem", letterSpacing: "0.03em", marginBottom: 4 }}>Co-Founder</h4>
            <div style={{ fontSize: "0.75rem", color: C.red, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontWeight: "bold" }}>Co-Founder & Head of Sports Strategy</div>
            <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.6 }}>
              Directs tournament scheduling, sports rules alignment, and athletic experience design.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
