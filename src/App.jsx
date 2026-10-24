import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLogin from "./pages/AdminLogin";

// Code-split AdminDashboard so heavy QR scanning libraries are not loaded on customer routes
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const AdminLoadingFallback = (
  <div
    style={{
      background: "#050505",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", marginBottom: 8 }}>
        LOADING DASHBOARD...
      </div>
      <p style={{ color: "#A1A1AA" }}>Please wait</p>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/:eventId" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={AdminLoadingFallback}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
