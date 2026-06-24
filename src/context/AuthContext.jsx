import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

/**
 * Admin authentication using environment-based credentials.
 * In production, replace with real Supabase auth.
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const sessionToken = sessionStorage.getItem("admin_session_token");
    const sessionEmail = sessionStorage.getItem("admin_email");
    
    if (sessionToken && sessionEmail) {
      // Verify session is not expired (demo: 1 hour)
      const sessionTime = parseInt(sessionStorage.getItem("admin_session_time") || "0");
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      if (now - sessionTime < ONE_HOUR) {
        setIsAuthenticated(true);
        setAdminEmail(sessionEmail);
      } else {
        // Session expired
        sessionStorage.removeItem("admin_session_token");
        sessionStorage.removeItem("admin_email");
        sessionStorage.removeItem("admin_session_time");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    // Read credentials from environment variables
    const validEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@sportxtreme.com";
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

    if (email === validEmail && password === validPassword) {
      // Create session token
      const sessionToken = btoa(`${email}:${Date.now()}`);
      sessionStorage.setItem("admin_session_token", sessionToken);
      sessionStorage.setItem("admin_email", email);
      sessionStorage.setItem("admin_session_time", Date.now().toString());
      
      setIsAuthenticated(true);
      setAdminEmail(email);
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("admin_session_token");
    sessionStorage.removeItem("admin_email");
    sessionStorage.removeItem("admin_session_time");
    setIsAuthenticated(false);
    setAdminEmail(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminEmail, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
