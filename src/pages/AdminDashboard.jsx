import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../data/content";
import { MOCK_EVENTS } from "../data/mockEvents";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contacts");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock data
  const [contacts, setContacts] = useState([
    { id: "1", name: "John Doe", email: "john@example.com", phone: "+91 8976571622", message: "Interested in corporate event", timestamp: "2025-01-15T10:30:00Z" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+91 9136890309", message: "School championship inquiry", timestamp: "2025-01-14T14:20:00Z" },
  ]);

  const [proposals, setProposals] = useState([
    { id: "1", company_name: "TechCorp", event_type: "Corporate Sports League", participants: "100", budget: "500000", description: "Annual sports day", timestamp: "2025-01-15T09:00:00Z" },
    { id: "2", company_name: "Global Schools", event_type: "School Championship", participants: "500", budget: "200000", description: "Inter-school tournament", timestamp: "2025-01-14T11:30:00Z" },
  ]);

  const [events, setEvents] = useState(MOCK_EVENTS);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("admin_authenticated");
    if (!auth) {
      navigate("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    navigate("/admin/login");
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== id));
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

  const handleSaveEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      title: formData.get("title"),
      category: formData.get("category"),
      sport: formData.get("sport"),
      description: formData.get("description"),
      location: formData.get("location"),
      participants: formData.get("participants"),
      event_date: formData.get("event_date"),
      image_url: null,
      status: "upcoming"
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? newEvent : e));
    } else {
      setEvents([...events, newEvent]);
    }

    setShowEventForm(false);
    setEditingEvent(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ background: C.black, color: "#fff", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "rgba(229,9,20,0.1)", borderBottom: "1px solid rgba(229,9,20,0.2)", padding: "16px 5%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="bebas" style={{ fontSize: "1.5rem" }}>
          SPORT<span style={{ color: C.red }}>X</span>TREME ADMIN
        </div>
        <button onClick={handleLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem" }}>
          LOGOUT
        </button>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
        {/* Sidebar */}
        <div style={{ width: 250, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 16px" }}>
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setActiveTab("contacts")}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: activeTab === "contacts" ? "rgba(229,9,20,0.2)" : "none",
                border: activeTab === "contacts" ? "1px solid rgba(229,9,20,0.3)" : "1px solid transparent",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                marginBottom: 8,
              }}
            >
              Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab("proposals")}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: activeTab === "proposals" ? "rgba(229,9,20,0.2)" : "none",
                border: activeTab === "proposals" ? "1px solid rgba(229,9,20,0.3)" : "1px solid transparent",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                marginBottom: 8,
              }}
            >
              Proposals ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab("events")}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: activeTab === "events" ? "rgba(229,9,20,0.2)" : "none",
                border: activeTab === "events" ? "1px solid rgba(229,9,20,0.3)" : "1px solid transparent",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
              }}
            >
              Events ({events.length})
            </button>
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
          {activeTab === "contacts" && (
            <>
              <h2 className="bebas" style={{ fontSize: "2rem", marginBottom: 24 }}>CONTACTS</h2>
              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
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
                    {contacts.map((contact) => (
                      <tr key={contact.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>{contact.name}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>{contact.email}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>{contact.phone}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem", maxWidth: 300 }}>{contact.message}</td>
                        <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray }}>{new Date(contact.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "proposals" && (
            <>
              <h2 className="bebas" style={{ fontSize: "2rem", marginBottom: 24 }}>PROPOSALS</h2>
              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Company</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Event Type</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Participants</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Budget</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Description</th>
                      <th style={{ padding: "16px", textAlign: "left", fontSize: "0.85rem", color: C.gray }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal) => (
                      <tr key={proposal.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.company_name}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.event_type}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>{proposal.participants}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem" }}>₹{proposal.budget}</td>
                        <td style={{ padding: "16px", fontSize: "0.9rem", maxWidth: 300 }}>{proposal.description}</td>
                        <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray }}>{new Date(proposal.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

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
                    <input name="title" defaultValue={editingEvent?.title} placeholder="Event Title *" required style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <input name="category" defaultValue={editingEvent?.category} placeholder="Category *" required style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <input name="sport" defaultValue={editingEvent?.sport} placeholder="Sport *" required style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <input name="location" defaultValue={editingEvent?.location} placeholder="Location" style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <input name="participants" defaultValue={editingEvent?.participants} placeholder="Participants" style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <input name="event_date" defaultValue={editingEvent?.event_date} type="date" placeholder="Event Date" style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                    <textarea name="description" defaultValue={editingEvent?.description} placeholder="Description" style={{ gridColumn: "1 / -1", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", minHeight: 80 }} />
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

              <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
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
                        <td style={{ padding: "16px", fontSize: "0.85rem", color: C.gray }}>{event.event_date}</td>
                        <td style={{ padding: "16px" }}>
                          <button onClick={() => handleEditEvent(event)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", marginRight: 8 }}>
                            EDIT
                          </button>
                          <button onClick={() => handleDeleteEvent(event.id)} style={{ background: "none", border: "1px solid rgba(229,9,20,0.3)", color: C.red, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem" }}>
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
        </div>
      </div>
    </div>
  );
}
