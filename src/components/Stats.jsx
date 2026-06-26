import { useRef, useState, useEffect } from "react";
import { useCounter } from "../hooks/useCounter";
import { useInView }  from "../hooks/useInView";
import { C } from "../data/content";
import { supabase } from "../lib/supabase";

export default function Stats() {
  const statsRef  = useRef(null);
  const statsInView = useInView(statsRef);

  const [rawStats, setRawStats] = useState({
    events: 0,
    participants: 0,
    sports: 0,
    gallery: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch events count and distinct sports
        const { data: eventsData } = await supabase.from("events").select("sport");
        const eventsCount = eventsData ? eventsData.length : 0;
        const distinctSports = eventsData
          ? new Set(eventsData.map((e) => e.sport).filter(Boolean)).size
          : 0;

        // Fetch registrations count
        // Note: we swallow error if registrations table does not exist yet (displays 0)
        const { count: registrationsCount } = await supabase
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .catch(() => ({ count: 0 }));

        // Fetch gallery count
        const { count: galleryCount } = await supabase
          .from("gallery")
          .select("id", { count: "exact", head: true });

        setRawStats({
          events: eventsCount,
          participants: registrationsCount || 0,
          sports: distinctSports,
          gallery: galleryCount || 0,
        });
      } catch (err) {
        console.error("Error fetching live stats:", err);
      }
    }
    fetchStats();
  }, []);

  const eventsC  = useCounter(rawStats.events,       statsInView);
  const partC    = useCounter(rawStats.participants, statsInView);
  const sportsC  = useCounter(rawStats.sports,       statsInView);
  const galleryC = useCounter(rawStats.gallery,      statsInView);

  const STAT_ITEMS = [
    { val: eventsC,                      suf: rawStats.events > 0 ? "+" : "",       label: "Events Managed",    icon: "🏆" },
    { val: partC.toLocaleString("en-IN"), suf: rawStats.participants > 0 ? "+" : "", label: "Participants",       icon: "🤝" },
    { val: sportsC,                      suf: rawStats.sports > 0 ? "+" : "",       label: "Sports Categories",  icon: "⚡" },
    { val: galleryC,                     suf: rawStats.gallery > 0 ? "+" : "",      label: "Gallery Images",    icon: "📸" },
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
