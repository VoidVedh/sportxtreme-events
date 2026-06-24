import { Navigate, Route, Routes } from "react-router-dom";
import SponsorModal from "./components/SponsorModal";
import Home from "./pages/Home";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SponsorModal />
    </>
  );
}
