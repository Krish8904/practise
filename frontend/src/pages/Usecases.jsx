import React, { useEffect, useState } from "react";
import axios from "axios";

const Usecases = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="mt-15 w-full text-center py-20">Loading...</div>;

  const s = pageData?.sections || {};

  // Get alignment class for sections
  const getAlignmentClass = (align) => {
    const alignLower = (align || "left").toLowerCase();
    if (alignLower === "center") return "text-center";
    if (alignLower === "right") return "text-right";
    return "text-left";
  };

  // Render custom section
  const renderCustomSection = (sectionId, position) => {
    const section = s[sectionId];
    if (!section) return null;

    const alignClass = getAlignmentClass(section.alignment);
    const bgClass = position % 2 !== 0 ? "bg-gray-50" : "bg-white";

    return (
      <section key={sectionId} className={`py-20 ${bgClass}`}>
        <div className={`max-w-6xl mx-auto px-6 ${alignClass}`}>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            {section.mainText}
          </h2>
          {section.secondaryText && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {section.secondaryText}
            </p>
          )}
        </div>
      </section>
    );
  };

  // Get all sections sorted by position
  const getSortedSections = () => {
    const allSections = [];

    // Add hero
    if (s.hero) {
      allSections.push({
        id: 'hero',
        position: s.hero.position || 1,
        type: 'hero',
        data: s.hero
      });
    }

    // Add usecases object (with items)
    if (s.usecases && Array.isArray(s.usecases.items)) {
      allSections.push({
        id: 'usecases',
        position: s.usecases.position || 2,
        type: 'usecases',
        data: s.usecases.items
      });
    }

    // Add CTA
    if (s.cta) {
      allSections.push({
        id: 'cta',
        position: s.cta.position || 999,
        type: 'cta',
        data: s.cta
      });
    }

    // Add custom sections
    Object.keys(s).forEach(key => {
      if (key !== 'hero' && key !== 'usecases' && key !== 'cta') {
        const section = s[key];
        if (section && section.type === "custom") {
          allSections.push({
            id: key,
            position: section.position || 999,
            type: 'custom',
            data: section
          });
        }
      }
    });

    return allSections.sort((a, b) => a.position - b.position);
  };

  const sortedSections = getSortedSections();

  return (
    <div className="mt-15 w-full">
      {sortedSections.map((section, index) => {
        const { id, type, data } = section;

        // Render Hero Section
        if (type === 'hero') {
          return (
            <section key={id} className="bg-gray-900 text-white py-24">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold mb-6">
                  {data.mainText || "Real Problems. Real Solutions."}
                </h1>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  {data.secondaryText || "We help teams solve complex technical and strategic challenges — from early-stage products to large-scale platforms."}
                </p>
              </div>
            </section>
          );
        }

        // Render Use Cases Array
        if (type === 'usecases') {
          return data.map((uc, i) => (
            <section key={`usecase-${i}`} className={`py-20 ${i % 2 !== 0 ? "bg-gray-50" : ""}`}>
              <div className={`max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center`}>
                <div className={i % 2 !== 0 ? "order-2 md:order-1" : ""}>
                  <span className="text-blue-600 text-xl font-semibold">
                    {uc.category}
                  </span>
                  <h2 className="text-3xl font-bold mt-2 mb-4">
                    {uc.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {uc.description}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    {uc.highlights?.map((h, hIdx) => (
                      <li key={hIdx}>• {h}</li>
                    ))}
                  </ul>
                </div>

                <div className={`bg-gray-100 rounded-2xl p-8 ${i % 2 !== 0 ? "order-1 md:order-2" : ""}`}>
                  <h4 className="font-semibold mb-4">Outcome</h4>
                  <div className="flex flex-col gap-3">
                    {uc.outcome?.map((o, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-3">
                        <span className="mt-1">▶</span>
                        <p className="text-gray-600">{o}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ));
        }

        // Render CTA Section
        if (type === 'cta') {
          return (
            <section key={id} className="bg-linear-to-b from-gray-900 to-black py-20 text-white">
              <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-6">
                  {data.mainText || "Built for Teams That Want Momentum"}
                </h2>
                <p className="text-gray-300 max-w-3xl pb-3 mx-auto text-lg mb-8">
                  {data.secondaryText || "We partner with teams that want to move with purpose — balancing speed, quality, and long-term thinking."}
                </p>
                <hr className="pb-10" />
                <h2 className="text-4xl font-bold mb-4">
                  {data.contactText || "Let's Talk About Your Challenge"}
                </h2>
                <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-6">
                  {data.contactDescription || "If you're facing a technical or strategic problem, we'd love to understand it and explore whether we're the right partner."}
                </p>
                <div className="flex justify-center gap-6 flex-wrap">
                  {data.buttons?.map((btn, btnIdx) => (
                    <a
                      key={btnIdx}
                      href={btn.link}
                      className={
                        btn.type === 'primary'
                          ? "bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-black cursor-pointer hover:text-white hover:border hover:border-white transition"
                          : "border-white px-8 py-4 cursor-pointer font-bold border rounded-xl hover:bg-white hover:text-black hover:border hover:border-black transition"
                      }
                    >
                      {btn.label}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Render Custom Section
        if (type === 'custom') {
          return renderCustomSection(id, index);
        }

        return null;
      })}
    </div>
  );
};

export default Usecases;