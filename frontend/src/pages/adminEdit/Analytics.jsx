import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PhoneCall, Users, Building2, Mail, Briefcase,
  Wrench, BarChart3, TrendingUp, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

const API = "http://localhost:5000";

/* ── palette ── */
const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";
const GREEN = "#10b981";
const SLATE = "#64748b";
const ORANGE = "#f97316";
const PINK = "#ec4899";
const TEAL = "#14b8a6";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  cancelled: "#ef4444",
  Screening: "#3b82f6",
  "1st Round": "#8b5cf6",
  "2nd Round": "#6366f1",
  "Final Round": "#f97316",
  Rejected: "#ef4444",
  Hired: "#10b981",
};

/* ── custom tooltip ── */
const ChartTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
      fontFamily: "'DM Sans', sans-serif", fontSize: 12,
    }}>
      {label && <p style={{ color: "#94a3b8", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.stroke, display: "inline-block" }} />
          <span style={{ color: "#475569" }}>{p.name}: </span>
          <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── stat card ── */
const StatCard = ({ icon: Icon, value, label, sub, color, delay = 0 }) => (
  <div style={{
    background: "white", borderRadius: 16, padding: "20px 22px",
    border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    fontFamily: "'DM Sans', sans-serif", animation: `fadeUp 0.5s ease ${delay}ms both`,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <TrendingUp size={13} style={{ color: "#cbd5e1" }} />
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
  </div>
);

/* ── section wrapper ── */
const Section = ({ title, children, delay = 0 }) => (
  <div style={{ animation: `fadeUp 0.5s ease ${delay}ms both` }}>
    <p style={{
      fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.12em",
      textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Sans', sans-serif",
    }}>{title}</p>
    {children}
  </div>
);

/* ── chart card ── */
const ChartCard = ({ title, icon: Icon, color, children, height = 260 }) => (
  <div style={{
    background: "white", borderRadius: 16, border: "1px solid #f1f5f9",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "16px 20px", borderBottom: "1px solid #f8fafc",
    }}>
      {Icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color }} />
        </div>
      )}
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 20px 20px", height }}>{children}</div>
  </div>
);

/* ── recent row ── */
const Row = ({ primary, secondary, badge, badgeColor, date }) => {
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 20px", borderBottom: "1px solid #f8fafc",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{primary}</div>
        {secondary && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{secondary}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {date && <span style={{ fontSize: 11, color: "#94a3b8" }}>{fmt(date)}</span>}
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            background: (badgeColor || "#64748b") + "18", color: badgeColor || "#64748b",
            border: `1px solid ${(badgeColor || "#64748b")}30`, textTransform: "capitalize",
          }}>{badge}</span>
        )}
      </div>
    </div>
  );
};

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    callBookings: 0, applications: 0, contactInquiries: 0,
    companyRegistrations: 0, openRoles: 0, services: 0, useCases: 0,
    bookingStatuses: {}, applicationStatuses: {},
    recentBookings: [], recentApplications: [], recentContacts: [], recentCompanies: [],
    monthlyBookings: [], monthlyApps: [],
  });

  const fetchAll = async () => {
    try {
      const [bookingsRes, applicationsRes, contactsRes, companiesRes, pagesRes] =
        await Promise.allSettled([
          axios.get(`${API}/api/bookings`),
          axios.get(`${API}/api/career/applications`),
          axios.get(`${API}/api/contact`),
          axios.get(`${API}/api/companies`),
          axios.get(`${API}/api/pages`),
        ]);

      const bookings = bookingsRes.status === "fulfilled" ? bookingsRes.value.data : [];
      const applications = applicationsRes.status === "fulfilled" ? applicationsRes.value.data : [];
      const contacts = contactsRes.status === "fulfilled" ? contactsRes.value.data : [];
      const companies = companiesRes.status === "fulfilled" ? companiesRes.value.data.data ?? [] : [];
      const pages = pagesRes.status === "fulfilled" ? pagesRes.value.data : [];

      let services = 0, useCases = 0, openRoles = 0;
      pages.forEach((page) => {
        if (page.pageName === "services" && Array.isArray(page.sections?.services?.items))
          services = page.sections.services.items.length;
        if (page.pageName === "usecases" && Array.isArray(page.sections?.usecases?.items))
          useCases = page.sections.usecases.items.length;
        if (page.pageName === "career") {
          const cats = page.sections?.jobCategoriesSection?.jobCategories || [];
          openRoles = cats.reduce((a, c) => a + (c.jobs?.length || 0), 0);
        }
      });

      const bookingStatuses = bookings.reduce((acc, b) => {
        const s = b.status || "Pending"; acc[s] = (acc[s] || 0) + 1; return acc;
      }, {});

      const applicationStatuses = applications.reduce((acc, a) => {
        const s = a.status || "Screening"; acc[s] = (acc[s] || 0) + 1; return acc;
      }, {});

      /* monthly trend — last 6 months */
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthNames[d.getMonth()], bookings: 0, applications: 0, contacts: 0 };
      });

      const toKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}`; };
      bookings.forEach(b => { const m = last6.find(x => x.key === toKey(b.createdAt)); if (m) m.bookings++; });
      applications.forEach(a => { const m = last6.find(x => x.key === toKey(a.createdAt)); if (m) m.applications++; });
      contacts.forEach(c => { const m = last6.find(x => x.key === toKey(c.createdAt)); if (m) m.contacts++; });

      setData({
        callBookings: bookings.length, applications: applications.length,
        contactInquiries: contacts.length, companyRegistrations: companies.length,
        openRoles, services, useCases,
        bookingStatuses, applicationStatuses,
        recentBookings: bookings.slice(0, 5), recentApplications: applications.slice(0, 5),
        recentContacts: contacts.slice(0, 5), recentCompanies: companies.slice(0, 5),
        trend: last6,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: BLUE, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading analytics…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* derived chart data */
  const bookingPieData = Object.entries(data.bookingStatuses).map(([name, value]) => ({ name, value }));
  const appPieData = Object.entries(data.applicationStatuses).map(([name, value]) => ({ name, value }));
  const contentBarData = [
    { name: "Services", value: data.services, fill: PURPLE },
    { name: "Use Cases", value: data.useCases, fill: ORANGE },
    { name: "Open Roles", value: data.openRoles, fill: BLUE },
  ];
  const inquiryBarData = [
    { name: "Calls", value: data.callBookings, fill: BLUE },
    { name: "Applications", value: data.applications, fill: PURPLE },
    { name: "Contacts", value: data.contactInquiries, fill: SLATE },
    { name: "Companies", value: data.companyRegistrations, fill: GREEN },
  ];

  const tk = { fontSize: 11, fill: "#94a3b8", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1300, paddingBottom: 60 }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, animation: "fadeUp 0.4s ease both" }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Analytics</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Platform-wide activity snapshot &nbsp;
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#f0fdf4", color: "#16a34a", fontSize: 11, borderRadius: 20, border: "1px solid #bbf7d0" }}>
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              Live
            </span>
          </p>
        </div>
        <button onClick={fetchAll} className="inline-flex items-center gap-1 p-[7px] bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-90"
        >
          <RefreshCw size={13} className={`${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <Section title="Inquiries & Submissions" delay={50}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard icon={PhoneCall} value={data.callBookings} label="Call Bookings" sub="via Book a Call" color={BLUE} delay={50} />
          <StatCard icon={Users} value={data.applications} label="Job Applications" sub="via Careers page" color={PURPLE} delay={100} />
          <StatCard icon={Mail} value={data.contactInquiries} label="Contact Inquiries" sub="via Contact Us" color={SLATE} delay={150} />
          <StatCard icon={Building2} value={data.companyRegistrations} label="Company Registrations" sub="via Company form" color={GREEN} delay={200} />
        </div>
      </Section>

      {/* ── Trend Chart ── */}
      <Section title="6-Month Trend" delay={200}>
        <div style={{ marginBottom: 28 }}>
          <ChartCard title="Activity Over Time" icon={TrendingUp} color={BLUE} height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gBook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={tk} />
                <YAxis tick={tk} allowDecimals={false} />
                <Tooltip content={<ChartTT />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke={BLUE} strokeWidth={2} fill="url(#gBook)" dot={{ r: 3, fill: BLUE }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="applications" name="Applications" stroke={PURPLE} strokeWidth={2} fill="url(#gApp)" dot={{ r: 3, fill: PURPLE }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="contacts" name="Contacts" stroke={TEAL} strokeWidth={2} fill="url(#gCon)" dot={{ r: 3, fill: TEAL }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </Section>

      {/* ── Bar Charts Row ── */}
      <Section title="Breakdown" delay={300}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>

          {/* Inquiry totals bar */}
          <ChartCard title="Inquiry Totals" icon={BarChart3} color={BLUE} height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inquiryBarData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={tk} />
                <YAxis tick={tk} allowDecimals={false} />
                <Tooltip content={<ChartTT />} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {inquiryBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Content bar */}
          <ChartCard title="Content Items" icon={Wrench} color={PURPLE} height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentBarData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={tk} />
                <YAxis tick={tk} allowDecimals={false} />
                <Tooltip content={<ChartTT />} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {contentBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </Section>

      {/* ── Pie Charts Row ── */}
      <Section title="Status Distribution" delay={350}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>

          {/* Booking statuses pie */}
          <ChartCard title="Call Booking Statuses" icon={PhoneCall} color={BLUE} height={240}>
            {bookingPieData.length === 0
              ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>No data yet</div>
              : <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bookingPieData} cx="40%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} stroke="none">
                    {bookingPieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />)}
                  </Pie>
                  <Tooltip content={<ChartTT />} />
                  <Legend iconType="circle" iconSize={8} layout="vertical" align="right" verticalAlign="middle"
                    wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                </PieChart>
              </ResponsiveContainer>
            }
          </ChartCard>

          {/* Application statuses pie */}
          <ChartCard title="Application Statuses" icon={Users} color={PURPLE} height={240}>
            {appPieData.length === 0
              ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>No data yet</div>
              : <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appPieData} cx="40%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3} stroke="none">
                    {appPieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />)}
                  </Pie>
                  <Tooltip content={<ChartTT />} />
                  <Legend iconType="circle" iconSize={8} layout="vertical" align="right" verticalAlign="middle"
                    wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                </PieChart>
              </ResponsiveContainer>
            }
          </ChartCard>
        </div>
      </Section>

      {/* ── Recent Activity ── */}
      <Section title="Recent Activity" delay={400}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          <ChartCard title="Recent Call Bookings" icon={PhoneCall} color={BLUE} height="auto">
            {data.recentBookings.length === 0
              ? <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No bookings yet</div>
              : data.recentBookings.map((b) => (
                <Row key={b._id} primary={b.name} secondary={`${b.date} at ${b.time} · ${b.phone}`}
                  badge={b.status} badgeColor={STATUS_COLORS[b.status]} date={b.createdAt} />
              ))
            }
          </ChartCard>

          <ChartCard title="Recent Job Applications" icon={Users} color={PURPLE} height="auto">
            {data.recentApplications.length === 0
              ? <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No applications yet</div>
              : data.recentApplications.map((a) => (
                <Row key={a._id} primary={`${a.firstName} ${a.lastName}`} secondary={a.email}
                  badge={a.status} badgeColor={STATUS_COLORS[a.status]} date={a.createdAt} />
              ))
            }
          </ChartCard>

          <ChartCard title="Recent Contact Inquiries" icon={Mail} color={SLATE} height="auto">
            {data.recentContacts.length === 0
              ? <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No inquiries yet</div>
              : data.recentContacts.map((c) => (
                <Row key={c._id} primary={`${c.firstName} ${c.lastName}`} secondary={c.email} date={c.createdAt} />
              ))
            }
          </ChartCard>

          <ChartCard title="Recent Company Registrations" icon={Building2} color={GREEN} height="auto">
            {data.recentCompanies.length === 0
              ? <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No registrations yet</div>
              : data.recentCompanies.map((c) => (
                <Row key={c._id} primary={c.companyName} secondary={`${c.companyEmail} · ${c.companyId || ""}`} date={c.createdAt} />
              ))
            }
          </ChartCard>
        </div>
      </Section>

    </div>
  );
}

export default Analytics;