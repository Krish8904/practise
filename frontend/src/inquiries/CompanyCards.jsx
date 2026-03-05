import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Mail, ChevronLeft, ChevronRight,
  Users, Building2, Globe, Tag, Layers, Radio, Briefcase, Phone,
} from "lucide-react";
import CompanyForm from "../pages/CompanyForm";

const toStr = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ").toLowerCase();
  return String(v).toLowerCase();
};

const PAGE_SIZES = [6, 12, 24];

const hueOf = (s = "") => (s.charCodeAt(0) * 47) % 360;
const avatarColors = (name = "") => {
  const h = hueOf(name);
  return { bg: `hsl(${h},40%,90%)`, color: `hsl(${h},45%,35%)` };
};

const gmailLink = (email) =>
  "https://mail.google.com/mail/?view=cm&to=" + encodeURIComponent(email || "");

const whatsappLink = (cc, num) =>
  "https://wa.me/" + ((cc ?? "") + (num ?? "")).replace(/\D/g, "");

function WaIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Avatar({ name, size }) {
  const safeName = name || "";
  const safeSize = size || 36;
  const { bg, color } = avatarColors(safeName);
  const initials = safeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: safeSize, height: safeSize, background: bg, color, fontSize: safeSize * 0.36 }}
    >
      {initials}
    </span>
  );
}

const S = {
  category:    { accent: "#6d4fc2", pill: { bg: "#f0ebfa", color: "#5338a0", border: "#cdbef5" } },
  subcategory: { accent: "#2472b0", pill: { bg: "#e8f2fb", color: "#1a568a", border: "#a8cff0" } },
  nature:      { accent: "#1e8c68", pill: { bg: "#e4f5ef", color: "#166650", border: "#8fd4bd" } },
  channel:     { accent: "#b8692a", pill: { bg: "#fdf0e2", color: "#944f15", border: "#efc08a" } },
  company:     { accent: "#2472b0" },
  personal:    { accent: "#a04070" },
};

function SectionHeader({ icon, label, color }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span style={{ color }}>{icon}</span>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
    </div>
  );
}

function TagPill({ label, bg, color, border }) {
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: bg, color, border: "1px solid " + border }}
    >
      {label}
    </span>
  );
}

function CompanyCard({ company, index, onEdit }) {
  const c = company;
  const fullName = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
  const { bg, color } = avatarColors(c.companyName || "");
  const websiteHref = c.website
    ? c.website.startsWith("http") ? c.website : "https://" + c.website
    : null;

  const handleCardClick = () => {
    onEdit(c);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
    >
      {/* ── Banner ── */}
      <div
        className="px-5 py-4 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-sm"
          style={{ background: bg, color }}
        >
          {(c.companyName || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 text-xl leading-tight truncate">
            {c.companyName}
          </h3>
          {websiteHref && (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopPropagation}
              className="inline-flex items-center gap-1 text-xs font-semibold mt-1 hover:underline"
              style={{ color: S.category.accent }}
            >
              <Globe size={11} />
              <span className="truncate max-w-45">{c.website}</span>
            </a>
          )}
        </div>
      </div>

      {/* ── 2×3 Grid ── */}
      <div className="grid grid-cols-2 flex-1">

        <div className="px-4 py-3 border-r border-b border-gray-100">
          <SectionHeader icon={<Tag size={12} />} label="Category" color={S.category.accent} />
          <div className="flex flex-wrap gap-1">
            {c.category
              ? <TagPill label={c.category} {...S.category.pill} />
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<Layers size={12} />} label="Subcategory" color={S.subcategory.accent} />
          <div className="flex flex-wrap gap-1">
            {Array.isArray(c.subcategory) && c.subcategory.length > 0
              ? c.subcategory.map((s, i) => <TagPill key={i} label={s} {...S.subcategory.pill} />)
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        <div className="px-4 py-3 border-r border-b border-gray-100">
          <SectionHeader icon={<Briefcase size={12} />} label="Nature of Business" color={S.nature.accent} />
          <div className="flex flex-wrap gap-1">
            {Array.isArray(c.natureOfBusiness) && c.natureOfBusiness.length > 0
              ? c.natureOfBusiness.map((n, i) => <TagPill key={i} label={n} {...S.nature.pill} />)
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<Radio size={12} />} label="Channel" color={S.channel.accent} />
          <div className="flex flex-wrap gap-1">
            {Array.isArray(c.channel) && c.channel.length > 0
              ? c.channel.map((ch, i) => <TagPill key={i} label={ch} {...S.channel.pill} />)
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        <div className="px-4 py-3 border-r border-gray-100">
          <SectionHeader icon={<Building2 size={12} />} label="Company Contact" color={S.company.accent} />
          <div className="space-y-1.5">
            {c.companyEmail ? (
              <a
                href={gmailLink(c.companyEmail)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-700 transition-colors group"
              >
                <Mail size={14} className="text-gray-400 group-hover:text-blue-500 shrink-0" />
                <span className="truncate">{c.companyEmail}</span>
              </a>
            ) : null}
            {c.companyMobile ? (
              <a
                href={whatsappLink(c.countryCode, c.companyMobile)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-green-700 transition-colors"
              >
                <span className="text-green-500 shrink-0"><WaIcon /></span>
                <span>{c.countryCode} {c.companyMobile}</span>
              </a>
            ) : null}
            {!c.companyEmail && !c.companyMobile && (
              <span className="text-xs text-gray-400 italic">—</span>
            )}
          </div>
        </div>

        <div className="px-4 py-3">
          <SectionHeader icon={<Phone size={12} />} label="Personal Contact" color={S.personal.accent} />
          <div className="space-y-1.5">
            {c.personalEmail ? (
              <a
                href={gmailLink(c.personalEmail)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-700 transition-colors group"
              >
                <Mail size={14} className="text-gray-400 group-hover:text-blue-500 shrink-0" />
                <span className="truncate">{c.personalEmail}</span>
              </a>
            ) : null}
            {c.personalMobile ? (
              <a
                href={whatsappLink(c.personalCountryCode, c.personalMobile)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopPropagation}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-green-700 transition-colors"
              >
                <span className="text-green-500 shrink-0"><WaIcon /></span>
                <span>{c.personalCountryCode} {c.personalMobile}</span>
              </a>
            ) : null}
            {!c.personalEmail && !c.personalMobile && (
              <span className="text-xs text-gray-400 italic">—</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="px-5 py-3 bg-gray-50 flex items-center gap-2"
        style={{ borderTop: "1px solid #f0f0f0" }}
      >
        <Avatar name={fullName} size={34} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 truncate">{fullName || "—"}</p>
            {c.gender ? (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: c.gender.toLowerCase() === "female" ? "#fce7f3" : "#dbeafe",
                  color: c.gender.toLowerCase() === "female" ? "#9d174d" : "#1e40af",
                }}
              >
                {c.gender}
              </span>
            ) : null}
          </div>
        </div>

        {c.companyId && (
          <span
            className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md whitespace-nowrap"
            style={{ background: S.category.pill.bg, color: S.category.pill.color }}
          >
            {c.companyId}
          </span>
        )}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
          style={{ background: S.category.pill.bg, color: S.category.pill.color }}
        >
          {index}
        </span>
      </div>
    </div>
  );
}

/* ─── Pagination ── */
function Pagination({ page, totalPages, onPage }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
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
          <button
            key={p}
            onClick={() => onPage(p)}
            className="w-7 h-7 text-sm font-semibold rounded transition-colors"
            style={{
              background: page === p ? S.category.accent : "white",
              color: page === p ? "white" : "#374151",
              border: "1px solid " + (page === p ? S.category.accent : "#d1d5db"),
            }}
          >
            {p}
          </button>
        )
      )}
    </div>
  );
}

/* ─── Main ── */
export default function CompanyCards({ search: externalSearch = "" }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalSearch, setInternalSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [editingCompany, setEditingCompany] = useState(null);

  // Use external search if provided (from parent), otherwise fall back to internal
  const search = externalSearch !== "" ? externalSearch : internalSearch;

  const fetchCompanies = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/companies")
      .then((res) => { if (res.data.success) setCompanies(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? companies.filter((c) =>
          [c.companyName, c.companyEmail, c.personalEmail, c.category,
           c.firstName, c.lastName, c.website, c.natureOfBusiness,
           c.channel, c.subcategory].some((v) => toStr(v).includes(q))
        )
      : companies;
    return [...list].reverse();
  }, [companies, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, filtered.length);

  const handleSearch = (v) => { setInternalSearch(v); setPage(1); };

  // Reset to page 1 whenever external search changes
  useEffect(() => { setPage(1); }, [externalSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {editingCompany && (
        <CompanyForm
          editData={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSuccess={() => { setEditingCompany(null); fetchCompanies(); }}
        />
      )}

      {/* ── Toolbar ── */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-800">{showingFrom}–{showingTo}</span>
          {" "}of{" "}
          <span className="font-bold text-gray-800">{filtered.length}</span> companies
        </p>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="px-3 pb-6">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-800">No companies found</p>
            <p className="text-sm text-gray-500">
              {search ? `No results for "${search}".` : "No data available."}
            </p>
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="text-sm font-semibold hover:underline"
                style={{ color: S.category.accent }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginated.map((c, idx) => (
              <CompanyCard
                key={c._id}
                company={c}
                index={(page - 1) * pageSize + idx + 1}
                onEdit={setEditingCompany}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-gray-600">
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
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}