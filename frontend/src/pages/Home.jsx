import React, { useEffect, useState } from "react";
import MainImage from "../assets/images/main.avif";
import Second from "../assets/images/second.avif";

export default function Home() {
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/pages/home`)
        .then((res) => res.json())
        .then((data) => {
          setHomeData(data || {});
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch home data:", err);
          setLoading(false);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center mt-12">Loading homepage...</p>;

  // Helper to get alignment classes for custom sections
  const getAlignClass = (align) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const colorMap = {
    "blue-600": "text-blue-600",
    "green-600": "text-green-600",
    "purple-600": "text-purple-600",
    "orange-600": "text-orange-600",
  };

  // --- DYNAMIC SECTION SORTER (REPAIRED) ---
  const sections = homeData.sections || {};
  const sortedSections = Object.keys(sections)
    .map((key) => ({ 
        id: key, 
        ...sections[key] 
    }))
    .sort((a, b) => {
      // This looks for 'position' (AddSection) or 'pos' (Editor)
      // and converts to Number to ensure 2 comes before 10
      const posA = Number(a.position ?? a.pos ?? 99);
      const posB = Number(b.position ?? b.pos ?? 99);
      return posA - posB;
    });

  return (
    <div className="mt-15 max-w-7xl mx-auto px-4 py-16 space-y-32 font-satoshi">
      {sortedSections.map((section) => {
        const { id, type } = section;

        // 1. CUSTOM SECTION RENDERER
        if (type === "custom") {
          return (
            <div key={id} className={`py-10 ${getAlignClass(section.alignment)}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{section.mainText}</h2>
              {section.secondaryText && (
                <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed whitespace-pre-wrap">
                  {section.secondaryText}
                </p>
              )}
            </div>
          );
        }

        // 2. HERO SECTION
        if (id === "hero") {
          return (
            <div key={id} className="flex flex-col md:flex-row items-center gap-8">
              <div>
                <h1 className="text-5xl font-bold leading-tight ml-10 mb-6 text-gray-900">
                  {(section.mainText || "").split("\n").map((line, i) => (
                    <span key={i}>
                      {line.includes("hidden value") ? (
                        <span className="text-blue-600">{line}</span>
                      ) : (
                        line
                      )}
                      <br />
                    </span>
                  ))}
                </h1>
                <p className="text-gray-700 ml-10 max-w-xl mb-6">{section.secondaryText}</p>
                <div className="flex ml-10 gap-6">
                  {Array.isArray(section.buttons) &&
                    section.buttons.map((btn, i) => (
                      <a href={btn.link || "/services"} key={i}>
                        <button className={`px-6 py-3 rounded-lg transition ${i === 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-blue-600 text-blue-600 hover:bg-blue-50"}`}>
                          {btn.label}
                        </button>
                      </a>
                    ))}
                </div>
              </div>
              <img src={MainImage} alt="Main" className="h-70 w-250 rounded-xl shadow-lg object-cover" />
            </div>
          );
        }

        // 3. INTRO SECTION
        if (id === "intro") {
          return (
            <div key={id} className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <img src={Second} alt="Secondary" className="ml-15 h-80 rounded-xl shadow-lg object-cover" />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-medium leading-relaxed mb-6 text-gray-700">
                  {section.secondaryText || "Applied AI built on data sovereignty..."}
                </h3>
              </div>
            </div>
          );
        }

        // 4. STATS SECTION
        if (id === "stats") {
          const statsArray = Array.isArray(section.steps) ? section.steps : [];
          return (
            <div key={id} className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center items-center">
              {statsArray.map((stat, i) => (
                <div key={i} className={`pr-6 ${i !== statsArray.length - 1 ? "border-r border-gray-500" : ""}`}>
                  <h3 className={`text-4xl font-bold ${colorMap[stat.color] || "text-black"}`}>{stat.value}</h3>
                  <p className="text-gray-700 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          );
        }

        // 5. WHAT WE DO
        if (id === "whatWeDo") {
          const items = Array.isArray(section.items) ? section.items : [];
          return (
            <div key={id} className="space-y-12 ml-10">
              <h2 className="text-4xl font-bold text-gray-900">{section.title || "What We Do"} ↴</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {items.map((item, i) => (
                  <div key={i} className="p-6 border-l-4 border-blue-600 rounded-xl hover:shadow-lg transition bg-white shadow-sm">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.heading}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 6. HOW WE WORK
        if (id === "howWeWork") {
          const steps = Array.isArray(section.steps) ? section.steps : [];
          return (
            <div key={id} className="space-y-12">
              <h2 className="text-4xl font-bold pl-10 text-gray-900">{section.title || "How We Work"} ↴</h2>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                {steps.map((step, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                    <h3 className="font-semibold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 7. CTA SECTION
        if (id === "cta") {
          return (
            <div key={id} className="text-center space-y-6 p-10 bg-linear-to-r from-blue-50 to-white rounded-xl">
              <h2 className="text-4xl font-bold text-gray-900">{section.mainText}</h2>
              <p className="max-w-xl mx-auto text-gray-700">{section.secondaryText}</p>
              <a href={section.button?.link || "/contact"}>
                <button className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition">
                  {section.button?.label || "Plan a Free Quick Scan"}
                </button>
              </a>
            </div>  
          );
        }

        return null; 
      })}
    </div>
  );
}