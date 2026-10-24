import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "../../config/siteContent";
import SafeImage from "./SafeImage";

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Scroll detection for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open & Escape key listener
  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }

      // Simple focus trap inside mobile drawer
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  // Handle smooth scroll or navigation for hash links
  const handleNavClick = (href, e) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");
      if (location.pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Let normal navigation to /#id happen; Home will handle scroll
      }
    }
  };

  const isNavActive = (href) => {
    if (href === "/") return location.pathname === "/" && !location.hash;
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.replace("/", "");
    return location.pathname === href;
  };

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        height: 72,
        background: scrolled ? "rgba(7, 7, 7, 0.96)" : "rgba(7, 7, 7, 0.75)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--sx-border)",
        transition: "background var(--sx-transition-fast), border-color var(--sx-transition-fast)",
      }}
    >
      <div
        className="sx-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            gap: 12,
            minHeight: 44,
          }}
          aria-label={`${SITE_CONFIG.brand.name} — Home`}
        >
          <SafeImage
            src={SITE_CONFIG.brand.logoUrl}
            alt={SITE_CONFIG.brand.logoAlt}
            style={{
              height: 38,
              width: "auto",
              maxWidth: 180,
              objectFit: "contain",
            }}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          style={{
            display: "none",
            alignItems: "center",
            gap: 28,
          }}
          className="sx-desktop-nav"
        >
          {SITE_CONFIG.navLinks.map((link) => {
            const active = isNavActive(link.href);
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                style={{
                  fontFamily: "var(--sx-font-display)",
                  fontSize: "1.05rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  color: active ? "var(--sx-red)" : "var(--sx-text-secondary)",
                  position: "relative",
                  padding: "8px 0",
                  transition: "color var(--sx-transition-fast)",
                }}
                aria-current={active ? "page" : undefined}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--sx-text-secondary)";
                }}
              >
                {link.label}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--sx-red)",
                    }}
                  />
                )}
              </Link>
            );
          })}

          <Link
            to="/#contact"
            className="sx-btn-primary"
            style={{
              padding: "9px 20px",
              fontSize: "0.95rem",
            }}
            onClick={(e) => handleNavClick("/#contact", e)}
          >
            PLAN AN EVENT →
          </Link>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sx-mobile-toggle"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="sx-mobile-drawer"
          style={{
            background: "none",
            border: "1px solid var(--sx-border)",
            borderRadius: "var(--sx-radius-sm)",
            padding: "8px 12px",
            color: "var(--sx-text-primary)",
            cursor: "pointer",
            minHeight: 44,
            minWidth: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Accessible Mobile Drawer */}
      {mobileOpen && (
        <div
          id="sx-mobile-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          style={{
            position: "fixed",
            inset: 0,
            top: 72,
            background: "rgba(7, 7, 7, 0.98)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            padding: "32px 24px 48px",
            overflowY: "auto",
            borderTop: "1px solid var(--sx-border)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {SITE_CONFIG.navLinks.map((link) => {
              const active = isNavActive(link.href);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => handleNavClick(link.href, e)}
                  style={{
                    fontFamily: "var(--sx-font-display)",
                    fontSize: "1.8rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: active ? "var(--sx-red)" : "var(--sx-text-primary)",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--sx-border)",
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}

            <div style={{ marginTop: 24 }}>
              <Link
                to="/#contact"
                className="sx-btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: "1.1rem" }}
                onClick={(e) => handleNavClick("/#contact", e)}
              >
                PLAN AN EVENT →
              </Link>
            </div>

            <div style={{ marginTop: 28, color: "var(--sx-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              <div>{SITE_CONFIG.contact.location}</div>
              <a
                href={`tel:${SITE_CONFIG.contact.primaryPhone.replace(/\s+/g, "")}`}
                style={{ color: "var(--sx-text-secondary)", textDecoration: "none", display: "block", marginTop: 4 }}
              >
                {SITE_CONFIG.contact.primaryPhone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Media query helper styles */}
      <style>{`
        @media (min-width: 900px) {
          .sx-desktop-nav {
            display: flex !important;
          }
          .sx-mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
