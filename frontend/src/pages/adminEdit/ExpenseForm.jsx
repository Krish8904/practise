import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Receipt, Building2, DollarSign, X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from "lucide-react";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

const MASTERS_API = "http://localhost:5000/api/expense-masters/all";

const COL_MAP = {
  "date": "date", "m": "month", "month": "month", "country": "country",
  "company": "company", "type": "type", "department": "department",
  "counterparty": "counterparty", "description": "description", "account": "account",
  "amount": "amount", "currency": "currency", "fx": "fx",
  "inr amt": "inrAmount", "inramt": "inrAmount", "inr amount": "inrAmount",
  "sert/doc no.": "sertDoc", "sertdocno": "sertDoc",
};

function parseExcelDate(val) {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "number") {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return d.toISOString().split("T")[0];
  }
  return String(val).split("T")[0];
}

function fmtNum(n) {
  if (n == null || n === "") return "—";
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MasterSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <select
      name={name} value={value} onChange={onChange} disabled={disabled}
      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-sm"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", appearance: "none" }}
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

function ExcelImportPanel({ onSuccess, masters = { type: [], country: [], currency: [] } }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setRows([]); setErrors([]); setDone(false); setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
        let headerIdx = -1;
        for (let i = 0; i < Math.min(raw.length, 10); i++) {
          if (raw[i].filter(Boolean).length >= 4) { headerIdx = i; break; }
        }
        if (headerIdx === -1) { setErrors(["Could not find header row."]); return; }
        const headers = raw[headerIdx].map((h) => String(h ?? "").toLowerCase().trim());
        const dataRows = raw.slice(headerIdx + 1).filter((r) => r.some(Boolean));
        const parsed = dataRows.map((row) => {
          const obj = {};
          headers.forEach((h, i) => { const field = COL_MAP[h]; if (field) obj[field] = row[i]; });
          return obj;
        });
        const normalised = parsed.map((r) => {
          const amt = typeof r.amount === "number" ? r.amount : parseFloat(r.amount) || 0;
          const fx = typeof r.fx === "number" ? r.fx : parseFloat(r.fx) || 1;
          let inr = r.inrAmount;
          if (!inr || typeof inr === "string" && inr.startsWith("=")) inr = amt * fx;
          return {
            date: parseExcelDate(r.date), month: r.month ? Number(r.month) : undefined,
            country: r.country ? String(r.country).trim() : undefined,
            company: r.company ? String(r.company).trim() : "",
            type: r.type ? String(r.type).trim() : "",
            department: r.department ? String(r.department).trim() : undefined,
            counterparty: r.counterparty ? String(r.counterparty).trim() : undefined,
            description: r.description ? String(r.description).trim() : undefined,
            account: r.account ? String(r.account).trim() : undefined,
            amount: amt, currency: r.currency ? String(r.currency).trim() : "INR",
            fx, inrAmount: typeof inr === "number" ? inr : parseFloat(inr) || 0,
            sign: amt >= 0 ? 1 : -1,
          };
        }).filter((r) => r.company || r.date);
        const errs = normalised.map((r, i) => {
          const e = [];
          if (!r.company) e.push("Company required");
          if (!r.date) e.push("Date required");
          if (!r.amount && r.amount !== 0) e.push("Amount required");
          return e.length ? `Row ${i + 1}: ${e.join(", ")}` : null;
        }).filter(Boolean);
        setRows(normalised); setErrors(errs);
      } catch (err) { setErrors([`Parse error: ${err.message}`]); }
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper: find _id by matching label, value, or code (case-insensitive)
  const resolveId = (list, rawVal) => {
    if (!rawVal) return undefined;
    const v = String(rawVal).trim().toLowerCase();
    const found = list.find(
      (m) =>
        (m.label && m.label.toLowerCase() === v) ||
        (m.value && m.value.toLowerCase() === v) ||
        (m.code && m.code.toLowerCase() === v)
    );
    return found?._id ?? undefined;
  };

  const handleImport = async () => {
    if (!rows.length || errors.length) return;
    setImporting(true);
    let success = 0, failed = 0;
    for (const row of rows) {
      try {
        const payload = {
          ...row,
          type:     resolveId(masters.type,     row.type)     ?? row.type,
          country:  resolveId(masters.country,  row.country)  ?? row.country,
          currency: resolveId(masters.currency, row.currency) ?? row.currency,
        };
        const res = await axios.post("http://localhost:5000/api/expenses", payload);
        if (res.data.success) success++; else failed++;
      } catch { failed++; }
    }
    setImporting(false); setImportResult({ success, failed }); setDone(true);
    if (success > 0 && onSuccess) setTimeout(() => onSuccess(), 1500);
  };

  const TC = { Purchase: "#1e3a8a", Spend: "#831843", Transfer: "#3730a3" };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
        <FileSpreadsheet size={40} className="mx-auto mb-3 text-slate-400" />
        <p className="font-semibold text-slate-700">Drop your Excel file here</p>
        <p className="text-sm text-slate-400 mt-1">or click to browse</p>
        {fileName && <p className="mt-3 text-xs font-semibold text-violet-700 bg-violet-50 inline-block px-3 py-1 rounded-full">📄 {fileName}</p>}
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>
      <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500">
        <p className="font-bold text-slate-600 mb-1">Expected columns:</p>
        <p>Date · M · Country · Company · Type · Department · Counterparty · Description · Account · Amount · Currency · FX · INR Amt</p>
      </div>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
          <p className="text-sm font-bold text-red-700 flex items-center gap-2"><AlertCircle size={15} /> {errors.length} validation error{errors.length > 1 ? "s" : ""}</p>
          {errors.slice(0, 5).map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
          {errors.length > 5 && <p className="text-xs text-red-400">…and {errors.length - 5} more</p>}
        </div>
      )}
      {rows.length > 0 && !done && (
        <div>
          <p className="text-sm font-semibold text-slate-600 mb-2">
            Preview — {rows.length} row{rows.length > 1 ? "s" : ""} detected
            {errors.length > 0 && <span className="text-red-500 ml-2">(fix errors before importing)</span>}
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-64">
            <table className="min-w-max w-full text-xs">
              <thead className="bg-slate-100 sticky top-0">
                <tr>{["#", "Date", "Company", "Type", "Dept", "Amount", "Currency", "INR Amt"].map((h) => <th key={h} className="px-3 py-2 text-left font-bold text-slate-600 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.date || "—"}</td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{r.company || "—"}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: r.type === "Purchase" ? "#dbeafe" : r.type === "Spend" ? "#fce7f3" : r.type === "Transfer" ? "#ede9fe" : "#e9ebee", color: TC[r.type] ?? "#374151" }}>
                        {r.type || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.department || "—"}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums" style={{ color: r.amount >= 0 ? "#16a34a" : "#dc2626" }}>{fmtNum(r.amount)}</td>
                    <td className="px-3 py-2">{r.currency}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums" style={{ color: r.inrAmount >= 0 ? "#16a34a" : "#dc2626" }}>₹{fmtNum(r.inrAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && <p className="text-xs text-slate-400 mt-1 text-center">Showing first 50 of {rows.length} rows</p>}
        </div>
      )}
      {done && importResult && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${importResult.failed === 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <CheckCircle size={20} className={importResult.failed === 0 ? "text-green-600" : "text-yellow-600"} />
          <div>
            <p className="font-semibold text-sm">{importResult.failed === 0 ? "Import complete!" : "Import finished with errors"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{importResult.success} saved · {importResult.failed} failed</p>
          </div>
        </div>
      )}
      {rows.length > 0 && !done && (
        <div className="flex justify-end gap-3">
          <button onClick={() => { setRows([]); setErrors([]); setFileName(""); }}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            Clear
          </button>
          <button onClick={handleImport} disabled={importing || errors.length > 0}
            className="px-6 py-2 text-sm font-semibold rounded-lg text-white transition flex items-center gap-2 cursor-pointer"
            style={{ background: importing || errors.length > 0 ? "#9ca3af" : "#7c3aed", cursor: errors.length > 0 ? "not-allowed" : "pointer" }}>
            {importing ? <><Loader size={14} className="animate-spin" /> Importing…</> : <><Upload size={14} /> Import {rows.length} Row{rows.length > 1 ? "s" : ""}</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPENSE FORM
───────────────────────────────────────────────────────────────── */
const ExpenseForm = ({ editData = null, onSuccess = null, onClose = null, defaultTab = "manual" }) => {
  const isEditMode = !!editData;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [masters, setMasters] = useState({ type: [], country: [], currency: [] });
  const [mastersLoading, setMastersLoading] = useState(true);

  useEffect(() => {
    axios.get(MASTERS_API).then((res) => {
      const { types, countries, currencies } = res.data.data;
      setMasters({
        type: types || [],
        country: countries || [],
        currency: currencies || [],
      });
    }).catch(() => {
      // Fallback if API is down
      setMasters({
        type: [
          { value: "Purchase", label: "Purchase" }, { value: "Spend", label: "Spend" },
          { value: "Transfer", label: "Transfer" }, { value: "Credit", label: "Credit" }, { value: "Debit", label: "Debit" },
        ],
        country: [
          { value: "IN", label: "India", code: "IN" }, { value: "RU", label: "Russia", code: "RU" },
          { value: "AE", label: "UAE", code: "AE" }, { value: "US", label: "USA", code: "US" },
          { value: "GB", label: "UK", code: "GB" }, { value: "DE", label: "Germany", code: "DE" },
          { value: "SG", label: "Singapore", code: "SG" }, { value: "OTHER", label: "Other", code: "OTHER" },
        ],
        currency: [
          { value: "INR", label: "Indian Rupee", code: "₹" }, { value: "USD", label: "US Dollar", code: "$" },
          { value: "RUB", label: "Russian Ruble", code: "₽" }, { value: "USDT", label: "Tether", code: "₮" },
          { value: "EUR", label: "Euro", code: "€" }, { value: "AED", label: "UAE Dirham", code: "د.إ" }, { value: "GBP", label: "British Pound", code: "£" },
        ],
      });
    }).finally(() => setMastersLoading(false));
  }, []);

  const FX_DEFAULTS = { INR: 1, USD: 84, RUB: 1.06, USDT: 80, EUR: 90, AED: 23, GBP: 106 };

  const emptyForm = {
    date: new Date().toISOString().split("T")[0],
    month: new Date().getMonth() + 1,
    country: "",
    company: "",
    type: "",
    department: "",
    counterparty: "",
    description: "",
    account: "",
    amount: "",
    currency: "",
    fx: 1,
    inrAmount: "",
    sign: 1,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (editData) {
      // Helper to extract _id string from either a populated object or raw string
      const getId = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val._id) return String(val._id);
        return String(val);
      };

      // Fix date format: strip time portion
      const rawDate = editData.date ? String(editData.date).split("T")[0] : emptyForm.date;

      setFormData({
        ...emptyForm,
        ...editData,
        date: rawDate,
        type: getId(editData.type),
        country: getId(editData.country),
        currency: getId(editData.currency),
        sign: editData.amount < 0 ? -1 : 1,
        amount: Math.abs(editData.amount ?? 0),
      });
    }
  }, [editData]);

  useEffect(() => {
    if (formData.date) {
      const d = new Date(formData.date);
      if (!isNaN(d)) setFormData((p) => ({ ...p, month: d.getMonth() + 1 }));
    }
  }, [formData.date]);

  useEffect(() => {
    const amt = parseFloat(formData.amount) || 0;
    const fx = parseFloat(formData.fx) || 1;
    setFormData((p) => ({ ...p, inrAmount: amt === 0 ? "" : (amt * fx * formData.sign).toFixed(2) }));
  }, [formData.amount, formData.fx, formData.sign, formData.currency]);

  const handleChange = (e) => { const { name, value } = e.target; setFormData((p) => ({ ...p, [name]: value })); };
  const handleCurrencyChange = (e) => {
    const currencyId = e.target.value;

    const selected = masters.currency.find(c => c._id === currencyId);

    const currencyCode = selected?.value || selected?.code;
    // depends on how your master is structured

    setFormData((p) => ({
      ...p,
      currency: currencyId,
      fx: FX_DEFAULTS[currencyCode] ?? 1
    }));
  };
  const setSign = (s) => setFormData((p) => ({ ...p, sign: s }));

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const amt = parseFloat(formData.amount);
      if (!formData.company?.trim()) throw new Error("Company is required.");
      if (!formData.type || !String(formData.type).trim()) throw new Error("Type is required.");
      if (!formData.date) throw new Error("Date is required.");
      if (isNaN(amt) || amt <= 0) throw new Error("Please enter a valid amount.");
      const payload = {
        date: formData.date, month: formData.month, country: formData.country,
        company: formData.company.trim(), type: formData.type,
        department: formData.department?.trim() || undefined,
        counterparty: formData.counterparty?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        account: formData.account?.trim() || undefined,
        amount: amt * formData.sign, currency: formData.currency,
        fx: parseFloat(formData.fx) || 1, inrAmount: parseFloat(formData.inrAmount) || 0, sign: formData.sign,
      };
      const res = isEditMode
        ? await axios.put(`http://localhost:5000/api/expenses/${editData._id}`, payload)
        : await axios.post("http://localhost:5000/api/expenses", payload);
      if (!res.data.success) throw new Error(res.data.message);
      showNotification("success", isEditMode ? "Transaction updated!" : "Transaction saved!");
      if (!isEditMode) setFormData(emptyForm);
      if (onSuccess) setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      showNotification("error", err.response?.data?.message || err.message || "Something went wrong.");
    } finally { setIsSubmitting(false); }
  };

  const inputCls = "w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-sm";

  function SectionHeader({ icon: Icon, title, iconBg, iconColor, iconBorder }) {
    return (
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} ${iconBorder}`}>
          <Icon size={24} className={iconColor} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
    );
  }

  const inrNum = parseFloat(formData.inrAmount);
  const steps = [
    { label: "Transaction ID", dot: "bg-blue-600" },
    { label: "Details", dot: "bg-green-600" },
    { label: "Financials", dot: "bg-violet-600" },
  ];

  const manualFormBody = (
    <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
      <div className="flex items-center mb-10 max-w-md">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-6 h-6 rounded-full ${s.dot} text-white text-xs font-bold flex items-center justify-center`}>{i + 1}</div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-3 min-w-4" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* Section 1 — Transaction Identity */}
        <div>
          <SectionHeader icon={Receipt} title="Transaction Identity" iconBg="bg-blue-50" iconColor="text-blue-600" iconBorder="border-blue-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">Date *</label>
              <input name="date" type="date" value={formData.date} onChange={handleChange} className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Month</label>
              <input name="month" type="number" readOnly value={formData.month} className={inputCls + " bg-slate-100 cursor-default text-slate-500"} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* Section 2 — Company & Details */}
        <div>
          <SectionHeader icon={Building2} title="Company & Details" iconBg="bg-green-50" iconColor="text-green-600" iconBorder="border-green-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">Company *</label>
              <input name="company" type="text" placeholder="e.g. Maha Bazar GJRT" value={formData.company} onChange={handleChange} className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Country</label>
              <MasterSelect name="country" value={formData.country} onChange={handleChange} options={masters.country} placeholder="Select country…" disabled={isSubmitting || mastersLoading} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Type *</label>
              <MasterSelect name="type" value={formData.type} onChange={handleChange} options={masters.type} placeholder="Select type…" disabled={isSubmitting || mastersLoading} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Department</label>
              <input name="department" type="text" placeholder="e.g. Stones purchase, Head office" value={formData.department} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Counterparty</label>
              <input name="counterparty" type="text" placeholder="e.g. VIRAG DIAM" value={formData.counterparty} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Account</label>
              <input name="account" type="text" placeholder="e.g. GJRT, Cash, SBER, USDT" value={formData.account} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Description</label>
              <textarea name="description" placeholder="e.g. MARQUIS 3.55 E VVS2, Office rent…" value={formData.description} onChange={handleChange} rows={3} className={inputCls + " resize-none"} disabled={isSubmitting} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* Section 3 — Financials */}
        <div>
          <SectionHeader icon={DollarSign} title="Financials" iconBg="bg-violet-50" iconColor="text-violet-600" iconBorder="border-violet-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">Direction *</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSign(1)} className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition cursor-pointer ${formData.sign === 1 ? "border-green-500 bg-green-50 text-green-700" : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"}`}>＋ Income / Credit</button>
                <button type="button" onClick={() => setSign(-1)} className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition cursor-pointer ${formData.sign === -1 ? "border-red-500 bg-red-50 text-red-700" : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"}`}>− Expense / Debit</button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Currency *</label>
              <MasterSelect name="currency" value={formData.currency} onChange={handleCurrencyChange} options={masters.currency} placeholder="Select currency…" disabled={isSubmitting || mastersLoading} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">FX Rate</label>
              <input name="fx" type="number" step="0.000001" min="0" value={formData.fx} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Amount *</label>
              <input name="amount" type="number" step="0.01" min="0" placeholder="0.00" value={formData.amount} onChange={handleChange} className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">INR Amount (auto)</label>
              <div className={`w-full border-2 rounded-lg px-4 py-3 flex items-center justify-between text-sm font-semibold ${inrNum > 0 ? "border-green-300 bg-green-50 text-green-700" : inrNum < 0 ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-slate-100 text-slate-400"}`}>
                <span className="text-xs font-normal opacity-70">₹ INR</span>
                <span className="text-base">{formData.inrAmount ? parseFloat(formData.inrAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button type="submit" disabled={isSubmitting} className={`px-12 py-4 rounded-xl font-bold transition shadow-lg text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                {isEditMode ? "Updating..." : "Saving..."}
              </span>
            ) : isEditMode ? "Update Transaction" : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );

  const NotificationBanner = () => notification ? (
    <div className={`fixed top-6 right-6 z-[300] max-w-md p-4 rounded-lg shadow-2xl animate-slide-in ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {notification.type === "success" ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{notification.type === "success" ? "Success!" : "Error"}</p>
          <p className="text-sm mt-1">{notification.message}</p>
        </div>
        <button onClick={() => setNotification(null)} className="shrink-0 ml-2 hover:opacity-75 transition"><X size={18} /></button>
      </div>
    </div>
  ) : null;

  const TabBar = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button onClick={() => setActiveTab("manual")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 cursor-pointer -mb-px ${activeTab === "manual" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}><Receipt size={15} /> Manual Entry</button>
      <button onClick={() => setActiveTab("import")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 cursor-pointer -mb-px ${activeTab === "import" ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}><FileSpreadsheet size={15} /> Import Excel</button>
    </div>
  );

  /* ── Modal mode ── */
  if (onClose) {
    return (
      <>
        <NotificationBanner />
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Edit Transaction" : defaultTab === "import" ? "Import from Excel" : "Add Transaction"}
                </h2>
                {isEditMode && <p className="text-sm text-gray-500 mt-0.5">Editing: <span className="font-semibold text-blue-600">{editData.transactionId}</span></p>}
              </div>
              <button onClick={onClose} className="rounded-xl bg-white border-red-500 border cursor-pointer hover:bg-red-500 flex items-center hover:text-white justify-center transition">
                <X size={23} className="text-red-500 hover:text-white m-1" />
              </button>
            </div>
            <div className="px-8 py-6">
              {!isEditMode && defaultTab !== "import" && <TabBar />}
              {isEditMode && manualFormBody}
              {!isEditMode && activeTab === "manual" && defaultTab !== "import" && manualFormBody}
              {!isEditMode && (activeTab === "import" || defaultTab === "import") && (
                <ExcelImportPanel
                  masters={masters}
                  onSuccess={() => { if (onSuccess) onSuccess(); }}
                />
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes slide-in{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}.animate-slide-in{animation:slide-in 0.3s ease-out}`}</style>
      </>
    );
  }

  /* ── Standalone page ── */
  return (
    <div className="max-w-5xl mt-20 mx-auto px-4 py-16">
      <NotificationBanner />
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Expense Tracker
        </span>
        <h1 className="text-5xl text-blue-600 font-bold mb-4">New Transaction</h1>
        <p className="text-gray-600 text-md">Record income, expenses, transfers and purchases<br />across all companies and currencies.</p>
      </div>
      <TabBar />
      {activeTab === "manual" && manualFormBody}
      {activeTab === "import" && (
        <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
          <ExcelImportPanel masters={masters} onSuccess={onSuccess} />
        </div>
      )}
      <style>{`@keyframes slide-in{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}.animate-slide-in{animation:slide-in 0.3s ease-out}`}</style>
    </div>
  );
};

export default ExpenseForm;