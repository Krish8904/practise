import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Clock } from "lucide-react";
import Apply from "./Apply";


const Career = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplication, setShowApplication] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

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
      <div key={sectionId} className={`bg-linear-to-r from-blue-50 to-white p-10 rounded-xl space-y-4 shadow-md ${alignClass}`}>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">{section.mainText}</h2>
        {section.secondaryText && (
          <p className="text-gray-700 max-w-2xl mx-auto">{section.secondaryText}</p>
        )}
      </div>
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

    // Add whyWorkWithUs
    if (s.whyWorkWithUs) {
      allSections.push({
        id: 'whyWorkWithUs',
        position: s.whyWorkWithUs.position || 2,
        type: 'whyWorkWithUs',
        data: s.whyWorkWithUs
      });
    }

    if (s.jobCategoriesSection) {
      allSections.push({
        id: 'jobCategories',
        position: s.jobCategoriesSection.position || 3,
        type: 'jobCategories',
        data: s.jobCategoriesSection.jobCategories
      });
    }


    // Add benefits
    if (s.benefits) {
      allSections.push({
        id: 'benefits',
        position: s.benefits.position || 4,
        type: 'benefits',
        data: s.benefits
      });
    }

    // Add contactCTA
    if (s.contactCTA) {
      allSections.push({
        id: 'contactCTA',
        position: s.contactCTA.position || 5,
        type: 'contactCTA',
        data: s.contactCTA
      });
    }

    // Add custom sections
    Object.keys(s).forEach(key => {
      if (!['hero', 'whyWorkWithUs', 'jobCategories', 'benefits', 'contactCTA'].includes(key)) {
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
    <div className="max-w-7xl mt-20 mx-auto px-6 py-16 font-satoshi space-y-20">
      {sortedSections.map((section) => {
        const { id, type, data } = section;

        // Render Hero
        if (type === 'hero') {
          return (
            <div key={id} className="text-center">
              <h1 className="text-5xl font-bold mb-4 text-gray-900">
                {data.mainText || "Join Our Team at SubDuxion"}
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {data.secondaryText || "At SubDuxion, we empower businesses with applied AI, strategy, and engineering expertise."}
              </p>
            </div>
          );
        }

        // Render Why Work With Us
        if (type === 'whyWorkWithUs') {
          return (
            <div key={id} className="bg-linear-to-r from-blue-50 to-white p-10 rounded-xl space-y-4 text-center shadow-md">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{data.title}</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">{data.text}</p>
              <ul className="list-disc list-inside text-gray-700 mt-4 max-w-2xl mx-auto space-y-2">
                {data.bullets?.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          );
        }

        // Render Job Categories
        if (type === 'jobCategories') {
          return data.map((cat, catIndex) => (
            <div key={`${id}-${catIndex}`} className="space-y-6">
              <h2 className="text-4xl font-bold border-b-2 border-gray-300 pb-2 text-gray-900">
                {cat.category}
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                {cat.jobs.map((job, j) => (
                  <div
                    key={j}
                    className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-blue-400/40 hover:from-blue-500 hover:via-purple-500 hover:to-blue-400 transition-all duration-500"
                  >
                    <div className="relative bg-white rounded-3xl p-8 overflow-hidden">

                      {/* floating glow */}
                      <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-100 rounded-full blur-3xl opacity-30 group-hover:opacity-30 transition" />

                      {/* header */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {job.title}
                          </h3>

                          <div className="flex items-center gap-3 mt-4">
                            <span className="flex items-center gap-2 text-xs font-semibold bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full shadow-inner">
                              <MapPin size={13} />
                              {job.location}
                            </span>

                            <span className="flex items-center gap-2 text-xs font-semibold bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full shadow-inner">
                              <Clock size={13} />
                              {job.type}
                            </span>
                          </div>
                        </div>

                        {/* arrow indicator */}
                        <div className="translate-x-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        </div>
                      </div>

                      {/* separator */}
                      <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mb-6" />

                      {/* description */}
                      <p className="text-slate-600 leading-relaxed line-clamp-4 mb-8">
                        {job.description}
                      </p>

                      {/* CTA */}
                      <button
                        onClick={() => navigate(`/career/applyforjobs?job=${encodeURIComponent(job.title)}`)}
                        className="relative text-sm font-semibold text-blue-700 group/btn"
                      >
                        Apply
                        <span className="ml-2 inline-block transition-transform group-hover/btn:translate-x-1">→</span>
                        <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-600 group-hover/btn:w-full transition-all duration-300" />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ));
        }

        // Render Benefits
        if (type === 'benefits') {
          return (
            <div key={id} className="bg-linear-to-r from-blue-50 to-white p-10 rounded-xl text-center space-y-4 shadow-md">
              <h2 className="text-3xl font-bold mb-2 pb-5 text-gray-900">{data.title}</h2>
              <ul className="list-disc list-inside text-gray-700 mt-4 max-w-2xl mx-auto space-y-2 text-left">
                {data.bullets?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          );
        }

        // Render Contact CTA
        if (type === 'contactCTA') {
          return (
            <div key={id} className="flex flex-col md:flex-row items-center justify-between pt-4 mt-14">
              <div className="flex flex-col text-left max-w-2xl ml-15">
                <h2 className="text-xl font-bold mb-2 text-gray-900">{data.title}</h2>
                <p className="text-gray-700">{data.text}</p>
              </div>
              <button
                onClick={() => navigate(`/career/applyforjobs`)}
                className="bg-linear-to-r mr-10 from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition cursor-pointer whitespace-nowrap">
                {data.buttonText}
              </button>
            </div>
          );
        }

        if (type === 'custom') {
          return renderCustomSection(id);
        }

        return null;
      })}
    </div>
  );
};

export default Career;