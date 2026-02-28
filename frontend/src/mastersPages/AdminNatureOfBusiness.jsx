import { useEffect, useState } from "react";
import axios from "axios";
import { Globe, Plus, Search, Pencil, Trash2, X, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const API = "http://localhost:5000/api/masters";
const HIGHLIGHT = "#3b82f6";

export default function NatureMasterPage() {
  const [natures, setNatures] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/nature-of-business`);
      setNatures(res.data.data);
      setFiltered(res.data.data);
    } catch {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(natures.filter((n) => n.name.toLowerCase().includes(q)));
  }, [search, natures]);

  const openCreate = () => { setEditingItem(null); setName(""); setError(""); setShowModal(true); };
  const openEdit = (item) => { setEditingItem(item); setName(item.name); setError(""); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setError(""); setName(""); setEditingItem(null); };
  const openDelete = (item) => { setDeletingItem(item); setShowDeleteModal(true); };

  const handleSave = async () => {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true); setError("");
    try {
      if (editingItem) {
        await axios.put(`${API}/nature-of-business/${editingItem._id}`, { name: name.trim() });
        showToast("Nature updated successfully");
      } else {
        await axios.post(`${API}/nature-of-business`, { name: name.trim() });
        showToast("Nature created successfully");
      }
      closeModal(); fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg.includes("duplicate") || msg.includes("E11000") ? "This name already exists" : msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/nature-of-business/${deletingItem._id}`);
      showToast("Nature deleted successfully");
      setShowDeleteModal(false); setDeletingItem(null); fetchData();
    } catch { showToast("Failed to delete", "error"); }
    finally { setDeleting(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") closeModal();
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "#f8fafc", padding: "44px 36px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-skeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .fu  { animation: fadeUp 0.4s ease both; }
        .d1  { animation-delay: 0.04s; }
        .d2  { animation-delay: 0.10s; }
        .d3  { animation-delay: 0.16s; }

        .nature-card {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          cursor: default;
        }
        .nature-card:hover {
          box-shadow: 0 6px 24px rgba(59,130,246,0.10) !important;
          border-color: #bfdbfe !important;
          transform: translateY(-2px);
        }
        .action-btn {
          transition: background 0.13s ease, color 0.13s ease;
          border: none; cursor: pointer;
        }
        .search-input:focus {
          outline: none;
          border-color: ${HIGHLIGHT};
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .modal-input:focus {
          outline: none;
          border-color: ${HIGHLIGHT};
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .modal-input.error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
        }
        .skeleton {
          animation: pulse-skeleton 1.5s ease infinite;
          background: #e2e8f0;
          border-radius: 6px;
        }
        .add-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .add-btn:hover {
          background: #2563eb !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(59,130,246,0.35) !important;
        }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 200,
          display: "flex", alignItems: "center", gap: 10,
          padding: "13px 18px", borderRadius: 12,
          background: toast.type === "success" ? "#fff" : "#fff",
          border: `1.5px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          animation: "toastIn 0.3s ease both",
          fontFamily: "'Poppins', sans-serif",
        }}>
          {toast.type === "success"
            ? <CheckCircle size={17} color="#16a34a" />
            : <XCircle size={17} color="#dc2626" />}
          <span style={{ fontSize: 13.5, fontWeight: 500, color: toast.type === "success" ? "#15803d" : "#dc2626" }}>
            {toast.message}
          </span>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="fu" style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>
            Nature of Business
          </h1>
          <span style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8", letterSpacing: "0.16em", fontFamily: "'DM Mono', monospace" }}>
            MASTER
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
          {natures.length} {natures.length === 1 ? "entry" : "entries"} total
        </p>

        {/* Rule — same as MastersPage */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
          <div style={{ width: 28, height: 2, background: "#0f172a", borderRadius: 2 }} />
          <div style={{ flex: 1, height: 1, background: "#e2e8f0", borderRadius: 2 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#cbd5e1", letterSpacing: "0.1em" }}>
            COMPANY MASTER
          </span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="fu d1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 320 }}>
          <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nature of business..."
            style={{
              width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              fontSize: 14, fontFamily: "'Poppins', sans-serif", fontWeight: 400,
              border: "1px solid #e2e8f0", borderRadius: 10, background: "white",
              color: "#334155", boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", padding: 2 }}>
              <X size={13} color="#94a3b8" />
            </button>
          )}
        </div>

        {/* Add button */}
        <button
          className="add-btn"
          onClick={openCreate}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 10,
            background: HIGHLIGHT, border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 600, color: "white",
            fontFamily: "'Poppins', sans-serif",
            boxShadow: "0 2px 8px rgba(59,130,246,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={16} /> Add Nature
        </button>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "white", borderRadius: 14, border: "1px solid #e8ecf0", padding: "22px 22px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="skeleton" style={{ height: 18, width: "70%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: "45%" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
                <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", color: "#94a3b8" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Globe size={26} color="#cbd5e1" />
          </div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#64748b" }}>
            {search ? "No results found" : "No natures added yet"}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#94a3b8" }}>
            {search ? `Nothing matched "${search}"` : 'Click "Add Nature" to get started'}
          </p>
        </div>
      ) : (
        <div className="fu d2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((item, idx) => (
            <div
              key={item._id}
              className="nature-card"
              onMouseEnter={() => setHoveredCard(item._id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: "white", borderRadius: 14,
                border: "1px solid #e8ecf0",
                padding: "22px 22px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                overflow: "hidden", position: "relative",
              }}
            >
              {/* Top accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${HIGHLIGHT}, ${HIGHLIGHT}44)`, borderRadius: "14px 14px 0 0" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    background: `${HIGHLIGHT}10`, border: `1px solid ${HIGHLIGHT}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Globe size={16} color={HIGHLIGHT} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, wordBreak: "break-word" }}>
                      {item.name}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>
                      Added {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span style={{
                  flexShrink: 0, fontSize: 11, fontWeight: 600, padding: "3px 9px",
                  borderRadius: 999, background: "#dcfce7", color: "#16a34a",
                  fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                }}>
                  Active
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                <button
                  className="action-btn"
                  onClick={() => openEdit(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: "#eff6ff", color: "#3b82f6",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#dbeafe"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#eff6ff"}
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  className="action-btn"
                  onClick={() => openDelete(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: "#fff1f2", color: "#ef4444",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#fff1f2"}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{
            background: "white", width: "100%", maxWidth: 440, borderRadius: 18,
            padding: "28px 28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            animation: "modalIn 0.22s ease both", fontFamily: "'Poppins', sans-serif",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
                  {editingItem ? "Edit Nature" : "Add Nature of Business"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
                  {editingItem ? `Editing: ${editingItem.name}` : "Create a new classification entry"}
                </p>
              </div>
              <button onClick={closeModal} style={{ border: "none", background: "#f1f5f9", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={15} color="#64748b" />
              </button>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", marginBottom: 22 }} />

            <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              autoFocus
              className={`modal-input${error ? " error" : ""}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Manufacturing, Retail..."
              style={{
                width: "100%", padding: "11px 14px", fontSize: 14,
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
                borderRadius: 10, background: "white", color: "#0f172a",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
            />
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ fontSize: 12.5, color: "#ef4444", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  padding: "10px 18px", borderRadius: 9, border: "1px solid #e2e8f0",
                  background: "white", color: "#64748b", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif", cursor: "pointer",
                  transition: "background 0.13s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 22px", borderRadius: 9, border: "none",
                  background: saving ? "#93c5fd" : HIGHLIGHT,
                  color: "white", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "0 2px 8px rgba(59,130,246,0.30)",
                  transition: "background 0.13s, box-shadow 0.13s",
                }}
              >
                {saving ? "Saving…" : editingItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{
            background: "white", width: "100%", maxWidth: 400, borderRadius: 18,
            padding: "28px 28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            animation: "modalIn 0.22s ease both", fontFamily: "'Poppins', sans-serif",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fff1f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} color="#ef4444" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Delete Nature</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>This action cannot be undone.</p>
              </div>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", marginBottom: 16 }} />

            <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <span style={{ fontWeight: 700, color: "#0f172a" }}>"{deletingItem?.name}"</span>?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingItem(null); }}
                disabled={deleting}
                style={{
                  padding: "10px 18px", borderRadius: 9, border: "1px solid #e2e8f0",
                  background: "white", color: "#64748b", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif", cursor: "pointer",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "white"}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 22px", borderRadius: 9, border: "none",
                  background: deleting ? "#fca5a5" : "#ef4444",
                  color: "white", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  cursor: deleting ? "not-allowed" : "pointer",
                  boxShadow: deleting ? "none" : "0 2px 8px rgba(239,68,68,0.28)",
                  transition: "background 0.13s",
                }}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}