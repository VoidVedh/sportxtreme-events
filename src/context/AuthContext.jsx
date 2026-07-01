import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "sportxtremeevents@gmail.com";

/**
 * Admin authentication using real Supabase Auth
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount and listen to changes
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user && session.user.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
        setAdminEmail(session.user.email);
      } else {
        setIsAuthenticated(false);
        setAdminEmail(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    if (email.trim() !== ADMIN_EMAIL) {
      return { success: false, error: "Access denied. Admin account required." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message || "Invalid email or password" };
    }

    if (data.user?.email !== ADMIN_EMAIL) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Signout after unauthorized access attempt failed:", err);
      }
      return { success: false, error: "Access denied. Admin account required." };
    }

    setIsAuthenticated(true);
    setAdminEmail(data.user.email);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut error:", err.message || err);
    } finally {
      setIsAuthenticated(false);
      setAdminEmail(null);
    }
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
