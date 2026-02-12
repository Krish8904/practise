import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Services = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="mt-20 text-center font-satoshi text-gray-500">Loading services...</div>;
  if (!page?.sections) return <div className="mt-20 text-center font-satoshi">No content found.</div>;

  // 🔥 SAME POSITION LOGIC AS PREVIEW
  const getPos = (key, s) => {
    if (s.position !== undefined && s.position !== null && s.position !== "") {
      return Number(s.position);
    }
    if (key === "hero") return 1;
    if (key === "services") return 2;
    if (key === "cta") return 99;
    return 10;
  };

  return (
    <div className="w-full mt-20 font-poppins">
      {Object.keys(page.sections)
        .sort((a, b) => getPos(a, page.sections[a]) - getPos(b, page.sections[b]))
        .map((key) => {
          const section = page.sections[key];

          // --- HERO ---
          if (key === "hero") {
            return (
              <section key={key} className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  {section.mainText}
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                  {section.secondaryText}
                </p>
                <Link
                  to="/contact"
                  className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                >
                  {section.buttonText}
                </Link>
              </section>
            );
          }

          // --- SERVICES GRID ---
          if (key === "services") {
            const services = section.items || []; // 👈 alias once

            return (
              <section key={key} className="bg-gray-50 py-15">
                <div className="max-w-7xl mx-auto px-6 pb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-15 p-5 pt-0">
                    {services.map((item, i) => (
                      <div
                        key={i}
                        className={`bg-white p-8 rounded-xl border-t-4 ${item.color || "border-blue-600"
                          } shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`}
                      >
                        <div className="w-full h-70 bg-gray-100 rounded-2xl mb-6 overflow-hidden">
                          <img
                            src={
                              item.image
                                ? `${import.meta.env.VITE_API_URL}${item.image.startsWith("/") ? "" : "/uploads/"
                                }${item.image}`
                                : "/placeholder.png"
                            }
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                          {item.desc}
                        </p>
                        <Link
                          to="/contact"
                          className="text-blue-600 font-bold flex items-center group"
                        >
                          Learn more
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          } 


          // --- CTA ---
          if (key === "cta") {
            return (
              <section key={key} className="max-w-7xl mx-auto px-6 py-10 pb-10">
                <div className="bg-blue-50 rounded-[1rem]  p-12 md:p-20 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]"></div>
                  <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                      {section.title}
                    </h2>
                    <p className="text-black-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                      {section.text}
                    </p>
                    <Link
                      to={section.link || "/contact"}
                      className="inline-block  bg-blue-500  text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg"
                    >
                      {section.buttonText}
                    </Link>
                  </div>
                </div>
              </section>
            );
          }

          // --- CUSTOM SECTIONS ---
          return (
            <section
              key={key}
              className="max-w-7xl mx-auto px-6 py-16"
              style={{ textAlign: section.alignment || "left" }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {section.mainText}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-wrap">
                {section.secondaryText}
              </p>
            </section>
          );
        })}
    </div>
  );
};

export default Services;
