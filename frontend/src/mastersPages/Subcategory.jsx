import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const API = "http://localhost:5000/api/masters";

export default function Subcategory() {
  const [subcategories, setSubcategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [error, setError] = useState({});
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
      const [subRes, catRes] = await Promise.all([
        axios.get(`${API}/subcategory`),
        axios.get(`${API}/category`),
      ]);
      setSubcategories(subRes.data.data);
      setFiltered(subRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Search + Category filter ───────────────────────────
  useEffect(() => {
    let result = subcategories;
    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterCategory) {
      result = result.filter((s) => s.category?._id === filterCategory);
    }
    setFiltered(result);
  }, [search, filterCategory, subcategories]);

  // ── Modal helpers ──────────────────────────────────────
  const openCreate = () => {
    setEditingItem(null);
    setName("");
    setCategoryId("");
    setError({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.category?._id || "");
    setError({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError({});
    setName("");
    setCategoryId("");
    setEditingItem(null);
  };

  const openDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  // ── Validate ───────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name cannot be empty";
    if (!categoryId) errs.category = "Please select a category";
    return errs;
  };

  // ── Save (Create / Update) ─────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setError(errs); return; }

    setSaving(true);
    setError({});

    try {
      if (editingItem) {
        await axios.put(`${API}/subcategory/${editingItem._id}`, {
          name: name.trim(),
          category: categoryId,
        });
        showToast("Subcategory updated successfully");
      } else {
        await axios.post(`${API}/subcategory`, {
          name: name.trim(),
          category: categoryId,
        });
        showToast("Subcategory created successfully");
      }
      closeModal();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      if (msg.includes("duplicate") || msg.includes("E11000")) {
        setError({ name: "This subcategory name already exists" });
      } else {
        setError({ general: msg });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/subcategory/${deletingItem._id}`);
      showToast("Subcategory deleted successfully");
      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchData();
    } catch (err) {
      showToast("Failed to delete subcategory", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Keyboard shortcuts ─────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") closeModal();
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-100 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Subcategories</h1>
          
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 cursor-pointer px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow font-medium transition"
        >
          <Plus size={18} />
          Add Subcategory
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subcategories..."
          className="w-full max-w-xs border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-slate-600"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        {(search || filterCategory) && (
          <button
            onClick={() => { setSearch(""); setFilterCategory(""); }}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 transition">
                    {item.name}
                  </h2>
                  {/* Category badge */}
                  <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">
                    {item.category?.name || "Uncategorized"}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    Added {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => openEdit(item)}
                  className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition cursor-pointer"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => openDelete(item)}
                  className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="text-5xl mb-4">🗂️</div>
              <p className="text-lg font-medium">
                {search || filterCategory ? "No results found" : "No subcategories added yet"}
              </p>
              <p className="text-sm mt-1">
                {search || filterCategory
                  ? "Try adjusting your filters"
                  : 'Click "+ Add Subcategory" to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-110 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingItem ? "Edit Subcategory" : "Add Subcategory"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => { setName(e.target.value); setError((p) => ({ ...p, name: "" })); }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Mobile Phones, Men's Wear..."
                className={`w-full border rounded-xl p-3 focus:ring-2 outline-none transition
                  ${error.name ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-blue-500"}`}
              />
              {error.name && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">⚠ {error.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setError((p) => ({ ...p, category: "" })); }}
                className={`w-full border rounded-xl p-3 focus:ring-2 outline-none transition text-slate-700
                  ${error.category ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-blue-500"}`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {error.category && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">⚠ {error.category}</p>
              )}
            </div>

            {error.general && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠ {error.general}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-100 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-lg">
                🗑️
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Delete Subcategory</h2>
            </div>

            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">"{deletingItem?.name}"</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingItem(null); }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}