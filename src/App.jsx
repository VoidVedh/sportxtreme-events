import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SponsorModal from "./components/SponsorModal";
import Home from "./pages/Home";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <>
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
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SponsorModal />
      </>
    </AuthProvider>
  );
}
