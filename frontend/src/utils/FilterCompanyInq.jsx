import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, Check, X } from "lucide-react";

/* ─── Master data ─────────────────────────────────────────────── */
export const MASTERS = {
  natureOfBusiness: [
    "Manufacturing", "Retail", "Wholesale", "E-commerce", "Services",
    "Technology", "Healthcare", "Education", "Finance", "Real Estate",
  ],
  channel: [
    "Direct Sales", "Online Store", "Distributors", "Retailers",
    "Marketplace", "B2B Platform", "Franchise", "Agent Network",
  ],
  category: [
    "Electronics", "Fashion & Apparel", "Food & Beverages", "Home & Garden",
    "Beauty & Personal Care", "Sports & Outdoors", "Automotive",
    "Books & Media", "Toys & Games", "Industrial Equipment",
  ],
  subcategory: [
    "Mobile Phones", "Laptops & Computers", "Tablets", "Smart Watches",
    "Headphones & Earbuds", "Cameras", "Gaming Consoles", "Home Appliances",
    "Men's Clothing", "Women's Clothing", "Kids' Clothing", "Footwear",
    "Accessories", "Jewelry", "Bags & Luggage", "Ethnic Wear",
    "Organic Foods", "Beverages", "Snacks", "Dairy Products",
    "Frozen Foods", "Bakery Items", "Health Foods", "Gourmet Foods",
    "Furniture", "Home Decor", "Kitchen & Dining", "Bedding & Bath",
    "Lighting", "Garden Tools", "Plants & Seeds", "Storage & Organization",
    "Skincare", "Makeup", "Hair Care", "Fragrances", "Bath & Body",
    "Nail Care", "Men's Grooming", "Beauty Tools",
    "Fitness Equipment", "Camping Gear", "Cycling", "Yoga & Pilates",
    "Team Sports", "Water Sports", "Winter Sports", "Outdoor Recreation",
    "Car Accessories", "Motorcycle Parts", "Car Care", "Tires & Wheels",
    "Tools & Equipment", "Audio & Electronics", "Interior Accessories", "Performance Parts",
    "Fiction Books", "Non-Fiction Books", "Educational Books", "E-Books",
    "Magazines", "Music CDs", "Movies & TV", "Video Games",
    "Action Figures", "Board Games", "Educational Toys", "Dolls & Plush",
    "Building Blocks", "Outdoor Toys", "Puzzles", "RC Toys",
    "Manufacturing Machinery", "Construction Equipment", "Material Handling",
    "Power Tools", "Safety Equipment", "Testing Equipment", "Packaging Equipment", "Electrical Equipment",
  ],
};

export const FILTER_GROUPS = [
  { key: "natureOfBusiness", label: "Nature of Business" },
  { key: "channel",          label: "Channel" },
  { key: "category",         label: "Category" },
  { key: "subcategory",      label: "Subcategory" },
];

export const DEFAULT_FILTERS = {
  natureOfBusiness: [],
  channel: [],
  category: [],
  subcategory: [],
  registeredDate: null,
  dateFrom: null,
  dateTo: null,
};

export default function FilterCompanyInq({ filters, onChange }) {
  const [open, setOpen]               = useState(false);
  const [activeGroup, setActiveGroup] = useState("natureOfBusiness");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalActive = Object.entries(filters).reduce((count, [key, value]) => {
    if (Array.isArray(value)) return count + value.length;
    if (value) return count + 1;
    return count;
  }, 0);

  const toggle = (groupKey, value) => {
    const current = filters[groupKey] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [groupKey]: updated });
  };

  const clearAll = () => onChange({ ...DEFAULT_FILTERS });

  const clearDates = () => onChange({ ...filters, registeredDate: null, dateFrom: null, dateTo: null });
  const hasAnyDate = filters.registeredDate || filters.dateFrom || filters.dateTo;

  return (
    <div className="relative shrink-0" ref={ref}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border rounded-lg transition-all whitespace-nowrap"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: totalActive > 0 ? "#dbeafe" : "white",
          color:      totalActive > 0 ? "#1e3a8a" : "#374151",
          border:     totalActive > 0 ? "1px solid #93c5fd" : "1px solid #d1d5db",
        }}
      >
        <SlidersHorizontal size={14} />
        Filter
        {totalActive > 0 && (
          <span
            className="inline-flex items-center justify-center rounded-full text-xs font-bold"
            style={{ width: 18, height: 18, background: "#1e3a8a", color: "white", fontSize: 10 }}
          >
            {totalActive}
          </span>
        )}
        <ChevronDown size={13} style={{ opacity: 0.6 }} />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          className="absolute left-0 mt-1 bg-white rounded-xl border border-gray-200 z-30 flex overflow-hidden"
          style={{ minWidth: 480, maxHeight: 440, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
        >

          {/* Left: group tabs */}
          <div className="border-r border-gray-100 py-2 flex flex-col" style={{ minWidth: 165 }}>

            {totalActive > 0 && (
              <button
                onClick={clearAll}
                className="mx-2 mb-1 flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <X size={12} /> Clear all filters
              </button>
            )}

            {FILTER_GROUPS.map((g) => {
              const count    = (filters[g.key] || []).length;
              const isActive = activeGroup === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => setActiveGroup(g.key)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium transition-all text-left"
                  style={{
                    fontFamily:  "'Poppins', sans-serif",
                    background:  isActive ? "#ede9fe" : "transparent",
                    color:       isActive ? "#3730a3" : "#374151",
                    borderRight: isActive ? "2px solid #7c3aed" : "2px solid transparent",
                  }}
                >
                  <span>{g.label}</span>
                  {count > 0 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                      style={{ width: 18, height: 18, background: "#7c3aed", color: "white", fontSize: 10 }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* ── Date filters ── */}
            <div className="px-3 py-2 mt-1 border-t border-gray-100 space-y-3">

              {/* Header row */}
              <div className="flex items-center justify-between">
                <label
                  className="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Registered On
                </label>
                {hasAnyDate && (
                  <button
                    onClick={clearDates}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Single date */}
              <div>
                <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Exact date
                </p>
                <input
                  type="date"
                  value={filters.registeredDate || ""}
                  onChange={(e) =>
                    onChange({ ...filters, registeredDate: e.target.value || null })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>or range</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* From */}
              <div>
                <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  From
                </p>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  max={filters.dateTo || undefined}
                  onChange={(e) =>
                    onChange({ ...filters, dateFrom: e.target.value || null })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              {/* To */}
              <div>
                <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  To
                </p>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  min={filters.dateFrom || undefined}
                  onChange={(e) =>
                    onChange({ ...filters, dateTo: e.target.value || null })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

            </div>

          </div>

          {/* Right: options list */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {MASTERS[activeGroup]?.map((opt) => {
              const checked = (filters[activeGroup] || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(activeGroup, opt)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-all text-left"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    background: checked ? "#ede9fe" : "transparent",
                    color:      checked ? "#3730a3" : "#374151",
                    fontWeight: checked ? 600 : 400,
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center rounded shrink-0"
                    style={{
                      width: 16, height: 16,
                      background: checked ? "#7c3aed" : "white",
                      border:     checked ? "1.5px solid #7c3aed" : "1.5px solid #d1d5db",
                    }}
                  >
                    {checked && <Check size={10} color="white" strokeWidth={3} />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}