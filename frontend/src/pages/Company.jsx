import { useEffect, useState } from "react";
import axios from "axios";

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

  // Get alignment class for sections
  const getAlignmentClass = (align) => {
    const alignLower = (align || "center").toLowerCase();
    if (alignLower === "center") return "text-center";
    if (alignLower === "right") return "text-right";
    return "text-left";
  };

  // Render custom section
  const renderCustomSection = (sectionId) => {
    const section = s[sectionId];
    if (!section) return null;

    const alignClass = getAlignmentClass(section.alignment);

    return (
      <section key={sectionId} className="py-20">
        <div className={`max-w-7xl mx-auto px-6 ${alignClass}`}>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">{section.mainText}</h2>
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

    // Add section1 (Why We Exist)
    if (s.section1) {
      allSections.push({
        id: 'section1',
        position: s.section1.position || 2,
        type: 'section1',
        data: s.section1
      });
    }

    // Add section2 (What Makes Us Different)
    if (s.section2) {
      allSections.push({
        id: 'section2',
        position: s.section2.position || 3,
        type: 'section2',
        data: s.section2
      });
    }

    // Add section3 (How We Operate)
    if (s.section3) {
      allSections.push({
        id: 'section3',
        position: s.section3.position || 4,
        type: 'section3',
        data: s.section3
      });
    }

    // Add section4 (Momentum & CTA)
    if (s.section4) {
      allSections.push({
        id: 'section4',
        position: s.section4.position || 5,
        type: 'section4',
        data: s.section4
      });
    }

    // Add custom sections
    Object.keys(s).forEach(key => {
      if (!['hero', 'section1', 'section2', 'section3', 'section4'].includes(key)) {
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
    <div className="w-full mt-15">
      {sortedSections.map((section) => {
        const { id, type, data } = section;

        // Render Hero
        if (type === 'hero') {
          return (
            <section key={id} className="bg-gray-900 text-white py-24">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold mb-6">
                  {data.mainText || "About SubDuxion"}
                </h1>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  {data.secondaryText || "We empower businesses through applied AI and strategic consulting."}
                </p>
              </div>
            </section>
          );
        }

        // Render Section1 (Why We Exist + What We Believe)
        if (type === 'section1') {
          return (
            <section key={id} className="py-20">
              <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    {data.left?.heading || "Why we exist"}
                  </h2>
                  <p className="text-gray-600">
                    {data.left?.text || ""}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-8">
                  <h3 className="font-semibold mb-4">
                    {data.right?.heading || "What we believe"}
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    {data.right?.points?.map((point, i) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        }

        // Render Section2 (What Makes Us Different)
        if (type === 'section2') {
          return (
            <section key={id} className="bg-gray-50 py-20">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">
                  {data.mainText || "What makes us different"}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {data.cards?.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow">
                      <h3 className="text-xl font-semibold mb-3">{card.heading}</h3>
                      <p className="text-gray-600">{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Render Section3 (How We Operate)
        if (type === 'section3') {
          return (
            <section key={id} className="py-20">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-12 text-center">
                  {data.mainText || "How we operate"}
                </h2>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  {data.steps?.map((step, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl p-6">
                      <h4 className="font-semibold mb-2">{step.heading}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Render Section4 (Momentum & CTA)
        if (type === 'section4') {
          return (
            <section key={id} className="bg-gray-900 text-white py-20 text-center">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl text-blue-600 font-bold mb-4">
                  {data.above?.mainText || "Built for momentum"}
                </h2>
                <p className="mb-12">
                  {data.above?.secondaryText || ""}
                </p>

                <hr className="mb-10 opacity-20" />

                <h2 className="text-3xl text-blue-600 font-bold mb-4">
                  {data.below?.mainText || "Let's talk"}
                </h2>
                <p className="mb-6">
                  {data.below?.secondaryText || ""}
                </p>

                <a
                  href={data.button?.link || "/contact"}
                  className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-xl cursor-pointer font-semibold hover:bg-gray-100 transition"
                >
                  {data.button?.label || "Contact Us"}
                </a>
              </div>
            </section>
          );
        }

        // Render Custom Section
        if (type === 'custom') {
          return renderCustomSection(id);
        }

        return null;
      })}
    </div>
  );
};

export default Company;