import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { supabase } from "../lib/supabase";

export default function GalleryPreview() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchLatestImages() {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);
        
        if (cancelled) return;
        if (!error && data) {
          setImages(data);
        }
      } catch (err) {
        console.error("Error loading gallery preview:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLatestImages();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="gallery-preview" style={{ padding: "100px 5%", background: "rgba(255,255,255,0.008)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
        <div>
          <div className="eyebrow">Visual Memories</div>
          <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
            EVENT <span style={{ color: C.red }}>GALLERY</span>
          </h2>
        </div>
        <button
          className="out-btn"
          onClick={() => navigate("/gallery")}
        >
          VIEW ALL IMAGES
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.gray }}>
          Loading gallery...
        </div>
      )}

      {!loading && images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {images.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate("/gallery")}
              className="card-lift"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: C.black,
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: 200,
                  background: item.url ? `url(${item.url}) center/cover no-repeat` : "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
                }}
              />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500, lineHeight: 1.4 }}>
                  {item.caption}
                </div>
                <div style={{ fontSize: "0.73rem", color: C.gray, marginTop: 4 }}>
                  {item.event_name || item.event || ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && images.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.005)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📸</div>
          <h3 className="bebas" style={{ fontSize: "1.5rem", marginBottom: 8, color: "#fff" }}>
            No gallery images uploaded yet.
          </h3>
          <p style={{ color: C.gray, fontSize: "0.88rem" }}>
            Images uploaded by the administrator will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
