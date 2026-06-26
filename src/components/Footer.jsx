import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../data/content";
import { scrollToSection } from "../lib/scroll";

const FOOTER_SERVICES = ["Tournament Management","Corporate Leagues","School Championships","Marathon Events","Sports Marketing","Venue Management"];
const FOOTER_SPORTS   = ["Cricket","Football","Basketball","Swimming","Marathon","Badminton","Cyclothon"];
const LEGAL_LINKS     = ["Privacy Policy","Terms of Service","Cookie Policy"];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (id) => {
    if (location.pathname === "/") {
      scrollToSection(id);
      return;
    }
    navigate("/", { state: { scrollTo: id } });
  };

  return (
    <footer style={{ padding: "64px 5% 28px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="fg" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

        {/* Brand column */}
        <div>
          <div className="bebas" style={{ fontSize: "1.9rem", letterSpacing: "0.04em", lineHeight: 1 }}>
            SPORT<span style={{ color: C.red }}>X</span>TREME
          </div>
          <div style={{ fontSize: "0.52rem", letterSpacing: "0.26em", color: C.gray, marginTop: 2, marginBottom: 18 }}>
            THE PLAN BEHIND THE PLAY
          </div>
          <p style={{ color: C.gray, fontSize: "0.8rem", lineHeight: 1.72, maxWidth: 280 }}>
            India&apos;s most trusted sports event management company. Crafting extraordinary sporting
            experiences that inspire and unite.
          </p>
        </div>

        {/* Services column */}
        <div>
          <div className="bebas" style={{ fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: 18 }}>SERVICES</div>
          {FOOTER_SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              className="flink"
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", width: "100%" }}
              onClick={() => goToSection("services")}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sports column */}
        <div>
          <div className="bebas" style={{ fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: 18 }}>SPORTS</div>
          {FOOTER_SPORTS.map((s) => (
            <button
              key={s}
              type="button"
              className="flink"
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", width: "100%" }}
              onClick={() => goToSection("sports-universe")}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Contact column */}
        <div>
          <div className="bebas" style={{ fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: 18 }}>CONTACT</div>
          <div style={{ color: C.gray, fontSize: "0.8rem", lineHeight: 2 }}>
            <a href="tel:+918976571622" className="flink" style={{ display: "block", marginBottom: 0 }}>+91 8976571622</a>
            <a href="tel:+919136890309" className="flink" style={{ display: "block", marginBottom: 0 }}>+91 9136890309</a>
            <a href="mailto:sportxtremeevents@gmail.com" className="flink" style={{ display: "block", marginTop: 6, marginBottom: 0 }}>
              sportxtremeevents@gmail.com
            </a>
            <div style={{ marginTop: 6 }}>Mumbai, India</div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 22,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 14,
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.73rem" }}>
          © 2025 SportXtreme Events. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {LEGAL_LINKS.map((l) => (
            <button
              key={l}
              type="button"
              className="flink"
              style={{ background: "none", border: "none", padding: 0, marginBottom: 0 }}
              onClick={() => goToSection("contact")}
            >
              {l}
            </button>
          ))}
          <button
            id="footer-admin"
            type="button"
            className="flink"
            style={{ background: "none", border: "none", padding: 0, marginBottom: 0, color: "#E50914", fontWeight: "bold" }}
            onClick={() => navigate("/admin/login")}
          >
            Admin Panel
          </button>
        </div>
      </div>
    </footer>
  );
}
