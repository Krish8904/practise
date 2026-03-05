import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Receipt, X, ChevronLeft, ChevronRight, LayoutGrid, Table,
  FilePlus, Search, ArrowUpDown, ChevronDown, Check,
  TrendingUp, TrendingDown, Minus, BookOpen, FolderCog, SlidersHorizontal
} from "lucide-react";
import FilterExpenseInq, { DEFAULT_FILTERS } from "../utils/FilterExpenseInq";
import ExpenseForm from "../pages/adminEdit/ExpenseForm";
import { ExpenseCard } from "./ExpenseCards";
import ExpenseExport from "../utils/ExpenseExport";
import CompanyLedgerModal from "../components/CompanyLedgerModal";

/* ─── helpers ─────────────────────────────────────────────────── */
const toStr = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ").toLowerCase();
  return String(v).toLowerCase();
};

const CARD_PAGE_SIZES = [6, 12, 24];
const TABLE_PAGE_SIZES = [10, 25, 50];

const fmt = (num) =>
  num == null ? "—" : Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATIC_TYPE_COLORS = {
  Purchase: { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  Spend: { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  Transfer: { bg: "#ede9fe", text: "#3730a3", border: "#c4b5fd" },
  Credit: { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  Debit: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

const COLOR_PALETTE = [
  { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
  { bg: "#f3e8ff", text: "#581c87", border: "#d8b4fe" },
  { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
];

function buildTypeColors(expenses) {
  const colorMap = { ...STATIC_TYPE_COLORS };
  const unknown = [...new Set(expenses.map((e) => e.typeLabel || e.type).filter(Boolean))].filter((t) => !colorMap[t]);
  unknown.forEach((t, i) => { colorMap[t] = COLOR_PALETTE[i % COLOR_PALETTE.length]; });
  return colorMap;
}

const COUNTRY_PALETTE = [
  { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  { bg: "#f3e8ff", text: "#581c87", border: "#d8b4fe" },
  { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
  { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  { bg: "#ede9fe", text: "#3730a3", border: "#c4b5fd" },
];

function buildCountryColors(expenses) {
  const colorMap = {};
  const countries = [...new Set(expenses.map((e) => e.countryLabel || e.country).filter(Boolean))];
  countries.forEach((c, i) => { colorMap[c] = COUNTRY_PALETTE[i % COUNTRY_PALETTE.length]; });
  return colorMap;
}

const ACCENT = "#6d4fc2";

function Pill({ label, typeColors }) {
  const c = typeColors?.[label] ?? { bg: "#e9ebee", text: "#1a202c", border: "#c1c7d0" };
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function CountryPill({ label, countryColors }) {
  const c = countryColors?.[label] ?? { bg: "#e9ebee", text: "#1a202c", border: "#c1c7d0" };
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function SignIcon({ amount }) {
  if (amount > 0) return <TrendingUp size={13} style={{ color: "#16a34a" }} />;
  if (amount < 0) return <TrendingDown size={13} style={{ color: "#dc2626" }} />;
  return <Minus size={13} style={{ color: "#9ca3af" }} />;
}

function PaginationDots({ page, totalPages, onPage }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  const withEllipsis = pages.reduce((acc, p, i, arr) => {
    if (i > 0 && p - arr[i - 1] > 1) acc.push("ellipsis-" + p);
    acc.push(p);
    return acc;
  }, []);
  return (
    <div className="flex items-center gap-1">
      {withEllipsis.map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)}
            className="w-7 h-7 text-sm font-semibold rounded transition-colors"
            style={{
              background: page === p ? ACCENT : "white",
              color: page === p ? "white" : "#374151",
              border: "1px solid " + (page === p ? ACCENT : "#d1d5db"),
            }}>
            {p}
          </button>
        )
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "date_desc", label: "Date ↓" },
  { value: "date_asc", label: "Date ↑" },
  { value: "inr_desc", label: "INR Amount ↓" },
  { value: "inr_asc", label: "INR Amount ↑" },
  { value: "company_az", label: "Company A–Z" },
  { value: "company_za", label: "Company Z–A" },
];

function SortBar({ search, onSearch, sortValue, onSort }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = SORT_OPTIONS.find((o) => o.value === sortValue);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="relative" style={{ width: 220 }}>
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type="text" placeholder="Search . . ." value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-8 pr-7 py-2 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition"
          style={{ fontFamily: "'Poppins', sans-serif" }} />
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      <div className="relative" ref={ref}>
        <button onClick={() => setOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-semibold border rounded-lg transition-all whitespace-nowrap"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: sortValue ? "#ede9fe" : "white",
            color: sortValue ? "#3730a3" : "#374151",
            border: sortValue ? "1px solid #c4b5fd" : "1px solid #d1d5db",
          }}>
          <ArrowUpDown size={14} />
          {active ? active.label : "Sort"}
          <ChevronDown size={13} style={{ opacity: 0.6 }} />
        </button>
        {open && (
          <div className="absolute left-0 mt-1 bg-white rounded-xl border border-gray-200 z-30 overflow-hidden"
            style={{ minWidth: 190, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
            {sortValue && (
              <button onClick={() => { onSort(null); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition cursor-pointer border-b border-gray-100"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                <X size={12} /> Clear sort
              </button>
            )}
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => { onSort(opt.value); setOpen(false); }}
                className="w-full flex items-center cursor-pointer justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 transition"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                {opt.label}
                {sortValue === opt.value && <Check size={13} className="text-violet-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
const ExpenseInquiries = () => {
  const navigate = useNavigate();
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);
  const [viewMode, setViewMode] = useState("table");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ledgerExpense, setLedgerExpense] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortValue, setSortValue] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formDefaultTab, setFormDefaultTab] = useState("manual");

  useEffect(() => {
    if (!document.getElementById("poppins-font")) {
      const link = document.createElement("link");
      link.id = "poppins-font"; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    fetchExpenses();
  }, []);

  useEffect(() => {
    const handleMasterUpdate = () => { fetchExpenses(); };
    window.addEventListener("expenseMastersUpdated", handleMasterUpdate);
    return () => window.removeEventListener("expenseMastersUpdated", handleMasterUpdate);
  }, []);

  useEffect(() => {
    const refresh = () => { fetchExpenses(); };
    window.addEventListener("expense-master-updated", refresh);
    return () => window.removeEventListener("expense-master-updated", refresh);
  }, []);

  useEffect(() => {
    setPage(1);
    setPageSize(viewMode === "card" ? 6 : 10);
  }, [viewMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expenses");
      if (res.data.success) setExpenses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const typeColors = useMemo(() => buildTypeColors(expenses), [expenses]);
  const countryColors = useMemo(() => buildCountryColors(expenses), [expenses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = q
      ? expenses.filter((e) =>
        [e.transactionId, e.company, e.counterparty, e.department,
        e.description, e.account, e.typeLabel, e.countryLabel, e.currencyLabel]
          .some((v) => toStr(v).includes(q))
      )
      : [...expenses];

    if (filters.transactionId) list = list.filter((e) => toStr(e.transactionId).includes(filters.transactionId.toLowerCase()));
    if (filters.company) list = list.filter((e) => e.company === filters.company);
    if (filters.type?.length) list = list.filter((e) => filters.type.includes(e.typeLabel));
    if (filters.country?.length) list = list.filter((e) => filters.country.includes(e.countryLabel));
    if (filters.currency?.length) list = list.filter((e) => filters.currency.includes(e.currencyLabel));
    if (filters.department?.length) list = list.filter((e) => filters.department.includes(e.department));
    if (filters.counterparty?.length) list = list.filter((e) => filters.counterparty.includes(e.counterparty));
    if (filters.account?.length) list = list.filter((e) => filters.account.includes(e.account));
    if (filters.sign === "Income / Credit") list = list.filter((e) => e.amount > 0);
    if (filters.sign === "Expense / Debit") list = list.filter((e) => e.amount < 0);
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom); from.setHours(0, 0, 0, 0);
      list = list.filter((e) => e.date && new Date(e.date) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo); to.setHours(23, 59, 59, 999);
      list = list.filter((e) => e.date && new Date(e.date) <= to);
    }

    if (sortValue === "createdAt_desc") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortValue === "createdAt_asc") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortValue === "date_desc") list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortValue === "date_asc") list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortValue === "inr_desc") list.sort((a, b) => Math.abs(b.inrAmount) - Math.abs(a.inrAmount));
    else if (sortValue === "inr_asc") list.sort((a, b) => Math.abs(a.inrAmount) - Math.abs(b.inrAmount));
    else if (sortValue === "company_az") list.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    else if (sortValue === "company_za") list.sort((a, b) => (b.company || "").localeCompare(a.company || ""));
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [expenses, search, filters, sortValue]);

  const totalActive = Object.entries(filters).reduce((n, [k, v]) => {
    if (k === "transactionId" || k === "company") return n + (v ? 1 : 0);
    return n + (Array.isArray(v) ? v.length : v ? 1 : 0);
  }, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, filtered.length);

  const { totalExpense, totalCredit } = useMemo(() => {
    let expense = 0, credit = 0;
    filtered.forEach((e) => {
      const amt = e.inrAmount ?? 0;
      if (amt < 0) expense += Math.abs(amt);
      if (amt > 0) credit += amt;
    });
    return { totalExpense: expense, totalCredit: credit };
  }, [filtered]);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleFilterChange = (f) => { setFilters(f); setPage(1); };
  const handleFilterReset = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

  const openImport = () => { setEditData(null); setFormDefaultTab("import"); setShowForm(true); };
  const openEdit = (row) => { setEditData(row); setFormDefaultTab("manual"); setShowForm(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-600 mx-auto mb-4" />
          <p className="text-gray-600 pl-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <Receipt size={24} className="text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>No transactions found</p>
      <p className="text-sm text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {search ? `No results for "${search}".` : "No data available."}
      </p>
      {search && (
        <button onClick={() => handleSearch("")} className="text-sm font-semibold hover:underline" style={{ color: ACCENT }}>
          Clear search
        </button>
      )}
    </div>
  );

  const PaginationFooter = () => (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <span style={{ fontFamily: "'Poppins', sans-serif" }}>
          Page <span className="font-bold text-gray-900">{page}</span> of{" "}
          <span className="font-bold text-gray-900">{totalPages}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronLeft size={15} /> Previous
        </button>
        <PaginationDots page={page} totalPages={totalPages} onPage={setPage} />
        <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {showForm && (
        <ExpenseForm
          editData={editData}
          defaultTab={formDefaultTab}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchExpenses(); }}
        />
      )}

      {ledgerExpense && (
        <CompanyLedgerModal
          company={ledgerExpense.company}
          allExpenses={expenses}
          sourceExpense={ledgerExpense}
          onClose={() => setLedgerExpense(null)}
        />
      )}

      <FilterExpenseInq
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        expenses={expenses}
        onReset={() => { handleFilterReset(); setFilterOpen(false); }}
      />

      {/* ── Sticky header ── */}
      <div className="bg-white border-b rounded border-gray-200 sticky top-0 z-30"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div className="w-full mx-auto px-5 py-3">

          <div className="flex items-start justify-between mb-3">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center justify-center rounded-xl bg-violet-600 shrink-0" style={{ width: 42, height: 42 }}>
                <Receipt size={21} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Expenses
                </h1>
                <p className="text-xs text-gray-400 font-medium whitespace-nowrap mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {viewMode === "table"
                    ? `Showing ${showingFrom}–${showingTo} of ${filtered.length} transactions`
                    : `${filtered.length} transactions`}
                </p>
              </div>
            </div>

            <div className="flex flex-row items-end gap-2">
              <div className="flex items-center gap-0.5">
                <div className="flex flex-col items-end px-2.5 py-0.5 border-r border-gray-200">
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Spend</span>
                  <div className="flex items-center gap-0.5">
                    <TrendingDown size={12} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-600">₹{fmt(totalExpense)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end px-2.5 py-0.5 border-r border-gray-200">
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Credit</span>
                  <div className="flex items-center gap-0.5">
                    <TrendingUp size={12} className="text-green-500" />
                    <span className="text-sm font-semibold text-green-600">₹{fmt(totalCredit)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end px-2.5 py-0.5">
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Net</span>
                  <span className={`text-sm font-bold ${totalCredit - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {totalCredit - totalExpense >= 0 ? "+" : "-"}₹{fmt(Math.abs(totalCredit - totalExpense))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECOND ROW */}
          <div className="flex items-center flex-wrap gap-2">
            <SortBar
              search={search}
              onSearch={handleSearch}
              sortValue={sortValue}
              onSort={(v) => { setSortValue(v); setPage(1); }}
            />
            <div className="flex items-center ml-1.5 mr-1.5 bg-gray-100 rounded-lg p-1 shrink-0">
              <button onClick={() => setViewMode("table")}
                className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: viewMode === "table" ? "white" : "transparent",
                  color: viewMode === "table" ? "#1e3a8a" : "#9ca3af",
                  boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>
                <Table size={16} />
              </button>
              <button onClick={() => setViewMode("card")}
                className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: viewMode === "card" ? "white" : "transparent",
                  color: viewMode === "card" ? "#5b21b6" : "#9ca3af",
                  boxShadow: viewMode === "card" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>
                <LayoutGrid size={16} />
              </button>
            </div>
            <button onClick={() => navigate("/admin/manageexpense")}
              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg border border-blue-600 hover:bg-white hover:text-blue-600 transition-all shrink-0 whitespace-nowrap cursor-pointer">
              <Receipt size={18} /> Create
            </button>

            <div className="ml-auto flex items-center gap-3">

              {/* ACTIONS BUTTON */}
              <div className="relative z-50" ref={actionsRef}>
                <button
                  onClick={() => setActionsOpen((v) => !v)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <FolderCog size={16} />
                  Actions
                  <ChevronDown size={14} />
                </button>

                {actionsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <button
                      onClick={() => {
                        openImport();
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition"
                    >
                      <FilePlus size={16} />
                      Import
                    </button>
                    <div className="border-t border-gray-100" />
                    <ExpenseExport data={filtered} fileName="Expenses_Report" />
                  </div>
                )}
              </div>

              {/* FILTER BUTTON */}
              <button
                onClick={() => setFilterOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-xl border transition-all whitespace-nowrap cursor-pointer hover:shadow-md"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: totalActive > 0 ? "#4F46E5" : "white",
                  color: totalActive > 0 ? "white" : "#374151",
                  border:
                    totalActive > 0
                      ? "1px solid #4F46E5"
                      : "1px solid #d1d5db",
                }}
              >
                <SlidersHorizontal size={15} />
                Filter
                {totalActive > 0 && (
                  <span
                    className="inline-flex items-center justify-center rounded-full text-xs font-bold bg-white text-indigo-600"
                    style={{ width: 18, height: 18, fontSize: 10 }}
                  >
                    {totalActive}
                  </span>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ══ CARD VIEW ══ */}
      {viewMode === "card" && (
        <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="font-bold text-gray-800">{showingFrom}–{showingTo}</span>
              {" "}of <span className="font-bold text-gray-800">{filtered.length}</span> transactions
            </p>
            <select value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {CARD_PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
          <div className="px-3 pb-6">
            {paginated.length === 0 ? <EmptyState /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginated.map((e, idx) => (
                  <ExpenseCard key={e._id} tx={e} index={(page - 1) * pageSize + idx + 1}
                    onEdit={openEdit} typeColors={typeColors} />
                ))}
              </div>
            )}
            {filtered.length > 0 && <PaginationFooter />}
          </div>
        </div>
      )}

      {/* ══ TABLE VIEW ══ */}
      {viewMode === "table" && (
        <div className="max-w-425 mx-auto py-6 px-2">
          <div className="bg-white rounded border border-gray-300 overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="min-w-max w-full">
                <thead>
                  <tr style={{ background: "#f0f2f5", borderBottom: "2px solid #d1d5db" }}>
                    {["#", "Transaction ID", "Date", "Company", "Type", "Country", "Department", "Counterparty", "Description", "Account", "Amount", "Currency", "FX", "INR Amount", "Ledger"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left whitespace-nowrap"
                        style={{ fontSize: 14, fontWeight: 700, color: "black", letterSpacing: "0.02em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={15}><EmptyState /></td></tr>
                  ) : (
                    paginated.map((e, idx) => {
                      const rowNum = (page - 1) * pageSize + idx + 1;
                      const amtPos = e.amount > 0, amtNeg = e.amount < 0;
                      const inrPos = (e.inrAmount ?? 0) > 0, inrNeg = (e.inrAmount ?? 0) < 0;
                      const sym = e.currencySymbol || "";
                      return (
                        <tr key={e._id}
                          className="transition-colors duration-100"
                          onClick={() => openEdit(e)}
                          onMouseEnter={(ev) => (ev.currentTarget.style.background = "#f9fafb")}
                          onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}>
                          <td className="px-6 py-4 text-sm font-semibold tabular-nums" style={{ color: "#6b7280" }}>{rowNum}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold whitespace-nowrap" style={{ color: "#3730a3", fontFamily: "monospace" }}>{e.transactionId}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>{fmtDate(e.date)}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "#111827" }}>{e.company}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Pill label={e.typeLabel || e.type} typeColors={typeColors} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(e.countryLabel || e.country)
                              ? <CountryPill label={e.countryLabel || e.country} countryColors={countryColors} />
                              : <span className="text-sm text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>{e.department || "—"}</td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>{e.counterparty || "—"}</td>
                          <td className="px-6 py-4 text-sm" style={{ color: "#6b7280", maxWidth: 220 }}>
                            <span className="block truncate" title={e.description}>{e.description || "—"}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>{e.account || "—"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <SignIcon amount={e.amount} />
                              <span className="text-sm font-semibold tabular-nums"
                                style={{ color: amtPos ? "#16a34a" : amtNeg ? "#dc2626" : "#374151" }}>
                                {sym}{fmt(Math.abs(e.amount))}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                            {e.currencyLabel || e.currency || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm tabular-nums" style={{ color: "#6b7280" }}>{e.fx ?? 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <SignIcon amount={e.inrAmount} />
                              <span className="text-sm font-bold tabular-nums"
                                style={{ color: inrPos ? "#16a34a" : inrNeg ? "#dc2626" : "#374151" }}>
                                ₹{fmt(Math.abs(e.inrAmount ?? 0))}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4" onClick={(ev) => ev.stopPropagation()}>
                            <button
                              onClick={(ev) => { ev.stopPropagation(); setLedgerExpense(e); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap cursor-pointer"
                              style={{ background: "#f5f3ff", color: "#4F46E5", border: "1px solid #c4b5fd" }}
                              onMouseEnter={(ev) => { ev.currentTarget.style.background = "#4F46E5"; ev.currentTarget.style.color = "white"; }}
                              onMouseLeave={(ev) => { ev.currentTarget.style.background = "#f5f3ff"; ev.currentTarget.style.color = "#4F46E5"; }}
                            >
                              <BookOpen size={12} /> Ledger
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>Rows per page:</span>
                  <select value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="border border-gray-300 rounded-lg text-sm px-2 py-1.5 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {TABLE_PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-700">
                    Page <span className="font-bold text-gray-900">{page}</span> of{" "}
                    <span className="font-bold text-gray-900">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      <ChevronLeft size={15} /> Previous
                    </button>
                    <PaginationDots page={page} totalPages={totalPages} onPage={setPage} />
                    <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseInquiries;