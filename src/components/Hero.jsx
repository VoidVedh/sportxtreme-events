import { useState, useEffect } from "react";
import { C } from "../data/content";
import { useModal } from "../context/ModalContext";
import { scrollToSection } from "../lib/scroll";
import { supabase } from "../lib/supabase";

const SPEED_LINE_POSITIONS = [12, 27, 42, 57, 72];

export default function Hero() {
  const { openModal } = useModal();
  const [stats, setStats] = useState({ events: 0, participants: 0, sports: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const { data: eventsData } = await supabase.from("events").select("sport");
        const eventsCount = eventsData ? eventsData.length : 0;
        const distinctSports = eventsData
          ? new Set(eventsData.map((e) => e.sport).filter(Boolean)).size
          : 0;

        let registrationsCount = 0;
        try {
          const { count, error: regError } = await supabase
            .from("registrations")
            .select("id", { count: "exact", head: true });
          if (!regError && count !== null) {
            registrationsCount = count;
          }
        } catch (e) {
          console.error("Error fetching registrations:", e);
        }

        setStats({
          events: eventsCount,
          participants: registrationsCount || 0,
          sports: distinctSports
        });
      } catch (err) {
        console.error("Error loading hero stats:", err);
      }
    }
    loadStats();
  }, []);

  const heroStats = [
    { n: stats.events, l: "Events" },
    { n: stats.participants, l: "Participants" },
    { n: stats.sports, l: "Sports" }
  ];

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh", position: "relative",
        display: "flex", alignItems: "center",
        background: `radial-gradient(ellipse 75% 65% at 70% 50%, rgba(229,9,20,0.10) 0%, transparent 68%), ${C.black}`,
        overflow: "hidden",
      }}
    >
      {/* Giant background X */}
      <div
        style={{
          position: "absolute", right: "-4%", top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "65vw", lineHeight: 1,
          color: "rgba(229,9,20,0.04)", userSelect: "none", pointerEvents: "none", zIndex: 0,
        }}
      >
        X
      </div>

      {/* Speed lines */}
      {SPEED_LINE_POSITIONS.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: `${l}%`, top: 0, bottom: 0, width: 1,
            background: `linear-gradient(to bottom, transparent, rgba(229,9,20,${0.04 + i * 0.01}), transparent)`,
            transform: "rotate(20deg) scaleY(1.5)", pointerEvents: "none", zIndex: 0,
          }}
        />
      ))}

      {/* Bottom glow */}
      <div
        style={{
          position: "absolute", bottom: 0, left: "25%", right: 0, height: "45%",
          background: "radial-gradient(ellipse at bottom right, rgba(229,9,20,0.12) 0%, transparent 70%)",
          zIndex: 0, pointerEvents: "none",
        }}
      />

      {/* Hero content */}
      <div style={{ position: "relative", zIndex: 1, padding: "100px 5% 80px", maxWidth: 760 }}>
        <div className="eyebrow afu">Sports Event Management</div>

        <h1 className="bebas afu d1" style={{ fontSize: "clamp(3.5rem, 9vw, 8.5rem)", lineHeight: 0.9, marginBottom: 14 }}>
          THE PLAN<br />
          <span style={{ color: C.red, textShadow: "0 0 40px rgba(229,9,20,0.35)" }}>BEHIND THE</span><br />
          PLAY
        </h1>

        <div
          className="afu d2"
          style={{ width: "100%", height: 1, background: "linear-gradient(90deg, rgba(229,9,20,0.45), transparent)", margin: "22px 0 26px" }}
        />

        <p className="afu d2" style={{ color: C.gray, fontSize: "clamp(0.88rem, 1.4vw, 1rem)", lineHeight: 1.78, maxWidth: 480, marginBottom: 40 }}>
          SportXtreme Events coordinates premium corporate sports leagues, marathons, school championships, and tournaments. We handle planning, logistics, marketing, and gate check-in so your event runs seamlessly.
        </p>

        <div className="afu d3" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 56 }}>
          <button id="hero-explore-events" className="red-btn" onClick={() => scrollToSection("events")}>EXPLORE EVENTS →</button>
          <button id="hero-book-event" className="out-btn" onClick={() => openModal("proposal")}>BOOK YOUR EVENT</button>
        </div>

        <div
          className="afu d4"
          style={{ display: "flex", gap: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {heroStats.map((s) => (
            <div key={s.l}>
              <div className="bebas" style={{ fontSize: "1.75rem", color: C.red, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: "0.68rem", color: C.gray, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}
      >
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: C.gray }}>SCROLL</div>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #E50914, transparent)", animation: "floatY 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}
