import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Building2, Globe, Coins, ArrowLeftRight, CheckCircle, AlertCircle, Loader, X, Pencil, Trash2, Search } from "lucide-react";

const API = "http://localhost:5000/api/legal-entities";
const MASTERS_API = "http://localhost:5000/api/expense-masters/all";

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 tracking-wider uppercase";

function MasterSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <select
      name={name} value={value} onChange={onChange} disabled={disabled}
      className={inputCls}
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        appearance: "none", paddingRight: "32px",
      }}
    >
      <option value="">{placeholder || "Select…"}</option>
      {options.map((opt) => (
        <option key={opt._id} value={opt._id}>
          {opt.code ? `${opt.code} — ${opt.label}` : opt.label}
        </option>
      ))}
    </select>
  );
}

const EMPTY = { companyName: "", country: "", localCurrency: "", foreignCurrency: "" };

export default function LegalEntities() {
  const [entities, setEntities] = useState([]);
  const [masters, setMasters] = useState({ country: [], currency: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load entities + masters
  useEffect(() => {
    Promise.all([
      axios.get(API),
      axios.get(MASTERS_API).catch(() => ({ data: { data: {} } })),
    ]).then(([entRes, masterRes]) => {
      if (entRes.data.success) setEntities(entRes.data.data);
      const { countries, currencies } = masterRes.data.data || {};
      setMasters({ country: countries || [], currency: currencies || [] });
    }).catch(() => notify("error", "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const resolveLabel = (list, id) => {
    if (!id) return "—";
    const found = list.find((i) => String(i._id) === String(id));
    return found ? (found.code ? `${found.code} — ${found.label}` : found.label) : String(id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (entity) => {
    const getId = (v) => (v && typeof v === "object" ? String(v._id) : String(v || ""));
    setForm({
      companyName: entity.companyName || "",
      country: getId(entity.country),
      localCurrency: getId(entity.localCurrency),
      foreignCurrency: getId(entity.foreignCurrency),
    });
    setEditId(entity._id);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  // Build denormalised label fields from masters
  const buildPayload = () => {
    const countryObj = masters.country.find((c) => String(c._id) === form.country);
    const localCurObj = masters.currency.find((c) => String(c._id) === form.localCurrency);
    const forCurObj = masters.currency.find((c) => String(c._id) === form.foreignCurrency);
    return {
      companyName: form.companyName.trim(),
      country: form.country || null,
      localCurrency: form.localCurrency || null,
      foreignCurrency: form.foreignCurrency || null,
      countryName: countryObj?.label || "",
      localCurrencyCode: localCurObj?.value || localCurObj?.code || "",
      foreignCurrencyCode: forCurObj?.value || forCurObj?.code || "",
    };
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) { notify("error", "Company name is required."); return; }
    setSaving(true);
    try {
      let res;
      if (editId) {
        res = await axios.put(`${API}/${editId}`, buildPayload());
        setEntities((p) => p.map((e) => e._id === editId ? res.data.data : e));
        notify("success", "Legal entity updated!");
      } else {
        res = await axios.post(API, buildPayload());
        setEntities((p) => [res.data.data, ...p]);
        notify("success", "Legal entity created!");
      }
      closeForm();
    } catch (err) {
      notify("error", err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this legal entity?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/${id}`);
      setEntities((p) => p.filter((e) => e._id !== id));
      notify("success", "Deleted.");
    } catch (err) {
      notify("error", err.response?.data?.message || "Delete failed.");
    } finally { setDeletingId(null); }
  };

  const filtered = entities.filter((e) =>
    e.companyName?.toLowerCase().includes(search.toLowerCase().trim())
  );

  const hue = (name) => (name?.charCodeAt(0) ?? 0) * 47 % 360;

  const CURRENCY_SYMBOLS = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹",
    AUD: "A$", CAD: "C$", CHF: "Fr", SGD: "S$", HKD: "HK$", AED: "د.إ",
    SAR: "﷼", MYR: "RM", THB: "฿", KRW: "₩", BRL: "R$", MXN: "Mex$",
    ZAR: "R", NOK: "kr", SEK: "kr", DKK: "kr", NZD: "NZ$", RUB: "₽",
    TRY: "₺", PLN: "zł", IDR: "Rp", PHP: "₱", VND: "₫", EGP: "£", USDT:"₮"
  };

  const getCurrencySymbol = (code) => {
    if (!code) return null;
    const raw = code.includes("—") ? code.split("—")[1].trim() : code.trim();
    return CURRENCY_SYMBOLS[raw] || raw;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 max-w-xs p-4 rounded-xl shadow-xl flex items-start gap-3 bg-white ${notification.type === "success" ? "border border-green-200" : "border border-red-200"}`}
          style={{ animation: "slideIn .25s ease-out" }}>
          {notification.type === "success"
            ? <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700">{notification.type === "success" ? "Success" : "Error"}</p>
            <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
          <style>{`@keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" /> Legal Entities
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{entities.length} registered entit{entities.length === 1 ? "y" : "ies"}</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer">
            <Plus size={15} /> New Entity
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text" placeholder="Search entities…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 pl-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading…</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Building2 size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">{search ? `No results for "${search}"` : "No legal entities yet"}</p>
              {!search && <p className="text-xs mt-1">Click "New Entity" to create one</p>}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Company", "Country", "Local Currency", "Foreign Currency", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 tracking-wider uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: `hsl(${hue(e.companyName)},60%,88%)`, color: `hsl(${hue(e.companyName)},55%,32%)` }}>
                          {e.companyName?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{e.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {e.countryName
                        ? <span className="flex items-center gap-1.5 text-slate-600"><Globe size={13} className="text-slate-400" />{e.countryName}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4  py-3">
                      {e.localCurrencyCode
                        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs  bg-green-50 text-green-700">
                          <span className="text-base leading-none">{getCurrencySymbol(e.localCurrencyCode)}</span>
                          {e.localCurrencyCode}
                        </span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {e.foreignCurrencyCode
                        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs  bg-violet-50 text-violet-700">
                          <span className="text-base leading-none">{getCurrencySymbol(e.foreignCurrencyCode)}</span>
                          {e.foreignCurrencyCode}
                        </span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => openEdit(e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(e._id)} disabled={deletingId === e._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-40">
                          {deletingId === e._id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {editId ? "Edit Legal Entity" : "New Legal Entity"}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 transition cursor-pointer"><X size={16} /></button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Company Name *</label>
                <input
                  name="companyName" type="text" placeholder="e.g. Acme India Pvt Ltd"
                  value={form.companyName} onChange={handleChange}
                  className={inputCls} disabled={saving}
                />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <MasterSelect
                  name="country" value={form.country} onChange={handleChange}
                  options={masters.country} placeholder="Select country…" disabled={saving}
                />
              </div>
              <div>
                <label className={labelCls}>Local Currency</label>
                <MasterSelect
                  name="localCurrency" value={form.localCurrency} onChange={handleChange}
                  options={masters.currency} placeholder="Select local currency…" disabled={saving}
                />
              </div>
              <div>
                <label className={labelCls}>Foreign Currency</label>
                <MasterSelect
                  name="foreignCurrency" value={form.foreignCurrency} onChange={handleChange}
                  options={masters.currency} placeholder="Select foreign currency…" disabled={saving}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button onClick={closeForm} disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className={`px-5 py-2 text-sm font-semibold rounded-lg text-white flex items-center gap-1.5 transition ${saving ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}>
                {saving ? <><Loader size={13} className="animate-spin" />Saving…</> : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}