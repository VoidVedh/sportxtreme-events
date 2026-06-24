import { useState, useEffect, useRef } from "react";

const C = {
  black: "#050505", red: "#E50914", white: "#FFFFFF",
  gray: "#A1A1AA", dark: "#0d0d0d", border: "rgba(255,255,255,0.06)",
};

function useCounter(target, started, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let frame = 0; const total = 60;
    const timer = setInterval(() => {
      frame++;
      const ease = 1 - Math.pow(1 - frame / total, 3);
      setCount(Math.floor(ease * target));
      if (frame >= total) clearInterval(timer);
    }, duration / total);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

function useInView(ref, threshold = 0.2) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

const SPORTS_CATS = {
  outdoor: { label: "Outdoor Sports", emoji: "⚽", desc: "From cricket pitches to football grounds — we orchestrate outdoor competitions with national-level precision and passion.", list: ["Cricket","Football","Basketball","Tennis","Pickleball"] },
  indoor: { label: "Indoor Sports", emoji: "🏸", desc: "Precision, skill, and mental fortitude. Elite indoor competition in perfectly managed, climate-controlled environments.", list: ["Badminton","Table Tennis","Chess","Carrom","Squash"] },
  aquatic: { label: "Aquatic Sports", emoji: "🏊", desc: "Professional aquatic events with international timing systems, robust safety protocols, and spectacular spectator setups.", list: ["Swimming","Aqua Fitness","Aqua Zumba"] },
  largescale: { label: "Large Scale Events", emoji: "🏃", desc: "Mass participation events uniting thousands of athletes — meticulously planned from start line to finish line.", list: ["Marathon","Half Marathon","Walkathon","Cyclothon","Relay Events"] },
};

const SERVICES = [
  { icon: "🏆", title: "Tournament Planning & Management", desc: "End-to-end organization — brackets, scheduling, officiating, and real-time results for tournaments of any scale." },
  { icon: "🏢", title: "Corporate Sports Leagues", desc: "Customized leagues building team spirit, healthy competition, and brand culture across organizations." },
  { icon: "🎓", title: "School & College Championships", desc: "Youth programs designed to identify, nurture, and celebrate the next generation of Indian champions." },
  { icon: "🏃", title: "Marathon & Mass Events", desc: "City-scale events with chip timing, hydration stations, safety marshals, and full logistical support." },
  { icon: "📢", title: "Sports Marketing", desc: "360° marketing solutions maximizing event visibility, digital reach, and sponsor value." },
  { icon: "🏟️", title: "Venue Management", desc: "Expert venue selection, setup, logistics, and management for events of any scale." },
  { icon: "📊", title: "Live Scoring", desc: "Real-time digital scoreboards and display systems for immersive on-ground and remote fan experiences." },
  { icon: "📝", title: "Registration Management", desc: "Seamless online and offline registration flows with integrated payment gateways." },
  { icon: "🤝", title: "Sponsorship Management", desc: "Strategic sponsor acquisition, activation, and relationship management for maximum ROI." },
];

const JOURNEY = [
  { n: "01", title: "CONCEPT", desc: "Your vision, our blueprint" },
  { n: "02", title: "PLANNING", desc: "Strategy meets execution" },
  { n: "03", title: "REGISTRATION", desc: "Seamless participant onboarding" },
  { n: "04", title: "EXECUTION", desc: "Flawless on-ground delivery" },
  { n: "05", title: "LIVE SCORING", desc: "Real-time results & updates" },
  { n: "06", title: "AWARDS", desc: "Celebrating excellence" },
  { n: "07", title: "ANALYTICS", desc: "Data-driven post-event insights" },
];

const TESTIMONIALS = [
  { name: "Vikram Mehta", role: "VP Operations, TechCorp India", text: "SportXtreme transformed our annual corporate games into a world-class event. Their execution was flawless — every single detail accounted for.", stars: 5 },
  { name: "Priya Sharma", role: "Sports Director, Mumbai Schools Association", text: "The school championship they organized was the most professionally run youth sporting event we have ever witnessed in the city.", stars: 5 },
  { name: "Rahul Nair", role: "Marathon Participant & Running Club Lead", text: "From registration to the finish line, every detail was perfect. This is what world-class event management looks like in India.", stars: 5 },
];

const EVENTS = [
  { cat: "CORPORATE", title: "Mumbai Corporate Cricket League", n: "500+", sport: "Cricket", ed: "4th Edition", emoji: "🏏" },
  { cat: "MARATHON", title: "SportXtreme City Marathon 2025", n: "2,500+", sport: "Running", ed: "2nd Edition", emoji: "🏃" },
  { cat: "SCHOOL", title: "Inter-School Sports Championship", n: "1,200+", sport: "Multi-Sport", ed: "Annual", emoji: "🎓" },
  { cat: "LEAGUE", title: "Football Super League Mumbai", n: "800+", sport: "Football", ed: "3rd Season", emoji: "⚽" },
  { cat: "CYCLING", title: "Western Mumbai Cyclothon", n: "3,000+", sport: "Cycling", ed: "Inaugural", emoji: "🚴" },
  { cat: "AQUATIC", title: "Corporate Swim Challenge", n: "400+", sport: "Swimming", ed: "2nd Edition", emoji: "🏊" },
];

export default function SportXtreme() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("outdoor");
  const [activeStep, setActiveStep] = useState(0);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef);

  const eventsC = useCounter(150, statsInView);
  const partC = useCounter(50000, statsInView);
  const sportsC = useCounter(15, statsInView);
  const clientsC = useCounter(25, statsInView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: C.black, color: C.white, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden", minHeight: "100vh" }}>

      {/* ─── GLOBAL STYLES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap');
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#050505}::-webkit-scrollbar-thumb{background:#E50914}
        .bebas{font-family:'Bebas Neue',cursive!important;letter-spacing:0.03em}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(229,9,20,0)}50%{box-shadow:0 0 24px 6px rgba(229,9,20,0.25)}}
        .afu{animation:fadeUp 0.8s ease both}
        .d1{animation-delay:0.15s}.d2{animation-delay:0.3s}.d3{animation-delay:0.45s}.d4{animation-delay:0.6s}
        .card-lift{transition:transform 0.3s ease,border-color 0.3s ease,box-shadow 0.3s ease;cursor:pointer}
        .card-lift:hover{transform:translateY(-6px);border-color:rgba(229,9,20,0.4)!important;box-shadow:0 20px 48px rgba(229,9,20,0.1)}
        .red-btn{background:#E50914;color:#fff;font-family:'Bebas Neue',cursive;font-size:1.05rem;letter-spacing:0.12em;padding:14px 32px;border:none;cursor:pointer;position:relative;overflow:hidden;transition:box-shadow 0.3s,transform 0.2s;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
        .red-btn:hover{box-shadow:0 0 28px rgba(229,9,20,0.5);transform:scale(1.02)}
        .red-btn::after{content:'';position:absolute;top:0;left:-120%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);transition:left 0.5s}
        .red-btn:hover::after{left:120%}
        .out-btn{background:transparent;color:#fff;font-family:'Bebas Neue',cursive;font-size:1.05rem;letter-spacing:0.12em;padding:12px 32px;border:1px solid rgba(255,255,255,0.25);cursor:pointer;transition:all 0.3s;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
        .out-btn:hover{border-color:#E50914;color:#E50914}
        .nav-a{font-size:0.78rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.65);cursor:pointer;transition:color 0.3s;position:relative}
        .nav-a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1px;background:#E50914;transition:width 0.3s}
        .nav-a:hover{color:#fff}.nav-a:hover::after{width:100%}
        .sport-tab{background:none;border:none;font-family:'Bebas Neue',cursive;font-size:1rem;letter-spacing:0.08em;padding:14px 28px;cursor:pointer;transition:all 0.3s;border-bottom:2px solid transparent;white-space:nowrap}
        .sport-tab.on{color:#fff;border-bottom-color:#E50914}
        .sport-tab:not(.on){color:#A1A1AA}.sport-tab:hover:not(.on){color:#fff}
        .form-f{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:13px 16px;font-family:Inter,sans-serif;font-size:0.88rem;outline:none;transition:border-color 0.3s,background 0.3s;box-sizing:border-box}
        .form-f:focus{border-color:#E50914;background:rgba(229,9,20,0.04)}.form-f::placeholder{color:rgba(255,255,255,0.3)}.form-f option{background:#0d0d0d}
        .flink{display:block;color:rgba(255,255,255,0.4);font-size:0.82rem;margin-bottom:10px;cursor:pointer;transition:color 0.3s}.flink:hover{color:#E50914}
        .sb{width:36px;height:36px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',cursive;font-size:0.7rem;letter-spacing:0.05em;color:#A1A1AA;cursor:pointer;transition:all 0.3s}.sb:hover{border-color:#E50914;color:#E50914}
        .tech-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:28px;position:relative;overflow:hidden;transition:all 0.4s ease}
        .tech-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#E50914;transform:scaleX(0);transform-origin:left;transition:transform 0.4s ease}
        .tech-card:hover::before{transform:scaleX(1)}.tech-card:hover{background:rgba(229,9,20,0.04);border-color:rgba(229,9,20,0.2);transform:translateY(-4px)}
        .eyebrow{display:flex;align-items:center;gap:12px;font-size:0.7rem;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#E50914;margin-bottom:16px}
        .eyebrow::before{content:'';display:block;width:32px;height:1px;background:#E50914}
        .wcard{background:#050505;padding:36px 28px;position:relative;transition:all 0.4s ease;cursor:pointer}
        .wcard:hover{background:rgba(229,9,20,0.04)}
        @media(max-width:768px){
          .dn-mob{display:none!important}
          .g2{grid-template-columns:1fr!important}
          .g3{grid-template-columns:1fr!important}
          .g4{grid-template-columns:repeat(2,1fr)!important}
          .fg{grid-template-columns:1fr 1fr!important}
          .jgrid{display:flex!important;flex-wrap:wrap!important}
          .jgrid>div{min-width:calc(50% - 8px)!important;flex:0 0 calc(50% - 8px)!important}
        }
        @media(min-width:769px){.dn-desk{display:none!important}}
      `}</style>

      {/* ═══ NAVIGATION ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 68, padding: "0 5%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(5,5,5,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{ cursor: "pointer" }}>
          <div className="bebas" style={{ fontSize: "1.55rem", lineHeight: 1 }}>
            SPORT<span style={{ color: C.red }}>X</span>TREME
          </div>
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.28em", color: C.gray, marginTop: 2 }}>
            — THE PLAN BEHIND THE PLAY —
          </div>
        </div>

        <div className="dn-mob" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Home","About","Services","Events","Gallery","Contact"].map(n => (
            <span key={n} className="nav-a">{n}</span>
          ))}
          <button className="red-btn" style={{ padding: "10px 22px", fontSize: "0.82rem" }}>GET IN TOUCH →</button>
        </div>

        <button className="dn-desk" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: "#fff", borderRadius: 1 }} />)}
          </div>
        </button>
      </nav>

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", display: "flex" }}
          onClick={() => setMobileOpen(false)}>
          <div style={{ background: "#0a0a0a", width: "75%", maxWidth: 300, padding: "80px 32px 32px", borderRight: "1px solid rgba(229,9,20,0.2)", display: "flex", flexDirection: "column", gap: 28 }}
            onClick={e => e.stopPropagation()}>
            {["Home","About","Services","Events","Gallery","Contact"].map(n => (
              <span key={n} className="bebas" style={{ fontSize: "1.5rem", color: "#fff", cursor: "pointer" }} onClick={() => setMobileOpen(false)}>{n}</span>
            ))}
            <button className="red-btn" style={{ marginTop: 8 }}>GET IN TOUCH →</button>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: "100vh", position: "relative", display: "flex", alignItems: "center",
        background: `radial-gradient(ellipse 75% 65% at 70% 50%, rgba(229,9,20,0.10) 0%, transparent 68%), ${C.black}`,
        overflow: "hidden",
      }}>
        {/* Giant X */}
        <div style={{
          position: "absolute", right: "-4%", top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "65vw", lineHeight: 1,
          color: "rgba(229,9,20,0.04)", userSelect: "none", pointerEvents: "none", zIndex: 0,
        }}>X</div>

        {/* Speed lines */}
        {[12, 27, 42, 57, 72].map((l, i) => (
          <div key={i} style={{
            position: "absolute", left: `${l}%`, top: 0, bottom: 0, width: 1,
            background: `linear-gradient(to bottom, transparent, rgba(229,9,20,${0.04 + i * 0.01}), transparent)`,
            transform: "rotate(20deg) scaleY(1.5)", pointerEvents: "none", zIndex: 0,
          }} />
        ))}

        {/* Bottom glow */}
        <div style={{
          position: "absolute", bottom: 0, left: "25%", right: 0, height: "45%",
          background: "radial-gradient(ellipse at bottom right, rgba(229,9,20,0.12) 0%, transparent 70%)",
          zIndex: 0, pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, padding: "100px 5% 80px", maxWidth: 760 }}>
          <div className="eyebrow afu">Sports Event Management</div>

          <h1 className="bebas afu d1" style={{ fontSize: "clamp(3.5rem, 9vw, 8.5rem)", lineHeight: 0.9, marginBottom: 14 }}>
            THE PLAN<br/>
            <span style={{ color: C.red, textShadow: "0 0 40px rgba(229,9,20,0.35)" }}>BEHIND THE</span><br/>
            PLAY
          </h1>

          <div className="afu d2" style={{ width: "100%", height: 1, background: "linear-gradient(90deg, rgba(229,9,20,0.45), transparent)", margin: "22px 0 26px" }} />

          <p className="afu d2" style={{ color: C.gray, fontSize: "clamp(0.88rem, 1.4vw, 1rem)", lineHeight: 1.78, maxWidth: 480, marginBottom: 40 }}>
            Transforming sporting dreams into extraordinary experiences — from school sports days to national-level corporate leagues and 50,000-participant marathons.
          </p>

          <div className="afu d3" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 56 }}>
            <button className="red-btn">EXPLORE EVENTS →</button>
            <button className="out-btn">BOOK YOUR EVENT</button>
          </div>

          <div className="afu d4" style={{ display: "flex", gap: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[{ n: "150+", l: "Events" }, { n: "50K+", l: "Athletes" }, { n: "15+", l: "Sports" }].map(s => (
              <div key={s.l}>
                <div className="bebas" style={{ fontSize: "1.75rem", color: C.red, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: "0.68rem", color: C.gray, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: C.gray }}>SCROLL</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #E50914, transparent)", animation: "floatY 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div style={{ background: C.red, padding: "14px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "marquee 28s linear infinite" }}>
          {[0, 1].map(ri => (
            <span key={ri} style={{ display: "inline-flex" }}>
              {["TOURNAMENT MANAGEMENT","CORPORATE LEAGUES","MARATHON EVENTS","SCHOOL CHAMPIONSHIPS","LIVE SCORING","SPONSORSHIP","VENUE MANAGEMENT","REGISTRATION"].map((item, i) => (
                <span key={i} className="bebas" style={{ marginRight: 56, fontSize: "0.88rem", letterSpacing: "0.18em" }}>⚡ {item}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <section ref={statsRef} style={{ padding: "80px 5%" }}>
        <div className="g4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "rgba(255,255,255,0.04)", gap: 1 }}>
          {[
            { val: eventsC, suf: "+", label: "Events Managed", icon: "🏆" },
            { val: partC.toLocaleString(), suf: "+", label: "Participants", icon: "🤝" },
            { val: sportsC, suf: "+", label: "Sports Categories", icon: "⚡" },
            { val: clientsC, suf: "+", label: "Corporate Clients", icon: "🏢" },
          ].map((stat, i) => (
            <div key={i} style={{ background: C.black, padding: "48px 24px", textAlign: "center", position: "relative" }}>
              <div style={{ fontSize: "1.3rem", marginBottom: 10 }}>{stat.icon}</div>
              <div className="bebas" style={{ fontSize: "3.5rem", color: C.red, lineHeight: 1 }}>{stat.val}{stat.suf}</div>
              <div style={{ color: C.gray, fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 8 }}>{stat.label}</div>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: C.red,
                transform: statsInView ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left",
                transition: `transform 1.2s ease ${i * 0.2}s`,
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section style={{ padding: "100px 5%", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "26vw",
          color: "rgba(229,9,20,0.02)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>ABOUT</div>

        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
          <div>
            <div className="eyebrow">Who We Are</div>
            <h2 className="bebas" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", lineHeight: 0.92, marginBottom: 24 }}>
              INDIA'S MOST<br/>TRUSTED SPORTS<br/><span style={{ color: C.red }}>EVENT COMPANY</span>
            </h2>
            <p style={{ color: C.gray, lineHeight: 1.8, marginBottom: 18 }}>
              SportXtreme Events is a full-service sports event management company dedicated to crafting memorable, professionally managed, result-driven sporting experiences.
            </p>
            <p style={{ color: "rgba(161,161,170,0.7)", lineHeight: 1.8, fontSize: "0.9rem", marginBottom: 36 }}>
              From intimate school championships to large-scale corporate leagues and mass participation marathons — we bring the same level of precision, energy, and passion to every event.
            </p>

            <div style={{ display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
              {[
                { label: "OUR VISION", text: "India's most trusted sports event company delivering world-class experiences that inspire excellence and community engagement.", accent: true },
                { label: "OUR MISSION", text: "Professional event solutions combining strategic planning, flawless execution, technology, and creativity for every event.", accent: false },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, minWidth: 180, borderLeft: `2px solid ${item.accent ? C.red : "rgba(255,255,255,0.15)"}`, paddingLeft: 16 }}>
                  <div className="bebas" style={{ fontSize: "0.8rem", color: item.accent ? C.red : C.white, letterSpacing: "0.1em", marginBottom: 6 }}>{item.label}</div>
                  <p style={{ fontSize: "0.78rem", color: C.gray, lineHeight: 1.65 }}>{item.text}</p>
                </div>
              ))}
            </div>
            <button className="red-btn">LEARN MORE ABOUT US</button>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ border: "1px solid rgba(229,9,20,0.15)", background: "rgba(229,9,20,0.03)", padding: 48, position: "relative" }}>
              {/* Corner ticks */}
              {[{ top: -1, left: -1 }, { top: -1, right: -1 }, { bottom: -1, left: -1 }, { bottom: -1, right: -1 }].map((pos, i) => (
                <div key={i} style={{
                  position: "absolute", width: 20, height: 20,
                  borderTop: i < 2 ? `2px solid ${C.red}` : "none",
                  borderBottom: i >= 2 ? `2px solid ${C.red}` : "none",
                  borderLeft: i === 0 || i === 2 ? `2px solid ${C.red}` : "none",
                  borderRight: i === 1 || i === 3 ? `2px solid ${C.red}` : "none",
                  ...pos,
                }} />
              ))}
              <div className="bebas" style={{ fontSize: "5.5rem", color: C.red, lineHeight: 1, opacity: 0.5, marginBottom: 18 }}>SX</div>
              <div className="bebas" style={{ fontSize: "1.3rem", marginBottom: 12 }}>SPORTXTREME EVENTS</div>
              <div style={{ color: C.gray, fontSize: "0.82rem", marginBottom: 28, lineHeight: 1.6 }}>Where Every Game Becomes a Grand Event</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                {["Cricket","Football","Marathon","Swimming","Badminton","Basketball","Cyclothon","& More…"].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: C.gray }}>
                    <div style={{ width: 4, height: 4, background: C.red, borderRadius: "50%", flexShrink: 0 }} />{s}
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              position: "absolute", bottom: -18, right: -18,
              background: C.red, padding: "18px 20px", textAlign: "center",
              animation: "glowPulse 4s ease-in-out infinite",
            }}>
              <div className="bebas" style={{ fontSize: "1.8rem", lineHeight: 1 }}>7+</div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.08em", lineHeight: 1.4, marginTop: 4 }}>YEARS OF<br/>EXCELLENCE</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY SPORTXTREME ═══ */}
      <section style={{ padding: "100px 5%", background: "rgba(255,255,255,0.012)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Why Choose Us</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            THE SPORTXTREME<br/><span style={{ color: C.red }}>ADVANTAGE</span>
          </h2>
        </div>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
          {[
            { icon: "🎯", title: "Professional Execution", desc: "Military-grade planning with athlete-first delivery. Every minute of your event is accounted for." },
            { icon: "💻", title: "Technology Driven", desc: "QR check-ins, live scoring, digital certificates, and real-time analytics at every event." },
            { icon: "🛡️", title: "Safety First", desc: "Trained safety personnel, medical support, and risk management protocols in place always." },
            { icon: "🏆", title: "National Level Standards", desc: "Events organized to national federation standards, ensuring credibility and trust." },
            { icon: "🤝", title: "Sponsor Friendly", desc: "Maximum brand visibility with strategic on-ground placement and comprehensive digital reach." },
            { icon: "⚡", title: "Athlete Focused", desc: "From registration to medals, every touchpoint is designed to honor the athlete's experience." },
          ].map((item, i) => (
            <div key={i} className="wcard">
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>{item.icon}</div>
              <div className="bebas" style={{ fontSize: "1.1rem", letterSpacing: "0.05em", marginBottom: 12 }}>{item.title}</div>
              <p style={{ color: C.gray, fontSize: "0.83rem", lineHeight: 1.72 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SPORTS UNIVERSE (SIGNATURE) ═══ */}
      <section style={{ padding: "100px 5%", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: "-5%", top: "50%", transform: "translateY(-50%)",
          fontFamily: "'Bebas Neue', cursive", fontSize: "35vw",
          color: "rgba(229,9,20,0.02)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>X</div>

        <div style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Our Sports Universe</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            EVERY SPORT.<br/><span style={{ color: C.red }}>EVERY SCALE.</span>
          </h2>
          <p style={{ color: C.gray, marginTop: 20, maxWidth: 480, margin: "20px auto 0", lineHeight: 1.7 }}>
            From intimate indoor tournaments to city-scale marathons — we have the expertise to manage any sporting event at any level.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
          {Object.entries(SPORTS_CATS).map(([key, cat]) => (
            <button key={key} className={`sport-tab ${activeCat === key ? "on" : ""}`} onClick={() => setActiveCat(key)}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active panel */}
        <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", background: "rgba(255,255,255,0.01)", position: "relative", zIndex: 1 }}>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "48px 40px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{SPORTS_CATS[activeCat].emoji}</div>
              <h3 className="bebas" style={{ fontSize: "2.2rem", marginBottom: 16 }}>{SPORTS_CATS[activeCat].label}</h3>
              <p style={{ color: C.gray, lineHeight: 1.75, marginBottom: 28 }}>{SPORTS_CATS[activeCat].desc}</p>
              <button className="red-btn" style={{ fontSize: "0.85rem", padding: "12px 24px" }}>EXPLORE THIS CATEGORY →</button>
            </div>
            <div style={{ padding: "48px 40px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SPORTS_CATS[activeCat].list.map((sport, i) => (
                  <div key={sport}
                    style={{ padding: "18px 20px", border: `1px solid ${i === 0 ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.07)"}`, background: i === 0 ? "rgba(229,9,20,0.06)" : "transparent", cursor: "pointer", transition: "all 0.3s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(229,9,20,0.35)"; e.currentTarget.style.background = "rgba(229,9,20,0.06)"; }}
                    onMouseLeave={e => { if (i !== 0) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "transparent"; } }}
                  >
                    <div className="bebas" style={{ fontSize: "0.95rem", letterSpacing: "0.05em", color: i === 0 ? C.white : C.gray }}>{sport}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section style={{ padding: "100px 5%", background: "rgba(255,255,255,0.012)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>What We Do</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            OUR <span style={{ color: C.red }}>SERVICES</span>
          </h2>
        </div>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.04)" }}>
          {SERVICES.map((s, i) => (
            <div key={i} className="card-lift" style={{ background: C.black, padding: "32px 28px", border: "none" }}>
              <div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)", marginBottom: 20, clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))" }}>{s.icon}</div>
              <div style={{ width: 40, height: 2, background: C.red, marginBottom: 18 }} />
              <div className="bebas" style={{ fontSize: "1.05rem", letterSpacing: "0.04em", marginBottom: 10 }}>{s.title}</div>
              <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.72 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EVENT JOURNEY ═══ */}
      <section style={{ padding: "100px 5%", overflow: "hidden" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>The Process</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            YOUR EVENT <span style={{ color: C.red }}>JOURNEY</span>
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          <div className="dn-mob" style={{ position: "absolute", top: 26, left: "5%", right: "5%", height: 2, background: `linear-gradient(90deg, ${C.red}, rgba(229,9,20,0.12))`, zIndex: 0 }} />
          <div className="jgrid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, position: "relative", zIndex: 1 }}>
            {JOURNEY.map((step, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{ textAlign: "center", padding: "0 6px", cursor: "pointer" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", border: `2px solid ${i <= activeStep ? C.red : "rgba(255,255,255,0.15)"}`,
                  background: i === activeStep ? C.red : i < activeStep ? "rgba(229,9,20,0.1)" : C.black,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
                  color: i === activeStep ? C.white : i <= activeStep ? C.red : C.gray,
                  transition: "all 0.3s",
                }}>{step.n}</div>
                <div className="bebas" style={{ fontSize: "0.82rem", letterSpacing: "0.06em", marginBottom: 6, color: i === activeStep ? C.white : C.gray, transition: "color 0.3s" }}>{step.title}</div>
                <div style={{ fontSize: "0.67rem", color: C.gray, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 40, border: "1px solid rgba(229,9,20,0.25)", background: "rgba(229,9,20,0.04)",
          padding: "24px 32px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
          transition: "all 0.4s",
        }}>
          <div className="bebas" style={{ fontSize: "3.5rem", color: C.red, opacity: 0.45, lineHeight: 1 }}>{JOURNEY[activeStep].n}</div>
          <div>
            <div className="bebas" style={{ fontSize: "1.5rem", marginBottom: 4 }}>{JOURNEY[activeStep].title}</div>
            <div style={{ color: C.gray, fontSize: "0.88rem" }}>{JOURNEY[activeStep].desc}</div>
          </div>
        </div>
      </section>

      {/* ═══ TECHNOLOGY ═══ */}
      <section style={{ padding: "100px 5%", background: "linear-gradient(180deg, rgba(229,9,20,0.035) 0%, transparent 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Technology First</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            POWERING EVENTS WITH<br/><span style={{ color: C.red }}>TECHNOLOGY</span>
          </h2>
        </div>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "📱", title: "Online Registration", desc: "Integrated registration with payment gateway, custom forms, and instant confirmation.", hot: true },
            { icon: "📷", title: "QR Check-In", desc: "Instant participant verification via QR code scanning at event entry gates." },
            { icon: "📊", title: "Live Scoring", desc: "Real-time score updates visible to participants, spectators, and remote viewers." },
            { icon: "🏅", title: "Live Leaderboards", desc: "Dynamic leaderboards that update in real-time as events progress and scores change." },
            { icon: "🎓", title: "Digital Certificates", desc: "Instantly generated and emailed digital certificates for all participants and winners." },
            { icon: "📈", title: "Analytics Dashboard", desc: "Post-event data insights on participation, performance, and sponsor exposure metrics." },
          ].map((tech, i) => (
            <div key={i} className="tech-card" style={{ borderColor: tech.hot ? "rgba(229,9,20,0.3)" : "rgba(255,255,255,0.06)", background: tech.hot ? "rgba(229,9,20,0.06)" : "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 14 }}>{tech.icon}</div>
              <div className="bebas" style={{ fontSize: "1.1rem", letterSpacing: "0.05em", marginBottom: 10 }}>{tech.title}</div>
              <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.7 }}>{tech.desc}</p>
              {tech.hot && <div style={{ marginTop: 14, fontSize: "0.68rem", color: C.red, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>★ Most Used Feature</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EVENT SHOWCASE ═══ */}
      <section style={{ padding: "100px 5%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
          <div>
            <div className="eyebrow">Event Showcase</div>
            <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
              EVENTS WE'VE<br/><span style={{ color: C.red }}>MADE LEGENDARY</span>
            </h2>
          </div>
          <button className="out-btn">VIEW ALL EVENTS</button>
        </div>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {EVENTS.map((ev, i) => (
            <div key={i} className="card-lift" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
              <div style={{ height: 160, position: "relative", background: "linear-gradient(135deg, #0d0000, #1a0505)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "4rem", opacity: 0.18, animation: `floatY ${3 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>{ev.emoji}</div>
                <div style={{ position: "absolute", top: 12, left: 12, background: C.red, padding: "3px 10px", fontFamily: "'Bebas Neue', cursive", fontSize: "0.68rem", letterSpacing: "0.1em" }}>{ev.cat}</div>
                <div style={{ position: "absolute", bottom: 10, right: 12, background: "rgba(0,0,0,0.6)", padding: "3px 10px", fontSize: "0.65rem", color: C.gray }}>{ev.ed}</div>
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                <div className="bebas" style={{ fontSize: "1rem", letterSpacing: "0.03em", marginBottom: 10 }}>{ev.title}</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: "0.73rem", color: C.gray }}><span style={{ color: C.red }}>●</span> {ev.n} Participants</span>
                  <span style={{ fontSize: "0.73rem", color: C.gray }}>● {ev.sport}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SPONSORSHIP ═══ */}
      <section style={{ padding: "100px 5%", background: "rgba(229,9,20,0.025)", borderTop: "1px solid rgba(229,9,20,0.08)", borderBottom: "1px solid rgba(229,9,20,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>For Brands &amp; Sponsors</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            SPONSOR AN EVENT.<br/><span style={{ color: C.red }}>OWN A MOMENT.</span>
          </h2>
        </div>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "📢", title: "Brand Visibility", desc: "Your brand at the center — banners, jerseys, digital screens, and immersive on-ground presence." },
            { icon: "🎯", title: "Lead Generation", desc: "Direct access to thousands of engaged sport enthusiasts and corporate decision-makers." },
            { icon: "🤝", title: "Community Reach", desc: "Build genuine brand affinity through meaningful sports engagement and shared values." },
            { icon: "📍", title: "On-ground Branding", desc: "Activation zones, stalls, and experiential marketing integrated into every event." },
            { icon: "📊", title: "Post Event Analytics", desc: "Detailed reports on reach, impressions, and ROI metrics after every event closes." },
            { icon: "💰", title: "Sponsor ROI", desc: "Transparent measurement of sponsor value through quantified reach and activation data." },
          ].map((item, i) => (
            <div key={i} className="card-lift" style={{ padding: "28px 24px", border: "1px solid rgba(255,255,255,0.06)", background: C.black }}>
              <div style={{ fontSize: "1.7rem", marginBottom: 12 }}>{item.icon}</div>
              <div className="bebas" style={{ fontSize: "1.05rem", letterSpacing: "0.05em", marginBottom: 10 }}>{item.title}</div>
              <p style={{ color: C.gray, fontSize: "0.82rem", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <button className="red-btn">BECOME A SPONSOR →</button>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "100px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Client Voices</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            WHAT THEY SAY<br/><span style={{ color: C.red }}>ABOUT US</span>
          </h2>
        </div>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card-lift" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "32px 28px", position: "relative" }}>
              <div className="bebas" style={{ position: "absolute", top: 12, left: 20, fontSize: "4.5rem", lineHeight: 1, color: C.red, opacity: 0.22 }}>"</div>
              <div style={{ display: "flex", gap: 3, marginBottom: 18, marginTop: 28 }}>
                {[...Array(t.stars)].map((_, j) => <span key={j} style={{ color: C.red, fontSize: "0.85rem" }}>★</span>)}
              </div>
              <p style={{ color: C.gray, fontSize: "0.88rem", lineHeight: 1.78, marginBottom: 24 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem" }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{t.name}</div>
                  <div style={{ color: C.gray, fontSize: "0.72rem" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section style={{ padding: "100px 5%", background: "rgba(255,255,255,0.012)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue', cursive", fontSize: "18vw", color: "rgba(229,9,20,0.02)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>CONTACT</div>

        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72 }}>
          <div>
            <div className="eyebrow">Get In Touch</div>
            <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 0.92, marginBottom: 24 }}>
              READY TO CREATE<br/><span style={{ color: C.red }}>CHAMPIONS</span><br/>TOGETHER?
            </h2>
            <p style={{ color: C.gray, lineHeight: 1.8, marginBottom: 48, maxWidth: 400 }}>
              Let's talk about your next sporting event. Whether it's a school championship or a city marathon, we're ready to make it extraordinary.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { icon: "📞", label: "Call Us", val: "+91 8976571622\n+91 9136890309" },
                { icon: "✉️", label: "Email", val: "sportxtremeevents@gmail.com" },
                { icon: "📍", label: "Location", val: "Mumbai, Maharashtra, India" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, border: "1px solid rgba(229,9,20,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: C.red, textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{ marginTop: 32, background: "#25D366", color: "#fff", border: "none", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em", padding: "13px 28px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "opacity 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              💬 CHAT ON WHATSAPP
            </button>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "40px 36px", background: "rgba(255,255,255,0.01)" }}>
            <div className="bebas" style={{ fontSize: "1.4rem", letterSpacing: "0.05em", marginBottom: 28 }}>SEND YOUR PROPOSAL REQUEST</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <input className="form-f" placeholder="Your Name" />
                <input className="form-f" placeholder="Your Phone" />
              </div>
              <input className="form-f" placeholder="Your Email" />
              <select className="form-f">
                <option value="">Event Type</option>
                <option>Corporate Sports League</option>
                <option>School Championship</option>
                <option>Marathon / Mass Event</option>
                <option>Tournament Management</option>
                <option>Other</option>
              </select>
              <input className="form-f" placeholder="Expected Number of Participants" />
              <textarea className="form-f" placeholder="Tell us about your event..." style={{ height: 96, resize: "vertical" }} />
              <button className="red-btn" style={{ width: "100%", padding: 16 }}>SEND PROPOSAL REQUEST →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "64px 5% 28px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="fg" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div className="bebas" style={{ fontSize: "1.9rem", letterSpacing: "0.04em", lineHeight: 1 }}>SPORT<span style={{ color: C.red }}>X</span>TREME</div>
            <div style={{ fontSize: "0.52rem", letterSpacing: "0.26em", color: C.gray, marginTop: 2, marginBottom: 18 }}>THE PLAN BEHIND THE PLAY</div>
            <p style={{ color: C.gray, fontSize: "0.8rem", lineHeight: 1.72, maxWidth: 280 }}>India's most trusted sports event management company. Crafting extraordinary sporting experiences that inspire and unite.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {["IG","FB","LI","YT"].map(s => <div key={s} className="sb">{s}</div>)}
            </div>
          </div>
          <div>
            <div className="bebas" style={{ fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: 18 }}>SERVICES</div>
            {["Tournament Management","Corporate Leagues","School Championships","Marathon Events","Sports Marketing","Venue Management"].map(s => <span key={s} className="flink">{s}</span>)}
          </div>
          <div>
            <div className="bebas" style={{ fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: 18 }}>SPORTS</div>
            {["Cricket","Football","Basketball","Swimming","Marathon","Badminton","Cyclothon"].map(s => <span key={s} className="flink">{s}</span>)}
          </div>
          <div>
            <div className="bebas" style={{ fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: 18 }}>CONTACT</div>
            <div style={{ color: C.gray, fontSize: "0.8rem", lineHeight: 2 }}>
              <div>+91 8976571622</div><div>+91 9136890309</div>
              <div style={{ marginTop: 6 }}>sportxtremeevents@gmail.com</div>
              <div style={{ marginTop: 6 }}>Mumbai, India</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.73rem" }}>© 2025 SportXtreme Events. All rights reserved.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy","Terms of Service","Cookie Policy"].map(l => <span key={l} className="flink" style={{ marginBottom: 0 }}>{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
