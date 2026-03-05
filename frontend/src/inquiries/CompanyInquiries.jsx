import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import {
  Mail, ExternalLink, X, ChevronLeft, ChevronRight,
  Users, Building2, LayoutGrid, Table, FilePlus,
} from "lucide-react";
import CompanyCards from "./CompanyCards";
import CompanyForm from "../pages/CompanyForm";
import CompanyExport from "../utils/CompanyExport";
import CompanyImport from "../utils/CompanyImport";
import FilterCompanyInq, { DEFAULT_FILTERS } from "../utils/FilterCompanyInq";
import SortCompanyInq from "../utils/SortCompanyInq";

/* ─── helpers ─────────────────────────────────────────────────── */
const toStr = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ").toLowerCase();
  return String(v).toLowerCase();
};

const PAGE_SIZES = [10, 25, 50];
const hueOf = (s = "") => (s.charCodeAt(0) * 47) % 360;
const avatarStyle = (name = "") => {
  const h = hueOf(name);
  return { bg: `hsl(${h},60%,88%)`, text: `hsl(${h},55%,32%)` };
};
const gmailLink = (email) => `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`;
const whatsappLink = (cc, num) => `https://wa.me/${`${cc ?? ""}${num ?? ""}`.replace(/\D/g, "")}`;

/* ─── WaIcon ──────────────────────────────────────────────────── */
function WaIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Avatar ──────────────────────────────────────────────────── */
function Avatar({ name = "" }) {
  const { bg, text } = avatarStyle(name);
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0 font-semibold text-xs"
      style={{ width: 28, height: 28, background: bg, color: text }}
    >
      {initials}
    </span>
  );
}

/* ─── Pill ────────────────────────────────────────────────────── */
function Pill({ label, color = "gray" }) {
  const palettes = {
    gray:   { bg: "#e9ebee", text: "#1a202c", border: "#c1c7d0" },
    blue:   { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
    violet: { bg: "#ede9fe", text: "#3730a3", border: "#c4b5fd" },
    pink:   { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
    green:  { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  };
  const c = palettes[color] ?? palettes.gray;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {label}
    </span>
  );
}

const genderColor = (g = "") =>
  g.toLowerCase() === "female" ? "pink" : g.toLowerCase() === "male" ? "blue" : "gray";

/* ─── Main ────────────────────────────────────────────────────── */
const CompanyInquiries = () => {

  const { sidebarCollapsed } = useOutletContext();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState("table");
  const [showImportForm, setShowImportForm] = useState(false);
  const [sortValue, setSortValue] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    if (!document.getElementById("poppins-font")) {
      const link = document.createElement("link");
      link.id = "poppins-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      if (res.data.success) setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    // 1. text search
    let list = q
      ? companies.filter((c) =>
        [c.companyName, c.companyEmail, c.personalEmail, c.category,
        c.firstName, c.lastName, c.website, c.natureOfBusiness, c.channel, c.subcategory]
          .some((v) => toStr(v).includes(q))
      )
      : [...companies];

    // 2. master filters
    if (filters.natureOfBusiness.length)
      list = list.filter((c) =>
        (Array.isArray(c.natureOfBusiness) ? c.natureOfBusiness : [c.natureOfBusiness])
          .some((v) => filters.natureOfBusiness.includes(v))
      );
    if (filters.channel.length)
      list = list.filter((c) =>
        (Array.isArray(c.channel) ? c.channel : [c.channel])
          .some((v) => filters.channel.includes(v))
      );
    if (filters.category.length)
      list = list.filter((c) => filters.category.includes(c.category));
    if (filters.subcategory.length)
      list = list.filter((c) =>
        (Array.isArray(c.subcategory) ? c.subcategory : [c.subcategory])
          .some((v) => filters.subcategory.includes(v))
      );

    // 2.5. exact date filter
    if (filters.registeredDate) {
      list = list.filter((c) => {
        if (!c.createdAt) return false;
        const d  = new Date(c.createdAt);
        const sd = new Date(filters.registeredDate);
        return (
          d.getFullYear() === sd.getFullYear() &&
          d.getMonth()    === sd.getMonth()    &&
          d.getDate()     === sd.getDate()
        );
      });
    }

    // 2.6. date range filter
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((c) => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) >= from;
      });
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((c) => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) <= to;
      });
    }

    // 3. sort
    if (sortValue === "createdAt_desc") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === "createdAt_asc") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortValue === "az") {
      list.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || ""));
    } else if (sortValue === "za") {
      list.sort((a, b) => (b.companyName || "").localeCompare(a.companyName || ""));
    } else {
      list.reverse();
    }

    return list;
  }, [companies, search, filters, sortValue]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo   = Math.min(page * pageSize, filtered.length);

  const handleSearch       = (v) => { setSearch(v);  setPage(1); };
  const handleFilterChange = (f) => { setFilters(f); setPage(1); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 pl-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Import Form Modal ── */}
      {showImportForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
          onClick={() => setShowImportForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Import Companies (Excel)</h2>
              <button
                onClick={() => setShowImportForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <CompanyImport
                variant="modal"
                onSuccess={() => { setShowImportForm(false); fetchCompanies(); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Header ── */}
      <div
        className="bg-white border-b rounded border-gray-200 sticky top-0 z-30"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
      >
        <div className="w-full mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-4">

          {/* Title Group */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center justify-center rounded-xl bg-blue-600 shrink-0"
              style={{ width: 42, height: 42 }}
            >
              <Building2 size={21} className="text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900 leading-tight whitespace-nowrap"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Registered Companies
              </h1>
            </div>
            <div className="flex">
              <p
                className="text-xs text-gray-400 text-end font-medium whitespace-nowrap mt-0.5"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {viewMode === "table"
                  ? `Showing ${showingFrom}–${showingTo} of ${filtered.length} companies`
                  : `${filtered.length} companies`}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <SortCompanyInq
              search={search}
              onSearch={handleSearch}
              sortValue={sortValue}
              onSort={(v) => { setSortValue(v); setPage(1); }}
            />

            <FilterCompanyInq filters={filters} onChange={handleFilterChange} />

            {/* View Toggle */}
            <div className="flex items-center ml-1.5 mr-1.5 bg-gray-100 rounded-lg p-1 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: viewMode === "table" ? "white" : "transparent",
                  color: viewMode === "table" ? "#1e3a8a" : "#9ca3af",
                  boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <Table size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-all"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: viewMode === "card" ? "white" : "transparent",
                  color: viewMode === "card" ? "#5b21b6" : "#9ca3af",
                  boxShadow: viewMode === "card" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <LayoutGrid size={14} /> Cards
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <CompanyImport onSuccess={fetchCompanies} />
              <CompanyExport data={filtered} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Card View ── */}
      {viewMode === "card" && <CompanyCards search={search} />}

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <div className="max-w-[1600px] mx-auto py-6 px-2">
          <div
            className="bg-white rounded border border-gray-300 overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-max w-full">

                <thead>
                  <tr style={{ background: "#f0f2f5", borderBottom: "2px solid #d1d5db" }}>
                    {[
                      "#", "Company", "Website", "Nature of Business", "Channel",
                      "Company Email", "Category", "Subcategory", "Company Mobile",
                      "Contact Person", "Personal Email", "Gender", "Personal Mobile",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-8 py-3.5 text-left whitespace-nowrap"
                        style={{ fontSize: 16, fontWeight: 700, color: "black", letterSpacing: "0.02em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={13}>
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users size={22} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800">No companies found</p>
                          <p className="text-sm text-gray-500">
                            {search ? `No results for "${search}".` : "No data available."}
                          </p>
                          {search && (
                            <button
                              onClick={() => handleSearch("")}
                              className="text-sm font-semibold text-violet-700 hover:text-violet-900 transition"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c, idx) => {
                      const rowNum   = (page - 1) * pageSize + idx + 1;
                      const fullName = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
                      return (
                        <tr
                          key={c._id}
                          className="transition-colors duration-100"
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                        >
                          <td className="px-6 py-4 text-sm font-semibold tabular-nums" style={{ color: "#6b7280" }}>
                            {rowNum}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-md text-gray-700 font-semibold whitespace-nowrap">
                              {c.companyName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={c.website?.startsWith("http") ? c.website : `https://${c.website}`}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline max-w-[160px] truncate transition-colors"
                              style={{ color: "#5b21b6" }}
                            >
                              <ExternalLink size={12} className="shrink-0" />
                              <span className="truncate">{c.website}</span>
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                            {c.natureOfBusiness?.join(", ")}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                            {c.channel?.join(", ")}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={gmailLink(c.companyEmail)}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                              style={{ color: "#374151" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#5b21b6")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                            >
                              <Mail size={15} className="text-violet-700 shrink-0" />
                              {c.companyEmail}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Pill label={c.category} color="violet" />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                            {c.subcategory?.join(", ")}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={whatsappLink(c.countryCode, c.companyMobile)}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                              style={{ color: "#374151" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#16a34a")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                            >
                              <span className="text-green-500"><WaIcon /></span>
                              {c.countryCode} {c.companyMobile}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={fullName} />
                              <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "#111827" }}>
                                {fullName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={gmailLink(c.personalEmail)}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                              style={{ color: "#374151" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#5b21b6")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                            >
                              <Mail size={15} className="shrink-0 text-violet-700" />
                              {c.personalEmail}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {c.gender && <Pill label={c.gender} color={genderColor(c.gender)} />}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={whatsappLink(c.personalCountryCode, c.personalMobile)}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                              style={{ color: "#374151" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#16a34a")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                            >
                              <span className="text-green-500"><WaIcon /></span>
                              {c.personalCountryCode} {c.personalMobile}
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="border border-gray-300 rounded-lg text-sm px-2 py-1.5 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-700">
                    Page <span className="font-bold text-gray-900">{page}</span> of{" "}
                    <span className="font-bold text-gray-900">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={15} /> Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
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

export default CompanyInquiries;