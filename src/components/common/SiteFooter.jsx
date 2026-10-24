import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../../config/siteContent";
import SafeImage from "./SafeImage";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        background: "var(--sx-bg-subtle)",
        borderTop: "1px solid var(--sx-border)",
        padding: "64px 0 32px",
        marginTop: "auto",
      }}
    >
      <div className="sx-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand Info */}
          <div>
            <SafeImage
              src={SITE_CONFIG.brand.logoUrl}
              alt={SITE_CONFIG.brand.logoAlt}
              style={{
                height: 38,
                width: "auto",
                maxWidth: 200,
                objectFit: "contain",
                marginBottom: 16,
              }}
            />
            <p
              style={{
                color: "var(--sx-text-muted)",
                fontSize: "0.88rem",
                lineHeight: 1.6,
                maxWidth: 320,
                marginBottom: 16,
              }}
            >
              Professional sports event management company delivering seamless tournaments, corporate leagues, marathons, and championship logistics across India.
            </p>
            <div style={{ color: "var(--sx-text-dim)", fontSize: "0.8rem" }}>
              {SITE_CONFIG.contact.location}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div
              className="sx-display"
              style={{
                fontSize: "1.1rem",
                letterSpacing: "0.08em",
                marginBottom: 18,
                color: "var(--sx-text-primary)",
              }}
            >
              NAVIGATION
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {SITE_CONFIG.navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{
                      color: "var(--sx-text-muted)",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      transition: "color var(--sx-transition-fast)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sx-red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sx-text-muted)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <div
              className="sx-display"
              style={{
                fontSize: "1.1rem",
                letterSpacing: "0.08em",
                marginBottom: 18,
                color: "var(--sx-text-primary)",
              }}
            >
              SERVICES
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {SITE_CONFIG.services.map((svc) => (
                <li key={svc.id}>
                  <Link
                    to="/#services"
                    style={{
                      color: "var(--sx-text-muted)",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      transition: "color var(--sx-transition-fast)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sx-red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sx-text-muted)")}
                  >
                    {svc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <div
              className="sx-display"
              style={{
                fontSize: "1.1rem",
                letterSpacing: "0.08em",
                marginBottom: 18,
                color: "var(--sx-text-primary)",
              }}
            >
              DIRECT CONTACT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.88rem" }}>
              <div>
                <span style={{ color: "var(--sx-text-dim)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Phone</span>
                <a
                  href={`tel:${SITE_CONFIG.contact.primaryPhone.replace(/\s+/g, "")}`}
                  style={{ color: "var(--sx-text-secondary)", textDecoration: "none" }}
                >
                  {SITE_CONFIG.contact.primaryPhone}
                </a>
                <span style={{ color: "var(--sx-text-dim)" }}> / </span>
                <a
                  href={`tel:${SITE_CONFIG.contact.secondaryPhone.replace(/\s+/g, "")}`}
                  style={{ color: "var(--sx-text-secondary)", textDecoration: "none" }}
                >
                  {SITE_CONFIG.contact.secondaryPhone}
                </a>
              </div>

              <div>
                <span style={{ color: "var(--sx-text-dim)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Email</span>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  style={{ color: "var(--sx-text-secondary)", textDecoration: "none" }}
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </div>

              <div style={{ marginTop: 8 }}>
                <a
                  href={SITE_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sx-btn-secondary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>💬</span> WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--sx-border)",
            paddingTop: 24,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            fontSize: "0.78rem",
            color: "var(--sx-text-dim)",
          }}
        >
          <div>
            © {currentYear} {SITE_CONFIG.brand.name}. All rights reserved.
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <Link
              to="/events"
              style={{ color: "var(--sx-text-dim)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sx-text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sx-text-dim)")}
            >
              All Events
            </Link>
            <Link
              to="/gallery"
              style={{ color: "var(--sx-text-dim)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sx-text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sx-text-dim)")}
            >
              Gallery
            </Link>
            <Link
              to="/#contact"
              style={{ color: "var(--sx-text-dim)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sx-text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sx-text-dim)")}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
