import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import {
  TrendingUp, TrendingDown, BarChart2, PieChart, Activity,
  ArrowUpRight, ArrowDownRight, ChevronDown,
  Building2, Globe, Layers, Calendar, DollarSign, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line,
  PieChart as RPie, Pie, Sector,
} from "recharts";

/* ─── palette ─────────────────────────────────────── */
const COLORS = [
  "#6d4fc2","#3b82f6","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#06b6d4","#84cc16","#f97316","#ec4899",
  "#14b8a6","#a855f7","#eab308","#0ea5e9","#22c55e",
];
const ACCENT = "#6d4fc2";
const RED    = "#ef4444";
const GREEN  = "#10b981";

/* ─── formatters ──────────────────────────────────── */
const fmt = (n) => {
  if (n == null) return "—";
  const a = Math.abs(n);
  if (a >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
  if (a >= 1e5) return (n / 1e5).toFixed(2) + "L";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Number(n).toFixed(0);
};
const fmtFull = (n) => {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};
const pct = (v, t) => t > 0 ? ((v / t) * 100).toFixed(1) + "%" : "0%";

/* ═══════════════════════════════════════════════════
   TOOLTIP COMPONENTS
═══════════════════════════════════════════════════ */
const TT = ({ children, style }) => (
  <div style={{
    background: "white", border: "1px solid #e5e7eb", borderRadius: 12,
    padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    fontFamily: "'Poppins',sans-serif", minWidth: 180, ...style,
  }}>
    {children}
  </div>
);

const TTLabel = ({ children }) => (
  <p style={{
    fontSize: 11, color: "#9ca3af", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px",
  }}>{children}</p>
);

const TTRow = ({ color, name, value, sub }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
    {color && <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0, marginTop: 2 }} />}
    <div style={{ flex: 1 }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{name}: </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{value}</span>
      {sub && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

const CashFlowTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const credit = payload.find(p => p.dataKey === "credit")?.value || 0;
  const spend  = payload.find(p => p.dataKey === "spend")?.value  || 0;
  const net    = payload.find(p => p.dataKey === "net")?.value    || 0;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={GREEN} name="Credit" value={fmtFull(credit)} />
      <TTRow color={RED}   name="Spend"  value={fmtFull(spend)} />
      <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8 }}>
        <TTRow color={ACCENT} name="Net" value={fmtFull(net)}
          sub={net >= 0 ? "Surplus this month" : "Deficit this month"} />
      </div>
    </TT>
  );
};

const BarTT = ({ active, payload, label, total }) => {
  if (!active || !payload?.length) return null;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      {payload.map((p, i) => (
        <TTRow key={i} color={p.fill} name={p.name} value={fmtFull(p.value)}
          sub={total ? `${pct(p.value, total)} of total` : undefined} />
      ))}
    </TT>
  );
};

const NetTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value || 0;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={v >= 0 ? GREEN : RED} name="Net Flow" value={fmtFull(v)}
        sub={v >= 0 ? "Surplus" : "Deficit"} />
    </TT>
  );
};

const CurrTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={payload[0]?.fill} name="INR Volume" value={fmtFull(payload[0]?.value)} />
    </TT>
  );
};

/* ═══════════════════════════════════════════════════
   ACTIVE PIE SHAPE
═══════════════════════════════════════════════════ */
const ActivePieShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827"
        style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>
        {payload.name?.length > 10 ? payload.name.slice(0, 9) + "…" : payload.name}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#6b7280"
        style={{ fontSize: 11, fontFamily: "'Poppins',sans-serif" }}>
        ₹{fmt(value)}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#9ca3af"
        style={{ fontSize: 10, fontFamily: "'Poppins',sans-serif" }}>
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

/* ═══════════════════════════════════════════════════
   TABLE ROW — hover state isolated in its own component
   so hooks are never called inside a .map()
═══════════════════════════════════════════════════ */
const CPRow = ({ cp, i, total }) => {
  const [hov, setHov] = useState(false);
  const net   = cp.credit - cp.spend;
  const share = pct(cp.spend + cp.credit, total);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderBottom: "1px solid #f9f9f9",
        background: hov ? "#f8f7ff" : "transparent",
        transition: "background 0.15s", cursor: "default",
      }}
    >
      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{i + 1}</td>
      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#111827" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: COLORS[i % COLORS.length] + (hov ? "44" : "22"),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: COLORS[i % COLORS.length], flexShrink: 0,
            transition: "background 0.15s",
          }}>
            {cp.name.slice(0, 2).toUpperCase()}
          </div>
          {cp.name}
        </div>
      </td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>
        <span style={{
          display: "inline-block", padding: "2px 10px", borderRadius: 20,
          background: "#f3f4f6", fontSize: 12, fontWeight: 600, color: "#374151",
        }}>{cp.count}</span>
      </td>
      <td style={{ padding: "12px 14px", textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: RED }}>₹{fmt(cp.spend)}</div>
        {hov && <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtFull(cp.spend)}</div>}
      </td>
      <td style={{ padding: "12px 14px", textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>₹{fmt(cp.credit)}</div>
        {hov && <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtFull(cp.credit)}</div>}
      </td>
      <td style={{ padding: "12px 14px", textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: net >= 0 ? GREEN : RED }}>
          {net >= 0 ? "+" : "-"}₹{fmt(Math.abs(net))}
        </div>
        {hov && <div style={{ fontSize: 10, color: "#9ca3af" }}>{net >= 0 ? "Surplus" : "Deficit"}</div>}
      </td>
      <td style={{ padding: "12px 14px", textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden" }}>
            <div style={{
              width: share, height: "100%", borderRadius: 3,
              background: COLORS[i % COLORS.length], transition: "width 0.3s",
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", minWidth: 36, textAlign: "right" }}>{share}</span>
        </div>
      </td>
    </tr>
  );
};

/* ═══════════════════════════════════════════════════
   UI PRIMITIVES
═══════════════════════════════════════════════════ */
const StatCard = ({ label, value, sub, color, icon: Icon }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "white", borderRadius: 14,
        border: `1px solid ${hov ? color + "44" : "#f0f0f0"}`,
        padding: "18px 20px",
        boxShadow: hov ? `0 8px 24px ${color}22` : "0 2px 10px rgba(0,0,0,0.04)",
        fontFamily: "'Poppins',sans-serif", flex: 1, minWidth: 160,
        transition: "all 0.2s", cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: hov ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s",
        }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>₹{fmt(value)}</p>
      {sub && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>{sub}</p>}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: ACCENT + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={16} style={{ color: ACCENT }} />
    </div>
    <div>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'Poppins',sans-serif" }}>{title}</h2>
      {sub && <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontFamily: "'Poppins',sans-serif" }}>{sub}</p>}
    </div>
  </div>
);

const CompanySelector = ({ companies, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px",
        background: value !== "__all__" ? "#ede9fe" : "white",
        color: value !== "__all__" ? "#3730a3" : "#374151",
        border: value !== "__all__" ? "1px solid #c4b5fd" : "1px solid #d1d5db",
        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap",
      }}>
        <Building2 size={14} />
        {value === "__all__" ? "All Companies" : value}
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", left: 0, top: "calc(100% + 4px)", background: "white",
          border: "1px solid #e5e7eb", borderRadius: 10, zIndex: 50, minWidth: 200,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)", maxHeight: 280, overflowY: "auto",
        }}>
          {[{ key: "__all__", label: "All Companies" }, ...companies.map(c => ({ key: c, label: c }))].map(o => (
            <button key={o.key} onClick={() => { onChange(o.key); setOpen(false); }} style={{
              width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 13, fontWeight: 500,
              cursor: "pointer", background: value === o.key ? "#ede9fe" : "transparent",
              color: value === o.key ? "#3730a3" : "#374151", border: "none",
              fontFamily: "'Poppins',sans-serif", borderBottom: "1px solid #f5f5f5",
            }}>{o.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const ExpenseAnalytics = ({ expenses: propExpenses }) => {
  const [expenses, setExpenses]   = useState(propExpenses || []);
  const [loading,  setLoading]    = useState(!propExpenses);
  const [sel,      setSel]        = useState("__all__");
  const [activePieType,  setActivePieType]  = useState(0);
  const [activePieRatio, setActivePieRatio] = useState(0);

  useEffect(() => { if (propExpenses) setExpenses(propExpenses); }, [propExpenses]);

  useEffect(() => {
    if (!document.getElementById("poppins-font")) {
      const l = document.createElement("link");
      l.id = "poppins-font"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
    if (!propExpenses) fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const r = await axios.get("http://localhost:5000/api/expenses");
      if (r.data.success) setExpenses(r.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const allCompanies = useMemo(() => [...new Set(expenses.map(e => e.company).filter(Boolean))].sort(), [expenses]);
  const filtered     = useMemo(() => sel === "__all__" ? expenses : expenses.filter(e => e.company === sel), [expenses, sel]);

  const { totalSpend, totalCredit, netFlow, txCount } = useMemo(() => {
    let spend = 0, credit = 0;
    filtered.forEach(e => { const a = e.inrAmount ?? 0; if (a < 0) spend += Math.abs(a); else if (a > 0) credit += a; });
    return { totalSpend: spend, totalCredit: credit, netFlow: credit - spend, txCount: filtered.length };
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const key = fmtDate(e.date); if (!key) return;
      if (!map[key]) map[key] = { month: key, spend: 0, credit: 0, net: 0 };
      const a = e.inrAmount ?? 0;
      if (a < 0) map[key].spend += Math.abs(a); else map[key].credit += a;
      map[key].net = map[key].credit - map[key].spend;
    });
    const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return Object.values(map).sort((a, b) => {
      const p = k => { const [m, y] = k.split(" "); return parseInt("20" + y) * 12 + mo.indexOf(m); };
      return p(a.month) - p(b.month);
    });
  }, [filtered]);

  const companyData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const c = e.company || "Unknown"; if (!map[c]) map[c] = { company: c, spend: 0, credit: 0, net: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[c].spend += Math.abs(a); else map[c].credit += a;
      map[c].net = map[c].credit - map[c].spend;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit));
  }, [filtered]);

  const typeData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const t = e.typeLabel || e.type || "Other"; if (!map[t]) map[t] = { name: t, value: 0, count: 0 };
      map[t].value += Math.abs(e.inrAmount ?? 0); map[t].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const countryData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const c = e.countryLabel || e.country || "Unknown"; if (!map[c]) map[c] = { name: c, spend: 0, credit: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[c].spend += Math.abs(a); else map[c].credit += a;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit)).slice(0, 8);
  }, [filtered]);

  const deptData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const d = e.department || "General"; if (!map[d]) map[d] = { name: d, spend: 0, credit: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[d].spend += Math.abs(a); else map[d].credit += a;
    });
    return Object.values(map).sort((a, b) => b.spend - a.spend).slice(0, 8);
  }, [filtered]);

  const currencyData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      const c = e.currencyLabel || e.currency || "INR"; if (!map[c]) map[c] = { name: c, value: 0, count: 0 };
      map[c].value += Math.abs(e.inrAmount ?? 0); map[c].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const cpData = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      if (!e.counterparty) return;
      if (!map[e.counterparty]) map[e.counterparty] = { name: e.counterparty, spend: 0, credit: 0, count: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[e.counterparty].spend += Math.abs(a); else map[e.counterparty].credit += a;
      map[e.counterparty].count++;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit)).slice(0, 10);
  }, [filtered]);

  const ratioData = [
    { name: "Spend",  value: totalSpend  },
    { name: "Credit", value: totalCredit },
  ];

  const totalCompanyVol  = companyData.reduce((s, d) => s + d.spend + d.credit, 0);
  const totalCountryVol  = countryData.reduce((s, d) => s + d.spend + d.credit, 0);
  const totalDeptVol     = deptData.reduce((s, d) => s + d.spend + d.credit, 0);
  const cpTotal          = cpData.reduce((s, c) => s + c.spend + c.credit, 0);

  const tk  = (sz = 11, col = "#9ca3af") => ({ fontSize: sz, fill: col, fontFamily: "'Poppins',sans-serif" });
  const lgnd = { iconType: "square", iconSize: 10, wrapperStyle: { fontSize: 11, fontFamily: "'Poppins',sans-serif" } };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div style={{ textAlign: "center", fontFamily: "'Poppins',sans-serif" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid #ede9fe", borderTopColor: ACCENT,
          borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
        }} />
        <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading analytics…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const card = {
    background: "white", borderRadius: 14, border: "1px solid #f0f0f0",
    padding: "22px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: "'Poppins',sans-serif",
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", minHeight: "100vh", padding: "0 0 60px", background: "#fafafa" }}>

      {/* Header */}
      <div style={{
        background: "white", borderBottom: "1px solid #f0f0f0", padding: "18px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 30,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={20} style={{ color: "white" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Expense Analytics</h1>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
              {txCount} transactions · {allCompanies.length} companies
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CompanySelector companies={allCompanies} value={sel} onChange={setSel} />
          <button onClick={fetchExpenses} style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px",
            background: "white", border: "1px solid #d1d5db", borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer", fontFamily: "'Poppins',sans-serif",
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: "28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          <StatCard label="Total Spend"  value={totalSpend}  color={RED}   icon={TrendingDown}
            sub={`${filtered.filter(e => (e.inrAmount ?? 0) < 0).length} debit transactions`} />
          <StatCard label="Total Credit" value={totalCredit} color={GREEN} icon={TrendingUp}
            sub={`${filtered.filter(e => (e.inrAmount ?? 0) > 0).length} credit transactions`} />
          <StatCard label="Net Flow"     value={Math.abs(netFlow)} color={netFlow >= 0 ? GREEN : RED}
            icon={netFlow >= 0 ? ArrowUpRight : ArrowDownRight}
            sub={netFlow >= 0 ? "Net positive (surplus)" : "Net negative (deficit)"} />
          <StatCard label="Avg per Txn"  value={txCount > 0 ? (totalSpend + totalCredit) / txCount : 0}
            color={ACCENT} icon={Activity} sub={`Across ${txCount} transactions`} />
        </div>

        {/* Monthly Cash Flow */}
        {monthlyData.length > 1 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Calendar} title="Monthly Cash Flow" sub="Hover any point for details" />
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={tk(11, "#9ca3af")} />
                <YAxis tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} width={64} />
                <Tooltip content={<CashFlowTT />} />
                <Legend {...lgnd} />
                <Area type="monotone" dataKey="credit" name="Credit"
                  fill={GREEN + "22"} stroke={GREEN} strokeWidth={2}
                  dot={{ r: 3, fill: GREEN }} activeDot={{ r: 6, fill: GREEN, stroke: "white", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="spend" name="Spend"
                  fill={RED + "22"} stroke={RED} strokeWidth={2}
                  dot={{ r: 3, fill: RED }} activeDot={{ r: 6, fill: RED, stroke: "white", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="net" name="Net"
                  stroke={ACCENT} strokeWidth={2} strokeDasharray="5 3"
                  dot={{ r: 3, fill: ACCENT }} activeDot={{ r: 6, fill: ACCENT, stroke: "white", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Company Breakdown */}
        {sel === "__all__" && companyData.length > 0 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Building2} title="Company Breakdown" sub="Hover bars for details" />
            <ResponsiveContainer width="100%" height={Math.max(260, companyData.length * 60)}>
              <BarChart data={companyData} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} />
                <YAxis type="category" dataKey="company" tick={tk(11, "#374151")} width={96} />
                <Tooltip content={<BarTT total={totalCompanyVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend"  name="Spend"  fill={RED}   radius={[0, 4, 4, 0]} />
                <Bar dataKey="credit" name="Credit" fill={GREEN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Type Pie + Ratio Pie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Transaction Type */}
          <div style={card}>
            <SectionHeader icon={PieChart} title="By Transaction Type"/>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RPie width={220} height={220}>
                <Pie
                  data={typeData} cx={110} cy={110}
                  innerRadius={52} outerRadius={82}
                  dataKey="value" stroke="none"
                  activeIndex={activePieType}
                  activeShape={ActivePieShape}
                  onMouseEnter={(_, i) => setActivePieType(i)}
                >
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </RPie>
              <div style={{ flex: 1, paddingLeft: 4 }}>
                {typeData.map((t, i) => {
                  const tot = typeData.reduce((s, x) => s + x.value, 0);
                  const isActive = i === activePieType;
                  return (
                    <div key={t.name}
                      onMouseEnter={() => setActivePieType(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                        padding: "6px 8px", borderRadius: 8, cursor: "pointer",
                        background: isActive ? COLORS[i % COLORS.length] + "12" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, fontWeight: isActive ? 700 : 600,
                          color: isActive ? COLORS[i % COLORS.length] : "#374151",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{t.name}</div>
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>{t.count} txn · {pct(t.value, tot)}</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                        ₹{fmt(t.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Spend vs Credit Ratio */}
          <div style={card}>
            <SectionHeader icon={Activity} title="Spend vs Credit Ratio"  />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
              <RPie width={220} height={220}>
                <Pie
                  data={ratioData} cx={110} cy={110}
                  innerRadius={58} outerRadius={88}
                  dataKey="value" stroke="none" paddingAngle={3}
                  activeIndex={activePieRatio}
                  activeShape={ActivePieShape}
                  onMouseEnter={(_, i) => setActivePieRatio(i)}
                >
                  <Cell fill={RED} />
                  <Cell fill={GREEN} />
                </Pie>
              </RPie>
              <div>
                {ratioData.map((r, i) => {
                  const tot = totalSpend + totalCredit;
                  const isActive = i === activePieRatio;
                  const col = i === 0 ? RED : GREEN;
                  return (
                    <div key={r.name}
                      onMouseEnter={() => setActivePieRatio(i)}
                      style={{
                        marginBottom: 16, padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                        background: isActive ? col + "10" : "transparent",
                        border: isActive ? `1px solid ${col}30` : "1px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{r.name}</span>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: col }}>₹{fmt(r.value)}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{pct(r.value, tot)} of total flow</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{fmtFull(r.value)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Department Spend */}
        {deptData.length > 0 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Layers} title="Department Spend" sub="Hover bars for details" />
            <ResponsiveContainer width="100%" height={Math.max(220, deptData.length * 52)}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} />
                <YAxis type="category" dataKey="name" tick={tk(11, "#374151")} width={86} />
                <Tooltip content={<BarTT total={totalDeptVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend"  name="Spend"  fill={ACCENT}    radius={[0, 4, 4, 0]} />
                <Bar dataKey="credit" name="Credit" fill={"#06b6d4"} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Country + Currency */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div style={card}>
            <SectionHeader icon={Globe} title="By Country" sub="Top 8 countries — hover for details" />
            <ResponsiveContainer width="100%" height={Math.max(220, countryData.length * 52)}>
              <BarChart data={countryData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(10, "#9ca3af")} />
                <YAxis type="category" dataKey="name" tick={tk(10, "#374151")} width={66} />
                <Tooltip content={<BarTT total={totalCountryVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend"  name="Spend"  fill={"#FF0000"} radius={[0, 3, 3, 0]} />
                <Bar dataKey="credit" name="Credit" fill={"#10b981"} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <SectionHeader icon={DollarSign} title="By Currency" sub="INR equivalent — hover for details" />
            <ResponsiveContainer width="100%" height={Math.max(220, currencyData.length * 52)}>
              <BarChart data={currencyData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(10, "#9ca3af")} />
                <YAxis type="category" dataKey="name" tick={tk(10, "#374151")} width={46} />
                <Tooltip content={<CurrTT />} />
                <Bar dataKey="value" name="INR Volume" radius={[0, 3, 3, 0]}>
                  {currencyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Counterparties — CPRow component handles its own hover state (no hook-in-loop) */}
        {cpData.length > 0 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Activity} title="Top Counterparties" sub="Hover rows for details" />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    {["#", "Counterparty", "Transactions", "Spend", "Credit", "Net", "Share"].map(h => (
                      <th key={h} style={{
                        padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#9ca3af",
                        textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                        textAlign: h === "#" || h === "Transactions" ? "center" : h === "Counterparty" ? "left" : "right",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cpData.map((cp, i) => (
                    <CPRow key={cp.name} cp={cp} i={i} total={cpTotal} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Net Flow by Company */}
        {sel === "__all__" && companyData.length > 1 && (
          <div style={card}>
            <SectionHeader icon={BarChart2} title="Net Flow by Company" sub="Positive = surplus · Negative = deficit — hover for details" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyData} margin={{ top: 4, right: 20, bottom: 56, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="company" tick={tk(10, "#374151")} angle={-30} textAnchor="end" interval={0} />
                <YAxis tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} width={64} />
                <Tooltip content={<NetTT />} />
                <Bar dataKey="net" name="Net Flow" radius={[4, 4, 0, 0]}>
                  {companyData.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExpenseAnalytics;