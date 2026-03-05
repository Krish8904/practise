import { useEffect, useState } from "react";
import axios from "axios";
import { Globe, Plus, Pencil, Trash2, X, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const API = "http://localhost:5000/api/masters";

export default function Category() {
  const [categories, setCategories] = useState([]);
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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/category`);
      setCategories(res.data.data);
      setFiltered(res.data.data);
    } catch {
      showToast("Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(categories.filter((c) => c.name.toLowerCase().includes(q)));
  }, [search, categories]);

  const openCreate = () => { setEditingItem(null); setName(""); setError(""); setShowModal(true); };
  const openEdit = (item) => { setEditingItem(item); setName(item.name); setError(""); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setError(""); setName(""); setEditingItem(null); };
  const openDelete = (item) => { setDeletingItem(item); setShowDeleteModal(true); };

  const handleSave = async () => {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true); setError("");
    try {
      if (editingItem) {
        await axios.put(`${API}/category/${editingItem._id}`, { name: name.trim() });
        showToast("Category updated successfully");
      } else {
        await axios.post(`${API}/category`, { name: name.trim() });
        showToast("Category created successfully");
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
      await axios.delete(`${API}/category/${deletingItem._id}`);
      showToast("Category deleted successfully");
      setShowDeleteModal(false); setDeletingItem(null); fetchData();
    } catch { showToast("Failed to delete", "error"); }
    finally { setDeleting(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") closeModal();
  };

  return (
    <div className="font-['Poppins'] min-h-screen bg-slate-50/80 px-9 py-11">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-skeleton {
          0%,100%{opacity:1;}
          50%{opacity:0.4;}
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .animate-fade-up-delay-1 { animation-delay: 0.04s; }
        .category-card {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .category-card:hover {
          box-shadow: 0 6px 24px rgba(59,130,246,0.10) !important;
          border-color: rgb(191 219 254) !important;
          transform: translateY(-2px);
        }
        .search-input:focus {
          outline: none;
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .modal-input:focus {
          outline: none;
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .modal-input.error:focus {
          border-color: rgb(239 68 68);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
        }
        .skeleton {
          animation: pulse-skeleton 1.5s ease infinite;
          background: rgb(226 232 240);
          border-radius: 6px;
        }
        .add-btn {
          transition: all 0.15s ease;
        }
        .add-btn:hover {
          background: rgb(37 99 235) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(59,130,246,0.35) !important;
        }
        .action-btn {
          transition: background 0.13s ease, color 0.13s ease;
          border: none;
          cursor: pointer;
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 p-3.5 rounded-3xl shadow-2xl animate-toast-in font-medium text-sm leading-none bg-white border-2
          ${toast.type === "success" 
            ? "border-emerald-200" 
            : "border-red-200"
          }`}>
          {toast.type === "success" 
            ? <CheckCircle size={17} className="text-emerald-600" />
            : <XCircle size={17} className="text-red-600" />
          }
          <span className={
            toast.type === "success" 
              ? "text-emerald-700" 
              : "text-red-600"
          }>
            {toast.message}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="animate-fade-up mb-9">
        <div className="flex items-baseline gap-2.5 mb-1">
          <h1 className="text-4xl font-black text-slate-900 -tracking-1 leading-none">Categories</h1>
          <span className="text-xs font-medium text-slate-400 tracking-[0.016em] font-['DM_Mono'] uppercase">MASTER</span>
        </div>
        <p className="text-sm text-slate-500">
          {categories.length} {categories.length === 1 ? "entry" : "entries"} total
        </p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-up animate-fade-up-delay-1 flex items-center justify-between gap-3.5 mb-7 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="search-input w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 bg-white"
          />
          {search && (
            <button 
              onClick={() => setSearch("")} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>
        <button 
          className="add-btn flex items-center gap-1.75 px-5 py-2.5 rounded-2xl bg-blue-500 text-white font-semibold text-sm shadow-lg"
          onClick={openCreate}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="skeleton h-4.5 w-[70%] mb-2.5" />
              <div className="skeleton h-3 w-[45%]" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
            <Globe size={26} className="text-slate-300" />
          </div>
          <p className="text-lg font-semibold text-slate-500 mb-0">
            {search ? "No results found" : "No categories added yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="category-card bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.75 flex-1 min-w-0">
                  <div className="w-9.5 h-9.5 rounded-2xl shrink-0 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Globe size={16} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-slate-900 leading-tight mb-1.25 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400 font-normal mb-0">
                      Added {new Date(item.createdAt).toLocaleDateString("en-IN", { 
                        day: "numeric", 
                        month: "short", 
                        year: "numeric" 
                      })}
                    </p>
                  </div>
                </div>
                <span className="ml-2 shrink-0 text-xs font-semibold px-2.25 py-0.75 rounded-full bg-emerald-50 text-emerald-600 font-['DM_Mono'] tracking-[0.04em]">
                  Active
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button 
                  className="action-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600"
                  onMouseEnter={(e) => e.currentTarget.classList.add('!bg-blue-100')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('!bg-blue-100')}
                  onClick={() => openEdit(item)}
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button 
                  className="action-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600"
                  onMouseEnter={(e) => e.currentTarget.classList.add('!bg-red-100')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('!bg-red-100')}
                  onClick={() => openDelete(item)}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="bg-white w-full max-w-md rounded-3xl p-7 pb-6 shadow-2xl animate-modal-in">
            <div className="flex items-center justify-between mb-5.5">
              <div>
                <h2 className="text-lg font-black text-slate-900 -tracking-0.3 mb-0.75">
                  {editingItem ? "Edit Category" : "Add Category"}
                </h2>
                <p className="text-xs text-slate-400 mb-0">
                  {editingItem ? `Editing: ${editingItem.name}` : "Create a new category entry"}
                </p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-1.5 -m-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>
            
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input 
              autoFocus
              className={`modal-input w-full px-3.5 py-2.75 text-sm rounded-2xl bg-white text-slate-900 transition-all ${error ? "border-red-400 border-2! shadow-red-200/50" : "border-slate-200 border-2 shadow-sm hover:border-slate-300"}`}
              value={name} 
              onChange={(e)=>{setName(e.target.value);setError("");}} 
              onKeyDown={handleKeyDown} 
              placeholder="e.g. Electronics, Fashion..."
            />
            
            {error && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-500">{error}</span>
              </div>
            )}
            
            <div className="flex justify-end gap-2.5 mt-5.5">
              <button 
                onClick={closeModal} 
                className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="px-3.5 py-2 rounded-2xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="bg-white w-full max-w-sm rounded-3xl p-7 pb-6 shadow-2xl animate-modal-in">
            <h3 className="text-lg font-black text-slate-900 mb-3">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mb-5.5 leading-relaxed">
              Are you sure you want to delete <strong>"{deletingItem?.name}"</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button 
                onClick={()=>{setShowDeleteModal(false);setDeletingItem(null)}} 
                className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="px-3.5 py-2 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
