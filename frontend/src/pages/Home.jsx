import React, { useEffect, useState } from "react";
import ChatBot from "../components/Chatbot";

export default function Home() {
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/pages/home`)
        .then((res) => res.json())
        .then((data) => { setHomeData(data || {}); setLoading(false); })
        .catch((err) => { console.error("Failed to fetch home data:", err); setLoading(false); });
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);


  
  if (loading) return <p className="text-center mt-12">Loading homepage...</p>;

  
  
  const getAlignClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const sections = homeData.sections || {};
  const sortedSections = Object.keys(sections)
    .map((key) => ({ id: key, ...sections[key] }))
    .sort((a, b) => {
      const posA = Number(a.position ?? a.pos ?? 99);
      const posB = Number(b.position ?? b.pos ?? 99);
      return posA - posB;
    });

  return (
    <>
    <div className="w-full mt-20 bg-[#f5f3ef] text-[#1a1a1a]" style={{ fontFamily: "'poppins', sans-serif" }}>
      {sortedSections.map((section) => {
        const { id, type } = section;

        // ── CUSTOM ──
        if (type === "custom") {
          return (
            <section key={id} className={`max-w-7xl mx-auto px-12 py-16 ${getAlignClass(section.alignment)}`}>
              <h2 className="text-[2.2rem] font-light text-[#1a1a1a] mb-5 tracking-[-0.02em] m-0" style={{ fontFamily: "'poppins', serif" }}>
                {section.mainText}
              </h2>
              {section.secondaryText && (
                <p className="text-[0.95rem] text-[#888] leading-[1.75] font-light whitespace-pre-wrap">{section.secondaryText}</p>
              )}
            </section>
          );
        }

        // ── HERO ──
        if (id === "hero") {
          return (
            <section key={id} className="max-w-7xl font-poppins mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-10">
                <h1
                  className="text-[clamp(3rem,5.5vw,5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
                  style={{ fontFamily: "'poppins', serif" }}
                >
                  {(section.mainText || "").split("\n").map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </h1>
                {/* image strip */}
              <div className="h-60 mb-10">
                <div className="rounded-2xl overflow-hidden bg-[#d8d4cc]">
                  {section.image && <img src={`${import.meta.env.VITE_API_URL}${section.image}`} alt="Hero" className="w-full h-full object-cover" />}
                </div>
                
              </div>
                <div className="flex flex-col items-start  gap-6 pb-1.5">
                  <p className="text-md text-[#888] text-left leading-[1.75] font-light  max-w-70 m-0">
                    {section.secondaryText}
                  </p>
                  <div className="flex items-center gap-3">
                    {Array.isArray(section.buttons) && section.buttons.map((btn, i) => (
                      <a href={btn.link || "/call"} key={i} className="no-underline">
                        {i === 0 ? (
                          <button className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] px-6 py-3.5 rounded-full text-[0.85rem] font-medium border-none cursor-pointer transition-all duration-200 tracking-[0.02em]">
                            {btn.label}
                            <span className="w-5.5 h-5.5 rounded-full bg-[#f5f3ef] text-[#1a1a1a] flex items-center justify-center text-[0.75rem]">↗</span>
                          </button>
                        ) : (
                          <button className="inline-flex items-center bg-transparent text-[#888] hover:text-[#1a1a1a] px-5 py-3.5 rounded-full text-[0.85rem] font-light border border-[#d4d0c8] hover:border-[#888] cursor-pointer transition-all duration-200">
                            {btn.label}
                          </button>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              
            </section>
          );
        }

        // ── INTRO ──
        if (id === "intro") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-2 gap-16 items-center">
                <div className="h-90 rounded-2xl overflow-hidden bg-[#d0ccc4]">
                  {section.image && <img src={`${import.meta.env.VITE_API_URL}${section.image}`} alt="Intro" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="text-sm text-[#4a7c59] font-medium tracking-widest uppercase mb-4">Who We Are <span className="text-[#4a7c59] text-2xl">↴</span></p>
                  <p
                    className="text-3xl font-light leading-[1.45] tracking-[-0.02em] text-[#1a1a1a] m-0"
                    style={{ fontFamily: "'poppins', serif" }}
                  >
                    {section.secondaryText || "Applied AI built on data sovereignty."}
                  </p>
                </div>
              </div>
            </section>
          );
        }

        // ── STATS ──
        if (id === "stats") {
          const statsArray = Array.isArray(section.steps) ? section.steps : [];
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-4 border border-[#d4d0c8] rounded overflow-hidden">
                {statsArray.map((stat, i) => (
                  <div key={i} className={`px-8 py-10 text-center ${i < statsArray.length - 1 ? "border-r border-[#d4d0c8]" : ""}`}>
                    <span
                      className="block text-[clamp(2rem,3.5vw,3rem)] font-light tracking-[-0.03em] text-[#4a7c59] mb-2"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {stat.value}
                    </span>
                    <span className="text-[0.8rem] text-[#aaa] font-normal tracking-[0.04em] uppercase">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // ── WHAT WE DO ──
        if (id === "whatWeDo") {
          const items = Array.isArray(section.items) ? section.items : [];
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                <h2
                  className="text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
                  style={{ fontFamily: "'poppins', serif" }}
                >
                  {section.title || "What We Do"}
                </h2>
                <span className="text-[0.8rem] text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
                  {String(items.length).padStart(2, "0")} Areas
                </span>
              </div>
              <div className="grid grid-cols-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={`p-9 border-b border-[#d4d0c8] hover:bg-[#eceae4] transition-colors duration-200 ${(i + 1) % 3 !== 0 ? "border-r border-[#d4d0c8]" : ""}`}
                  >
                    <span className="block text-[0.75rem] text-[#bbb] tracking-[0.08em] mb-4" style={{ fontFamily: "'poppins', serif" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[1.1rem] font-normal text-[#1a1a1a] mb-3 tracking-[-0.01em]" style={{ fontFamily: "'poppins', serif" }}>
                      {item.heading}
                    </h3>
                    <p className="text-[0.875rem] text-[#888] leading-[1.7] font-light m-0">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // ── HOW WE WORK ──
        if (id === "howWeWork") {
          const steps = Array.isArray(section.steps) ? section.steps : [];
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-20">
              <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                <h2
                  className="text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
                  style={{ fontFamily: "'poppins', serif" }}
                >
                  {section.title || "How We Work"}
                </h2>
                <span className="text-[0.8rem] text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
                  {String(steps.length).padStart(2, "0")} Steps
                </span>
              </div>
              <ul className="list-none m-0 p-0">
                {steps.map((step, i) => (
                  <li
                    key={i}
                    className="grid items-center gap-7 px-4 py-5.5 border-b border-[#d4d0c8] rounded-xl transition-all duration-200 hover:bg-[#eceae4] hover:pl-6 first:border-t first:border-[#d4d0c8] group"
                    style={{ gridTemplateColumns: "60px 1fr auto" }}
                  >
                    <span
                      className="text-[0.8rem] text-[#c0bbb0] font-light text-right transition-colors duration-200 group-hover:text-[#4a7c59]"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[clamp(1.05rem,1.8vw,1.35rem)] font-normal text-[#1a1a1a] tracking-[-0.01em] transition-colors duration-200 group-hover:text-[#4a7c59]"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {step.title}
                    </span>
                    <span className="text-[0.875rem] text-[#999] leading-[1.65] font-light max-w-95">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        // ── CTA ──
        if (id === "cta") {
          return (
            <div
              key={id}
              className="max-w-7xl mx-auto px-12 pt-16 pb-20 grid gap-6 items-stretch"
              style={{ gridTemplateColumns: "auto 1fr" }}
            >
              <button className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] border-none px-8 rounded-2xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200">
                Free Quick Scan ↗
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
                    {section.mainText}
                  </h2>
                  <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                    {section.secondaryText}
                  </p>
                </div>
                <a
                  href={section.button?.link || "/contact"}
                  className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 no-underline shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
                  {section.button?.label || "Plan a Free Quick Scan"}
                </a>
              </div>
            </div>
          
        );
          
        }

        return null;
      })}
      <ChatBot />
    </div>
    </>
  );
}