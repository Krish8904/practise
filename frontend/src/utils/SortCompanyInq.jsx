import React, { useState, useRef, useEffect } from "react";
import { ArrowUpDown, ChevronDown, Check, X, Search } from "lucide-react";

export const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc",  label: "Oldest First" },
  { value: "az",             label: "A → Z" },
  { value: "za",             label: "Z → A" },
];

export default function SortCompanyInq({ search, onSearch, sortValue, onSort }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = SORT_OPTIONS.find((o) => o.value === sortValue);
  const hasActivity = !!sortValue || !!search;

  return (
    <div className="flex items-center gap-4 shrink-0">

      {/* ── Search input ── */}
      <div className="relative shrink-0" style={{ width: 220 }}>
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search . . ."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-8 pr-7 py-2 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:bg-white transition"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Sort button + dropdown ── */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-semibold border rounded-lg transition-all whitespace-nowrap"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: sortValue ? "#ede9fe" : "white",
            color:      sortValue ? "#3730a3" : "#374151",
            border:     sortValue ? "1px solid #c4b5fd" : "1px solid #d1d5db",
          }}
        >
          <ArrowUpDown size={14} />
          {active ? active.label : "Sort"}
          <ChevronDown size={13} style={{ opacity: 0.6 }} />
        </button>

        {open && (
          <div
            className="absolute left-0 mt-1 bg-white  rounded-xl border border-gray-200 z-30  overflow-hidden"
            style={{ minWidth: 170, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
          >
            {sortValue && (
              <button
                onClick={() => { onSort(null); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition cursor-pointer border-b border-gray-100"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <X size={12} /> Clear sort
              </button>
            )}
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onSort(opt.value); setOpen(false); }}
                className="w-full flex items-center cursor-pointer justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-800 transition"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
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