import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Clock } from "lucide-react";

const Career = () => {
  const navigate = useNavigate();
  const openingsRef = useRef(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredJob, setHoveredJob] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/career`);
        setPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch career page", err);
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
    if (s.hero) allSections.push({ id: "hero", position: s.hero.position || 1, type: "hero", data: s.hero });
    if (s.whyWorkWithUs) allSections.push({ id: "whyWorkWithUs", position: s.whyWorkWithUs.position || 2, type: "whyWorkWithUs", data: s.whyWorkWithUs });
    if (s.jobCategoriesSection) allSections.push({ id: "jobCategories", position: s.jobCategoriesSection.position || 3, type: "jobCategories", data: s.jobCategoriesSection.jobCategories });
    if (s.benefits) allSections.push({ id: "benefits", position: s.benefits.position || 4, type: "benefits", data: s.benefits });
    if (s.contactCTA) allSections.push({ id: "contactCTA", position: s.contactCTA.position || 5, type: "contactCTA", data: s.contactCTA });
    Object.keys(s).forEach(key => {
      if (!["hero", "whyWorkWithUs", "jobCategories", "benefits", "contactCTA"].includes(key)) {
        const section = s[key];
        if (section?.type === "custom") allSections.push({ id: key, position: section.position || 999, type: "custom", data: section });
      }
    });
    return allSections.sort((a, b) => a.position - b.position);
  };

  const sortedSections = getSortedSections();

  return (
    <div className="font-dm-sans font-normal antialiased bg-[#f5f3ef] text-[#1a1a1a]">
      {sortedSections.map(({ id, type, data }) => {

        // ── HERO ──
        if (type === "hero") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-1 mt-20 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-10 items-end mb-5 lg:mb-10">
                <h1 className="font-fraunces text-[clamp(3rem,5.5vw,5rem)] font-light leading-tight tracking-tight text-[#1a1a1a] mb-0">
                  {data.mainText || "Join Our Team"}
                </h1>
                <div className="flex flex-col items-start lg:items-end mr-10 gap-6 pb-1.5">
                  <p className="font-light text-sm text-[#888] leading-relaxed text-left lg:text-right max-w-70 mb-0">
                    {data.secondaryText}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#aaa] tracking-wider uppercase font-medium">We're Hiring</span>
                    <button
                      className="group inline-flex items-center gap-2.5 bg-[#1a1a1a] text-[#f5f3ef] px-6.5 py-3.25 rounded-full font-dm-sans text-xs font-medium no-underline tracking-tight border-none cursor-pointer transition-all duration-300 hover:bg-[#4a7c59] hover:scale-[1.03]"
                      onClick={() => {
                        openingsRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });

                        setTimeout(() => {
                          window.scrollBy({ top: -100, behavior: "smooth" });
                        }, 300);
                      }}
                    >
                      See Openings
                      <span className="w-5.5 h-5.5 rounded-full bg-[#f5f3ef] text-[#1a1a1a] flex items-center justify-center text-xs">↗</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ── WHY WORK WITH US ──
        if (type === "whyWorkWithUs") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 pb-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="text-xs text-[#4a7c59] font-medium tracking-wider uppercase mb-4">Why Us</p>
                  <h2 className="font-fraunces text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-tight text-[#1a1a1a] mb-5 leading-tight">
                    {data.title}
                  </h2>
                  <p className="font-light text-sm text-[#888] leading-relaxed mb-0">{data.text}</p>
                </div>
                <ul className="list-none m-0 p-0">
                  {data.bullets?.map((b, i) => (
                    <li key={i} className="flex items-start gap-4 py-4.5 border-b border-[#d4d0c8] text-sm text-[#555] leading-relaxed font-light first:border-t border-[#d4d0c8]">
                      <span className="font-fraunces text-xs text-[#bbb] shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        }

        if (type === "jobCategories") {
          return (
            <section
              key={id}
              ref={openingsRef}
              className="max-w-7xl mx-auto px-12 pt-20 pb-0"
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
                <h2 className="font-fraunces text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-tight text-[#1a1a1a] mb-0 leading-tight lg:mb-0">
                  Open <em className="italic text-[#4a7c59]">Positions</em>
                </h2>
                <span className="text-xs text-[#aaa] tracking-widest uppercase font-medium mt-4 lg:mt-0 pb-1">
                  {data?.reduce((acc, cat) => acc + (cat.jobs?.length || 0), 0)} Roles
                </span>
              </div>
              {data?.map((cat, ci) => (
                <div key={ci} className="mb-14">
                  <p className="font-fraunces text-base font-normal text-[#4a7c59] tracking-tight uppercase mb-5 flex items-center gap-3 after:flex-1  after:bg-[#d4d0c8]">
                    {cat.category}
                  </p>
                  <ul className="list-none m-0 p-0">
                    {cat.jobs?.map((job, ji) => (
                      <li
                        key={ji}
                        className="grid grid-cols-[1fr_auto_auto_auto] lg:grid-cols-[1fr_auto_auto_auto] items-center gap-6 py-5 px-4 border-b border-[#d4d0c8] rounded-xl transition-all duration-200 first:border-t border-[#d4d0c8] hover:bg-[#eceae4] hover:pl-6"
                        onMouseEnter={() => setHoveredJob(`${ci}-${ji}`)}
                        onMouseLeave={() => setHoveredJob(null)}
                      >
                        <span className="font-fraunces text-[clamp(1.05rem,1.8vw,1.35rem)] font-normal text-[#1a1a1a] tracking-tight transition-colors duration-200 hover:text-[#4a7c59]">
                          {job.title}
                        </span>
                        <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap font-dm-sans bg-[#e8e6e0] text-[#666]">
                          <MapPin size={11} /> {job.location}
                        </span>
                        <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap font-dm-sans bg-[#dceede] text-[#3a6b48]">
                          <Clock size={11} /> {job.type}
                        </span>
                        <button
                          className="w-10 h-10 rounded-full border-1.5 border-[#c8c4bc] bg-transparent text-[#aaa] flex items-center justify-center text-sm shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] -rotate-45 scale-[0.9] cursor-pointer font-dm-sans hover:bg-[#4a7c59] hover:text-[#f5f3ef] hover:border-[#4a7c59] hover:rotate-0 hover:scale-100"
                          onClick={() => navigate(`/career/applyforjobs?job=${encodeURIComponent(job.title)}`)}
                          aria-label={`Apply for ${job.title}`}
                        >
                          →
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          );
        }

        // ── BENEFITS ──
        if (type === "benefits") {
          return (
            <section key={id} className="max-w-7xl mx-auto px-12 pt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <p className="text-xs text-[#4a7c59] font-medium tracking-wider uppercase mb-4">Perks & Benefits</p>
                <h2 className="font-fraunces text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-tight text-[#1a1a1a] leading-tight mb-0">
                  <em className="italic text-[#4a7c59]">{data.title}</em>
                </h2>
              </div>
              <ul className="list-none m-0 p-0">
                {data.bullets?.map((b, i) => (
                  <li key={i} className="flex items-start gap-4 py-4.5 border-b border-[#d4d0c8] text-sm text-[#555] leading-relaxed font-light first:border-t border-[#d4d0c8]">
                    <span className="w-7 h-7 mt-0.5 rounded-full bg-[#dceede] text-[#4a7c59] flex items-center justify-center text-xs shrink-0">✦</span>
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        // ── CONTACT CTA ──
        if (type === "contactCTA") {
          return (
            <div key={id} className="max-w-7xl mx-auto px-12 pt-15 pb-20 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-3 items-stretch">
              <button
                className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-[#f5f3ef] border-none px-8 py-0 rounded-xl font-dm-sans text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-300 hover:bg-[#4a7c59] lg:py-4 lg:px-7"
                onClick={() => navigate("/career/applyforjobs")}
              >
                Apply Now ↗
              </button>
              <div className="bg-[#1a1a1a] rounded-xl p-10 lg:px-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-light text-[clamp(1.3rem,2.5vw,2rem)] text-[#f5f3ef] tracking-tight leading-tight mb-2 ">
                    {data.title}
                  </h2>
                  <p className="text-[rgba(245,243,239,0.45)] text-xs leading-relaxed font-light max-w-90 mb-0">
                    {data.text}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2.5 bg-[#f5f3ef] text-[#1a1a1a] px-7 py-3.5 rounded-full font-dm-sans font-medium text-sm border-none cursor-pointer whitespace-nowrap transition-all duration-300 relative z-10 shrink-0 hover:bg-[#7ab98a] hover:scale-[1.04]"
                  onClick={() => navigate("/career/applyforjobs")}
                >
                  <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
                  {data.buttonText}
                </button>
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
                <p className="text-sm text-[#888] leading-relaxed font-light">
                  {data.secondaryText}
                </p>
              )}
            </section>
          );
        }

        return null;
      })}
    </div>
  );
};

export default Career;
