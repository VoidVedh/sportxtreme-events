import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../data/content";
import { supabase } from "../lib/supabase";

const GALLERY_CATEGORIES = ["Corporate", "Marathon", "School", "League", "Cycling", "Aquatic", "Badminton", "General"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, adminEmail } = useAuth();
  const [activeTab, setActiveTab] = useState("contacts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data states
  const [contacts, setContacts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [events, setEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);

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

    // Validate size limit (5MB)
    if (file.size > 5242880) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      // 1. Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      // 3. Save reference to gallery table
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

      // Success Reset
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
    if (window.confirm("Are you sure you want to delete this image?")) {
      setLoading(true);
      try {
        // 1. Delete from storage if storage path exists
        if (item.storage_path) {
          const { error: storageError } = await supabase.storage
            .from("gallery")
            .remove([item.storage_path]);
          if (storageError) console.error("Could not remove from storage:", storageError.message);
        }

        // 2. Delete database entry
        const { error: dbError } = await supabase
          .from("gallery")
          .delete()
          .eq("id", item.id);

        if (dbError) throw dbError;
        fetchData();
      } catch (err) {
        alert("Delete failed: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

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
              { id: "contacts", label: "Contacts", count: contacts.length },
              { id: "proposals", label: "Proposals", count: proposals.length },
              { id: "events", label: "Events", count: events.length },
              { id: "testimonials", label: "Testimonials", count: testimonials.length },
              { id: "gallery", label: "Gallery", count: gallery.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowEventForm(false); setShowTestimonialForm(false); }}
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
                {tab.label} ({tab.count})
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

          {loading && <div style={{ color: C.gray, marginBottom: 16 }}>Loading real-time Supabase records...</div>}

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
                    <input name="title" defaultValue={editingEvent?.title} placeholder="Event Title *" required style={inputStyle} />
                    <input name="category" defaultValue={editingEvent?.category} placeholder="Category (e.g. CORPORATE) *" required style={inputStyle} />
                    <input name="sport" defaultValue={editingEvent?.sport} placeholder="Sport (e.g. Cricket) *" required style={inputStyle} />
                    <input name="location" defaultValue={editingEvent?.location} placeholder="Location" style={inputStyle} />
                    <input name="participants" defaultValue={editingEvent?.participants} placeholder="Participants (e.g. 500+)" style={inputStyle} />
                    <input name="event_date" defaultValue={editingEvent?.event_date} type="date" style={inputStyle} />
                    <select name="status" defaultValue={editingEvent?.status || "upcoming"} style={inputStyle}>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                    <textarea name="description" defaultValue={editingEvent?.description} placeholder="Description" style={{ gridColumn: "1 / -1", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", minHeight: "100px" }} />
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
                    {events.map((event) => (
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
                    ))}
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
                    {testimonials.map((t) => (
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
                    ))}
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

              {/* Gallery Items Grid */}
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
                          style={{ width: "100%", background: "none", border: "1px solid rgba(229,9,20,0.3)", color: C.red, padding: "5px", cursor: "pointer", fontSize: "0.72rem" }}
                        >
                          DELETE
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
