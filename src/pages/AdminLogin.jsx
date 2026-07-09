import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../data/content";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
    
    setLoading(false);
  };

  return (
    <div style={{ background: C.black, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="bebas" style={{ fontSize: "2.5rem", marginBottom: 8 }}>
            SPORT<span style={{ color: C.red }}>X</span>TREME
          </div>
          <div style={{ color: C.gray, fontSize: "0.85rem" }}>Admin Dashboard</div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "40px 32px" }}>
          <h2 className="bebas" style={{ fontSize: "1.8rem", marginBottom: 32, textAlign: "center" }}>
            ADMIN LOGIN
          </h2>

          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(229,9,20,0.1)", border: "1px solid #E50914", color: "#E50914", fontSize: "0.85rem", marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: C.gray, marginBottom: 8 }}>Email</label>
              <input
                type="email"
                className="form-f"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="sportxtremeevents@gmail.com"
                style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: C.gray, marginBottom: 8 }}>Password</label>
              <input
                type="password"
                className="form-f"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "0.9rem" }}
              />
            </div>

            <button
              type="submit"
              className="red-btn"
              disabled={loading}
              style={{ width: "100%", padding: 14, marginTop: 8 }}
            >
              {loading ? "LOGGING IN..." : "LOGIN →"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.8rem", color: C.gray }}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", textDecoration: "underline" }}
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
          <p>Login with your Supabase admin credentials</p>
        </div>
      </div>
    </div>
  );
}
