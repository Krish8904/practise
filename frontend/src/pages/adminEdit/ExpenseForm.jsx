import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Receipt, Building2, DollarSign, TrendingUp, TrendingDown, X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader, Search, ChevronDown } from "lucide-react";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

const MASTERS_API = "http://localhost:5000/api/expense-masters/all";
const COMPANIES_API = "http://localhost:5000/api/companies";
const LEGAL_ENTITIES_API = "http://localhost:5000/api/legal-entities";

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

const inputCls = "w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-40 disabled:cursor-not-allowed";
const labelCls = "block text-xs font-semibold text-slate-500 mb-1 tracking-wide";

function MasterSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <select
      name={name} value={value} onChange={onChange} disabled={disabled}
      className={inputCls}
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", appearance: "none", paddingRight: "28px"
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

/* ── Legal Entity Dropdown ── */
function LegalEntitySelect({ value, onChange, disabled }) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios.get(LEGAL_ENTITIES_API)
      .then((res) => { if (res.data.success) setEntities(res.data.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Sync display text when value changes externally (e.g. edit mode)
  useEffect(() => {
    if (!value) { setSearch(""); return; }
    const match = entities.find((e) => e._id === value || e.companyName === value);
    if (match) setSearch(match.companyName);
  }, [value, entities]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = entities.filter((e) =>
    e.companyName?.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleSelect = (entity) => {
    setSearch(entity.companyName);
    setOpen(false);
    onChange(entity); // pass full object so parent can auto-fill fields
  };

  const handleClear = () => {
    setSearch("");
    setOpen(false);
    onChange(null);
    inputRef.current?.focus();
  };

  const selected = entities.find((e) => e.companyName === search);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search legal entity…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          className={`${inputCls} pl-9 pr-8`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading
            ? <Loader size={13} className="animate-spin text-slate-400" />
            : search
              ? <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600 flex"><X size={13} /></button>
              : <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
        </div>
      </div>

      {open && !disabled && (filtered.length > 0 || search.length > 0) && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden" style={{ maxHeight: 240 }}>
          <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
            {filtered.length === 0
              ? <div className="px-4 py-3 text-sm text-slate-400 text-center">No match for "{search}"</div>
              : filtered.map((e) => {
                const hue = (e.companyName?.charCodeAt(0) ?? 0) * 47 % 360;
                const isSelected = selected?._id === e._id;
                return (
                  <button key={e._id} type="button" onClick={() => handleSelect(e)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50 border-b border-slate-50 last:border-b-0 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `hsl(${hue},60%,88%)`, color: `hsl(${hue},55%,32%)` }}>
                      {e.companyName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-slate-700"}`}>{e.companyName}</p>
                      {/* Show country · local currency · foreign currency as subtitle */}
                      <p className="text-xs text-slate-400 flex items-center gap-4 truncate">
                        {e.countryName && <span className="whitespace-nowrap">{e.countryName}</span>}·
                        {e.localCurrencyCode && (
                          <span className="whitespace-nowrap">Local: {e.localCurrencyCode}</span>
                        )}·
                        {e.foreignCurrencyCode && (
                          <span className="whitespace-nowrap">Foreign: {e.foreignCurrencyCode}</span>
                        )}
                      </p>
                    </div>
                    {isSelected && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })}
          </div>
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">{filtered.length} of {entities.length} entities</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanySearchDropdown({ value, onChange, disabled }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios.get(COMPANIES_API)
      .then((res) => { if (res.data.success) setCompanies(res.data.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setSearch(value || ""); }, [value]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = companies.filter((c) =>
    c.companyName?.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleSelect = (name) => { setSearch(name); onChange(name); setOpen(false); };
  const handleInputChange = (e) => { const v = e.target.value; setSearch(v); onChange(v); setOpen(true); };
  const handleClear = () => { setSearch(""); onChange(""); setOpen(false); inputRef.current?.focus(); };
  const showDropdown = open && !disabled && (filtered.length > 0 || search.length > 0);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef} type="text" placeholder="Search or type company name…"
          value={search} onChange={handleInputChange} onFocus={() => setOpen(true)}
          disabled={disabled} className={`${inputCls} pl-9 pr-8`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading
            ? <Loader size={13} className="animate-spin text-slate-400" />
            : search
              ? <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600 transition flex"><X size={13} /></button>
              : <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
        </div>
      </div>
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden" style={{ maxHeight: 220 }}>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0
              ? <div className="px-4 py-3 text-sm text-slate-400 text-center">No match for "{search}"</div>
              : filtered.map((c) => {
                const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ");
                const isSelected = search === c.companyName;
                const hue = (c.companyName?.charCodeAt(0) ?? 0) * 47 % 360;
                return (
                  <button key={c._id} type="button" onClick={() => handleSelect(c.companyName)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50 border-b border-slate-50 last:border-b-0 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `hsl(${hue},60%,88%)`, color: `hsl(${hue},55%,32%)` }}>
                      {c.companyName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-slate-700"}`}>{c.companyName}</p>
                      {(c.category || fullName) && <p className="text-xs text-slate-400 truncate">{[c.category, fullName].filter(Boolean).join(" · ")}</p>}
                    </div>
                    {isSelected && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })}
          </div>
          {filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">{filtered.length} of {companies.length} companies</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Excel Import Panel ── */
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
    setFileName(file.name); setRows([]); setErrors([]); setDone(false); setImportResult(null);
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

  const resolveId = (list, rawVal) => {
    if (!rawVal) return undefined;
    const v = String(rawVal).trim().toLowerCase();
    const found = list.find((m) =>
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
          type: resolveId(masters.type, row.type) ?? row.type,
          country: resolveId(masters.country, row.country) ?? row.country,
          currency: resolveId(masters.currency, row.currency) ?? row.currency,
        };
        const res = await axios.post("http://localhost:5000/api/expenses", payload);
        if (res.data.success) success++; else failed++;
      } catch { failed++; }
    }
    setImporting(false); setImportResult({ success, failed }); setDone(true);
    if (success > 0 && onSuccess) setTimeout(() => onSuccess(), 1500);
  };

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition shrink-0"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <FileSpreadsheet size={28} className="mx-auto mb-2 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">Drop Excel file here</p>
        <p className="text-xs text-slate-400 mt-1">or click to browse</p>
        {fileName && <p className="mt-2 text-xs font-semibold text-violet-700 bg-violet-50 inline-block px-3 py-1 rounded-full">{fileName}</p>}
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>
      <div className="bg-slate-50 rounded-lg px-4 py-2.5 text-xs text-slate-400 shrink-0">
        <span className="font-semibold text-slate-500">Columns: </span>
        Date · M · Country · Company · Type · Dept · Counterparty · Description · Account · Amount · Currency · FX · INR Amt
      </div>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 shrink-0">
          <p className="text-sm font-bold text-red-700 flex items-center gap-1.5 mb-1"><AlertCircle size={14} /> {errors.length} error{errors.length > 1 ? "s" : ""}</p>
          {errors.slice(0, 3).map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
          {errors.length > 3 && <p className="text-xs text-red-400">…and {errors.length - 3} more</p>}
        </div>
      )}
      {rows.length > 0 && !done && (
        <div className="flex flex-col min-h-0 flex-1">
          <p className="text-sm font-semibold text-slate-600 mb-2 shrink-0">
            Preview — {rows.length} row{rows.length > 1 ? "s" : ""}
            {errors.length > 0 && <span className="text-red-500 ml-2">fix errors first</span>}
          </p>
          <div className="overflow-auto rounded-lg border border-slate-200 flex-1">
            <table className="min-w-max w-full text-xs">
              <thead className="bg-slate-100 sticky top-0">
                <tr>{["#", "Date", "Company", "Type", "Amount", "Ccy", "INR"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-bold text-slate-600 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600">{r.date || "—"}</td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap text-slate-700">{r.company || "—"}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{r.type || "—"}</span></td>
                    <td className={`px-3 py-2 font-semibold tabular-nums ${r.amount >= 0 ? "text-green-600" : "text-red-500"}`}>{fmtNum(r.amount)}</td>
                    <td className="px-3 py-2 text-slate-500">{r.currency}</td>
                    <td className={`px-3 py-2 font-semibold tabular-nums ${r.inrAmount >= 0 ? "text-green-600" : "text-red-500"}`}>₹{fmtNum(r.inrAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 mt-3 shrink-0">
            <button onClick={() => { setRows([]); setErrors([]); setFileName(""); }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer">Clear</button>
            <button onClick={handleImport} disabled={importing || errors.length > 0}
              className={`px-5 py-2 text-sm font-semibold rounded-lg text-white flex items-center gap-1.5 transition ${importing || errors.length > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700 cursor-pointer"}`}>
              {importing ? <><Loader size={14} className="animate-spin" />Importing…</> : <><Upload size={14} />Import {rows.length} Row{rows.length > 1 ? "s" : ""}</>}
            </button>
          </div>
        </div>
      )}
      {done && importResult && (
        <div className={`rounded-lg p-4 flex items-center gap-3 shrink-0 ${importResult.failed === 0 ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <CheckCircle size={18} className={importResult.failed === 0 ? "text-green-600" : "text-yellow-600"} />
          <div>
            <p className="text-sm font-bold text-slate-700">{importResult.failed === 0 ? "Import complete!" : "Finished with errors"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{importResult.success} saved · {importResult.failed} failed</p>
          </div>
        </div>
      )}
    </div>
  );
}

const ExpenseForm = ({ editData = null, onSuccess = null, onClose = null, defaultTab = "manual" }) => {
  const isEditMode = !!editData;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [masters, setMasters] = useState({ type: [], country: [], currency: [] });
  const [mastersLoading, setMastersLoading] = useState(true);

  useEffect(() => {
    axios.get(MASTERS_API).then((res) => {
      const { types, countries, currencies } = res.data.data;
      setMasters({ type: types || [], country: countries || [], currency: currencies || [] });
    }).catch(() => {
      setMasters({
        type: [
          { _id: "Purchase", value: "Purchase", label: "Purchase" }, { _id: "Spend", value: "Spend", label: "Spend" },
          { _id: "Transfer", value: "Transfer", label: "Transfer" }, { _id: "Credit", value: "Credit", label: "Credit" }, { _id: "Debit", value: "Debit", label: "Debit" },
        ],
        country: [
          { _id: "IN", label: "India", code: "IN" }, { _id: "RU", label: "Russia", code: "RU" },
          { _id: "AE", label: "UAE", code: "AE" }, { _id: "US", label: "USA", code: "US" },
          { _id: "GB", label: "UK", code: "GB" }, { _id: "DE", label: "Germany", code: "DE" },
          { _id: "SG", label: "Singapore", code: "SG" }, { _id: "OTHER", label: "Other", code: "OTHER" },
        ],
        currency: [
          { _id: "INR", value: "INR", label: "Indian Rupee", code: "₹" }, { _id: "USD", value: "USD", label: "US Dollar", code: "$" },
          { _id: "RUB", value: "RUB", label: "Russian Ruble", code: "₽" }, { _id: "USDT", value: "USDT", label: "Tether", code: "₮" },
          { _id: "EUR", value: "EUR", label: "Euro", code: "€" }, { _id: "AED", value: "AED", label: "UAE Dirham", code: "د.إ" }, { _id: "GBP", value: "GBP", label: "British Pound", code: "£" },
        ],
      });
    }).finally(() => setMastersLoading(false));
  }, []);

  const FX_DEFAULTS = { INR: 1, USD: 84, RUB: 1.06, USDT: 80, EUR: 90, AED: 23, GBP: 106 };

  const emptyForm = {
    date: new Date().toISOString().split("T")[0], month: new Date().getMonth() + 1,
    legalEntity: "",   // stores the selected entity _id (for saving)
    country: "", company: "", type: "", department: "", counterparty: "",
    description: "", account: "", amount: "", currency: "", fx: 1, inrAmount: "", sign: 1,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (editData) {
      const getId = (val) => { if (!val) return ""; if (typeof val === "object" && val._id) return String(val._id); return String(val); };
      const rawDate = editData.date ? String(editData.date).split("T")[0] : emptyForm.date;
      setFormData({
        ...emptyForm, ...editData, date: rawDate,
        type: getId(editData.type), country: getId(editData.country), currency: getId(editData.currency),
        legalEntity: getId(editData.legalEntity) || "",
        sign: editData.amount < 0 ? -1 : 1, amount: Math.abs(editData.amount ?? 0),
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
    setFormData((p) => ({ ...p, currency: currencyId, fx: FX_DEFAULTS[currencyCode] ?? 1 }));
  };

  /* ── Legal Entity selected → auto-fill Country, Currency (local), FX ── */
  const handleLegalEntityChange = (entity) => {
    if (!entity) {
      setFormData((p) => ({ ...p, legalEntity: "", country: "", currency: "", fx: 1 }));
      return;
    }

    // Match country from masters by id or name
    const matchedCountry = masters.country.find(
      (c) => String(c._id) === String(entity.country) || c.label === entity.countryName
    );

    // Match local currency from masters
    const matchedCurrency = masters.currency.find(
      (c) => String(c._id) === String(entity.localCurrency) || c.value === entity.localCurrencyCode || c.label === entity.localCurrencyCode
    );

    const currencyCode = matchedCurrency?.value || matchedCurrency?.code || entity.localCurrencyCode;
    const fx = FX_DEFAULTS[currencyCode] ?? 1;

    setFormData((p) => ({
      ...p,
      legalEntity: entity._id,
      country: matchedCountry?._id || entity.country || p.country,
      currency: matchedCurrency?._id || entity.localCurrency || p.currency,
      fx,
    }));
  };

  const setSign = (s) => setFormData((p) => ({ ...p, sign: s }));

  const showNotification = (type, message) => { setNotification({ type, message }); setTimeout(() => setNotification(null), 4000); };

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
        legalEntity: formData.legalEntity || undefined,
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

  const inrNum = parseFloat(formData.inrAmount);

  const NotificationBanner = () => notification ? (
    <div className={`fixed top-5 right-5 z-50 max-w-xs p-4 rounded-xl shadow-xl flex items-start gap-3 bg-white ${notification.type === "success" ? "border border-green-200" : "border border-red-200"}`}
      style={{ animation: "slideIn .25s ease-out" }}>
      {notification.type === "success"
        ? <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
        : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-700">{notification.type === "success" ? "Success" : "Error"}</p>
        <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
      </div>
      <button onClick={() => setNotification(null)} className="text-slate-300 hover:text-slate-500 flex shrink-0"><X size={14} /></button>
      <style>{`@keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  ) : null;

  const SectionLabel = ({ icon: Icon, label, iconCls }) => (
    <div className="flex items-center w-fit gap-2 mb-2 px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.07)" }}>
      <Icon size={13} className={iconCls || "text-slate-500"} />
      <span className="text-xs text-slate-700 font-bold uppercase">{label}</span>
    </div>
  );

  const TabBar = () => (
    <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
      <button type="button" onClick={() => setActiveTab("manual")}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === "manual" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
        <Receipt size={11} /> Manual
      </button>
      <button type="button" onClick={() => setActiveTab("import")}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === "import" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
        <FileSpreadsheet size={11} /> Import
      </button>
    </div>
  );

  const manualBody = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1 p-0.5 overflow-y-auto">

      {/* ── Section 1: Transaction ── */}
      <div className="shrink-0">
        <SectionLabel icon={Receipt} label="Transaction" iconCls="text-blue-500" />
        {/* Row 1: Legal Entity · Date · Month */}
        <div className="grid grid-cols-4 gap-4 mb-2.5">

          <div className="col-span-2">
            <label className={labelCls}>Legal Entity</label>
            <LegalEntitySelect
              value={formData.legalEntity}
              onChange={handleLegalEntityChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="col-span-1">
            <label className={labelCls}>Date *</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className={inputCls}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="col-span-1">
            <label className={labelCls}>Month</label>
            <input
              name="month"
              type="number"
              readOnly
              value={formData.month}
              className={`${inputCls} bg-slate-100 text-slate-400 cursor-default`}
            />
          </div>

        </div>

        {/* Row 2: Country · Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Country</label>
            <MasterSelect name="country" value={formData.country} onChange={handleChange} options={masters.country} placeholder="Select…" disabled={isSubmitting || mastersLoading} />
          </div>
          <div>
            <label className={labelCls}>Type *</label>
            <MasterSelect name="type" value={formData.type} onChange={handleChange} options={masters.type} placeholder="Select…" disabled={isSubmitting || mastersLoading} />
          </div>
        </div>
      </div>

      {/* ── Section 2: Company & Details ── */}
      <div className="shrink-0">
        <SectionLabel icon={Building2} label="Company & Details" iconCls="text-green-600" />
        <div className="grid grid-cols-4 gap-4 mb-2.5">
          <div className="col-span-2">
            <label className={labelCls}>Company *</label>
            <CompanySearchDropdown value={formData.company} onChange={(v) => setFormData((p) => ({ ...p, company: v }))} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input name="department" type="text" placeholder="e.g. Stones purchase" value={formData.department} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Account</label>
            <input name="account" type="text" placeholder="e.g. GJRT, Cash" value={formData.account} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Counterparty</label>
            <input name="counterparty" type="text" placeholder="e.g. VIRAG DIAM" value={formData.counterparty} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input name="description" type="text" placeholder="e.g. MARQUIS 3.55 E VVS2, Office rent…" value={formData.description} onChange={handleChange} className={inputCls} disabled={isSubmitting} />
          </div>
        </div>
      </div>

      {/* ── Section 3: Financials ── */}
      <div className="shrink-0">
        <SectionLabel icon={DollarSign} label="Financials" iconCls="text-violet-600" />

        <div className="grid grid-cols-4 gap-4">

          {/* Direction */}
          <div className="col-span-2">
            <label className={labelCls}>Direction *</label>
            <div className="flex gap-2 h-9.5">
              <button
                type="button"
                onClick={() => setSign(1)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border-2 text-sm font-bold transition cursor-pointer ${formData.sign === 1
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                  }`}
              >
                + Credit <TrendingUp size={14} />
              </button>

              <button
                type="button"
                onClick={() => setSign(-1)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border-2 text-sm font-bold transition cursor-pointer ${formData.sign === -1
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                  }`}
              >
                − Debit <TrendingDown size={14} />
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="col-span-2">
            <label className={labelCls}>Amount *</label>
            <input
              name="amount"
              type="number"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              className={`${inputCls} text-right`}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Currency */}
          <div className="col-span-1">
            <label className={labelCls}>Currency *</label>
            <MasterSelect
              name="currency"
              value={formData.currency}
              onChange={handleCurrencyChange}
              options={masters.currency}
              placeholder="Select…"
              disabled={isSubmitting || mastersLoading}
            />
          </div>

          {/* FX Rate */}
          <div className="col-span-1">
            <label className={labelCls}>FX Rate</label>
            <input
              name="fx"
              type="number"
              step="0.000001"
              min="0"
              value={formData.fx}
              onChange={handleChange}
              className={inputCls}
              disabled={isSubmitting}
            />
          </div>

          {/* INR Amount */}
          <div className="col-span-2">
            <label className={labelCls}>INR Amount</label>
            <div
              className={`w-full border-2 rounded-md px-3 py-2 flex items-center justify-between h-9.5 ${inrNum > 0
                ? "border-green-300 bg-green-50"
                : inrNum < 0
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-slate-100"
                }`}
            >
              <span className="text-md text-slate-400 font-semibold">₹</span>
              <span
                className={`font-bold tabular-nums text-sm ${inrNum > 0
                  ? "text-green-700"
                  : inrNum < 0
                    ? "text-red-600"
                    : "text-slate-400"
                  }`}
              >
                {formData.inrAmount
                  ? parseFloat(formData.inrAmount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })
                  : "—"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Submit ── */}
      <div className="pt-2.5 border-t border-slate-100 flex justify-center shrink-0">
        <button type="submit" disabled={isSubmitting}
          className={`px-10 py-2 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center gap-2 shadow-sm ${isSubmitting ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}>
          {isSubmitting
            ? <><Loader size={14} className="animate-spin" />{isEditMode ? "Updating…" : "Saving…"}</>
            : isEditMode ? "Update Transaction" : "Save Transaction"}
        </button>
      </div>
    </form>
  );

  const inner = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            {isEditMode ? (
              <div className="leading-tight">
                <span className="text-sm font-bold text-slate-800">Edit Transaction</span>
                <span className="ml-2 text-xs text-slate-400">
                  ID: <span className="font-semibold text-blue-600">{editData.transactionId}</span>
                </span>
              </div>
              
            ) : (
              <span className="text-sm font-bold text-slate-800">
                {activeTab === "import" ? "Import from Excel" : "New Transaction"}
              </span>
            )}
          </div>
        </div>
        {!isEditMode && (
          <div className="flex items-center gap-2">
            <TabBar />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {(activeTab === "manual" || isEditMode) && manualBody}
        {activeTab === "import" && !isEditMode && <ExcelImportPanel masters={masters} onSuccess={() => { if (onSuccess) onSuccess(); }} />}
      </div>
    </div>
  );

  if (onClose) {
    return (
      <>
        <NotificationBanner />
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full min-w-4xl flex flex-col" style={{ height: "90vh", padding: "16px 20px" }}>
            {inner}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <NotificationBanner />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full min-w-4xl flex flex-col" style={{ height: "95vh", padding: "16px 20px" }}>
        {inner}
      </div>
    </div>
  );
};

export default ExpenseForm;