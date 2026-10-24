import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useEvents } from "../hooks/useEvents";
import { supabase } from "../lib/supabase";
import { SITE_CONFIG } from "../config/siteContent";
import SiteHeader from "../components/common/SiteHeader";
import SiteFooter from "../components/common/SiteFooter";
import SectionHeading from "../components/common/SectionHeading";
import EventCard from "../components/common/EventCard";
import EventCardSkeleton from "../components/common/EventCardSkeleton";
import EnquiryForm from "../components/common/EnquiryForm";
import SafeImage from "../components/common/SafeImage";
import "../styles/site.css";

export default function Home() {
  useDocumentMeta({
    title: "SportXtreme Events | Professional Sports Event Management",
    description:
      "SportXtreme Events coordinates professional sports events across India — corporate sports leagues, marathons, tournaments, school championships, and gate operations.",
    canonical: "https://sportxtreme.com/",
    ogImage: "https://sportxtreme.com/og-image.jpg",
  });

  const { events, loading: eventsLoading } = useEvents({ limit: 3 });
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // Fetch a small slice of gallery images if available
  useEffect(() => {
    let active = true;
    async function loadGalleryPreview() {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("id, url, caption, category, event_name")
          .order("created_at", { ascending: false })
          .limit(4);

        if (!active) return;
        if (!error && data) {
          setGalleryImages(data);
        }
      } catch (err) {
        console.warn("Gallery preview notice:", err.message || err);
      } finally {
        if (active) setGalleryLoading(false);
      }
    }
    loadGalleryPreview();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="sx-site">
      <a href="#main-content" className="sx-skip-link">
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content">
        {/* ============================================================
            1. HERO SECTION
            ============================================================ */}
        <section
          style={{
            position: "relative",
            minHeight: "86vh",
            display: "flex",
            alignItems: "center",
            padding: "80px 0 100px",
            background:
              "radial-gradient(ellipse 70% 60% at 75% 35%, rgba(229, 9, 20, 0.12) 0%, transparent 70%), #070707",
            borderBottom: "1px solid var(--sx-border)",
            overflow: "hidden",
          }}
        >
          {/* Subtle textured sports backdrop lines */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "-5%",
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "var(--sx-font-display)",
              fontSize: "35vw",
              lineHeight: 1,
              color: "rgba(229, 9, 20, 0.03)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            SX
          </div>

          <div className="sx-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 760 }}>
              <span className="sx-eyebrow">Professional Sports Event Management</span>

              <h1
                className="sx-display"
                style={{
                  fontSize: "clamp(3.2rem, 8.5vw, 6.8rem)",
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  lineHeight: 0.92,
                  marginBottom: 24,
                }}
              >
                {SITE_CONFIG.hero.headline.split(" ")[0]}{" "}
                <span style={{ color: "var(--sx-red)" }}>{SITE_CONFIG.hero.headline.split(" ")[1]}</span>
                <br />
                {SITE_CONFIG.hero.headline.split(" ").slice(2).join(" ")}
              </h1>

              <div
                style={{
                  width: 80,
                  height: 3,
                  background: "var(--sx-red)",
                  marginBottom: 24,
                }}
              />

              <p
                style={{
                  color: "var(--sx-text-secondary)",
                  fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
                  lineHeight: 1.7,
                  maxWidth: 620,
                  marginBottom: 36,
                }}
              >
                {SITE_CONFIG.hero.subheadline}
              </p>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link to={SITE_CONFIG.hero.ctaPrimary.href} className="sx-btn-primary">
                  {SITE_CONFIG.hero.ctaPrimary.label} →
                </Link>
                <a href={SITE_CONFIG.hero.ctaSecondary.href} className="sx-btn-secondary">
                  {SITE_CONFIG.hero.ctaSecondary.label}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. FEATURED / UPCOMING EVENTS
            ============================================================ */}
        <section style={{ padding: "96px 0", borderBottom: "1px solid var(--sx-border)" }}>
          <div className="sx-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 24,
                marginBottom: 44,
              }}
            >
              <SectionHeading
                eyebrow="Competitions & Fixtures"
                title="FEATURED"
                accentTitle="EVENTS"
                description="Explore active tournaments, upcoming marathons, and championship leagues organized by SportXtreme."
              />

              <Link to="/events" className="sx-btn-secondary" style={{ marginBottom: 44 }}>
                VIEW ALL EVENTS →
              </Link>
            </div>

            {eventsLoading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 28,
                }}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 28,
                }}
              >
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            ) : (
              <div
                className="sx-card"
                style={{
                  textAlign: "center",
                  padding: "64px 24px",
                  background: "var(--sx-surface)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏆</div>
                <h3 className="sx-display" style={{ fontSize: "1.6rem", marginBottom: 8 }}>
                  NO UPCOMING EVENTS SCHEDULED
                </h3>
                <p style={{ color: "var(--sx-text-muted)", fontSize: "0.92rem", maxWidth: 460, margin: "0 auto 24px" }}>
                  The administrative team is currently finalizing upcoming tournament fixtures. Inquire directly to plan an event for your organization.
                </p>
                <a href="#contact" className="sx-btn-primary">
                  PLAN YOUR TOURNAMENT →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            3. SERVICES & EXPERIENCES
            ============================================================ */}
        <section id="services" style={{ padding: "96px 0", background: "var(--sx-bg-subtle)", borderBottom: "1px solid var(--sx-border)" }}>
          <div className="sx-container">
            <SectionHeading
              eyebrow="What We Deliver"
              title="SPORTS EVENT"
              accentTitle="SOLUTIONS"
              description="Comprehensive sports operations — from strategic blueprinting and registration to match officiating and gate technology."
              align="center"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              {SITE_CONFIG.services.map((svc) => (
                <div
                  key={svc.id}
                  className="sx-card"
                  style={{
                    padding: "36px 30px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "var(--sx-radius-sm)",
                      background: "rgba(229, 9, 20, 0.1)",
                      border: "1px solid rgba(229, 9, 20, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      marginBottom: 20,
                    }}
                  >
                    {svc.icon}
                  </div>

                  <h3
                    className="sx-display"
                    style={{
                      fontSize: "1.25rem",
                      letterSpacing: "0.04em",
                      color: "var(--sx-text-primary)",
                      marginBottom: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {svc.title}
                  </h3>

                  <p
                    style={{
                      color: "var(--sx-text-secondary)",
                      fontSize: "0.88rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {svc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            4. THREE-STAGE PROCESS
            ============================================================ */}
        <section id="process" style={{ padding: "96px 0", borderBottom: "1px solid var(--sx-border)" }}>
          <div className="sx-container">
            <SectionHeading
              eyebrow="How We Work"
              title="STRUCTURED"
              accentTitle="EXECUTION"
              description="Every tournament and championship follows an operational methodology to ensure safety, fairness, and a premium athlete experience."
              align="center"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 28,
              }}
            >
              {SITE_CONFIG.processSteps.map((p) => (
                <div
                  key={p.step}
                  className="sx-card"
                  style={{
                    padding: "36px 30px",
                    position: "relative",
                  }}
                >
                  <div
                    className="sx-display"
                    style={{
                      fontSize: "3.2rem",
                      color: "var(--sx-red)",
                      opacity: 0.85,
                      lineHeight: 1,
                      marginBottom: 14,
                    }}
                  >
                    {p.step}
                  </div>

                  <h3
                    className="sx-display"
                    style={{
                      fontSize: "1.35rem",
                      letterSpacing: "0.04em",
                      marginBottom: 12,
                    }}
                  >
                    {p.title}
                  </h3>

                  <p style={{ color: "var(--sx-text-secondary)", fontSize: "0.88rem", lineHeight: 1.65 }}>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            5. LEADERSHIP & FOUNDERS
            ============================================================ */}
        <section style={{ padding: "96px 0", background: "var(--sx-bg-subtle)", borderBottom: "1px solid var(--sx-border)" }}>
          <div className="sx-container">
            <SectionHeading
              eyebrow="Executive Team"
              title="EXECUTIVE"
              accentTitle="LEADERSHIP"
              description="Founded by competitive athletes and sports management specialists dedicated to raising tournament benchmarks across India."
              align="center"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 32,
                maxWidth: 860,
                margin: "0 auto",
              }}
            >
              {SITE_CONFIG.leadership.map((leader) => (
                <div
                  key={leader.name}
                  className="sx-card"
                  style={{
                    padding: "36px 28px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid var(--sx-red-border)",
                      marginBottom: 20,
                    }}
                  >
                    <SafeImage
                      src={leader.image}
                      alt={leader.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      fallbackIcon="👤"
                    />
                  </div>

                  <h3 className="sx-display" style={{ fontSize: "1.45rem", marginBottom: 4 }}>
                    {leader.name}
                  </h3>

                  <div
                    style={{
                      fontFamily: "var(--sx-font-display)",
                      fontSize: "0.88rem",
                      letterSpacing: "0.08em",
                      color: "var(--sx-red)",
                      textTransform: "uppercase",
                      marginBottom: 14,
                    }}
                  >
                    {leader.role}
                  </div>

                  <p style={{ color: "var(--sx-text-secondary)", fontSize: "0.86rem", lineHeight: 1.65 }}>
                    {leader.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            6. GALLERY PREVIEW (ONLY IF IMAGES EXIST)
            ============================================================ */}
        {!galleryLoading && galleryImages.length > 0 && (
          <section style={{ padding: "96px 0", borderBottom: "1px solid var(--sx-border)" }}>
            <div className="sx-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: 20,
                  marginBottom: 40,
                }}
              >
                <SectionHeading
                  eyebrow="On-Ground Captures"
                  title="EVENT"
                  accentTitle="GALLERY"
                  description="Real snapshots from leagues, marathons, and championship events."
                />

                <Link to="/gallery" className="sx-btn-secondary" style={{ marginBottom: 40 }}>
                  VIEW FULL GALLERY →
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 20,
                }}
              >
                {galleryImages.map((img) => (
                  <Link
                    key={img.id}
                    to="/gallery"
                    className="sx-card"
                    style={{
                      textDecoration: "none",
                      display: "block",
                      position: "relative",
                      height: 220,
                    }}
                  >
                    <SafeImage
                      src={img.url}
                      alt={img.caption || "SportXtreme gallery photo"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      fallbackIcon="📸"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                        padding: "20px 16px 12px",
                      }}
                    >
                      <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
                        {img.caption || "Event Photo"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            7. CLOSING INQUIRY SECTION
            ============================================================ */}
        <section id="contact" style={{ padding: "96px 0", background: "var(--sx-bg-subtle)" }}>
          <div className="sx-container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 56,
                alignItems: "start",
              }}
            >
              {/* Left Column: Direct Outreach */}
              <div>
                <SectionHeading
                  eyebrow="Connect With Coordinators"
                  title="LET’S CREATE"
                  accentTitle="CHAMPIONS"
                  description="Whether you are planning an inter-corporate cup, school championship, or city-scale run — we are ready to coordinate every operational detail."
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32 }}>
                  <div>
                    <span style={{ color: "var(--sx-text-dim)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Direct Phone
                    </span>
                    <div style={{ fontSize: "1.1rem", marginTop: 4 }}>
                      <a href={`tel:${SITE_CONFIG.contact.primaryPhone.replace(/\s+/g, "")}`} style={{ color: "var(--sx-text-primary)", textDecoration: "none" }}>
                        {SITE_CONFIG.contact.primaryPhone}
                      </a>
                      <span style={{ color: "var(--sx-text-dim)" }}> &bull; </span>
                      <a href={`tel:${SITE_CONFIG.contact.secondaryPhone.replace(/\s+/g, "")}`} style={{ color: "var(--sx-text-primary)", textDecoration: "none" }}>
                        {SITE_CONFIG.contact.secondaryPhone}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "var(--sx-text-dim)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Official Email
                    </span>
                    <div style={{ fontSize: "1.05rem", marginTop: 4 }}>
                      <a href={`mailto:${SITE_CONFIG.contact.email}`} style={{ color: "var(--sx-text-primary)", textDecoration: "none" }}>
                        {SITE_CONFIG.contact.email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "var(--sx-text-dim)", display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Location Base
                    </span>
                    <div style={{ fontSize: "1rem", color: "var(--sx-text-secondary)", marginTop: 4 }}>
                      {SITE_CONFIG.contact.location}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <a
                      href={SITE_CONFIG.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sx-btn-secondary"
                      style={{
                        padding: "12px 24px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>💬</span> Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div>
                <EnquiryForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
