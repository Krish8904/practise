import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Target, Tag, Globe, DollarSign, List, Layers, ArrowRight } from "lucide-react";

const masterSections = [
  {
    title: "Company",
    label: "MASTERS",
    number: "01",
    subtitle: "Core company classification & structure",
    icon: Building2,
    highlight: "#3b82f6",
    subMasters: [
      { name: "Channel", path: "/admin/mainmasters/channel", icon: Target },
      { name: "Nature of Business", path: "/admin/mainmasters/natureofbusiness", icon: Globe },
      { name: "Category", path: "/admin/mainmasters/category", icon: Tag },
      { name: "Subcategory", path: "/admin/mainmasters/subcategory", icon: Layers },
    ],
  },
  {
    title: "Expense",
    label: "MASTERS",
    number: "02",
    subtitle: "Financial tracking & currency references",
    icon: DollarSign,
    highlight: "#8b5cf6",
    subMasters: [
      { name: "Types", path: "/admin/mainmasters/types", icon: List },
      { name: "Country", path: "/admin/mainmasters/country", icon: Globe },
      { name: "Currency", path: "/admin/mainmasters/currency", icon: DollarSign },
    ],
  },
];

const MastersPage = () => {
  const navigate = useNavigate();
  const [hoveredSub, setHoveredSub] = useState(null);

  return (
    <div style={{ fontFamily: "'poppins', sans-serif", minHeight: "100vh", background: "#f8fafc", padding: " 36px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');

        .master-card {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .master-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important;
        }
        .sub-btn {
          transition: background 0.14s ease, color 0.14s ease;
        }
        .quick-pill {
          transition: border-color 0.14s ease, color 0.14s ease, transform 0.14s ease;
        }
        .quick-pill:hover {
          transform: translateY(-1px);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu  { animation: fadeUp 0.4s ease both; }
        .d1  { animation-delay: 0.04s; }
        .d2  { animation-delay: 0.10s; }
        .d3  { animation-delay: 0.16s; }
        .d4  { animation-delay: 0.22s; }
      `}</style>

      {/* ── Page header ── */}
      <div className="fu" style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 700, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>
            Masters
          </h1>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", letterSpacing: "0.16em", fontFamily: "'DM Mono', monospace" }}>
            CONFIG
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 15, color: "#64748b" }}>
          Reference data that powers your entire admin system
        </p>

      </div>

      {/* ── Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
        {masterSections.map((sec, si) => {
          const SectionIcon = sec.icon;
          return (
            <div
              key={sec.number}
              className={`master-card fu d${si + 2}`}
              style={{
                background: "white",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #e8ecf0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Thin top bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${sec.highlight}, ${sec.highlight}44)` }} />

              {/* Header */}
              <div style={{ padding: "24px 24px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${sec.highlight}10`,
                      border: `1px solid ${sec.highlight}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <SectionIcon size={22} color={sec.highlight} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 23, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
                          {sec.title}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: sec.highlight,
                          letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace",
                        }}>
                          {sec.label}
                        </span>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>
                        {sec.subtitle}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 13,
                    fontWeight: 500, color: "#dde1e7",
                  }}>
                    {sec.number}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f1f5f9", margin: "0 24px" }} />

              {/* Sub-items */}
              <div style={{ padding: "12px 16px 14px" }}>
                {sec.subMasters.map((sub, idx) => {
                  const SubIcon = sub.icon;
                  const key = `${si}-${idx}`;
                  const isHov = hoveredSub === key;
                  return (
                    <button
                      key={sub.name}
                      className="sub-btn"
                      onClick={() => navigate(sub.path)}
                      onMouseEnter={() => setHoveredSub(key)}
                      onMouseLeave={() => setHoveredSub(null)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 11,
                        padding: "10px 12px", borderRadius: 9,
                        border: "none", cursor: "pointer", textAlign: "left",
                        background: isHov ? `${sec.highlight}0c` : "transparent",
                        marginBottom: idx < sec.subMasters.length - 1 ? 2 : 0,
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isHov ? `${sec.highlight}15` : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.14s ease",
                      }}>
                        <SubIcon size={15} color={isHov ? sec.highlight : "#94a3b8"} />
                      </div>
                      <span style={{
                        flex: 1, fontSize: 14.5, fontWeight: 600,
                        color: isHov ? sec.highlight : "#334155",
                        transition: "color 0.14s ease",
                      }}>
                        {sub.name}
                      </span>
                      <ArrowRight
                        size={13}
                        color={isHov ? sec.highlight : "#d1d5db"}
                        style={{ flexShrink: 0, transition: "transform 0.14s ease, color 0.14s ease", transform: isHov ? "translateX(2px)" : "none" }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{
                margin: "0 16px 16px",
                padding: "9px 13px",
                borderRadius: 8,
                background: `${sec.highlight}07`,
                border: `1px dashed ${sec.highlight}30`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500 }}>
                  {sec.subMasters.length} modules
                </span>
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: sec.highlight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ArrowRight size={10} color="white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default MastersPage;