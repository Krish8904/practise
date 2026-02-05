import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";


const DynamicPage = () => {
  const { pageName } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const IMG_URL = `${import.meta.env.VITE_API_URL}/uploads/`;

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
        setPageData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load page:", err);
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageName]);

  if (loading) return <p className="text-center mt-20">Loading page...</p>;
  if (!pageData) return <p className="text-center mt-20">Page not found</p>;

  const s = pageData.sections || {};
  const stats = s.stats?.steps || [];
  const whatWeDo = s.whatWeDo?.items || [];
  const howWeWork = s.howWeWork?.steps || [];
  const cta = s.cta || {};

  const colorMap = {
    "blue-600": "text-blue-600",
    "green-600": "text-green-600",
    "purple-600": "text-purple-600",
    "orange-600": "text-orange-600",
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-32">

        {/* HERO SECTION */}
        {s.hero && (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div>
              <h1 className="text-5xl font-bold leading-tight ml-10 mb-6 text-gray-900 whitespace-pre-wrap">
                {(s.hero?.mainText || "").split("\n").map((line, i) => (
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
              <p className="text-gray-700 ml-10 max-w-xl mb-6">{s.hero?.secondaryText}</p>
              <div className="flex ml-10 gap-6">
                {Array.isArray(s.hero?.buttons) && s.hero.buttons.map((btn, i) => (
                  <button
                    key={i}
                    className={`px-6 py-3 rounded-lg ${i === 0 ? "bg-blue-600 text-white" : "border border-blue-600 text-blue-600"}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <img alt="Main" className="h-70 w-250 rounded-xl shadow-lg object-cover" />
          </div>
        )}

        {/* INTRO SECTION */}
        {s.intro && (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img alt="Secondary" className="ml-15 h-80 rounded-xl shadow-lg object-cover" />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-xl font-medium leading-relaxed text-gray-700">
                {s.intro?.secondaryText || "Applied AI built on data sovereignty..."}
              </h3>
            </div>
          </div>
        )}

        {/* STATS SECTION */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center items-center">
            {stats.map((stat, i) => (
              <div key={i} className={`pr-6 ${i !== stats.length - 1 ? "border-r border-gray-500" : ""}`}>
                <h3 className={`text-4xl font-bold ${colorMap[stat.color] || "text-black"}`}>{stat.value}</h3>
                <p className="text-gray-700 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* WHAT WE DO SECTION */}
        {whatWeDo.length > 0 && (
          <div className="space-y-12 ml-10">
            <h2 className="text-4xl font-bold text-gray-900">{s.whatWeDo?.title || "What We Do ↴"}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {whatWeDo.map((item, i) => (
                <div key={i} className="p-6 border-l-4 border-blue-600 rounded-xl bg-white shadow-sm">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.heading}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOW WE WORK SECTION */}
        {howWeWork.length > 0 && (
          <div className="space-y-12">
            <h2 className="text-4xl font-bold pl-10 text-gray-900">{s.howWeWork?.title || "How We Work ↴"}</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {howWeWork.map((step, i) => (
                <div key={i} className="p-4 bg-white rounded-xl shadow border border-gray-50">
                  <h3 className="font-semibold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA SECTION */}
        {cta.mainText && (
          <div className="text-center space-y-6 p-10 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-50">
            <h2 className="text-4xl font-bold text-gray-900">{cta.mainText}</h2>
            <p className="max-w-xl mx-auto text-gray-700">{cta.secondaryText}</p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg">
              {cta.button?.label || "Get Started"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPage;