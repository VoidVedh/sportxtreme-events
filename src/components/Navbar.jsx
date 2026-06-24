import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { scrollToSection } from "../lib/scroll";

// Map nav label → section id on the home page
const NAV_SECTIONS = [
  { label: "Home",     id: "hero"     },
  { label: "About",    id: "about"    },
  { label: "Services", id: "services" },
  { label: "Events",   id: "events"   },
  { label: "Gallery",  route: "/gallery" },
  { label: "Contact",  id: "contact"  },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const navigate  = useNavigate();
  const location  = useLocation();

  const isHome = location.pathname === "/";

  // ── scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── active section via IntersectionObserver ────────────────────────────────
  useEffect(() => {
    if (!isHome) return;

    const observers = [];
    const visibleMap = {};

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          visibleMap[id] = entry.intersectionRatio;
          // Pick section with highest visibility ratio
          const best = Object.entries(visibleMap).sort((a, b) => b[1] - a[1])[0];
          if (best) setActiveSection(best[0]);
        },
        { threshold: [0, 0.15, 0.4, 0.6, 1.0], rootMargin: "-10% 0px -10% 0px" }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isHome]);

  // ── nav click handler ──────────────────────────────────────────────────────
  const handleNav = useCallback(
    (section) => {
      setMobileOpen(false);
      
      if (section.route) {
        // Navigate to route
        navigate(section.route);
      } else if (isHome) {
        // Scroll to section on home
        scrollToSection(section.id);
      } else {
        // Navigate home then scroll after mount
        navigate("/", { state: { scrollTo: section.id } });
      }
    },
    [isHome, navigate]
  );

  // ── handle scrollTo after navigation from another page ────────────────────
  useEffect(() => {
    if (!isHome || !location.state?.scrollTo) return;

    const id = location.state.scrollTo;
    const timer = setTimeout(() => {
      scrollToSection(id);
      navigate("/", { replace: true, state: {} });
    }, 100);

    return () => clearTimeout(timer);
  }, [isHome, location.state?.scrollTo, navigate]);

  const handleGetInTouch = () => {
    setMobileOpen(false);
    handleNav("contact");
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          height: 68, padding: "0 5%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background:     scrolled ? "rgba(5,5,5,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)"        : "none",
          borderBottom:   scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "all 0.4s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{ cursor: "pointer" }}
          onClick={() => handleNav("hero")}
          role="link"
          tabIndex={0}
          aria-label="SportXtreme Home"
          onKeyDown={(e) => e.key === "Enter" && handleNav("hero")}
        >
          <div className="bebas" style={{ fontSize: "1.55rem", lineHeight: 1 }}>
            SPORT<span style={{ color: "#E50914" }}>X</span>TREME
          </div>
          <div style={{ fontSize: "0.5rem", letterSpacing: "0.28em", color: "#A1A1AA", marginTop: 2 }}>
            — THE PLAN BEHIND THE PLAY —
          </div>
        </div>

        {/* Desktop nav */}
        <div className="dn-mob" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV_SECTIONS.map((section) => (
            <span
              key={section.label}
              className="nav-a"
              data-active={isHome && !section.route && activeSection === section.id ? "true" : "false"}
              style={{
                color: isHome && !section.route && activeSection === section.id ? "#fff" : "rgba(255,255,255,0.65)",
              }}
              onClick={() => handleNav(section)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNav(section)}
            >
              {section.label}
              {/* Active underline indicator */}
              {isHome && !section.route && activeSection === section.id && (
                <span
                  style={{
                    position: "absolute", bottom: -2, left: 0,
                    width: "100%", height: 1,
                    background: "#E50914",
                  }}
                />
              )}
            </span>
          ))}
          <button
            id="navbar-get-in-touch"
            className="red-btn"
            style={{ padding: "10px 22px", fontSize: "0.82rem" }}
            onClick={handleGetInTouch}
          >
            GET IN TOUCH →
          </button>
        </div>

        {/* Hamburger */}
        <button
          id="navbar-hamburger"
          className="dn-desk"
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 22, height: 2,
                  background: "#fff", borderRadius: 1,
                  transition: "all 0.3s",
                  transform: mobileOpen
                    ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                    : i === 1 ? "scaleX(0)"
                    : "rotate(-45deg) translate(5px, -5px)"
                    : "none",
                }}
              />
            ))}
          </div>
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.85)", display: "flex",
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              background: "#0a0a0a", width: "75%", maxWidth: 300,
              padding: "90px 32px 32px",
              borderRight: "1px solid rgba(229,9,20,0.2)",
              display: "flex", flexDirection: "column", gap: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_SECTIONS.map((section) => (
              <span
                key={section.label}
                className="bebas"
                style={{
                  fontSize: "1.5rem", cursor: "pointer",
                  color: isHome && !section.route && activeSection === section.id ? "#E50914" : "#fff",
                  transition: "color 0.3s",
                }}
                onClick={() => handleNav(section)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNav(section)}
              >
                {section.label}
              </span>
            ))}
            <button className="red-btn" style={{ marginTop: 8 }} onClick={handleGetInTouch}>
              GET IN TOUCH →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
