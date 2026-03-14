import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X, SlidersHorizontal, Building2, Globe, Check, ChevronDown,
} from "lucide-react";

export const DEFAULT_FILTERS = {
  selectedEntity: null,
  country: null,
  localCurrency: null,
  foreignCurrency: null,
};

const labelCls = "block text-xs font-bold text-slate-500 mb-1.5 tracking-wider uppercase";

/* ── Reusable styled dropdown ── */
function FilterDropdown({ label, icon: Icon, value, onChange, options, placeholder, color = "#4f46e5" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find((o) => o.value === value);
  const isActive = !!value;

  return (
    <div className="relative" ref={ref}>
      <label className={labelCls}>{label}</label>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold border rounded-lg transition-all whitespace-nowrap cursor-pointer"
        style={{
          background: isActive ? `${color}10` : "white",
          color: isActive ? color : "#374151",
          border: isActive ? `1px solid ${color}50` : "1px solid #e2e8f0",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {Icon && <Icon size={14} style={{ color: isActive ? color : "#9ca3af", flexShrink: 0 }} />}
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : placeholder}
        </span>
        {isActive ? (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center hover:opacity-70 transition cursor-pointer"
            style={{ background: color, color: "white" }}
          >
            <X size={9} />
          </span>
        ) : (
          <ChevronDown size={13} style={{ opacity: 0.4, flexShrink: 0 }} />
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 mt-1 bg-white rounded-xl border border-slate-200 z-50 overflow-hidden"
          style={{ minWidth: "100%", maxHeight: 260, overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
        >
          {/* Clear option */}
          {isActive && (
            <button
              onClick={() => { onChange(null); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition cursor-pointer border-b border-slate-100"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <X size={11} /> Clear
            </button>
          )}
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium transition cursor-pointer"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: isSelected ? `${color}10` : "white",
                  color: isSelected ? color : "#374151",
                }}
                onMouseEnter={(ev) => { if (!isSelected) ev.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(ev) => { if (!isSelected) ev.currentTarget.style.background = "white"; }}
              >
                <span className="truncate">{opt.label}</span>
                {opt.sub && <span className="text-xs text-slate-400 shrink-0">{opt.sub}</span>}
                {isSelected && <Check size={13} style={{ color, flexShrink: 0 }} />}
              </button>
            );
          })}
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
  ].filter(Boolean).length;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 bg-white flex flex-col"
        style={{ width: 340, borderLeft: "1px solid #e2e8f0", boxShadow: "-4px 0 24px rgba(0,0,0,0.10)", fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Filters</h3>
            {totalActive > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {totalActive}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <FilterDropdown
            label="Legal Entity"
            icon={Building2}
            value={filters.selectedEntity}
            onChange={(val) => onChange({ ...filters, selectedEntity: val })}
            options={entityOptions}
            placeholder="All entities"
            color="#4f46e5"
          />
          <FilterDropdown
            label="Country"
            icon={Globe}
            value={filters.country}
            onChange={(val) => onChange({ ...filters, country: val })}
            options={countriesAvailable}
            placeholder="All countries"
            color="#0284c7"
          />
          <FilterDropdown
            label="Local Currency"
            value={filters.localCurrency}
            onChange={(val) => onChange({ ...filters, localCurrency: val })}
            options={localCurrenciesAvailable}
            placeholder="All local currencies"
            color="#16a34a"
          />
          <FilterDropdown
            label="Foreign Currency"
            value={filters.foreignCurrency}
            onChange={(val) => onChange({ ...filters, foreignCurrency: val })}
            options={foreignCurrenciesAvailable}
            placeholder="All foreign currencies"
            color="#7c3aed"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}