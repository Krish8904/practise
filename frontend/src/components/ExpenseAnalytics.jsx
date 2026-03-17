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
  "#6d4fc2", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899",
  "#14b8a6", "#a855f7", "#eab308", "#0ea5e9", "#22c55e",
];
const ACCENT = "#6d4fc2";
const RED = "#ef4444";
const GREEN = "#10b981";

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
  const dt = new Date(d);
  const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return mo[dt.getMonth()] + " " + String(dt.getFullYear()).slice(-2);
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
  const spend = payload.find(p => p.dataKey === "spend")?.value || 0;
  const net = payload.find(p => p.dataKey === "net")?.value || 0;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={GREEN} name="Credit" value={fmtFull(credit)} />
      <TTRow color={RED} name="Spend" value={fmtFull(spend)} />
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
  const net = cp.credit - cp.spend;
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

/* ═══════════════════════════════════════════════════
   LEGAL ENTITY SELECTOR (Replaces CompanySelector)
═══════════════════════════════════════════════════ */
const LegalEntitySelector = ({ entities, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Format entities for display
  const entityOptions = [
    { key: "__all__", label: "All Legal Entities", entity: null },
    ...entities.map(e => ({
      key: e._id,
      label: e.companyName,
      entity: e
    }))
  ];

  // Find selected entity display
  const selectedLabel = value === "__all__"
    ? "All Legal Entities"
    : entities.find(e => e._id === value)?.companyName || "Select Legal Entity";

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
        {selectedLabel}
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", left: 0, top: "calc(100% + 4px)", background: "white",
          border: "1px solid #e5e7eb", borderRadius: 10, zIndex: 50, minWidth: 220,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)", maxHeight: 280, overflowY: "auto",
        }}>
          {entityOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              style={{
                width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 13, fontWeight: 500,
                cursor: "pointer", background: value === opt.key ? "#ede9fe" : "transparent",
                color: value === opt.key ? "#3730a3" : "#374151", border: "none",
                fontFamily: "'Poppins',sans-serif", borderBottom: "1px solid #f5f5f5",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {opt.entity && (
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: opt.entity.country ? "#f0f0f0" : "#f9f9f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 600, color: "#6b7280",
                }}>
                  {opt.entity.companyName?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span style={{ flex: 1 }}>{opt.label}</span>
              {opt.entity?.localCurrencyCode && (
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{opt.entity.localCurrencyCode}</span>
              )}
            </button>
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
  const [expenses, setExpenses] = useState(propExpenses || []);
  const [legalEntities, setLegalEntities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(!propExpenses);
  const [selectedEntity, setSelectedEntity] = useState("__all__");
  const [activePieType, setActivePieType] = useState(0);
  const [activePieRatio, setActivePieRatio] = useState(0);

  // API endpoints
  const LEGAL_ENTITIES_API = "http://localhost:5000/api/legal-entities";
  const COMPANIES_API = "http://localhost:5000/api/companies";

  useEffect(() => {
    if (propExpenses) setExpenses(propExpenses);
  }, [propExpenses]);

  useEffect(() => {
    if (!document.getElementById("poppins-font")) {
      const l = document.createElement("link");
      l.id = "poppins-font"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
    if (!propExpenses) {
      fetchExpenses();
    }
    fetchLegalEntities();
    fetchCompanies();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const r = await axios.get("http://localhost:5000/api/expenses");
      if (r.data.success) setExpenses(r.data.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLegalEntities = async () => {
    try {
      const r = await axios.get(LEGAL_ENTITIES_API);
      if (r.data.success) {
        setLegalEntities(r.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch legal entities:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const r = await axios.get(COMPANIES_API);
      if (r.data.success) {
        setCompanies(r.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  // Filter expenses by selected legal entity
  const filteredExpenses = useMemo(() => {
    if (selectedEntity === "__all__") return expenses;

    // Get all companies under this legal entity
    const entityCompanies = companies
      .filter(c => String(c.legalEntityId) === String(selectedEntity))
      .map(c => c.companyName);

    // If no companies found for this entity, return empty array
    if (entityCompanies.length === 0) return [];

    // Filter expenses by those companies
    return expenses.filter(e => entityCompanies.includes(e.company));
  }, [expenses, selectedEntity, companies]);

  const allCompanies = useMemo(() => [...new Set(expenses.map(e => e.company).filter(Boolean))].sort(), [expenses]);

  const { totalSpend, totalCredit, netFlow, txCount } = useMemo(() => {
    let spend = 0, credit = 0;
    filteredExpenses.forEach(e => {
      const a = e.inrAmount ?? 0;
      if (a < 0) spend += Math.abs(a);
      else if (a > 0) credit += a;
    });
    return {
      totalSpend: spend,
      totalCredit: credit,
      netFlow: credit - spend,
      txCount: filteredExpenses.length
    };
  }, [filteredExpenses]);

  // Monthly data with all months including zeros
  const monthlyData = useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    console.log("Generating monthly data for", filteredExpenses.length, "expenses");

    // Get date range from expenses
    let minDate = new Date();
    let maxDate = new Date(0);

    filteredExpenses.forEach(e => {
      const dt = new Date(e.date);
      if (!isNaN(dt)) {
        if (dt < minDate) minDate = dt;
        if (dt > maxDate) maxDate = dt;
      }
    });

    // If no valid dates, return empty
    if (minDate > maxDate) return [];

    // Add padding months to show context (show 3 months before and after)
    const paddingMonths = 3;
    minDate.setMonth(minDate.getMonth() - paddingMonths);
    maxDate.setMonth(maxDate.getMonth() + paddingMonths);

    // Create array of all months in range
    const months = [];
    const current = new Date(minDate);
    current.setDate(1); // Start from first day of month

    while (current <= maxDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const key = monthNames[month] + " " + String(year).slice(-2);
      const sortVal = year * 12 + month;

      months.push({
        month: key,
        sortVal,
        spend: 0,
        credit: 0,
        net: 0,
        hasTransactions: false,
        transactionCount: 0,
        isPaddingMonth: true // Initially mark all as padding
      });

      current.setMonth(current.getMonth() + 1);
    }

    // Mark actual months in our range
    const actualMinDate = new Date(Math.min(...filteredExpenses.map(e => new Date(e.date))));
    const actualMaxDate = new Date(Math.max(...filteredExpenses.map(e => new Date(e.date))));

    months.forEach(m => {
      const [monthName, yearStr] = m.month.split(' ');
      const year = 2000 + parseInt(yearStr);
      const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthName);
      const monthDate = new Date(year, monthIndex, 1);

      if (monthDate >= actualMinDate && monthDate <= actualMaxDate) {
        m.isPaddingMonth = false;
      }
    });

    // Aggregate actual expense data
    filteredExpenses.forEach(e => {
      const dt = new Date(e.date);
      if (isNaN(dt)) return;

      const year = dt.getFullYear();
      const month = dt.getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const key = monthNames[month] + " " + String(year).slice(-2);

      const monthData = months.find(m => m.month === key);
      if (monthData) {
        const a = e.inrAmount ?? 0;
        if (a < 0) monthData.spend += Math.abs(a);
        else monthData.credit += a;
        monthData.net = monthData.credit - monthData.spend;
        monthData.hasTransactions = true;
        monthData.transactionCount++;
        monthData.isPaddingMonth = false;
      }
    });

    const sorted = months.sort((a, b) => a.sortVal - b.sortVal);
    console.log("Generated months:", sorted.map(m => ({
      month: m.month,
      hasTransactions: m.hasTransactions,
      transactionCount: m.transactionCount,
      isPadding: m.isPaddingMonth
    })));

    return sorted;
  }, [filteredExpenses]);

  const companyData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const c = e.company || "Unknown"; if (!map[c]) map[c] = { company: c, spend: 0, credit: 0, net: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[c].spend += Math.abs(a); else map[c].credit += a;
      map[c].net = map[c].credit - map[c].spend;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit));
  }, [filteredExpenses]);

  const typeData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const t = e.typeLabel || e.type || "Other"; if (!map[t]) map[t] = { name: t, value: 0, count: 0 };
      map[t].value += Math.abs(e.inrAmount ?? 0); map[t].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const countryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const c = e.countryLabel || e.country || "Unknown"; if (!map[c]) map[c] = { name: c, spend: 0, credit: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[c].spend += Math.abs(a); else map[c].credit += a;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit)).slice(0, 8);
  }, [filteredExpenses]);

  const deptData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const d = e.department || "General"; if (!map[d]) map[d] = { name: d, spend: 0, credit: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[d].spend += Math.abs(a); else map[d].credit += a;
    });
    return Object.values(map).sort((a, b) => b.spend - a.spend).slice(0, 8);
  }, [filteredExpenses]);

  const currencyData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const c = e.currencyLabel || e.currency || "INR"; if (!map[c]) map[c] = { name: c, value: 0, count: 0 };
      map[c].value += Math.abs(e.inrAmount ?? 0); map[c].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const cpData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      if (!e.counterparty) return;
      if (!map[e.counterparty]) map[e.counterparty] = { name: e.counterparty, spend: 0, credit: 0, count: 0 };
      const a = e.inrAmount ?? 0; if (a < 0) map[e.counterparty].spend += Math.abs(a); else map[e.counterparty].credit += a;
      map[e.counterparty].count++;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit)).slice(0, 10);
  }, [filteredExpenses]);

  const ratioData = [
    { name: "Spend", value: totalSpend },
    { name: "Credit", value: totalCredit },
  ];

  const totalCompanyVol = companyData.reduce((s, d) => s + d.spend + d.credit, 0);
  const totalCountryVol = countryData.reduce((s, d) => s + d.spend + d.credit, 0);
  const totalDeptVol = deptData.reduce((s, d) => s + d.spend + d.credit, 0);
  const cpTotal = cpData.reduce((s, c) => s + c.spend + c.credit, 0);

  const tk = (sz = 11, col = "#9ca3af") => ({ fontSize: sz, fill: col, fontFamily: "'Poppins',sans-serif" });
  const lgnd = { iconType: "square", iconSize: 10, wrapperStyle: { fontSize: 11, fontFamily: "'Poppins',sans-serif" } };

  // Get selected entity details for display
  const selectedEntityDetails = useMemo(() =>
    legalEntities.find(e => e._id === selectedEntity),
    [legalEntities, selectedEntity]
  );

  // Get companies count for selected entity
  const entityCompaniesCount = useMemo(() => {
    if (selectedEntity === "__all__") return companies.length;
    return companies.filter(c => String(c.legalEntityId) === String(selectedEntity)).length;
  }, [companies, selectedEntity]);

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
              {filteredExpenses.length} transactions · {entityCompaniesCount} companies
              {selectedEntityDetails && (
                <span style={{ marginLeft: 8, padding: "2px 8px", background: "#ede9fe", color: "#3730a3", borderRadius: 12, fontSize: 10 }}>
                  {selectedEntityDetails.companyName}
                </span>
              )}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LegalEntitySelector
            entities={legalEntities}
            value={selectedEntity}
            onChange={setSelectedEntity}
          />
          <button
            onClick={() => {
              fetchExpenses();
              fetchLegalEntities();
              fetchCompanies();
            }}
            className="inline-flex items-center gap-1.25 px-[12px] py-[12px] bg-white border border-gray-300 rounded-full text-[12px] font-semibold text-gray-700 cursor-pointer font-[Poppins] transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 active:scale-95"
          >
            <RefreshCw size={12} className="transition-transform duration-300 active:rotate-180" />
          </button>
        </div>
      </div>

      <div style={{ padding: "28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          <StatCard label="Total Spend" value={totalSpend} color={RED} icon={TrendingDown}
            sub={`${filteredExpenses.filter(e => (e.inrAmount ?? 0) < 0).length} debit transactions`} />
          <StatCard label="Total Credit" value={totalCredit} color={GREEN} icon={TrendingUp}
            sub={`${filteredExpenses.filter(e => (e.inrAmount ?? 0) > 0).length} credit transactions`} />
          <StatCard label="Net Flow" value={Math.abs(netFlow)} color={netFlow >= 0 ? GREEN : RED}
            icon={netFlow >= 0 ? ArrowUpRight : ArrowDownRight}
            sub={netFlow >= 0 ? "Net positive (surplus)" : "Net negative (deficit)"} />
          <StatCard label="Avg per Txn" value={txCount > 0 ? (totalSpend + totalCredit) / txCount : 0}
            color={ACCENT} icon={Activity} sub={`Across ${txCount} transactions`} />
        </div>

        {/* Monthly Cash Flow */}
        {monthlyData.length > 0 && (  
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Calendar} title="Monthly Cash Flow" sub="Hover any point for details" />
            <ResponsiveContainer width="100%" height={350}>
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

        {/* Company Breakdown - Only show when All Entities is selected or when entity has multiple companies */}
        {(selectedEntity === "__all__" || companyData.length > 1) && companyData.length > 0 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Building2} title="Company Breakdown" sub="Hover bars for details" />
            <ResponsiveContainer  width="90%" height={Math.max(260, companyData.length * 60)}>
              <BarChart data={companyData} layout="vertical" margin={{ top: 4, right: 15, bottom: 4, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} />
                <YAxis type="category" dataKey="company" tick={tk(11, "#374151")} width={96} />
                <Tooltip content={<BarTT total={totalCompanyVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend" name="Spend" fill={RED} radius={[0, 4, 4, 0]} />
                <Bar dataKey="credit" name="Credit" fill={GREEN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* If entity selected, show company summary */}
        {selectedEntity !== "__all__" && companyData.length === 1 && (
          <div style={{ ...card, marginBottom: 24, background: "#f8f7ff", borderColor: "#c4b5fd" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: ACCENT + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Building2 size={24} style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
                    {companyData[0].company}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
                    Single company under this legal entity
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Spend</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: RED }}>₹{fmt(companyData[0].spend)}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Credit</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>₹{fmt(companyData[0].credit)}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Net</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: companyData[0].net >= 0 ? GREEN : RED }}>
                    {companyData[0].net >= 0 ? "+" : "-"}₹{fmt(Math.abs(companyData[0].net))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Type Pie + Ratio Pie */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Transaction Type */}
          {typeData.length > 0 && (
            <div style={card}>
              <SectionHeader icon={PieChart} title="By Transaction Type" />
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
          )}

          {/* Spend vs Credit Ratio */}
          {(totalSpend > 0 || totalCredit > 0) && (
            <div style={card}>
              <SectionHeader icon={Activity} title="Spend vs Credit Ratio" />
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
          )}
        </div>

        {/* Department Spend */}
        {deptData.length > 0 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <SectionHeader icon={Layers} title="Department Spend" sub="Hover bars for details" />
            <ResponsiveContainer width="100%" height={Math.max(220, deptData.length * 52)}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 4, right: 15, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} />
                <YAxis type="category" dataKey="name" tick={tk(11, "#374151")} width={86} />
                <Tooltip content={<BarTT total={totalDeptVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend" name="Spend" fill={ACCENT} radius={[0, 4, 4, 0]} />
                <Bar dataKey="credit" name="Credit" fill={"#06b6d4"} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Country + Currency */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {countryData.length > 0 && (
            <div style={card}>
              <SectionHeader icon={Globe} title="By Country" sub="Top 8 countries — hover for details" />
              <ResponsiveContainer width="100%" height={Math.max(220, countryData.length * 52)}>
                <BarChart data={countryData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(10, "#9ca3af")} />
                  <YAxis type="category" dataKey="name" tick={tk(10, "#374151")} width={66} />
                  <Tooltip content={<BarTT total={totalCountryVol} />} />
                  <Legend {...lgnd} />
                  <Bar dataKey="spend" name="Spend" fill={"#FF0000"} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="credit" name="Credit" fill={"#10b981"} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {currencyData.length > 0 && (
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
          )}
        </div>

        {/* Top Counterparties */}
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
        {selectedEntity === "__all__" && companyData.length > 1 && (
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

        {/* Legal Entity Details Card - Additional Info */}
        {selectedEntity !== "__all__" && selectedEntityDetails && (
          <div style={{ ...card, marginTop: 24, background: "#f8f7ff", borderColor: "#c4b5fd" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: ACCENT + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Building2 size={24} style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
                  {selectedEntityDetails.companyName}
                </h3>
                <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
                  {selectedEntityDetails.countryName && (
                    <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                      <Globe size={12} /> {selectedEntityDetails.countryName}
                    </span>
                  )}
                  {selectedEntityDetails.localCurrencyCode && (
                    <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                      <DollarSign size={12} /> Local: {selectedEntityDetails.localCurrencyCode}
                    </span>
                  )}
                  {selectedEntityDetails.foreignCurrencyCode && (
                    <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                      <DollarSign size={12} /> Foreign: {selectedEntityDetails.foreignCurrencyCode}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Companies</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>{entityCompaniesCount}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "block" }}>Transactions</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>{txCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {filteredExpenses.length === 0 && selectedEntity !== "__all__" && (
          <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
            <Building2 size={48} style={{ color: "#9ca3af", marginBottom: 16, opacity: 0.3 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              No Expenses Found
            </h3>
            <p style={{ fontSize: 13, color: "#9ca3af", maxWidth: 400, margin: "0 auto" }}>
              No expenses found for {selectedEntityDetails?.companyName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalytics;