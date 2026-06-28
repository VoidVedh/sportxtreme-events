import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../data/content";
import { supabase } from "../lib/supabase";
import { Html5QrcodeScanner } from "html5-qrcode";

const GALLERY_CATEGORIES = ["Corporate", "Marathon", "School", "League", "Cycling", "Aquatic", "Badminton", "General"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, adminEmail } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data states
  const [contacts, setContacts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [events, setEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  // Registration filters & search
  const [regSearch, setRegSearch] = useState("");
  const [regEventFilter, setRegEventFilter] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("");

  // Scanner scanner-result state
  const [scanResult, setScanResult] = useState({ success: null, message: "" });
  const [manualTicketId, setManualTicketId] = useState("");
  const [scannerLoading, setScannerLoading] = useState(false);

  // Form states - Events
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // Form states - Testimonials
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  // Upload states - Gallery
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState("General");
  const [uploadEventName, setUploadEventName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch all data helper
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // 2. Fetch Proposals
      const { data: proposalsData, error: proposalsError } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (proposalsError) throw proposalsError;
      setProposals(proposalsData || []);

      // 3. Fetch Events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });
      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // 4. Fetch Testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (testimonialsError) throw testimonialsError;
      setTestimonials(testimonialsData || []);

      // 5. Fetch Gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (galleryError) throw galleryError;
      setGallery(galleryData || []);

      // 6. Fetch Registrations
      try {
        const { data: registrationsData, error: registrationsError } = await supabase
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false });
        if (registrationsError) throw registrationsError;
        setRegistrations(registrationsData || []);
      } catch (regErr) {
        console.warn("Registrations table not yet loaded/created:", regErr.message);
        setRegistrations([]);
      }

    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  // ── QR SCANNER LOGIC ──
  useEffect(() => {
    if (activeTab !== "scanner") return;

    let scanner;
    const startScanner = () => {
      scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(
        async (decodedText) => {
          if (decodedText) {
            scanner.clear().catch(err => console.error("Error clearing scanner on hit:", err));
            await handleCheckInTicket(decodedText);
          }
        },
        (error) => {
          // Continuous search throws minor exceptions, safely ignore
        }
      );
    };

    // Delay instantiation slightly to ensure DOM element is loaded
    const timer = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner on unmount:", err));
      }
    };
  }, [activeTab]);

  const handleCheckInTicket = async (ticketId) => {
    setScannerLoading(true);
    setScanResult({ success: null, message: "" });
    try {
      const trimmedId = ticketId.trim();
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmedId);

      let query = supabase.from("registrations").select("*");
      if (isUuid) {
        query = query.eq("id", trimmedId);
      } else {
        query = query.eq("registration_number", trimmedId);
      }

      const { data: ticketData, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!ticketData || ticketData.length === 0) {
        setScanResult({ success: false, message: `Ticket "${trimmedId}" not found.` });
        setScannerLoading(false);
        return;
      }

      const ticketObj = ticketData[0];

      if (ticketObj.status === "attended") {
        setScanResult({ success: false, message: `Already Checked In! Participant: ${ticketObj.name} has already checked in.` });
        setScannerLoading(false);
        return;
      }

      if (ticketObj.status === "cancelled") {
        setScanResult({ success: false, message: `Cancelled Registration! Ticket for ${ticketObj.name} was cancelled.` });
        setScannerLoading(false);
        return;
      }

      // Update registration to attended
      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          status: "attended",
          approved_at: new Date().toISOString(),
          approved_by: adminEmail || "admin"
        })
        .eq("id", ticketObj.id);

      if (updateError) throw updateError;

      setScanResult({ success: true, message: `Check-In Successful! Name: ${ticketObj.name} | Ticket: ${ticketObj.registration_number}` });
      setManualTicketId("");
      fetchData(); // reload
    } catch (err) {
      console.error("Scan processing error:", err);
      setScanResult({ success: false, message: err.message || "Failed to process check-in." });
    } finally {
      setScannerLoading(false);
    }
  };

  const handleUpdateRegStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === "attended" || newStatus === "approved") {
        payload.approved_at = new Date().toISOString();
        payload.approved_by = adminEmail || "admin";
      }

      const { error: updateError } = await supabase
        .from("registrations")
        .update(payload)
        .eq("id", id);

      if (updateError) throw updateError;
      fetchData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert("No registration records to export.");
      return;
    }
    const headers = ["Registration Number", "Name", "Email", "Phone", "Age", "T-Shirt Size", "Status", "Created At"];
    const rows = registrations.map(r => [
      r.registration_number,
      r.name,
      r.email,
      r.phone,
      r.age || "—",
      r.tshirt_size || "—",
      r.status,
      new Date(r.created_at).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sportxtreme_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── EVENTS CRUD ──
  const handleDeleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const { error: deleteError } = await supabase.from("events").delete().eq("id", id);
      if (deleteError) {
        alert("Failed to delete event: " + deleteError.message);
      } else {
        setEvents(events.filter(e => e.id !== id));
      }
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventPayload = {
      title: formData.get("title"),
      category: formData.get("category"),
      sport: formData.get("sport"),
      description: formData.get("description"),
      location: formData.get("location"),
      participants: formData.get("participants"),
      event_date: formData.get("event_date") || null,
      status: formData.get("status") || "upcoming",
      image_url: formData.get("image_url") || null,
      registration_deadline: formData.get("registration_deadline") || null,
      max_participants: formData.get("max_participants") ? parseInt(formData.get("max_participants"), 10) : null,
    };

    if (editingEvent) {
      const { error: updateError } = await supabase
        .from("events")
        .update(eventPayload)
        .eq("id", editingEvent.id);
      if (updateError) {
        alert("Failed to update event: " + updateError.message);
      } else {
        fetchData();
        setShowEventForm(false);
        setEditingEvent(null);
      }
    } else {
      const { error: insertError } = await supabase
        .from("events")
        .insert([eventPayload]);
      if (insertError) {
        alert("Failed to create event: " + insertError.message);
      } else {
        fetchData();
        setShowEventForm(false);
        setEditingEvent(null);
      }
    }
  };

  // ── TESTIMONIALS CRUD ──
  const handleDeleteTestimonial = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      const { error: deleteError } = await supabase.from("testimonials").delete().eq("id", id);
      if (deleteError) {
        alert("Failed to delete testimonial: " + deleteError.message);
      } else {
        setTestimonials(testimonials.filter(t => t.id !== id));
      }
    }
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setShowTestimonialForm(true);
  };

  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setShowTestimonialForm(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const testimonialPayload = {
      name: formData.get("name"),
      role: formData.get("role"),
      text: formData.get("text"),
      stars: parseInt(formData.get("stars") || "5", 10),
    };

    if (editingTestimonial) {
      const { error: updateError } = await supabase
        .from("testimonials")
        .update(testimonialPayload)
        .eq("id", editingTestimonial.id);
      if (updateError) {
        alert("Failed to update testimonial: " + updateError.message);
      } else {
        fetchData();
        setShowTestimonialForm(false);
        setEditingTestimonial(null);
      }
    } else {
      const { error: insertError } = await supabase
        .from("testimonials")
        .insert([testimonialPayload]);
      if (insertError) {
        alert("Failed to create testimonial: " + insertError.message);
      } else {
        fetchData();
        setShowTestimonialForm(false);
        setEditingTestimonial(null);
      }
    }
  };

  // ── GALLERY CRUD (WITH STORAGE) ──
  const handleGalleryFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("gallery").insert([
        {
          url: publicUrl,
          caption: uploadCaption.trim() || file.name,
          category: uploadCategory,
          event_name: uploadEventName.trim() || null,
          storage_path: filePath,
        },
      ]);

      if (dbError) throw dbError;

      setUploadCaption("");
      setUploadEventName("");
      setUploadCategory("General");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchData();
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + (err.message || err.error_description || "Unknown error"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteGalleryItem = async (item) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    setDeletingId(item.id);
    console.log("[Gallery Delete] Starting delete for:", item.id, item.caption);

    try {
      // Step 1: Delete from Supabase Storage (if file path exists)
      if (item.storage_path) {
        console.log("[Gallery Delete] Removing storage file:", item.storage_path);
        const { data: storageData, error: storageError } = await supabase.storage
          .from("gallery")
          .remove([item.storage_path]);
        if (storageError) {
          console.error("[Gallery Delete] Storage delete error (non-fatal):", storageError.code, storageError.message);
        } else {
          console.log("[Gallery Delete] Storage delete succeeded:", storageData);
        }
      } else {
        console.log("[Gallery Delete] No storage_path on item — skipping storage delete.");
      }

      // Step 2: Delete from gallery table
      console.log("[Gallery Delete] Deleting DB row id:", item.id);
      const { data: dbData, error: dbError } = await supabase
        .from("gallery")
        .delete()
        .eq("id", item.id)
        .select("id");

      if (dbError) {
        console.error("[Gallery Delete] DB delete FAILED:", dbError.code, dbError.message, dbError.details, dbError.hint);
        throw dbError;
      }

      console.log("[Gallery Delete] DB row deleted:", dbData);

      // Step 3: Refresh gallery list
      await fetchData();
      console.log("[Gallery Delete] Gallery refreshed. Delete complete.");
    } catch (err) {
      console.error("[Gallery Delete] Unhandled error:", err);
      alert("Delete failed: " + (err.message || JSON.stringify(err)));
    } finally {
      setDeletingId(null);
    }
  };

  // Filters for registrations list
  const filteredRegs = registrations.filter(r => {
    const searchMatch = !regSearch.trim() ||
      r.name.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.phone.toLowerCase().includes(regSearch.toLowerCase()) ||
      (r.registration_number && r.registration_number.toLowerCase().includes(regSearch.toLowerCase()));

    const eventMatch = !regEventFilter || r.event_id === regEventFilter;
    const statusMatch = !regStatusFilter || r.status === regStatusFilter;

    return searchMatch && eventMatch && statusMatch;
  });

  const inputStyle = {
    padding: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "0.9rem",
  };

  return (
    <div style={{ background: C.black, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "rgba(229,9,20,0.1)", borderBottom: "1px solid rgba(229,9,20,0.2)", padding: "16px 5%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="bebas" style={{ fontSize: "1.5rem" }}>
            SPORT<span style={{ color: C.red }}>X</span>TREME ADMIN
          </div>
          <div style={{ fontSize: "0.75rem", color: C.gray, marginTop: 4 }}>Logged in as: {adminEmail}</div>
        </div>
        <button onClick={handleLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.3s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
        >
          LOGOUT
        </button>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
        {/* Sidebar */}
        <div style={{ width: 250, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "overview", label: "Overview", count: null },
              { id: "registrations", label: "Registrations", count: registrations.length },
              { id: "scanner", label: "QR Scanner", count: null },
              { id: "contacts", label: "Contacts", count: contacts.length },
              { id: "proposals", label: "Proposals", count: proposals.length },
              { id: "events", label: "Events", count: events.length },
              { id: "testimonials", label: "Testimonials", count: testimonials.length },
              { id: "gallery", label: "Gallery", count: gallery.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowEventForm(false); setShowTestimonialForm(false); setScanResult({ success: null, message: "" }); }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: activeTab === tab.id ? "rgba(229,9,20,0.2)" : "none",
                  border: activeTab === tab.id ? "1px solid rgba(229,9,20,0.3)" : "1px solid transparent",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.9rem",
                }}
              >
                {tab.label} {tab.count !== null ? `(${tab.count})` : ""}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ width: "100%", padding: "12px 16px", background: "none", border: "1px solid rgba(255,255,255,0.1)", color: C.gray, cursor: "pointer", textAlign: "left", fontSize: "0.85rem" }}
          >
            ← Back to Website
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(229,9,20,0.1)", border: "1px solid #E50914", color: "#E50914", fontSize: "0.85rem", marginBottom: 24 }}>
              {error}
            </div>
          )}

          {loading && <div style={{ color: C.gray, marginBottom: 16 }}>Loading real-time records...</div>}

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              <h2 className="bebas" style={{ fontSize: "2rem", marginBottom: 24 }}>DASHBOARD OVERVIEW</h2>
              
              {/* Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
                {[
                  { title: "Total Events", value: events.length, color: C.red, icon: "🏆" },
                  { title: "Total Registrations", value: registrations.length, color: "#fff", icon: "📝" },
                  { title: "Checked-In (Attended)", value: registrations.filter(r => r.status === "attended").length, color: "#25D366", icon: "✅" },
                  { title: "Pending Approvals", value: registrations.filter(r => r.status === "pending").length, color: "#FFA500", icon: "⏳" },
                  { title: "Gallery Images", value: gallery.length, color: "#fff", icon: "📸" },
                  { title: "Testimonials", value: testimonials.length, color: "#fff", icon: "💬" }
                ].map((card, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", position: "relative" }}>
                    <div style={{ fontSize: "1.2rem", marginBottom: 8 }}>{card.icon}</div>
                    <div style={{ color: C.gray, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      {card.title}
                    </div>
                    <div className="bebas" style={{ fontSize: "2.5rem", color: card.color, lineHeight: 1 }}>
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance Chart (Dynamic SVGs & CSS) */}
              <h3 className="bebas" style={{ fontSize: "1.5rem", marginBottom: 20 }}>EVENT ATTENDANCE ANALYTICS</h3>
              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.06)", padding: "28px" }}>
                {events.length === 0 ? (
                  <div style={{ color: C.gray, textAlign: "center" }}>No events defined. Attendance metrics will display here.</div>
                ) : (
                  events.map(ev => {
                    const regForEv = registrations.filter(r => r.event_id === ev.id);
                    const total = regForEv.length;
                    const attended = regForEv.filter(r => r.status === "attended").length;
                    const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
                    return (
                      <div key={ev.id} style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.88rem" }}>
                          <span style={{ fontWeight: 600 }}>{ev.title}</span>
                          <span style={{ color: C.red }}>
                            {attended} / {total} Checked In ({pct}%)
                          </span>
                        </div>
                        <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #E50914, #ff5c5c)", borderRadius: 5 }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ── REGISTRATIONS TAB ── */}
          {activeTab === "registrations" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                <h2 className="bebas" style={{ fontSize: "2rem" }}>REGISTRATIONS</h2>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={handleExportCSV} className="out-btn" style={{ padding: "10px 20px" }}>
                    📥 EXPORT CSV
                  </button>
                  <button onClick={fetchData} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "10px 16px", cursor: "pointer", fontSize: "0.8rem" }}>
                    ↻ REFRESH
                  </button>
                </div>
              </div>

              {/* Filters Box */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                <input
                  placeholder="Search name, email, phone, or ticket ID..."
                  value={regSearch}
                  onChange={e => setRegSearch(e.target.value)}
                  className="form-f"
                  style={{ width: "100%" }}
                />
                <select
                  value={regEventFilter}
                  onChange={e => setRegEventFilter(e.target.value)}
                  className="form-f"
                >
                  <option value="">All Events</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
                <select
                  value={regStatusFilter}
                  onChange={e => setRegStatusFilter(e.target.value)}
                  className="form-f"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="attended">Attended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Registrations Table */}
              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Ticket ID</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Name</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Email/Phone</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Event</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Size</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Status</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Check-in</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegs.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: C.gray }}>No registrations match the selected filters.</td></tr>
                    ) : (
                      filteredRegs.map(reg => {
                        const eventObj = events.find(e => e.id === reg.event_id);
                        return (
                          <tr key={reg.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "16px", fontSize: "0.85rem", fontWeight: "bold", color: C.red }}>
                              {reg.registration_number || reg.id.substring(0, 8)}
                            </td>
                            <td style={{ padding: "16px", fontSize: "0.9rem" }}>{reg.name}</td>
                            <td style={{ padding: "16px", fontSize: "0.82rem", lineHeight: 1.4 }}>
                              <div>{reg.email}</div>
                              <div style={{ color: C.gray }}>{reg.phone}</div>
                            </td>
                            <td style={{ padding: "16px", fontSize: "0.85rem" }}>
                              {eventObj ? eventObj.title : "Unknown Event"}
                            </td>
                            <td style={{ padding: "16px", fontSize: "0.85rem" }}>{reg.tshirt_size || "—"}</td>
                            <td style={{ padding: "16px" }}>
                              <span style={{
                                padding: "3px 8px", fontSize: "0.72rem", textTransform: "uppercase",
                                border: "1px solid",
                                borderColor: reg.status === "attended" ? "#25D366" : reg.status === "cancelled" ? C.red : reg.status === "approved" ? "#00bfff" : "#FFA500",
                                color: reg.status === "attended" ? "#25D366" : reg.status === "cancelled" ? C.red : reg.status === "approved" ? "#00bfff" : "#FFA500",
                              }}>
                                {reg.status}
                              </span>
                            </td>
                            <td style={{ padding: "16px", fontSize: "0.82rem", color: C.gray }}>
                              {reg.status === "attended" ? (
                                <div>Checked In<br/>{reg.approved_at ? new Date(reg.approved_at).toLocaleTimeString() : ""}</div>
                              ) : "Not checked in"}
                            </td>
                            <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                              {reg.status !== "attended" && (
                                <button
                                  onClick={() => handleUpdateRegStatus(reg.id, "attended")}
                                  style={{ background: "none", border: "1px solid #25D366", color: "#25D366", padding: "6px 12px", cursor: "pointer", marginRight: 8, fontSize: "0.72rem" }}
                                >
                                  CHECK IN
                                </button>
                              )}
                              {reg.status === "pending" && (
                                <button
                                  onClick={() => handleUpdateRegStatus(reg.id, "approved")}
                                  style={{ background: "none", border: "1px solid #00bfff", color: "#00bfff", padding: "6px 12px", cursor: "pointer", marginRight: 8, fontSize: "0.72rem" }}
                                >
                                  APPROVE
                                </button>
                              )}
                              {reg.status !== "cancelled" && (
                                <button
                                  onClick={() => handleUpdateRegStatus(reg.id, "cancelled")}
                                  style={{ background: "none", border: "1px solid " + C.red, color: C.red, padding: "6px 12px", cursor: "pointer", fontSize: "0.72rem" }}
                                >
                                  CANCEL
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── QR SCANNER TAB ── */}
          {activeTab === "scanner" && (
            <>
              <h2 className="bebas" style={{ fontSize: "2rem", marginBottom: 24 }}>QR CODE GATE CHECK-IN</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32 }}>
                {/* Camera scanner view */}
                <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "28px", textAlign: "center" }}>
                  <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>CAMERA FEED</div>
                  <div id="qr-reader" style={{ width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.05)" }} />
                  <div style={{ fontSize: "0.78rem", color: C.gray, marginTop: 12 }}>
                    Hold the ticket QR code in front of the camera to scan and automatically register attendance.
                  </div>
                </div>

                {/* Manual text-id entry & results */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Manual entry */}
                  <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", padding: "28px" }}>
                    <h3 className="bebas" style={{ fontSize: "1.2rem", marginBottom: 16 }}>MANUAL CHECK-IN</h3>
                    <div style={{ display: "flex", gap: 12 }}>
                      <input
                        placeholder="Enter Ticket ID (e.g. REG-10001 or UUID)..."
                        value={manualTicketId}
                        onChange={e => setManualTicketId(e.target.value)}
                        className="form-f"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => handleCheckInTicket(manualTicketId)}
                        disabled={scannerLoading || !manualTicketId.trim()}
                        className="red-btn"
                        style={{ padding: "0 24px" }}
                      >
                        {scannerLoading ? "VERIFYING…" : "CHECK-IN"}
                      </button>
                    </div>
                  </div>

                  {/* Scan results panel */}
                  {scanResult.success !== null && (
                    <div style={{
                      padding: "24px",
                      border: "1px solid",
                      background: scanResult.success ? "rgba(37,211,102,0.1)" : "rgba(229,9,20,0.1)",
                      borderColor: scanResult.success ? "#25D366" : C.red,
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{scanResult.success ? "✅" : "❌"}</div>
                      <h4 className="bebas" style={{ fontSize: "1.3rem", color: scanResult.success ? "#25D366" : C.red, marginBottom: 8 }}>
                        {scanResult.success ? "VALID ENTRY" : "INVALID / DENIED ENTRY"}
                      </h4>
                      <p style={{ fontSize: "0.9rem", color: "#fff", lineHeight: 1.5 }}>
                        {scanResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── CONTACTS TAB ── */}
          {activeTab === "contacts" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 className="bebas" style={{ fontSize: "2rem" }}>CONTACTS</h2>
                <button onClick={fetchData} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem" }}>
                  ↻ REFRESH
                </button>
              </div>

              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Name</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Email</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Phone</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Message</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: C.gray }}>No inquiries received yet.</td></tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{contact.name}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{contact.email}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{contact.phone || "—"}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem", maxWidth: 300 }}>{contact.message}</td>
                          <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray }}>{new Date(contact.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PROPOSALS TAB ── */}
          {activeTab === "proposals" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 className="bebas" style={{ fontSize: "2rem" }}>PROPOSALS</h2>
                <button onClick={fetchData} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem" }}>
                  ↻ REFRESH
                </button>
              </div>

              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Company</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Event Type</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Participants / Contact</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Budget</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Description</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: C.gray }}>No proposals received yet.</td></tr>
                    ) : (
                      proposals.map((proposal) => (
                        <tr key={proposal.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.company_name}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.event_type}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.participants || "—"}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.budget ? `₹${proposal.budget}` : "—"}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem", maxWidth: 300 }}>{proposal.description}</td>
                          <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray }}>{new Date(proposal.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── EVENTS TAB ── */}
          {activeTab === "events" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 className="bebas" style={{ fontSize: "2rem" }}>EVENTS</h2>
                <button onClick={handleAddEvent} className="red-btn" style={{ padding: "10px 20px" }}>
                  + ADD EVENT
                </button>
              </div>

              {showEventForm && (
                <div style={{ border: "1px solid rgba(229,9,20,0.3)", background: "rgba(229,9,20,0.05)", padding: "24px", marginBottom: 24 }}>
                  <h3 className="bebas" style={{ fontSize: "1.5rem", marginBottom: 16 }}>
                    {editingEvent ? "EDIT EVENT" : "ADD EVENT"}
                  </h3>
                  <form onSubmit={handleSaveEvent} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Event Title *</label>
                      <input name="title" defaultValue={editingEvent?.title} placeholder="Event Title" required style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Category (e.g. CORPORATE) *</label>
                      <input name="category" defaultValue={editingEvent?.category} placeholder="Category" required style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Sport (e.g. Cricket) *</label>
                      <input name="sport" defaultValue={editingEvent?.sport} placeholder="Sport" required style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Venue / Location</label>
                      <input name="location" defaultValue={editingEvent?.location} placeholder="Venue" style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Participants Label (e.g. 500+)</label>
                      <input name="participants" defaultValue={editingEvent?.participants} placeholder="Participants Label" style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Event Date</label>
                      <input name="event_date" defaultValue={editingEvent?.event_date} type="date" style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Registration Deadline</label>
                      <input name="registration_deadline" defaultValue={editingEvent?.registration_deadline} type="date" style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Maximum Participants Limit</label>
                      <input name="max_participants" defaultValue={editingEvent?.max_participants} type="number" placeholder="No limit if empty" style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Event Banner Image URL</label>
                      <input name="image_url" defaultValue={editingEvent?.image_url} placeholder="https://example.com/banner.jpg" style={{ ...inputStyle, width: "100%" }} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Event Status</label>
                      <select name="status" defaultValue={editingEvent?.status || "upcoming"} style={{ ...inputStyle, width: "100%" }}>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: C.gray, marginBottom: 4 }}>Description</label>
                      <textarea name="description" defaultValue={editingEvent?.description} placeholder="Description" style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", minHeight: "100px" }} />
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
                      <button type="submit" className="red-btn" style={{ padding: "12px 24px" }}>
                        {editingEvent ? "UPDATE EVENT" : "ADD EVENT"}
                      </button>
                      <button type="button" onClick={() => { setShowEventForm(false); setEditingEvent(null); }} style={{ padding: "12px 24px", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer" }}>
                         CANCEL
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Title</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Category</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Sport</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Location</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Date</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: C.gray }}>No events exist. Add your first event above.</td></tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{event.title}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{event.category}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{event.sport}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{event.location}</td>
                          <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray }}>{event.event_date || "—"}</td>
                          <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                            <button onClick={() => handleEditEvent(event)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", cursor: "pointer", marginRight: 8, fontSize: "0.75rem" }}>
                              EDIT
                            </button>
                            <button onClick={() => handleDeleteEvent(event.id)} style={{ background: "none", border: "1px solid rgba(229,9,20,0.3)", color: C.red, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem" }}>
                              DELETE
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── TESTIMONIALS TAB ── */}
          {activeTab === "testimonials" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 className="bebas" style={{ fontSize: "2rem" }}>TESTIMONIALS</h2>
                <button onClick={handleAddTestimonial} className="red-btn" style={{ padding: "10px 20px" }}>
                  + ADD TESTIMONIAL
                </button>
              </div>

              {showTestimonialForm && (
                <div style={{ border: "1px solid rgba(229,9,20,0.3)", background: "rgba(229,9,20,0.05)", padding: "24px", marginBottom: 24 }}>
                  <h3 className="bebas" style={{ fontSize: "1.5rem", marginBottom: 16 }}>
                    {editingTestimonial ? "EDIT TESTIMONIAL" : "ADD TESTIMONIAL"}
                  </h3>
                  <form onSubmit={handleSaveTestimonial} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <input name="name" defaultValue={editingTestimonial?.name} placeholder="Client Name *" required style={inputStyle} />
                    <input name="role" defaultValue={editingTestimonial?.role} placeholder="Role / Company *" required style={inputStyle} />
                    <input name="stars" defaultValue={editingTestimonial?.stars || "5"} type="number" min="1" max="5" placeholder="Stars (1-5) *" required style={inputStyle} />
                    <textarea name="text" defaultValue={editingTestimonial?.text} placeholder="Review Text *" required style={{ gridColumn: "1 / -1", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", minHeight: "100px" }} />
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
                      <button type="submit" className="red-btn" style={{ padding: "12px 24px" }}>
                        {editingTestimonial ? "UPDATE TESTIMONIAL" : "ADD TESTIMONIAL"}
                      </button>
                      <button type="button" onClick={() => { setShowTestimonialForm(false); setEditingTestimonial(null); }} style={{ padding: "12px 24px", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer" }}>
                        CANCEL
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Name</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Role</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Stars</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Text</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: C.gray }}>No testimonials exist. Add your first testimonial above.</td></tr>
                    ) : (
                      testimonials.map((t) => (
                        <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "16px", fontSize: "0.9rem" }}>{t.name}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem", color: C.gray }}>{t.role}</td>
                          <td style={{ padding: "16px", fontSize: "0.9rem", color: C.red }}>{"★".repeat(t.stars || 5)}</td>
                          <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray, maxWidth: 300 }}>{t.text}</td>
                          <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                            <button onClick={() => handleEditTestimonial(t)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", cursor: "pointer", marginRight: 8, fontSize: "0.75rem" }}>
                              EDIT
                            </button>
                            <button onClick={() => handleDeleteTestimonial(t.id)} style={{ background: "none", border: "1px solid rgba(229,9,20,0.3)", color: C.red, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem" }}>
                              DELETE
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── GALLERY TAB ── */}
          {activeTab === "gallery" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 className="bebas" style={{ fontSize: "2rem" }}>GALLERY</h2>
                <button onClick={fetchData} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem" }}>
                  ↻ REFRESH
                </button>
              </div>

              {/* Upload Image Panel */}
              <div style={{ border: "1px solid rgba(229,9,20,0.3)", background: "rgba(229,9,20,0.05)", padding: "24px", marginBottom: 28 }}>
                <h3 className="bebas" style={{ fontSize: "1.2rem", marginBottom: 16 }}>UPLOAD IMAGE TO STORAGE</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <input
                    placeholder="Caption"
                    value={uploadCaption}
                    onChange={e => setUploadCaption(e.target.value)}
                    style={inputStyle}
                  />
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    style={inputStyle}
                  >
                    {GALLERY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Event Name (optional)"
                    value={uploadEventName}
                    onChange={e => setUploadEventName(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <label style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: uploadingImage ? "not-allowed" : "pointer",
                      background: uploadingImage ? "rgba(229,9,20,0.5)" : C.red,
                      padding: "12px 20px", color: "#fff",
                      fontSize: "0.85rem", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em",
                      transition: "opacity 0.2s",
                    }}>
                      {uploadingImage ? "UPLOADING…" : "SELECT & UPLOAD IMAGE"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleGalleryFileChange}
                        disabled={uploadingImage}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: C.gray }}>Max 5 MB · JPEG, PNG, WebP, GIF</div>
              </div>

              {/* Gallery Grid */}
              {gallery.length === 0 ? (
                <div style={{ color: C.gray, padding: "48px 0", textAlign: "center" }}>
                  No images in gallery yet. Upload your first image above.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {gallery.map(item => (
                    <div key={item.id} style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
                      <div style={{
                        height: 140, position: "relative",
                        background: item.url
                          ? `url(${item.url}) center/cover no-repeat`
                          : "rgba(229,9,20,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {!item.url && <div style={{ fontSize: "2.5rem", opacity: 0.3 }}>📷</div>}
                        <div style={{ position: "absolute", top: 8, left: 8, background: C.red, padding: "2px 8px", fontSize: "0.62rem", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.08em" }}>
                          {item.category || "General"}
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", padding: "4px 8px", fontSize: "0.65rem", color: "#fff", textDecoration: "none" }}
                          >
                            VIEW
                          </a>
                        )}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "0.78rem", color: "#fff", marginBottom: 2 }}>{item.caption || "—"}</div>
                        <div style={{ fontSize: "0.7rem", color: C.gray, marginBottom: 8 }}>{item.event_name || ""}</div>
                        <button
                          onClick={() => handleDeleteGalleryItem(item)}
                          disabled={deletingId === item.id}
                          style={{
                            width: "100%", background: deletingId === item.id ? "rgba(229,9,20,0.15)" : "none",
                            border: "1px solid rgba(229,9,20,0.3)", color: C.red, padding: "5px",
                            cursor: deletingId === item.id ? "not-allowed" : "pointer", fontSize: "0.72rem",
                            opacity: deletingId === item.id ? 0.6 : 1,
                          }}
                        >
                          {deletingId === item.id ? "DELETING…" : "DELETE"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
