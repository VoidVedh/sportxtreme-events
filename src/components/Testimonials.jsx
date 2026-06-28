import { useState, useEffect } from "react";
import { TESTIMONIALS as STATIC_TESTIMONIALS, C } from "../data/content";
import { supabase } from "../lib/supabase";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (!error && data) {
          setTestimonials(data);
          setCurrentIndex(0);
        }
      } catch {
        setTestimonials([]);
      }
    }
    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

  const next = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goTo = (index) => {
    setCurrentIndex(index);
  };

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <section style={{ padding: "100px 5%" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>Client Voices</div>
        <h2 className="bebas" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 0.92 }}>
          WHAT THEY SAY<br /><span style={{ color: C.red }}>ABOUT US</span>
        </h2>
      </div>

      {/* Carousel */}
      <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
        {/* Main testimonial card */}
        <div
          className="card-lift"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            padding: "48px 40px",
            position: "relative",
            minHeight: 280,
          }}
        >
          {/* Quote mark */}
          <div className="bebas" style={{ position: "absolute", top: 20, left: 32, fontSize: "5rem", lineHeight: 1, color: C.red, opacity: 0.22 }}>
            &ldquo;
          </div>

          {/* Stars */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, marginTop: 32 }}>
            {Array.from({ length: current.stars }).map((_, j) => (
              <span key={j} style={{ color: C.red, fontSize: "1rem" }}>★</span>
            ))}
          </div>

          <p style={{ color: C.gray, fontSize: "1rem", lineHeight: 1.85, marginBottom: 32 }}>
            &ldquo;{current.text}&rdquo;
          </p>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56, height: 56, background: C.red,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem",
              }}
            >
              {current.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{current.name}</div>
              <div style={{ color: C.gray, fontSize: "0.8rem" }}>{current.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prev}
          style={{
            position: "absolute",
            top: "50%",
            left: -20,
            transform: "translateY(-50%)",
            background: "rgba(229,9,20,0.1)",
            border: "1px solid rgba(229,9,20,0.3)",
            color: C.red,
            width: 48,
            height: 48,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(229,9,20,0.2)";
            e.currentTarget.style.borderColor = C.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(229,9,20,0.1)";
            e.currentTarget.style.borderColor = "rgba(229,9,20,0.3)";
          }}
        >
          ←
        </button>

        <button
          onClick={next}
          style={{
            position: "absolute",
            top: "50%",
            right: -20,
            transform: "translateY(-50%)",
            background: "rgba(229,9,20,0.1)",
            border: "1px solid rgba(229,9,20,0.3)",
            color: C.red,
            width: 48,
            height: 48,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(229,9,20,0.2)";
            e.currentTarget.style.borderColor = C.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(229,9,20,0.1)";
            e.currentTarget.style.borderColor = "rgba(229,9,20,0.3)";
          }}
        >
          →
        </button>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 32 }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: index === currentIndex ? C.red : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
