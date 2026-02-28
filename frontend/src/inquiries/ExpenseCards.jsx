import React from "react";
import {
  TrendingUp, TrendingDown, Minus,
  Building2, Calendar, MapPin,
  ArrowLeftRight, FileText, Landmark, Hash,
} from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────────── */
const fmt = (num) =>
  num == null
    ? "—"
    : Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const CURRENCY_SYMBOLS = {
  INR: "₹", USD: "$", RUB: "₽", USDT: "₮", EUR: "€", AED: "د.إ", GBP: "£",
};

/* Banner gradient per type — mirrors CompanyCard's fixed indigo gradient */
const TYPE_META = {
  Purchase: {
    banner: "linear-gradient(135deg,#eff6ff 0%,#ffffff 100%)",
    pill: { bg: "#dbeafe", color: "#1e3a8a", border: "#93c5fd" },
  },
  Spend: {
    banner: "linear-gradient(135deg,#fdf2f8 0%,#ffffff 100%)",
    pill: { bg: "#fce7f3", color: "#831843", border: "#f9a8d4" },
  },
  Transfer: {
    banner: "linear-gradient(135deg,#f5f3ff 0%,#ffffff 100%)",
    pill: { bg: "#ede9fe", color: "#3730a3", border: "#c4b5fd" },
  },
};

/* Colour tokens — same naming convention as CompanyCards S object */
const S = {
  amount: { accent: "#1e8c68", pill: { bg: "#e4f5ef", color: "#166650", border: "#8fd4bd" } },
  inr: { accent: "#2472b0", pill: { bg: "#e8f2fb", color: "#1a568a", border: "#a8cff0" } },
  dept: { accent: "#6d4fc2", pill: { bg: "#f0ebfa", color: "#5338a0", border: "#cdbef5" } },
  account: { accent: "#b8692a", pill: { bg: "#fdf0e2", color: "#944f15", border: "#efc08a" } },
  country: { accent: "#1e8c68", pill: { bg: "#e4f5ef", color: "#166650", border: "#8fd4bd" } },
  footer: { pill: { bg: "#f0ebfa", color: "#5338a0" } },
};

const hueOf = (s = "") => (s.charCodeAt(0) * 47) % 360;
const avatarColors = (name = "") => {
  const h = hueOf(name);
  return { bg: `hsl(${h},40%,90%)`, color: `hsl(${h},45%,35%)` };
};

/* ─── Shared sub-components (identical to CompanyCards) ──────── */
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

function SignIcon({ amount, size = 14 }) {
  if (amount > 0) return <TrendingUp size={size} style={{ color: "#16a34a" }} />;
  if (amount < 0) return <TrendingDown size={size} style={{ color: "#dc2626" }} />;
  return <Minus size={size} style={{ color: "#9ca3af" }} />;
}

/* ─── ExpenseCard ─────────────────────────────────────────────── */
export function ExpenseCard({ tx, index, onEdit }) {
  const meta = TYPE_META[tx.type?.label] ?? TYPE_META.Spend;
  const sym = CURRENCY_SYMBOLS[tx.currency?.value] ?? "";
  const amtPos = tx.amount > 0, amtNeg = tx.amount < 0;
  const inrPos = (tx.inrAmount ?? 0) > 0, inrNeg = (tx.inrAmount ?? 0) < 0;
  const { bg: avBg, color: avColor } = avatarColors(tx.company || "");

  return (
    <div
      onClick={() => onEdit(tx)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
    >
      {/* ── Banner — identical structure to CompanyCard ── */}
      <div
        className="px-5 py-4 flex items-center gap-4"
        style={{ background: meta.banner, borderBottom: "1px solid #f0f0f0" }}
      >
        {/* Letter avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-sm"
          style={{ background: avBg, color: avColor }}
        >
          {(tx.company || "?")[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 text-xl leading-tight truncate">
            {tx.company}
          </h3>
          {tx.counterparty && (
            <p className="text-xs font-semibold mt-1 truncate" style={{ color: S.dept.accent }}>
              ↔ {tx.counterparty}
            </p>
          )}
        </div>

        {/* Type pill — top-right, mirrors CompanyCard's companyId badge placement */}
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
          style={{ background: meta.pill.bg, color: meta.pill.color, border: `1px solid ${meta.pill.border}` }}
        >
          {tx.type?.label}
        </span>
      </div>

      {/* ── 2 × 3 Grid — same layout as CompanyCard ── */}
      <div className="grid grid-cols-2 flex-1">

        {/* Cell 1 — Amount */}
        <div className="px-4 py-3 border-r border-b border-gray-100">
          <SectionHeader icon={<TrendingUp size={12} />} label="Amount" color={S.amount.accent} />
          <div className="flex items-center gap-1.5 flex-wrap">
            <SignIcon amount={tx.amount} size={13} />
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: amtPos ? "#16a34a" : amtNeg ? "#dc2626" : "#374151" }}
            >
              {sym}{fmt(Math.abs(tx.amount))}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {tx.currency?.value}
            </span>
          </div>
          {tx.fx && tx.fx !== 1 && (
            <p className="text-xs text-gray-400 mt-0.5">FX: {tx.fx}</p>
          )}
        </div>

        {/* Cell 2 — INR Amount */}
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<ArrowLeftRight size={12} />} label="INR Amount" color={S.inr.accent} />
          <div className="flex items-center gap-1.5">
            <SignIcon amount={tx.inrAmount} size={13} />
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: inrPos ? "#16a34a" : inrNeg ? "#dc2626" : "#374151" }}
            >
              ₹{fmt(Math.abs(tx.inrAmount ?? 0))}
            </span>
          </div>
        </div>

        {/* Cell 3 — Department */}
        <div className="px-4 py-3 border-r border-b border-gray-100">
          <SectionHeader icon={<Building2 size={12} />} label="Department" color={S.dept.accent} />
          <div className="flex flex-wrap gap-1">
            {tx.department
              ? <TagPill label={tx.department} {...S.dept.pill} />
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        {/* Cell 4 — Account */}
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<Landmark size={12} />} label="Account" color={S.account.accent} />
          <div className="flex flex-wrap gap-1">
            {tx.account
              ? <TagPill label={tx.account} {...S.account.pill} />
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        {/* Cell 5 — Country */}
        <div className="px-4 py-3 border-r border-gray-100">
          <SectionHeader icon={<MapPin size={12} />} label="Country" color={S.country.accent} />
          <div className="flex flex-wrap gap-1">
            {tx.country
              ? <TagPill label={tx.country?.label}  {...S.country.pill} />
              : <span className="text-xs text-gray-400 italic">—</span>}
          </div>
        </div>

        {/* Cell 6 — Description */}
        <div className="px-4 py-3">
          <SectionHeader icon={<FileText size={12} />} label="Description" color={S.account.accent} />
          {tx.description
            ? <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{tx.description}</p>
            : <span className="text-xs text-gray-400 italic">—</span>}
        </div>
      </div>

      {/* ── Footer — mirrors CompanyCard footer exactly ── */}
      <div
        className="px-5 py-3 bg-gray-50 flex items-center gap-2"
        style={{ borderTop: "1px solid #f0f0f0" }}
      >
        {/* Date — takes the place of the Avatar + name row */}
        <Calendar size={14} className="text-gray-400 shrink-0" />
        <p className="text-sm font-semibold text-gray-700 flex-1 min-w-0 truncate">
          {fmtDate(tx.date)}
        </p>

        {/* Tx ID badge — mirrors companyId badge */}
        {tx.transactionId && (
          <span
            className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md whitespace-nowrap"
            style={{ background: S.footer.pill.bg, color: S.footer.pill.color }}
          >
            {tx.transactionId}
          </span>
        )}

        {/* Row index badge */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
          style={{ background: S.footer.pill.bg, color: S.footer.pill.color }}
        >
          {index}
        </span>
      </div>
    </div>
  );
}

export default ExpenseCard;