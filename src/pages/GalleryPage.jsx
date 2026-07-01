import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function formatCaption(caption) {
  if (!caption) return "Untitled Image";
  const trimmed = caption.trim();
  if (!trimmed) return "Untitled Image";
  const lower = trimmed.toLowerCase();
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.match(/^[a-z0-9-]+\.[a-z0-9]+$/)
  ) {
    return "Untitled Image";
  }
  return trimmed;
}

const CATEGORY_COLORS = {
  Corporate: "linear-gradient(135deg, #1a0a0a, #2d1a1a)",
  Marathon: "linear-gradient(135deg, #0a1a0a, #1a2d1a)",
  School: "linear-gradient(135deg, #0a0a1a, #1a1a2d)",
  League: "linear-gradient(135deg, #1a1a0a, #2d2d1a)",
  Cycling: "linear-gradient(135deg, #0a1a1a, #1a2d2d)",
  Aquatic: "linear-gradient(135deg, #0a0a1a, #1a1a3d)",
};

const getCategoryGradient = (category) => {
  return CATEGORY_COLORS[category] || "linear-gradient(135deg, #0a0a0a, #1a1a1a)";
};

function GalleryItem({ item, idx, onClick }) {
  const gradient = getCategoryGradient(item.category);
  
  return (
    <div
      className="card-lift"
      onClick={() => onClick(item)}
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.01)",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          height: 200,
          position: "relative",
          background: item.url ? `url(${item.url}) center/cover no-repeat` : gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!item.url && (
          <div
            style={{
              fontSize: "3rem",
              opacity: 0.3,
              animation: `floatY ${3 + idx * 0.3}s ease-in-out infinite`,
              animationDelay: `${idx * 0.2}s`,
            }}
          >
            📷
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: C.red,
            padding: "3px 10px",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "0.68rem",
            letterSpacing: "0.1em",
          }}
        >
          {item.category}
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "0.85rem", color: "#fff", marginBottom: 8, lineHeight: 1.4 }}>
          {formatCaption(item.caption)}
        </div>
        <div style={{ fontSize: "0.73rem", color: C.gray }}>
          {item.event}
        </div>
      </div>
    </div>
  );
}

function GalleryModal({ item, onClose }) {
  if (!item) return null;

  const gradient = getCategoryGradient(item.category);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          background: "#0a0a0a",
          border: "1px solid rgba(229,9,20,0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            height: 400,
            background: item.url ? `url(${item.url}) center/cover no-repeat` : gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!item.url && (
            <div style={{ fontSize: "5rem", opacity: 0.3 }}>📷</div>
          )}
        </div>
        <div style={{ padding: "32px" }}>
          <h2 className="bebas" style={{ fontSize: "1.8rem", marginBottom: 12 }}>
            {formatCaption(item.caption)}
          </h2>
          <div style={{ display: "flex", gap: 16, color: C.gray, fontSize: "0.85rem" }}>
            <span>Category: {item.category}</span>
            <span>Event: {item.event}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            width: 40,
            height: 40,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchGallery() {
      setGalleryLoading(true);
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (error) throw error;
        // Map event_name -> event for component compatibility
        const mapped = (data || []).map(item => ({
          ...item,
          event: item.event_name || item.event || "",
        }));
        setGallery(mapped);
      } catch (err) {
        console.error("Gallery fetch error:", err);
        if (!cancelled) setGallery([]);
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    }
    fetchGallery();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === "All"
    ? gallery
    : gallery.filter((item) => item.category === filter);

  const categories = ["All", ...new Set(gallery.map(item => item.category).filter(Boolean))];

  return (
    <div style={{ background: C.black, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero banner */}
      <div
        style={{
          paddingTop: 120,
          paddingBottom: 64,
          paddingLeft: "5%",
          paddingRight: "5%",
          background: `radial-gradient(ellipse 60% 60% at 60% 50%, rgba(229,9,20,0.08) 0%, transparent 70%), ${C.black}`,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark */}
        <div
          style={{
            position: "absolute",
            right: "-2%",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "20vw",
            color: "rgba(229,9,20,0.03)",
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          GALLERY
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            padding: "8px 18px",
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            fontFamily: "'Bebas Neue', cursive",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.red;
            e.currentTarget.style.color = C.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          ← BACK
        </button>

        <div className="eyebrow" style={{ position: "relative" }}>Event Memories</div>
        <h1 className="bebas" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 0.9, position: "relative" }}>
          OUR <span style={{ color: C.red }}>GALLERY</span>
        </h1>
        <p style={{ color: C.gray, marginTop: 20, maxWidth: 520, lineHeight: 1.75, position: "relative" }}>
          Capturing moments from our sports event management tournaments.
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          padding: "0 5%",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          overflowX: "auto",
          gap: 0,
          background: "rgba(255,255,255,0.01)",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            className={`sport-tab${filter === cat ? " on" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div style={{ padding: "60px 5% 100px" }}>
        <p style={{ color: C.gray, fontSize: "0.8rem", marginBottom: 28, letterSpacing: "0.1em" }}>
          SHOWING {filtered.length} PHOTO{filtered.length !== 1 ? "S" : ""}
          {filter !== "All" ? ` · ${filter.toUpperCase()}` : ""}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filtered.map((item, idx) => (
            <GalleryItem key={item.id} item={item} idx={idx} onClick={setSelectedItem} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 20 }}>📷</div>
            <h2 className="bebas" style={{ fontSize: "2rem", marginBottom: 12 }}>
              {filter !== "All" ? `NO ${filter.toUpperCase()} PHOTOS` : "No gallery images available."}
            </h2>
            <p style={{ color: C.gray, marginBottom: 32 }}>
              {filter !== "All"
                ? `No photos found under category "${filter}".`
                : "Images uploaded by the administrator will appear here."}
            </p>
            {filter !== "All" && (
              <button className="out-btn" onClick={() => setFilter("All")}>
                VIEW ALL PHOTOS
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <GalleryModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <Footer />
    </div>
  );
}
