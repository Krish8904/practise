import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus, Building2, Globe, X, Pencil, Trash2, Search,
  CheckCircle, AlertCircle, Loader, ChevronRight, Users,
  MoveRight, Building, UserCheck, UserMinus, SlidersHorizontal,
  TrendingUp, TrendingDown, BarChart2,
} from "lucide-react";
import FilterLegalEntities, { DEFAULT_FILTERS } from "../utils/FilterLegalEntity";

const API = "http://localhost:5000/api/legal-entities";
const MASTERS_API = "http://localhost:5000/api/expense-masters/all";
const COMPANIES_API = "http://localhost:5000/api/companies";
const EXPENSES_API = "http://localhost:5000/api/expenses";

const fmt = (num) =>
  num == null ? "—" : Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 tracking-wider uppercase";

const EMPTY_FORM = { companyName: "", country: "", localCurrency: "", foreignCurrency: "" };

/* ── helpers ── */
const entityHue = (name) => (name?.charCodeAt(0) ?? 0) * 47 % 360;

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹", AUD: "A$", CAD: "C$", CHF: "Fr",
  SGD: "S$", HKD: "HK$", AED: "د.إ", SAR: "﷼", MYR: "RM", THB: "฿", KRW: "₩", BRL: "R$",
  MXN: "Mex$", ZAR: "R", NOK: "kr", SEK: "kr", DKK: "kr", NZD: "NZ$", RUB: "₽", TRY: "₺",
  PLN: "zł", IDR: "Rp", PHP: "₱", VND: "₫", EGP: "£", USDT: "₮",
};

const getCurrencySymbol = (code) => {
  if (!code) return null;
  const raw = code.includes("—") ? code.split("—")[1].trim() : code.trim();
  return CURRENCY_SYMBOLS[raw] || raw;
};

/* ── EntityAvatar ── */
function EntityAvatar({ name, px = 32 }) {
  const h = entityHue(name);
  return (
    <div style={{
      width: px, height: px, minWidth: px, minHeight: px,
      background: `hsl(${h},60%,88%)`, color: `hsl(${h},55%,32%)`,
      borderRadius: 8, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ── MasterSelect ── */
function MasterSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <select name={name} value={value} onChange={onChange} disabled={disabled} className={inputCls}
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        appearance: "none", paddingRight: 32,
      }}>
      <option value="">{placeholder || "Select…"}</option>
      {options.map((opt) => (
        <option key={opt._id} value={opt._id}>
          {opt.code ? `${opt.code} — ${opt.label}` : opt.label}
        </option>
      ))}
    </select>
  );
}

/* ══════════════════════════════════════════════
   ENTITY FORM MODAL
══════════════════════════════════════════════ */
function EntityFormModal({ editData, masters, onSave, onClose, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editData) {
      const getId = (v) => (v && typeof v === "object" ? String(v._id) : String(v || ""));
      setForm({
        companyName: editData.companyName || "",
        country: getId(editData.country),
        localCurrency: getId(editData.localCurrency),
        foreignCurrency: getId(editData.foreignCurrency),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            {editData ? "Edit Legal Entity" : "New Legal Entity"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer"><X size={16} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Company Name *</label>
            <input name="companyName" type="text" placeholder="e.g. Acme India Pvt Ltd"
              value={form.companyName} onChange={handleChange} className={inputCls} disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <MasterSelect name="country" value={form.country} onChange={handleChange}
              options={masters.country} placeholder="Select country…" disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Local Currency</label>
            <MasterSelect name="localCurrency" value={form.localCurrency} onChange={handleChange}
              options={masters.currency} placeholder="Select local currency…" disabled={saving} />
          </div>
          <div>
            <label className={labelCls}>Foreign Currency</label>
            <MasterSelect name="foreignCurrency" value={form.foreignCurrency} onChange={handleChange}
              options={masters.currency} placeholder="Select foreign currency…" disabled={saving} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={saving}
            className={`px-5 py-2 text-sm font-semibold rounded-lg text-white flex items-center gap-1.5 transition ${saving ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}>
            {saving ? <><Loader size={13} className="animate-spin" />Saving…</> : editData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPANY ROW
══════════════════════════════════════════════ */
function CompanyRow({ company, action, loading, onAction, entityInfo }) {
  const fullName = [company.firstName, company.lastName].filter(Boolean).join(" ");
  const isAssign = action === "assign";
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition group ${isAssign
      ? "border-slate-100 hover:border-blue-200 hover:bg-blue-50 bg-white"
      : "border-green-100 bg-green-50 hover:border-red-200 hover:bg-red-50"}`}>
      <EntityAvatar name={company.companyName} px={32} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{company.companyName}</p>
        {(company.category || fullName) && (
          <p className="text-xs text-slate-400 truncate">{[company.category, fullName].filter(Boolean).join(" · ")}</p>
        )}
        {!isAssign && entityInfo && (
          <div className="flex items-center gap-2 mt-0.5">
            {entityInfo.localCurrencyCode && <span className="text-xs text-green-600 font-medium">{entityInfo.localCurrencyCode}</span>}
            {entityInfo.foreignCurrencyCode && <span className="text-xs text-violet-600 font-medium">{entityInfo.foreignCurrencyCode}</span>}
          </div>
        )}
      </div>
      <button onClick={onAction} disabled={loading}
        className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isAssign
          ? "bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
          : "bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"}`}>
        {loading ? <Loader size={12} className="animate-spin" />
          : isAssign ? <><MoveRight size={12} /> Assign</> : <><UserMinus size={12} /> Remove</>}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPANY ASSIGNMENT PANEL
══════════════════════════════════════════════ */
function CompanyAssignmentPanel({ entity, allCompanies, onClose, onAssigned, allEntityIds }) {
  const [assigned, setAssigned] = useState(
    () => allCompanies.filter((c) => String(c.legalEntityId) === String(entity._id))
  );
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  const assignedIds = new Set(assigned.map((c) => c._id));
  const available = allCompanies
    .filter((c) => {
      if (!c.legalEntityId) return true;
      if (String(c.legalEntityId) === String(entity._id)) return false;
      return !allEntityIds.has(String(c.legalEntityId));
    })
    .filter((c) => !assignedIds.has(c._id));

  const lowerSearch = search.toLowerCase().trim();
  const filteredAvailable = available.filter((c) => c.companyName?.toLowerCase().includes(lowerSearch));
  const filteredAssigned = assigned.filter((c) => c.companyName?.toLowerCase().includes(lowerSearch));
  const h = entityHue(entity.companyName);

  const handleAssign = async (company) => {
    setSavingId(company._id);
    try {
      await axios.patch(`${COMPANIES_API}/${company._id}`, {
        legalEntityId: entity._id, legalEntityName: entity.companyName,
        country: entity.country, countryName: entity.countryName,
        localCurrency: entity.localCurrency, localCurrencyCode: entity.localCurrencyCode,
        foreignCurrency: entity.foreignCurrency, foreignCurrencyCode: entity.foreignCurrencyCode,
      });
      setAssigned((prev) => [...prev, { ...company, legalEntityId: entity._id }]);
      onAssigned?.();
    } catch (err) { alert(err.response?.data?.message || "Failed to assign company."); }
    finally { setSavingId(null); }
  };

  const handleUnassign = async (company) => {
    setSavingId(company._id);
    try {
      await axios.patch(`${COMPANIES_API}/${company._id}`, {
        legalEntityId: null, legalEntityName: null,
        country: null, countryName: null,
        localCurrency: null, localCurrencyCode: null,
        foreignCurrency: null, foreignCurrencyCode: null,
      });
      setAssigned((prev) => prev.filter((a) => a._id !== company._id));
      onAssigned?.();
    } catch (err) { alert(err.response?.data?.message || "Failed to unassign company."); }
    finally { setSavingId(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full min-w-3xl flex flex-col overflow-hidden" style={{ height: "92vh" }}>
        <div className="flex items-center gap-4 p-5 border-b border-slate-100 shrink-0">
          <EntityAvatar name={entity.companyName} px={40} />
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">{entity.companyName}</h2>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {entity.countryName && <span className="text-xs text-slate-400 flex items-center gap-1"><Globe size={11} />{entity.countryName}</span>}
              {entity.localCurrencyCode && <span className="text-xs text-green-600 font-semibold">Local: {entity.localCurrencyCode}</span>}
              {entity.foreignCurrencyCode && <span className="text-xs text-violet-600 font-semibold">Foreign: {entity.foreignCurrencyCode}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"><X size={18} /></button>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Search companies…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        </div>

        <div className="flex flex-1 min-h-0 divide-x divide-slate-100">
          <div className="flex flex-col w-1/2 min-h-0">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 shrink-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={12} className="text-slate-400" />Available Companies
                <span className="ml-auto text-slate-400 font-normal">{filteredAvailable.length}</span>
              </p>
            </div>
            <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-1.5">
              {filteredAvailable.length === 0
                ? <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center">
                  <Building size={28} className="mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No companies available</p>
                  <p className="text-xs mt-1 opacity-70">All companies are already assigned</p>
                </div>
                : filteredAvailable.map((company) => (
                  <CompanyRow key={company._id} company={company} action="assign"
                    loading={savingId === company._id} onAction={() => handleAssign(company)} entityInfo={entity} />
                ))}
            </div>
          </div>
          <div className="flex flex-col w-1/2 min-h-0">
            <div className="px-4 py-2.5 shrink-0"
              style={{ background: `hsl(${h},60%,95%)`, borderBottom: `1px solid hsl(${h},40%,88%)` }}>
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: `hsl(${h},55%,35%)` }}>
                <UserCheck size={12} />Assigned to this Entity
                <span className="ml-auto font-normal" style={{ color: `hsl(${h},40%,55%)` }}>{filteredAssigned.length}</span>
              </p>
            </div>
            <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-1.5">
              {filteredAssigned.length === 0
                ? <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center">
                  <UserCheck size={28} className="mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No companies yet</p>
                  <p className="text-xs mt-1 opacity-70">Assign from the left panel</p>
                </div>
                : filteredAssigned.map((company) => (
                  <CompanyRow key={company._id} company={company} action="unassign"
                    loading={savingId === company._id} onAction={() => handleUnassign(company)} entityInfo={entity} />
                ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end">
          <button onClick={onClose}
            className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function LegalEntities() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [masters, setMasters] = useState({ country: [], currency: [] });
  const [allCompanies, setAllCompanies] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [assignEntity, setAssignEntity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAll = () =>
    Promise.all([
      axios.get(API),
      axios.get(MASTERS_API).catch(() => ({ data: { data: {} } })),
      axios.get(COMPANIES_API).catch(() => ({ data: { data: [], success: false } })),
      axios.get(EXPENSES_API).catch(() => ({ data: { data: [], success: false } })),
    ]).then(([entRes, masterRes, compRes, expRes]) => {
      if (entRes.data.success) setEntities(entRes.data.data);
      const { countries, currencies } = masterRes.data.data || {};
      setMasters({ country: countries || [], currency: currencies || [] });
      if (compRes.data.success) setAllCompanies(compRes.data.data);
      if (expRes.data.success) setAllExpenses(expRes.data.data);
    }).catch(() => notify("error", "Failed to load data"));

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, []);

  const buildPayload = (form) => {
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

  const handleSave = async (form) => {
    if (!form.companyName.trim()) { notify("error", "Company name is required."); return; }
    setSaving(true);
    try {
      if (editData) {
        const res = await axios.put(`${API}/${editData._id}`, buildPayload(form));
        setEntities((prev) => prev.map((e) => e._id === editData._id ? res.data.data : e));
        notify("success", "Legal entity updated!");
      } else {
        const res = await axios.post(API, buildPayload(form));
        setEntities((prev) => [res.data.data, ...prev]);
        notify("success", "Legal entity created!");
      }
      setShowForm(false); setEditData(null);
    } catch (err) {
      notify("error", err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this legal entity?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/${id}`);
      setEntities((prev) => prev.filter((e) => e._id !== id));
      notify("success", "Deleted.");
    } catch (err) {
      notify("error", err.response?.data?.message || "Delete failed.");
    } finally { setDeletingId(null); }
  };

  const openEdit = (entity) => { setEditData(entity); setShowForm(true); };
  const openCreate = () => { setEditData(null); setShowForm(true); };

  const getCompanyCount = (entityId) =>
    allCompanies.filter((c) => c.legalEntityId === entityId).length;

  // Calculate financial metrics for each entity
  const getEntityFinancials = (entityId) => {
    // Get all companies under this legal entity
    const entityCompanies = allCompanies
      .filter(c => String(c.legalEntityId) === String(entityId))
      .map(c => c.companyName);

    if (entityCompanies.length === 0) {
      return { spend: 0, credit: 0, net: 0 };
    }

    // Calculate totals from expenses
    let spend = 0;
    let credit = 0;

    allExpenses.forEach(expense => {
      if (entityCompanies.includes(expense.company)) {
        const amount = expense.inrAmount ?? 0;
        if (amount < 0) {
          spend += Math.abs(amount);
        } else if (amount > 0) {
          credit += amount;
        }
      }
    });

    return {
      spend,
      credit,
      net: credit - spend
    };
  };

  const totalActive = [
    filters.selectedEntity, filters.country,
    filters.localCurrency, filters.foreignCurrency,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = entities.filter((e) =>
      e.companyName?.toLowerCase().includes(search.toLowerCase().trim())
    );
    if (filters.selectedEntity) list = list.filter((e) => String(e._id) === filters.selectedEntity);
    if (filters.country) list = list.filter((e) => e.countryName === filters.country);
    if (filters.localCurrency) list = list.filter((e) => e.localCurrencyCode === filters.localCurrency);
    if (filters.foreignCurrency) list = list.filter((e) => e.foreignCurrencyCode === filters.foreignCurrency);
    return list;
  }, [entities, search, filters]);

  const stats = useMemo(() => {
    const relevantNames = new Set(
      allCompanies
        .filter((c) => filters.selectedEntity
          ? String(c.legalEntityId) === filters.selectedEntity
          : !!c.legalEntityId)
        .map((c) => c.companyName)
    );
    let totalExpense = 0, totalCredit = 0;
    allExpenses.forEach((e) => {
      if (!relevantNames.has(e.company)) return;
      const amt = e.inrAmount ?? 0;
      if (amt < 0) totalExpense += Math.abs(amt);
      if (amt > 0) totalCredit += amt;
    });
    return { totalExpense, totalCredit, net: totalCredit - totalExpense };
  }, [allExpenses, allCompanies, filters.selectedEntity]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-xs p-4 rounded-xl shadow-xl flex items-start gap-3 bg-white ${notification.type === "success" ? "border border-green-200" : "border border-red-200"}`}
          style={{ animation: "slideIn .25s ease-out" }}
        >
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

      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div className="px-6 py-3">

          {/* ROW 1 — title + spend/credit/net */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center justify-center rounded-xl bg-blue-600 shrink-0" style={{ width: 42, height: 42 }}>
                <Building2 size={21} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">Legal Entities</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Showing {filtered.length} of {entities.length} entit{entities.length === 1 ? "y" : "ies"}
                  {filters.selectedEntity && (
                    <span className="ml-1.5 text-indigo-500 font-semibold">
                      · {entities.find((e) => e._id === filters.selectedEntity)?.companyName}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Spend / Credit / Net */}
            <div className="flex items-center gap-0.5">
              <div className="flex flex-col items-end px-2.5 py-0.5 border-r border-slate-200">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Spend</span>
                <div className="flex items-center gap-0.5">
                  <TrendingDown size={12} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-600">₹{fmt(stats.totalExpense)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end px-2.5 py-0.5 border-r border-slate-200">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Credit</span>
                <div className="flex items-center gap-0.5">
                  <TrendingUp size={12} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-600">₹{fmt(stats.totalCredit)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end px-2.5 py-0.5">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Net</span>
                <span className={`text-sm font-bold ${stats.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.net >= 0 ? "+" : "-"}₹{fmt(Math.abs(stats.net))}
                </span>
              </div>
            </div>
          </div>

          {/* ROW 2 — search / filter / analytics / create */}
          <div className="flex items-center gap-2">
            <div className="relative" style={{ width: 220 }}>
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Search entities…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all whitespace-nowrap cursor-pointer hover:shadow-sm"
              style={{
                background: totalActive > 0 ? "#2563eb" : "white",
                color: totalActive > 0 ? "white" : "#374151",
                border: totalActive > 0 ? "1px solid #2563eb" : "1px solid #d1d5db",
              }}
            >
              <SlidersHorizontal size={15} />
              Filter
              {totalActive > 0 && (
                <span className="inline-flex items-center justify-center rounded-full text-xs font-bold bg-white text-blue-600"
                  style={{ width: 18, height: 18, fontSize: 10 }}>
                  {totalActive}
                </span>
              )}
            </button>

            {/* ── ANALYTICS BUTTON ── */}
            <button
              onClick={() => navigate("/admin/legalentities/expenseanalytics")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all whitespace-nowrap cursor-pointer"
              style={{ background: "white", color: "#6d4fc2", border: "1px solid #6d4fc2" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#6d4fc2"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#6d4fc2"; }}
            >
              <BarChart2 size={15} />
              Analytics
            </button>

            <button onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all whitespace-nowrap cursor-pointer bg-white-600 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white hover:border hover:border-blue-600 ">
              <Plus size={15} /> Create
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading…</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Building2 size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">
                {search || totalActive > 0 ? "No results match your filters" : "No legal entities yet"}
              </p>
              {(search || totalActive > 0) && (
                <button onClick={() => { setSearch(""); setFilters(DEFAULT_FILTERS); }}
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                  Clear filters
                </button>
              )}
              {!search && totalActive === 0 && <p className="text-xs mt-1">Click "Create" to add one</p>}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Company", "Country", "Local Currency", "Foreign Currency", "Net", "Spend", "Credit", "Companies", ""].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-bold text-slate-500 tracking-wider uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((entity) => {
                  const count = getCompanyCount(entity._id);
                  const financials = getEntityFinancials(entity._id);
                  const h = entityHue(entity.companyName);
                  return (
                    <tr key={entity._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `hsl(${h},60%,88%)`, color: `hsl(${h},55%,32%)` }}>
                            {entity.companyName?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold pt-1.5 text-slate-800">{entity.companyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {entity.countryName
                          ? <span className="flex items-center gap-1.5 text-slate-600"><Globe size={13} className="text-slate-400" />{entity.countryName}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {entity.localCurrencyCode
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-700">
                            <span className="text-base leading-none">{getCurrencySymbol(entity.localCurrencyCode)}</span>
                            {entity.localCurrencyCode}
                          </span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {entity.foreignCurrencyCode
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-violet-50 text-violet-700">
                            <span className="text-base leading-none">{getCurrencySymbol(entity.foreignCurrencyCode)}</span>
                            {entity.foreignCurrencyCode}
                          </span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-red-600">₹{fmt(financials.spend)}</span>
                          
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-600">₹{fmt(financials.credit)}</span>
                        
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className={`font-bold ${financials.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {financials.net >= 0 ? "+" : "-"}₹{fmt(Math.abs(financials.net))}
                          </span>
                          <span className={`text-[10px] mt-0.5 ${financials.net >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {financials.net >= 0 ? "Surplus" : "Deficit"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <button onClick={() => setAssignEntity(entity)} className="flex items-center gap-2 cursor-pointer group/btn">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${count > 0
                            ? "bg-blue-50 text-blue-700 group-hover/btn:bg-blue-100"
                            : "bg-slate-100 text-slate-400 group-hover/btn:bg-slate-200"}`}>
                            <Users size={11} />
                            {count} {count === 1 ? "company" : "companies"}
                          </span>
                          <span className="text-xs text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Manage <ChevronRight size={12} />
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button onClick={() => openEdit(entity)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(entity._id)} disabled={deletingId === entity._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-40">
                            {deletingId === entity._id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <EntityFormModal editData={editData} masters={masters} onSave={handleSave}
          onClose={() => { setShowForm(false); setEditData(null); }} saving={saving} />
      )}
      {assignEntity && (
        <CompanyAssignmentPanel entity={assignEntity} allCompanies={allCompanies}
          allEntityIds={new Set(entities.map((e) => String(e._id)))}
          onClose={() => setAssignEntity(null)} onAssigned={loadAll} />
      )}

      <FilterLegalEntities
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() => { setFilters(DEFAULT_FILTERS); setFilterOpen(false); }}
        entities={entities}
        allCompanies={allCompanies}
      />
    </div>
  );
}