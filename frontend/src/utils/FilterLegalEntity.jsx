import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X, SlidersHorizontal, Building2, Globe, Check, ChevronDown,
} from "lucide-react";

export const DEFAULT_FILTERS = {
  selectedEntity: null,
  country: null,
  localCurrency: null,
  foreignCurrency: null,
  dateFrom: "",
  dateTo: "",
};

const labelCls = "block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2";
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400";

/* ── Collapsible single-select section ── */
function CollapsibleSingle({ label, value, onChange, options, placeholder }) {
  const [expanded, setExpanded] = useState(false);
  const selected = options.find((o) => o.value === value);
  if (!options.length) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {value && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
              1
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => {
              const active = value === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(active ? null : opt.value); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    background: active ? "#4F46E5" : "#ffffff",
                    color: active ? "white" : "#374151",
                    border: active ? "1px solid #4F46E5" : "1px solid #e5e7eb",
                  }}
                >
                  {active && <Check size={10} />}
                  {opt.label}
                  {opt.sub && <span style={{ opacity: 0.7 }}> · {opt.sub}</span>}
                </button>
              );
            })}
          </div>
          {value && (
            <button
              onClick={() => onChange(null)}
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
}

/* ══════════════════════════════════════════════
   FILTER LEGAL ENTITIES — slide-in drawer
══════════════════════════════════════════════ */
export default function FilterLegalEntity({
  open, onClose, filters, onChange, onReset,
  entities, allCompanies,
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const countriesAvailable = useMemo(() => {
    const seen = new Set();
    return entities
      .filter((e) => { if (!e.countryName || seen.has(e.countryName)) return false; seen.add(e.countryName); return true; })
      .map((e) => ({ value: e.countryName, label: e.countryName }));
  }, [entities]);

  const localCurrenciesAvailable = useMemo(() => {
    const seen = new Set();
    return entities
      .filter((e) => { if (!e.localCurrencyCode || seen.has(e.localCurrencyCode)) return false; seen.add(e.localCurrencyCode); return true; })
      .map((e) => ({ value: e.localCurrencyCode, label: e.localCurrencyCode }));
  }, [entities]);

  const foreignCurrenciesAvailable = useMemo(() => {
    const seen = new Set();
    return entities
      .filter((e) => { if (!e.foreignCurrencyCode || seen.has(e.foreignCurrencyCode)) return false; seen.add(e.foreignCurrencyCode); return true; })
      .map((e) => ({ value: e.foreignCurrencyCode, label: e.foreignCurrencyCode }));
  }, [entities]);

  const entityOptions = useMemo(() =>
    entities.map((e) => {
      const count = allCompanies.filter((c) => String(c.legalEntityId) === String(e._id)).length;
      return { value: e._id, label: e.companyName, sub: `${count} co.` };
    }), [entities, allCompanies]);

  const totalActive = [
    filters.selectedEntity, filters.country,
    filters.localCurrency, filters.foreignCurrency,
    filters.dateFrom, filters.dateTo,
  ].filter(Boolean).length;

  return (
    <>
      {open && (
        <div
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
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }}
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

          <div className="h-px bg-gray-100" />

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

          <div className="h-px bg-gray-100" />

          <CollapsibleSingle
            label="Legal Entity"
            value={filters.selectedEntity}
            onChange={(val) => onChange({ ...filters, selectedEntity: val })}
            options={entityOptions}
            placeholder="All entities"
          />
          <CollapsibleSingle
            label="Country"
            value={filters.country}
            onChange={(val) => onChange({ ...filters, country: val })}
            options={countriesAvailable}
            placeholder="All countries"
          />
          <CollapsibleSingle
            label="Local Currency"
            value={filters.localCurrency}
            onChange={(val) => onChange({ ...filters, localCurrency: val })}
            options={localCurrenciesAvailable}
            placeholder="All local currencies"
          />
          <CollapsibleSingle
            label="Foreign Currency"
            value={filters.foreignCurrency}
            onChange={(val) => onChange({ ...filters, foreignCurrency: val })}
            options={foreignCurrenciesAvailable}
            placeholder="All foreign currencies"
          />
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