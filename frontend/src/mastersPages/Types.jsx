import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/expense-masters";

export default function AdminTypesPage() {
  const [types, setTypes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // ── Toast ──────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/type`);
      setTypes(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      showToast("Failed to fetch types", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Search ─────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(types.filter(t => t.label.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)));
  }, [search, types]);

  // ── Modal helpers ─────────────────────────────────────
  const openCreate = () => {
    setEditingItem(null);
    setLabel("");
    setCode("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setLabel(item.label);
    setCode(item.code || "");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setLabel("");
    setCode("");
    setEditingItem(null);
  };

  const openDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  // ── Save ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!label.trim()) {
      setError("Label cannot be empty");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = { label: label.trim(), value: label.trim(), code: code.trim() };

      if (editingItem) {
        await axios.put(`${API}/type/${editingItem._id}`, payload);
        showToast("Type updated successfully");
      } else {
        await axios.post(`${API}/type`, payload);
        showToast("Type created successfully");
      }

      closeModal();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      if (msg.includes("duplicate") || msg.includes("E11000")) setError("This type already exists");
      else setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/type/${deletingItem._id}`);
      showToast("Type deleted successfully");
      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchData();
    } catch {
      showToast("Failed to delete type", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") closeModal();
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Admin Types</h1>
          <p className="text-slate-500 text-sm mt-1">
            {types.length} {types.length === 1 ? "type" : "types"} total
          </p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow font-medium transition">+ Add Type</button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search types..."
          className="w-full max-w-sm border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition group">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 transition">{item.label}</h2>
                  {item.code && <p className="text-xs text-slate-400 mt-1">Code: {item.code}</p>}
                  <p className="text-xs text-slate-400 mt-1">Added {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => openEdit(item)} className="text-sm px-4 py-1.5 bg-blue-50 text-blue-700 cursor-pointer rounded-lg hover:bg-blue-100 font-medium transition">Edit</button>
                <button onClick={() => openDelete(item)} className="text-sm px-4 py-1.5 bg-red-50 text-red-600 cursor-pointer rounded-lg hover:bg-red-100 font-medium transition">Delete</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="text-5xl mb-4">🗂️</div>
              <p className="text-lg font-medium">{search ? "No results found" : "No types added yet"}</p>
              <p className="text-sm mt-1">{search ? "Try a different search term" : 'Click "+ Add Type" to get started'}</p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[440px] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-slate-800">{editingItem ? "Edit Type" : "Add Type"}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            <label className="block text-sm font-medium text-slate-600 mb-1.5">Label <span className="text-red-500">*</span></label>
            <input
              autoFocus
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Manufacturing, Retail..."
              className={`w-full border rounded-xl p-3 focus:ring-2 outline-none transition ${error ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-blue-500"}`}
            />
            <label className="block text-sm font-medium text-slate-600 mb-1.5 mt-4">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Optional code"
              className="w-full border rounded-xl p-3 focus:ring-2 outline-none transition border-slate-200 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠ {error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} disabled={saving} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">{saving ? "Saving..." : editingItem ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-lg">🗑️</div>
              <h2 className="text-lg font-semibold text-slate-800">Delete Type</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{deletingItem?.label}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeletingItem(null); }} disabled={deleting} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed">{deleting ? "Deleting..." : "Yes, Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}