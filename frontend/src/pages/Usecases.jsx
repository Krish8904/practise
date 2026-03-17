import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBot from "../components/Chatbot";

const Usecases = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredUc, setHoveredUc] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/usecases`);
        setPageData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="mt-20 w-full text-center py-20">Loading...</div>;

  const s = pageData?.sections || {};

  const getAlignmentClass = (align) => {
    const a = (align || "left").toLowerCase();
    if (a === "center") return "text-center";
    if (a === "right") return "text-right";
    return "text-left";
  };

  const getSortedSections = () => {
    const allSections = [];
    if (s.hero) allSections.push({ id: "hero", position: s.hero.position || 1, type: "hero", data: s.hero });
    if (s.usecases && Array.isArray(s.usecases.items)) allSections.push({ id: "usecases", position: s.usecases.position || 2, type: "usecases", data: s.usecases.items });
    if (s.cta) allSections.push({ id: "cta", position: s.cta.position || 999, type: "cta", data: s.cta });
    Object.keys(s).forEach(key => {
      if (key !== "hero" && key !== "usecases" && key !== "cta") {
        const section = s[key];
        if (section?.type === "custom") allSections.push({ id: key, position: section.position || 999, type: "custom", data: section });
      }
    });
    return allSections.sort((a, b) => a.position - b.position);
  };

  const sortedSections = getSortedSections();

  return (
    <>
    <div className="font-dm-sans font-normal antialiased bg-[#f5f3ef] text-[#1a1a1a] w-full mt-20">
      {sortedSections.map((section) => {
        const { id, type, data } = section;

        // ── HERO ──
        if (type === "hero") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-10 items-end mb-10">
                <h1 className="font-fraunces text-[clamp(3rem,5.5vw,5rem)] font-light leading-tight tracking-tight text-[#1a1a1a]">
                  {data.mainText || "Real Problems. Real Solutions."}
                </h1>
                <div className="flex flex-col items-start lg:items-end gap-5 pb-1.5">
                  <p className="font-light text-sm text-[#888] leading-relaxed text-left lg:text-right max-w-70">
                    {data.secondaryText}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#4a7c59] font-medium tracking-wider uppercase">
                    <span className="w-1.75 h-1.75 rounded-full bg-[#4a7c59] shadow-[0_0_0_3px_rgba(74,124,89,0.2)]" />
                    Use Cases
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ── USE CASES ──
        if (type === "usecases") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                <h2 className="font-fraunces text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-tight text-[#1a1a1a] leading-tight mb-0 lg:mb-0">
                  Case <em className="italic text-[#4a7c59]">Studies</em>
                </h2>
                <span className="text-xs text-[#aaa] tracking-widest uppercase font-medium pb-1 mt-4 lg:mt-0">
                  {String(data.length).padStart(2, "0")} Cases
                </span>
              </div>
              {data.map((uc, i) => (
                <div
                  key={`uc-${i}`}
                  className="border-b border-[#d4d0c8] py-13 px-4 rounded-xl transition-colors duration-300 first:border-t border-[#d4d0c8] hover:bg-[#eceae4]"
                  onMouseEnter={() => setHoveredUc(i)}
                  onMouseLeave={() => setHoveredUc(null)}
                >
                  {/* row header */}
                  <div className="grid grid-cols-[60px_1fr_auto] items-center gap-7 mb-8 lg:grid-cols-[60px_1fr_auto]">
                    <span className="font-fraunces text-xs text-[#c0bbb0] font-light text-right transition-colors duration-200 group-hover:text-[#4a7c59]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <span className="block text-[0.72rem] font-medium tracking-widest uppercase text-[#4a7c59] mb-1.5">
                        {uc.category}
                      </span>
                      <h2 className="font-fraunces text-[clamp(1.3rem,2.5vw,2rem)] font-normal text-[#1a1a1a] tracking-tight leading-tight transition-colors duration-200 mb-0 group-hover:text-[#4a7c59]">
                        {uc.title}
                      </h2>
                    </div>
                    <div className="w-11 h-11 rounded-full border-1.5 border-[#c8c4bc] bg-transparent text-[#aaa] flex items-center justify-center text-sm shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] -rotate-45 scale-[0.9] hover:bg-[#4a7c59] hover:text-[#f5f3ef] hover:border-[#4a7c59] hover:rotate-0 hover:scale-100">
                      →
                    </div>
                  </div>

                  {/* expanded body */}
                  <div className="grid grid-cols-[60px_1fr_1fr] gap-7 md:grid-cols-[60px_1fr_1fr] xl:grid-cols-[60px_1fr_1fr]">
                    <div className="w-10 md:block hidden" /> {/* spacer */}
                    <div>
                      <p className="text-sm text-[#777] leading-relaxed font-light mb-5 ">{uc.description}</p>
                      <ul className="list-none m-0 p-0">
                        {uc.highlights?.map((h, hi) => (
                          <li key={hi} className="flex items-start gap-3 py-2.5 border-b border-[#d4d0c8] text-xs text-[#555] leading-relaxed font-light first:border-t border-[#d4d0c8]">
                            <span className="w-4.5 h-4.5 mt-0.5 rounded-full bg-[#dceede] text-[#4a7c59] flex items-center justify-center text-[0.65rem] font-bold shrink-0">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="hidden md:block xl:block">
                      <span className="block text-[0.72rem] font-medium tracking-widest uppercase text-[#aaa] mb-4">
                        Outcomes
                      </span>
                      <ul className="list-none m-0 p-0">
                        {uc.outcome?.map((o, oi) => (
                          <li key={oi} className="flex items-start gap-3.5 py-3 border-b border-[#d4d0c8] text-xs text-[#555] leading-relaxed font-light first:border-t border-[#d4d0c8]">
                            <span className="font-fraunces text-xs text-[#bbb] shrink-0 pt-0.5">
                              {String(oi + 1).padStart(2, "0")}
                            </span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          );
        }

        // ── CTA ──
        if (type === "cta") {
          return (
            <div key={id} className="max-w-7xl mx-auto px-12 pt-15 pb-20 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-3 items-stretch">
              <a 
                href={data.buttons?.[1]?.link || "/contact"} 
                className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-[#f5f3ef] border-none px-8 py-0 rounded-xl font-dm-sans text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-300 hover:bg-[#4a7c59] lg:py-4 lg:px-7"
              >
                Let's Talk ↗
              </a>
              <div className="bg-[#1a1a1a] rounded-xl px-12 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-light italic text-[clamp(1.1rem,2vw,1.6rem)] text-[#7ab98a] tracking-tight leading-tight mb-1">
                    {data.mainText || "Built for momentum"}
                  </h2>
                  <p className="text-[rgba(245,243,239,0.4)] text-xs leading-relaxed mb-5 font-light">
                    {data.secondaryText}
                  </p>
                  <div className="w-10 h-px bg-[rgba(255,255,255,0.15)] mb-5" />
                  <h2 className="font-light text-[clamp(1.3rem,2.5vw,2rem)] text-[#f5f3ef] tracking-tight leading-tight mb-2">
                    Let's talk about <em className="italic text-[#7ab98a]">your challenge</em>
                  </h2>
                  <p className="text-[rgba(245,243,239,0.45)] text-xs leading-relaxed font-light max-w-90">
                    {data.contactDescription}
                  </p>
                </div>
                <div className="flex flex-col gap-3 shrink-0 relative z-10 lg:flex-col">
                  {data.buttons?.map((btn, bi) => (
                    bi === 0
                      ? (
                        <a key={bi} href={btn.link} className="inline-flex items-center gap-2.5 bg-[#f5f3ef] text-[#1a1a1a] px-7 py-3.5 rounded-full font-dm-sans font-medium text-sm no-underline whitespace-nowrap transition-all duration-300 hover:bg-[#7ab98a] hover:scale-105">
                          <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
                          {btn.label}
                        </a>
                      )
                      : (
                        <a key={bi} href={btn.link} className="inline-flex items-center justify-center gap-2.5 bg-transparent text-[rgba(245,243,239,0.5)] px-7 py-3 rounded-full font-dm-sans font-normal text-sm no-underline whitespace-nowrap border-1.5 border-[rgba(245,243,239,0.15)] cursor-pointer transition-all duration-300 hover:border-[rgba(245,243,239,0.4)] hover:text-[#f5f3ef]">
                          {btn.label}
                        </a>
                      )
                  ))}
                </div>
                <div className="absolute -top-10 -right-10 w-45 h-45 rounded-full bg-[radial-gradient(circle,rgba(74,124,89,0.35)_0%,transparent_70%)] pointer-events-none" />
              </div>
            </div>
          );
        }

        // ── CUSTOM ──
        if (type === "custom") {
          return (
            <section key={id} className={`max-w-7xl mx-auto px-12 py-16 ${getAlignmentClass(data.alignment)}`}>
              <h2 className="font-fraunces text-[2.2rem] font-light text-[#1a1a1a] mb-5 tracking-tight">
                {data.mainText}
              </h2>
              {data.secondaryText && (
                <p className="whitespace-pre-wrap text-sm text-[#888] leading-relaxed font-light">
                  {data.secondaryText}
                </p>
              )}
            </section>
          );
        }

        return null;
      })}
      <ChatBot />
    </div>
  </>
  );
};

export default Usecases;
