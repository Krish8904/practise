import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/services`);
        setPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load services page:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="mt-20 text-center text-[#888]">Loading services...</div>;
  if (!page?.sections) return <div className="mt-20 text-center">No content found.</div>;

  const getPos = (key, s) => {
    if (s.position !== undefined && s.position !== null && s.position !== "") return Number(s.position);
    if (key === "hero") return 1;
    if (key === "services") return 2;
    if (key === "cta") return 99;
    return 10;
  };

  return (
    <div className="w-full mt-20 bg-[#f5f3ef] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {Object.keys(page.sections)
        .sort((a, b) => getPos(a, page.sections[a]) - getPos(b, page.sections[b]))
        .map((key) => {
          const section = page.sections[key];

          // ── HERO ──
          if (key === "hero") {
            return (
              <section key={key} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
                <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-12">
                  <h1
                    className="text-[clamp(3rem,5.5vw,5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
                    style={{ fontFamily: "'poppins', serif" }}
                  >
                    {section.mainText}
                  </h1>
                  <div className="flex flex-col items-end gap-6 pb-1.5">
                    <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-70 m-0">
                      {section.secondaryText}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#aaa] tracking-widest uppercase font-medium">Since 2015</span>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] px-6 py-3.5 rounded-full text-sm font-medium no-underline transition-all duration-200 tracking-[0.02em]"
                      >
                        {section.buttonText}
                        <span className="w-5 h-5 rounded-full bg-[#f5f3ef] text-[#1a1a1a] flex items-center justify-center text-[0.7rem]">↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // ── SERVICES LIST ──
          if (key === "services") {
            const services = section.items || [];
            return (
              <section key={key} className="max-w-7xl mx-auto px-12 pt-8 pb-16">

                {/* ── Header ── */}
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#4a7c59] font-bold mb-3">
                      What we do
                    </p>
                    <h2
                      className="text-[clamp(2.4rem,4.5vw,4rem)] font-light tracking-[-0.03em] text-[#1a1a1a] m-0 leading-[1]"
                      style={{ fontFamily: "'Poppins', serif" }}
                    >
                      Services <em className="not-italic text-[#4a7c59]">&</em><br />Works
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-1 pb-1">
                    <span className="text-[3rem] font-extralight text-[#e0ddd6] leading-none tabular-nums">
                      {String(services.length).padStart(2, "0")}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.15em] text-[#bbb] font-semibold">
                      Total Services
                    </span>
                  </div>
                </div>

                {/* ── Magazine grid ── */}
                <div
                  className="grid gap-14"
                  style={{
                    gridTemplateColumns: "repeat(12, 1fr)",
                    gridAutoRows: "180px",
                  }}
                >
                  {services.map((item, i) => {
                    // Tile sizing pattern — cycles every 5 items
                    const pattern = i % 5;
                    let colSpan, rowSpan;
                    if (pattern === 0) { colSpan = "span 7"; rowSpan = "span 2"; }      // big left
                    else if (pattern === 1) { colSpan = "span 5"; rowSpan = "span 1"; } // small right top
                    else if (pattern === 2) { colSpan = "span 5"; rowSpan = "span 1"; } // small right bottom
                    else if (pattern === 3) { colSpan = "span 5"; rowSpan = "span 2"; } // big right
                    else { colSpan = "span 7"; rowSpan = "span 1"; }                    // wide left

                    const isBig = rowSpan === "span 2";

                    return (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-2xl cursor-pointer"
                        style={{ gridColumn: colSpan, gridRow: rowSpan }}
                      >
                        {/* Background image */}
                        <img
                          src={
                            item.image
                              ? `${import.meta.env.VITE_API_URL}${item.image.startsWith("/") ? "" : "/uploads/"}${item.image}`
                              : "/placeholder.png"
                          }
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Base overlay — always visible */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/30 to-transparent opacity-80" />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-[#4a7c59]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                        {/* Index — top left */}
                        <span
                          className="absolute top-4 left-5 text-[0.65rem] font-bold tracking-[0.15em] text-white/40 uppercase group-hover:text-white/70 transition-colors duration-300"
                          style={{ fontFamily: "'Poppins', serif" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        {/* Arrow — top right, appears on hover */}
                        <Link
                          to="/contact"
                          aria-label={`Go to ${item.title}`}
                          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/30 bg-white/10 text-white flex items-center justify-center no-underline opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                          style={{ fontSize: "0.85rem" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          →
                        </Link>

                        {/* Content — bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          <h3
                            className="text-white font-medium tracking-[-0.01em] m-0 leading-tight mb-1"
                            style={{
                              fontFamily: "'Poppins', serif",
                              fontSize: isBig ? "clamp(1.1rem,2vw,1.5rem)" : "clamp(0.9rem,1.5vw,1.1rem)",
                            }}
                          >
                            {item.title}
                          </h3>

                          {/* Description — only shows on big tiles or on hover for small */}
                          <p
                            className={`text-white/70 text-[0.78rem] leading-[1.6] font-light m-0 transition-all duration-300
                    ${isBig
                                ? "max-h-20 opacity-100"
                                : "max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100"
                              }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          // ── CTA ──
          if (key === "cta") {
            return (
              <div
                key={key}
                className="max-w-7xl mx-auto px-12 pt-6 pb-20 grid gap-6 items-stretch"
                style={{ gridTemplateColumns: "auto 1fr" }}
              >
                <button
                  onClick={() => navigate("/contact")}
                  className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] border-none px-8 rounded-2xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200"
                >
                  Book a Service ↗
                </button>
                <div className="bg-[#1a1a1a] rounded-2xl px-12 py-10 flex items-center justify-between gap-8 relative overflow-hidden">
                  <div
                    className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(74,124,89,0.35) 0%, transparent 70%)" }}
                  />
                  <div className="relative z-10">
                    <h2
                      className="text-[clamp(1.3rem,2.5vw,2rem)] font-light text-[#f5f3ef] tracking-[-0.02em] leading-[1.2] m-0 mb-2"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {section.title}
                    </h2>
                    <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                      {section.text}
                    </p>
                  </div>
                  <Link
                    to={section.link || "/contact"}
                    className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 no-underline shrink-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
                    {section.buttonText}
                  </Link>
                </div>
              </div>
            );
          }

          // ── CUSTOM ──
          return (
            <section
              key={key}
              className="max-w-7xl mx-auto px-12 py-16"
              style={{ textAlign: section.alignment || "left" }}
            >
              <h2
                className="text-[2.5rem] font-light text-[#1a1a1a] m-0 mb-5 tracking-[-0.02em]"
                style={{ fontFamily: "'poppins', serif" }}
              >
                {section.mainText}
              </h2>
              <p className="text-base text-[#888] leading-[1.75] font-light whitespace-pre-wrap">
                {section.secondaryText}
              </p>
            </section>
          );
        })}
    </div>
  );
};

export default Services;