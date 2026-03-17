import { useEffect, useState } from "react";
import axios from "axios";
import ChatBot from "../components/Chatbot";

const Company = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/company`);
        setPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load company page", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="mt-20 text-center">Loading…</div>;
  if (!page?.sections) return <div className="mt-20 text-center">No content</div>;

  const s = page.sections;

  const getAlignmentClass = (align) => {
    const a = (align || "center").toLowerCase();
    if (a === "center") return "text-center";
    if (a === "right") return "text-right";
    return "text-left";
  };

  const getSortedSections = () => {
    const allSections = [];
    if (s.hero)     allSections.push({ id: "hero",     position: s.hero.position     || 1,   type: "hero",     data: s.hero });
    if (s.section1) allSections.push({ id: "section1", position: s.section1.position || 2,   type: "section1", data: s.section1 });
    if (s.section2) allSections.push({ id: "section2", position: s.section2.position || 3,   type: "section2", data: s.section2 });
    if (s.section3) allSections.push({ id: "section3", position: s.section3.position || 4,   type: "section3", data: s.section3 });
    if (s.section4) allSections.push({ id: "section4", position: s.section4.position || 5,   type: "section4", data: s.section4 });
    Object.keys(s).forEach(key => {
      if (!["hero","section1","section2","section3","section4"].includes(key)) {
        const section = s[key];
        if (section?.type === "custom") allSections.push({ id: key, position: section.position || 999, type: "custom", data: section });
      }
    });
    return allSections.sort((a, b) => a.position - b.position);
  };

  const sortedSections = getSortedSections();

  return (
    <>
    <div className="w-full mt-20 bg-[#f5f3ef] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {sortedSections.map(({ id, type, data }) => {

        // ── HERO ──
        if (type === "hero") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-12">
                <h1
                  className="text-[clamp(3rem,5.5vw,5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
                  style={{ fontFamily: "'poppins', serif" }}
                >
                  {data.mainText || "About SubDuxion"}
                </h1>
                <div className="flex flex-col items-end gap-5 pb-1.5">
                  <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-[280px] m-0">
                    {data.secondaryText}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse" />
                    <span className="text-xs text-[#4a7c59] font-medium tracking-[0.1em] uppercase">Who We Are</span>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ── SECTION 1 — Why We Exist ──
        if (type === "section1") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-2 border border-[#d4d0c8] rounded-[20px] overflow-hidden">
                {/* left */}
                <div className="p-[52px_48px] border-r border-[#d4d0c8]">
                  <p className="text-xs text-[#4a7c59] font-medium tracking-[0.1em] uppercase mb-4">Our Purpose</p>
                  <h2
                    className="text-[clamp(1.8rem,3vw,2.4rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 mb-5 leading-[1.15]"
                    style={{ fontFamily: "'poppins', serif" }}
                    dangerouslySetInnerHTML={{ __html: data.left?.heading || "Why we <em>exist</em>" }}
                  />
                  <p className="text-sm text-[#888] leading-[1.75] font-light m-0">{data.left?.text}</p>
                </div>
                {/* right */}
                <div className="p-[52px_48px] bg-[#eceae4]">
                  <p className="text-xs text-[#aaa] font-medium tracking-[0.1em] uppercase mb-6">
                    {data.right?.heading || "What we believe"}
                  </p>
                  <ul className="list-none m-0 p-0">
                    {data.right?.points?.map((point, i) => (
                      <li key={i} className="flex items-start gap-4 py-4 border-b border-[#d4d0c8] first:border-t first:border-[#d4d0c8] text-sm text-[#555] leading-[1.6] font-light">
                        <span className="text-[0.75rem] text-[#bbb] shrink-0 pt-0.5" style={{ fontFamily: "'poppins', serif" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        }

        // ── SECTION 2 — What Makes Us Different ──
        if (type === "section2") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                <h2
                  className="text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
                  style={{ fontFamily: "'poppins', serif" }}
                  dangerouslySetInnerHTML={{ __html: data.mainText || "What makes us <em style='font-style:italic;color:#4a7c59'>different</em>" }}
                />
                <span className="text-[0.8rem] text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
                  {String(data.cards?.length || 0).padStart(2, "0")} Pillars
                </span>
              </div>
              <div className="grid grid-cols-3 border border-[#d4d0c8] rounded-[20px] overflow-hidden">
                {data.cards?.map((card, i) => (
                  <div
                    key={i}
                    className={`p-10 hover:bg-[#eceae4] transition-colors duration-200 ${i < (data.cards.length - 1) ? "border-r border-[#d4d0c8]" : ""}`}
                  >
                    <span className="block text-[0.75rem] text-[#bbb] tracking-[0.05em] mb-4" style={{ fontFamily: "'poppins', serif" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[1.15rem] font-normal text-[#1a1a1a] mb-3 tracking-[-0.01em] leading-[1.3]" style={{ fontFamily: "'poppins', serif" }}>
                      {card.heading}
                    </h3>
                    <p className="text-[0.875rem] text-[#888] leading-[1.7] font-light m-0">{card.description}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // ── SECTION 3 — How We Operate ──
        if (type === "section3") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                <h2
                  className="text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
                  style={{ fontFamily: "'poppins', serif" }}
                  dangerouslySetInnerHTML={{ __html: data.mainText || "How we <em style='font-style:italic;color:#4a7c59'>operate</em>" }}
                />
                <span className="text-[0.8rem] text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
                  {String(data.steps?.length || 0).padStart(2, "0")} Steps
                </span>
              </div>
              <ul className="list-none m-0 p-0">
                {data.steps?.map((step, i) => (
                  <li
                    key={i}
                    className="grid items-center gap-7 px-4 py-5.5 border-b border-[#d4d0c8] rounded-xl transition-all duration-200 hover:bg-[#eceae4] hover:pl-6 first:border-t first:border-[#d4d0c8] group"
                    style={{ gridTemplateColumns: "60px 1fr 1fr" }}
                  >
                    <span
                      className="text-[0.8rem] text-[#c0bbb0] font-light text-right transition-colors duration-200 group-hover:text-[#4a7c59]"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[clamp(1rem,1.8vw,1.3rem)] font-normal text-[#1a1a1a] tracking-[-0.01em] transition-colors duration-200 group-hover:text-[#4a7c59]"
                      style={{ fontFamily: "'poppins', serif" }}
                    >
                      {step.heading}
                    </span>
                    <span className="text-[0.875rem] text-[#999] leading-[1.65] font-light">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        // ── SECTION 4 — CTA strip ──
        if (type === "section4") {
          return (
            <div
              key={id}
              className="max-w-7xl mx-auto px-12 pt-16 pb-20  items-stretch"
              style={{ gridTemplateColumns: "auto 1fr" }}
            >
              <div className="bg-[#1a1a1a] rounded-2xl px-12 py-10 flex items-center justify-between gap-8 relative overflow-hidden">
                <div
                  className="absolute top-[-40px] right-[-40px] w-44 h-44 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(74,124,89,0.35) 0%, transparent 70%)" }}
                />
                <div className="relative z-10">
                  <h2
                    className="text-3xl font-light text-[#7ab98a] tracking-[-0.02em] leading-[1.] m-0 mb-1 italic"
                    style={{ fontFamily: "'poppins', serif" }}
                  >
                    {data.above?.mainText || "Built for momentum"}
                  </h2>
                  <p className="text-[rgba(245,243,239,0.4)] text-sm leading-[1.7] m-0 mb-5 font-light">
                    {data.above?.secondaryText}
                  </p>
                  <div className="w-10 h-px bg-white/15 mb-5" />
                  <h2
                    className="text-[clamp(1.3rem,2.5vw,2rem)] font-light text-[#f5f3ef] tracking-[-0.02em] leading-[1.2] m-0 mb-2"
                    style={{ fontFamily: "'poppins', serif" }}
                    dangerouslySetInnerHTML={{ __html: data.below?.mainText || "Let's <em style='font-style:italic;color:#7ab98a'>talk</em>" }}
                  />
                  <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                    {data.below?.secondaryText}
                  </p>
                </div>
                <a
                  href={data.button?.link || "/contact"}
                  className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 no-underline shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
                  {data.button?.label || "Contact Us"}
                </a>
              </div>
            </div>
          );
        }

        // ── CUSTOM ──
        if (type === "custom") {
          return (
            <section key={id} className={`max-w-7xl mx-auto px-12 py-16 ${getAlignmentClass(data.alignment)}`}>
              <h2
                className="text-[2.2rem] font-light text-[#1a1a1a] m-0 mb-5 tracking-[-0.02em]"
                style={{ fontFamily: "'poppins', serif" }}
              >
                {data.mainText}
              </h2>
              {data.secondaryText && (
                <p className="text-[0.95rem] text-[#888] leading-[1.75] font-light whitespace-pre-wrap">{data.secondaryText}</p>
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

export default Company;