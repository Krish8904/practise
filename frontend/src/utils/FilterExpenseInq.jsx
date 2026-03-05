import React, { useState, useEffect, useRef } from "react";
import {
  X, ChevronDown, Check,
  TrendingUp, TrendingDown, SlidersHorizontal,
} from "lucide-react";

export const DEFAULT_FILTERS = {
  transactionId: "",
  company: "",
  department: [],
  counterparty: [],
  account: [],
  type: [],
  country: [],
  currency: [],
  sign: "",
  dateFrom: "",
  dateTo: "",
};

function FilterExpenseInq({ open, onClose, filters, onChange, expenses, onReset }) {
  const overlayRef = useRef(null);
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function uniqueVals(key) {
    return [...new Set(expenses.map((e) => {
      switch (key) {
        case "company":      return e.company;
        case "department":   return e.department;
        case "counterparty": return e.counterparty;
        case "account":      return e.account;
        case "type":         return e.typeLabel;
        case "country":      return e.countryLabel;
        case "currency":     return e.currencyLabel;
        default:             return null;
      }
    }).filter(Boolean))];
  }

  const toggleMulti = (key, val) => {
    const cur = filters[key] || [];
    onChange({ ...filters, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] });
  };

  const totalActive = Object.entries(filters).reduce((n, [k, v]) => {
    if (k === "transactionId" || k === "company") return n + (v ? 1 : 0);
    return n + (Array.isArray(v) ? v.length : v ? 1 : 0);
  }, 0);

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition placeholder-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2";

  // Collapsible multi-select section
  const CollapsibleMulti = ({ label, optionKey }) => {
    const opts = uniqueVals(optionKey);
    const selected = filters[optionKey] || [];
    const isOpen = expanded[optionKey];
    if (!opts.length) return null;

    return (
      <div className="border  border-gray-200 rounded-lg overflow-hidden">
        {/* Trigger row */}
        <button
          onClick={() => toggle(optionKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            {selected.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {selected.length}
              </span>
            )}
          </div>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Options panel */}
        {isOpen && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <div className="flex flex-wrap gap-1.5">
              {opts.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(optionKey, opt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      background: active ? "#4F46E5" : "#ffffff",
                      color: active ? "white" : "#374151",
                      border: active ? "1px solid #4F46E5" : "1px solid #e5e7eb",
                    }}
                  >
                    {active && <Check size={10} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected.length > 0 && (
              <button
                onClick={() => onChange({ ...filters, [optionKey]: [] })}
                className="mt-2.5 text-[11px] text-red-400 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Clear {label}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {open && (
        <div
          ref={overlayRef}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-[2px]"
        />
      )}

      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{
          width: 400,
          transform: open ? "translateX(0)" : "translateX(100%)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <SlidersHorizontal size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white m-0 leading-tight">Filter</h2>
              {totalActive > 0 && (
                <p className="text-[11px] text-white/70 m-0 font-medium">
                  {totalActive} filter{totalActive > 1 ? "s" : ""} active
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border-none flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={17} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Transaction ID */}
          <div>
            <label className={labelCls}>Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. EXCP00001"
              value={filters.transactionId}
              onChange={(e) => onChange({ ...filters, transactionId: e.target.value })}
              className={inputCls}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </div>

          {/* Company */}
          <div>
            <label className={labelCls}>Company</label>
            <div className="relative">
              <select
                value={filters.company}
                onChange={(e) => onChange({ ...filters, company: e.target.value })}
                className={inputCls + " appearance-none pr-8 cursor-pointer"}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <option value="">All Companies</option>
                {uniqueVals("company").map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className={labelCls}>Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">From</p>
                <input
                  type="date"
                  value={filters.dateFrom}
                  max={filters.dateTo || undefined}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                  className={inputCls}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">To</p>
                <input
                  type="date"
                  value={filters.dateTo}
                  min={filters.dateFrom || undefined}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                  className={inputCls}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className={labelCls}>Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {["Income / Credit", "Expense / Debit"].map((opt) => {
                const active = filters.sign === opt;
                const isCredit = opt.includes("Credit");
                return (
                  <button
                    key={opt}
                    onClick={() => onChange({ ...filters, sign: active ? "" : opt })}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      background: active ? (isCredit ? "#dcfce7" : "#fee2e2") : "#f9fafb",
                      color: active ? (isCredit ? "#15803d" : "#dc2626") : "#374151",
                      border: active ? `1.5px solid ${isCredit ? "#86efac" : "#fca5a5"}` : "1px solid #e5e7eb",
                    }}
                  >
                    {isCredit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isCredit ? "Credit" : "Debit"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Collapsible multi-selects */}
          <CollapsibleMulti label="Type"         optionKey="type"         />
          <CollapsibleMulti label="Country"      optionKey="country"      />
          <CollapsibleMulti label="Currency"     optionKey="currency"     />
          <CollapsibleMulti label="Department"   optionKey="department"   />
          <CollapsibleMulti label="Counterparty" optionKey="counterparty" />
          <CollapsibleMulti label="Account"      optionKey="account"      />

        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center gap-3 bg-gray-50">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors cursor-pointer border-none"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            ↺ Reset
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <X size={14} /> Close
          </button>
        </div>
      </div>
    </>
  );
}

export default FilterExpenseInq;