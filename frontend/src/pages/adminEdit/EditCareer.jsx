import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AddSection from "../../components/AddSection";
import NewSectionEditor from "./NewSectionEditor";


const EditCareer = ({ pageTitle }) => {
  const [careerData, setCareerData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ content: "", subtext: "", order: "" });
  const [showAddSection, setShowAddSection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  const [activeSortColumn, setActiveSortColumn] = useState("pos");
  const [pos_order, setPosOrder] = useState("asc");
  const [main_text_order, setMainTextOrder] = useState("asc");
  const [subtext_order, setSubtextOrder] = useState("asc");

  // --- INFINITE SCROLL STATE ---
  const [showAllRows, setShowAllRows] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observer = useRef(null);

  const s = careerData.sections || {};

  // Build table data including custom sections
  const buildTableData = React.useMemo(() => {
    const baseData = [
      {
        id: 'hero',
        name: 'Hero Section',
        primary: s.hero?.mainText,
        secondary: s.hero?.secondaryText,
        align: s.hero?.alignment || "Center",
        pos: s.hero?.position || 1,
        isCustom: false
      },
      {
        id: 'whyWorkWithUs',
        name: 'Why Work With Us',
        primary: s.whyWorkWithUs?.title,
        secondary: `${s.whyWorkWithUs?.bullets?.length || 0} Bullets`,
        align: s.whyWorkWithUs?.alignment || "Center",
        pos: s.whyWorkWithUs?.position || 2,
        isCustom: false
      },
      {
        id: 'jobCategories',
        name: 'Job Categories',
        primary: "Career Openings",
        secondary: `${s.jobCategoriesSection?.jobCategories?.length || 0} Categories`,
        align: "Left",
        pos: s.jobCategoriesSection?.position || 3,
        isCustom: false
      },
      {
        id: 'benefits',
        name: 'Benefits',
        primary: s.benefits?.title,
        secondary: `${s.benefits?.bullets?.length || 0} Bullets`,
        align: s.benefits?.alignment || "Center",
        pos: s.benefits?.position || 4,
        isCustom: false
      },
      {
        id: 'contactCTA',
        name: 'Contact CTA',
        primary: s.contactCTA?.title,
        secondary: s.contactCTA?.buttonText,
        align: s.contactCTA?.alignment || "Left",
        pos: s.contactCTA?.position || 5,
        isCustom: false
      }
    ];

    // Add custom sections
    Object.keys(s).forEach(key => {
      if (!['hero', 'whyWorkWithUs', 'jobCategories', 'benefits', 'contactCTA'].includes(key)) {
        const section = s[key];
        if (section && section.type === "custom") {
          baseData.push({
            id: key,
            name: section.name || key,
            primary: section.mainText,
            secondary: section.secondaryText,
            align: section.alignment || "Center",
            pos: section.position || 999,
            isCustom: true
          });
        }
      }
    });

    return baseData;
  }, [s]);

  // STEP 1: FILTER
  const filteredData = React.useMemo(() => {
    return buildTableData.filter(row => {
      const matchContent = (row.primary || "").toLowerCase().includes(searchQuery.content.toLowerCase());
      const matchSubtext = (row.secondary || "").toLowerCase().includes(searchQuery.subtext.toLowerCase());
      const matchOrder = searchQuery.order === "" || row.pos.toString() === searchQuery.order;
      return matchContent && matchSubtext && matchOrder;
    });
  }, [buildTableData, searchQuery.content, searchQuery.subtext, searchQuery.order]);

  // STEP 2: SORT
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (activeSortColumn === "pos") {
        return pos_order === "asc" ? a.pos - b.pos : b.pos - a.pos;
      }
      if (activeSortColumn === "main_text") {
        const valA = (a.primary || "").toLowerCase();
        const valB = (b.primary || "").toLowerCase();
        return main_text_order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (activeSortColumn === "subtext") {
        const valA = (a.secondary || "").toLowerCase();
        const valB = (b.secondary || "").toLowerCase();
        return subtext_order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredData, activeSortColumn, pos_order, main_text_order, subtext_order]);

  // Intersection Observer for infinite scroll
  const lastRowRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    if (showAllRows) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !showAllRows) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setShowAllRows(true);
          setIsLoadingMore(false);
        }, 800);
      }
    }, { threshold: 0.1 });

    if (node) observer.current.observe(node);
  }, [showAllRows]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/career`);
      let data = res.data || {};

      // Check if sections exists and jobCategories is an object
      if (data.sections?.jobCategories && !Array.isArray(data.sections.jobCategories)) {
        data.sections.jobCategories = Object.values(data.sections.jobCategories);
      }

      setCareerData(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    let interval;
    if (!editingSection && !showFilterModal && !showAddSection) {
      interval = setInterval(fetchData, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [editingSection, showFilterModal, showAddSection, fetchData]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  // Reset infinite scroll when data changes
  useEffect(() => {
    setShowAllRows(false);
    setIsLoadingMore(false);
  }, [sortedData.length]);

  const handleSave = async (sectionId, updatedContent) => {
    try {
      const updatedSections = { ...careerData.sections };

      if (sectionId === 'jobCategories') {
        updatedSections.jobCategoriesSection = {
          ...updatedSections.jobCategoriesSection,
          jobCategories: updatedContent
        };
      } else {
        updatedSections[sectionId] = updatedContent;
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/career`, { sections: updatedSections });
      await fetchData();
      setEditingSection(null);
      alert("✅ Career section updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save changes.");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      // HARDCODED for career page - no pageName needed
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/career`);
      const currentPage = response.data;

      const updatedSections = { ...currentPage.sections };
      delete updatedSections[sectionId];

      // Reset positions to 1,2,3...
      const sectionsWithPosition = Object.entries(updatedSections)
        .filter(([id, section]) => typeof section === 'object' && section.position !== undefined)
        .map(([id, section]) => ({ id, section }));

      sectionsWithPosition.sort((a, b) => a.section.position - b.section.position);

      sectionsWithPosition.forEach(({ id, section }, index) => {
        updatedSections[id] = { ...section, position: index + 1 };
      });

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/career`, {
        sections: updatedSections,
      });

      await fetchData();
      setEditingSection(null);
      alert('Section deleted and positions reset!');
    } catch (err) {
      console.error("Delete Error:", err);
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) return <p className="text-center mt-12 font-semibold text-gray-600 animate-pulse">Loading dashboard...</p>;

  // Show initial 2 rows, or all rows if scrolled
  const currentRows = showAllRows ? sortedData : sortedData.slice(0, rowsPerPage);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get alignment style for preview
  const getAlignmentStyle = (align) => {
    const alignLower = (align || "center").toLowerCase();
    if (alignLower === "center") return "text-center";
    if (alignLower === "right") return "text-right";
    return "text-left";
  };

  // Render custom section in preview
  const renderCustomSection = (sectionId) => {
    const section = s[sectionId];
    if (!section) return null;

    const alignClass = getAlignmentStyle(section.alignment);

    return (
      <div key={sectionId} className={`bg-linear-to-r from-blue-50 to-white p-10 rounded-xl space-y-4 shadow-md ${alignClass}`}>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">{section.mainText}</h2>
        {section.secondaryText && (
          <p className="text-gray-700 max-w-2xl mx-auto">{section.secondaryText}</p>
        )}
      </div>
    );
  };

  // Get sorted sections for preview
  const getSortedSections = () => {
    const allSections = [];

    Object.keys(s).forEach(key => {
      const section = s[key];
      if (section && typeof section === 'object') {
        allSections.push({
          id: key,
          position: section.position || 999,
          data: section,
          isCustom: section.type === "custom"
        });
      }
    });

    return allSections.sort((a, b) => a.position - b.position);
  };

  // If editing or adding, show full-page editor
  if (editingSection || showAddSection) {
    return (
      <div className="h-full flex flex-col bg-white">
        {showAddSection ? (
          <AddSection
            pageName="career"
            onClose={() => setShowAddSection(false)}
            onSectionAdded={() => {
              fetchData();
              setShowAddSection(false);
              setShowAllRows(false);
            }}
          />
        ) : editingSection.isCustom ? (
          <NewSectionEditor
            section={editingSection}
            pageData={careerData}
            pageName="career"
            onClose={() => setEditingSection(null)}
            onRefresh={fetchData}
            onDelete={handleDeleteSection}
          />
        ) : (
          <SectionEditor
            section={editingSection}
            data={editingSection.id === 'jobCategories' ? careerData.sections.jobCategoriesSection.jobCategories : careerData.sections[editingSection.id]}
            onClose={() => setEditingSection(null)}
            onSave={(content) => handleSave(editingSection.id, content)}
          />

        )}
      </div>
    );
  }

  return (
    <div className="p-10 font-poppins bg-white min-h-screen text-left">

      {/* HEADER */}
      <div className="flex flex-row justify-between items-center w-full mb-10">
        <h2 className="text-4xl font-bold text-slate-800">{'Career '}</h2>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowFullPreview(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className={`${(searchQuery.content || searchQuery.subtext || searchQuery.order) ? 'bg-orange-500' : 'bg-blue-600'} text-white px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer transition-colors`}
          >
            Filter {(searchQuery.content || searchQuery.subtext || searchQuery.order) && "Active"}
          </button>
          <button
            onClick={() => setShowAddSection(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Create Career
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <table className="w-full text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="p-3 border border-gray-300 w-24 text-center cursor-pointer hover:bg-gray-200 transition-colors group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold">Sr.</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            <th
              className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("main_text"); setMainTextOrder(main_text_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">Main Content</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'main_text' && main_text_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'main_text' && main_text_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            <th
              className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("subtext"); setSubtextOrder(subtext_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">Subtext/Info</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'subtext' && subtext_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'subtext' && subtext_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            <th className="p-3 border border-gray-300 w-32 text-center">
              <span className="font-bold">Align</span>
            </th>

            <th
              className="p-3 border border-gray-300 w-24 text-center cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold">Order</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            <th className="p-3 border border-gray-300 w-24 text-center font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, idx) => (
            <tr
              key={row.id}
              ref={idx === rowsPerPage - 1 && !showAllRows ? lastRowRef : null}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 border border-gray-300 align-top text-center">{idx + 1}</td>
              <td className="p-3 border border-gray-300 font-medium whitespace-pre-wrap align-top">
                {row.primary}
                {row.isCustom && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Custom</span>
                )}
              </td>
              <td className="p-3 border border-gray-300 text-gray-600 align-top">{row.secondary}</td>
              <td className="p-3 border border-gray-300 align-top text-xs font-bold text-gray-400 uppercase text-center">{row.align}</td>
              <td className="p-3 border border-gray-300 align-top text-center">{row.pos}</td>
              <td className="p-3 border border-gray-300 align-top text-center">
                <button
                  onClick={() => setEditingSection(row)}
                  className="text-blue-500 hover:text-white p-2 border border-blue-100 rounded-2xl hover:bg-blue-600 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No sections match your filter...</td></tr>
          )}
          {isLoadingMore && (
            <tr>
              <td colSpan="6" style={{ height: "120px" }}>
                <div className="flex flex-col justify-center items-center h-full gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-400 font-medium">Loading more sections...</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4 py-2 px-4 border-t border-gray-100">
        <span className="text-[13px] text-gray-400">
          {sortedData.length > 0 ? 1 : 0}-{showAllRows ? sortedData.length : Math.min(rowsPerPage, sortedData.length)} of {sortedData.length}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-1 px-3 text-xs font-medium text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer transition-colors">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} className={`w-7 h-7 rounded text-xs cursor-pointer transition-all ${currentPage === i + 1 ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-400 hover:bg-gray-50"}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => paginate(currentPage + 1)} className="p-1 px-3 text-xs font-medium text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer transition-colors">Next</button>
        </div>
      </div>

      {/* FILTER MODAL */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-10000 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700 uppercase tracking-widest text-sm text-left">Search & Filter</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-red-500 text-3xl leading-none cursor-pointer">&times;</button>
            </div>
            <div className="p-6 space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Main Content</label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search titles..."
                  value={searchQuery.content}
                  onChange={(e) => { setSearchQuery({ ...searchQuery, content: e.target.value }); setShowAllRows(false); }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subtext / Info</label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search descriptions..."
                  value={searchQuery.subtext}
                  onChange={(e) => { setSearchQuery({ ...searchQuery, subtext: e.target.value }); setShowAllRows(false); }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Order (Pos)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search position..."
                  value={searchQuery.order}
                  onChange={(e) => { setSearchQuery({ ...searchQuery, order: e.target.value }); setShowAllRows(false); }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => { setSearchQuery({ content: "", subtext: "", order: "" }); setShowFilterModal(false); setShowAllRows(false); }}
                className="px-6 py-2 text-gray-500 font-bold text-sm cursor-pointer"
              >
                Clear
              </button>
              <button onClick={() => setShowFilterModal(false)} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold text-sm cursor-pointer">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH FIDELITY PREVIEW MODAL */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-slate-950/80 z-20000 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full h-full max-w-400 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 px-10">
              <div className="flex items-center gap-4">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Live Career Preview</span>
              </div>
              <button onClick={() => setShowFullPreview(false)} className="bg-white border border-gray-200 text-gray-400 hover:text-red-500 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              <div className="max-w-7xl mt-20 mx-auto px-6 py-16 font-satoshi space-y-20 text-left">
                {getSortedSections().map((section) => {
                  const { id, data, isCustom } = section;

                  // Render custom sections
                  if (isCustom) {
                    return renderCustomSection(id);
                  }

                  // Render built-in sections
                  if (id === 'hero') {
                    return (
                      <div key={id} className="text-center">
                        <h1 className="text-5xl font-bold mb-4 text-gray-900">{data.mainText}</h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">{data.secondaryText}</p>
                      </div>
                    );
                  }

                  if (id === 'whyWorkWithUs') {
                    return (
                      <div key={id} className="bg-linear-to-r from-blue-50 to-white p-10 rounded-xl space-y-4 text-center shadow-md border border-blue-50">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900">{data.title}</h2>
                        <p className="text-gray-700 max-w-2xl mx-auto">{data.text}</p>
                        <ul className="list-disc list-inside text-gray-700 mt-4 max-w-2xl mx-auto space-y-2">
                          {data.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    );
                  }

                  if (id === 'jobCategories') {
                    const jobData = s.jobCategoriesSection?.jobCategories || [];
                    return jobData.map((cat, catIndex) => (
                      <div key={`${id}-${catIndex}`} className="space-y-6">
                        <h2 className="text-4xl font-bold border-b-2 border-gray-300 pb-2 text-gray-900">{cat.category}</h2>
                        <div className="grid gap-8 md:grid-cols-2">
                          {cat.jobs?.map((job, j) => (
                            <div key={j} className="border-l-4 border-blue-600 bg-white rounded-xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
                              <h3 className="text-2xl font-semibold mb-2 text-gray-900">{job.title}</h3>
                              <p className="text-gray-500 mb-1"><span className="font-medium text-slate-800">Location:</span> {job.location}</p>
                              <p className="text-gray-500 mb-4"><span className="font-medium text-slate-800">Type:</span> {job.type}</p>
                              <p className="mb-4 text-gray-700 leading-relaxed">{job.description}</p>
                              <button className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md shadow-blue-100">Apply Now</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  }


                  if (id === 'benefits') {
                    return (
                      <div key={id} className="bg-linear-to-r from-blue-50 to-white p-10 rounded-xl text-center space-y-4 shadow-md border border-blue-50">
                        <h2 className="text-3xl font-bold mb-2 pb-5 text-gray-900">{data.title}</h2>
                        <ul className="list-disc list-inside text-gray-700 mt-4 max-w-2xl mx-auto space-y-3 text-left">
                          {data.bullets?.map((b, i) => <li key={i} className="hover:text-blue-600 transition-colors">{b}</li>)}
                        </ul>
                      </div>
                    );
                  }

                  if (id === 'contactCTA') {
                    return (
                      <div key={id} className="flex flex-col md:flex-row items-center justify-between pt-12 mt-14 mb-24 border-t border-gray-100">
                        <div className="flex flex-col text-left max-w-2xl md:ml-15">
                          <h2 className="text-2xl font-bold mb-2 text-gray-900">{data.title}</h2>
                          <p className="text-gray-700">{data.text}</p>
                        </div>
                        <button className="bg-linear-to-r md:mr-10 from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-purple-100 transition-all mt-8 md:mt-0 whitespace-nowrap">{data.buttonText}</button>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// SectionEditor now takes full page
const SectionEditor = ({ section, data, onClose, onSave }) => {
  const [temp, setTemp] = useState(JSON.parse(JSON.stringify(data)));
  const updateBullet = (idx, val) => { const b = [...temp.bullets]; b[idx] = val; setTemp({ ...temp, bullets: b }); };
  const addBullet = () => setTemp({ ...temp, bullets: [...(temp.bullets || []), ""] });
  const remBullet = (idx) => setTemp({ ...temp, bullets: temp.bullets.filter((_, i) => i !== idx) });
  const addCategory = () => setTemp([...temp, { category: "New Category", jobs: [] }]);
  const updateCatName = (ci, val) => { const nt = [...temp]; nt[ci].category = val; setTemp(nt); };
  const remCategory = (ci) => { if (window.confirm("Delete entire category?")) setTemp(temp.filter((_, i) => i !== ci)); };
  const addJob = (ci) => { const nt = [...temp]; nt[ci].jobs.push({ title: "New Position", location: "Remote", type: "Full-time", description: "" }); setTemp(nt); };
  const updateJob = (ci, ji, field, val) => { const nt = [...temp]; nt[ci].jobs[ji][field] = val; setTemp(nt); };
  const remJob = (ci, ji) => { const nt = [...temp]; nt[ci].jobs = nt[ci].jobs.filter((_, i) => i !== ji); setTemp(nt); };
  const isArrayMode = Array.isArray(temp);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-12 py-10 border-b flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Edit {section.name}</h3>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-red-500 text-3xl font-thin leading-none transition-all cursor-pointer">&times;</button>
      </div>
      <div className="flex-1 p-12 overflow-y-auto bg-white custom-scrollbar">
        {isArrayMode ? (
          <div className="space-y-20">
            {temp.map((cat, ci) => (
              <div key={ci} className="relative p-10 border-2 border-slate-50 rounded-4xl bg-white shadow-sm hover:shadow-xl hover:border-blue-50 transition-all duration-300">
                <button onClick={() => remCategory(ci)} className="absolute -top-5 -right-5 bg-white text-red-400 w-12 h-12 rounded-full flex items-center justify-center shadow-xl border border-red-50 hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-10">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Department / Group Title</label>
                  <input className="w-full p-5 bg-slate-50 border-none rounded-2xl text-2xl font-black text-slate-800 focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={cat.category} onChange={(e) => updateCatName(ci, e.target.value)} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {cat.jobs.map((job, ji) => (
                    <div key={ji} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-500">
                      <button onClick={() => remJob(ci, ji)} className="absolute top-6 right-6 text-slate-200 hover:text-red-500 transition-colors cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      <div className="space-y-5">
                        <div>
                          <label className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Job Name</label>
                          <input className="w-full bg-white p-4 rounded-xl border border-slate-100 font-bold text-slate-700 focus:border-blue-400 outline-none shadow-sm transition-all" value={job.title} onChange={(e) => updateJob(ci, ji, 'title', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Location</label>
                            <input className="w-full p-3 text-xs bg-white border border-slate-100 rounded-lg outline-none focus:border-blue-400" placeholder="Location" value={job.location} onChange={(e) => updateJob(ci, ji, 'location', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Type</label>
                            <input className="w-full p-3 text-xs bg-white border border-slate-100 rounded-lg outline-none focus:border-blue-400" placeholder="Type" value={job.type} onChange={(e) => updateJob(ci, ji, 'type', e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Detailed Description</label>
                          <textarea className="w-full p-4 text-xs bg-white border border-slate-100 rounded-xl resize-none min-h-[120px] outline-none focus:border-blue-400 shadow-sm leading-relaxed" placeholder="Describe the responsibilities..." value={job.description} onChange={(e) => updateJob(ci, ji, 'description', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button onClick={() => addJob(ci)} className="border-4 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center p-12 text-slate-300 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-500 cursor-pointer">
                    <span className="text-4xl font-light mb-2">+</span>
                    <span className="text-[11px] font-black uppercase tracking-widest">Append Position</span>
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addCategory} className="w-full py-10 border-4 border-dashed border-slate-100 text-slate-300 rounded-[3rem] font-black uppercase tracking-[0.4em] hover:text-blue-400 hover:bg-blue-50/30 hover:border-blue-100 transition-all duration-500 cursor-pointer">
              + Create New Department
            </button>
          </div>
        ) : (
          <div className="space-y-12 max-w-2xl mx-auto">
            {(temp.mainText !== undefined || temp.title !== undefined) && (
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 tracking-widest group-hover:text-blue-500 transition-colors">Primary Heading</label>
                <input className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] text-3xl font-black outline-none focus:ring-8 focus:ring-blue-50 transition-all" value={temp.mainText || temp.title} onChange={(e) => setTemp({ ...temp, [temp.mainText !== undefined ? 'mainText' : 'title']: e.target.value })} />
              </div>
            )}
            {(temp.secondaryText !== undefined || temp.text !== undefined) && (
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 tracking-widest group-hover:text-blue-500 transition-colors">Supportive Text / Body</label>
                <textarea className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] text-xl text-slate-600 leading-relaxed outline-none focus:ring-8 focus:ring-blue-50 transition-all" rows="6" value={temp.secondaryText || temp.text} onChange={(e) => setTemp({ ...temp, [temp.secondaryText !== undefined ? 'secondaryText' : 'text']: e.target.value })} />
              </div>
            )}
            {temp.buttonText !== undefined && (
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-4 tracking-widest group-hover:text-blue-500 transition-colors">Button Text</label>
                <input className="w-full p-4 bg-slate-50 border-none rounded-xl text-lg font-bold outline-none focus:ring-8 focus:ring-blue-50 transition-all" value={temp.buttonText} onChange={(e) => setTemp({ ...temp, buttonText: e.target.value })} />
              </div>
            )}
            {temp.bullets && (
              <div className="space-y-6">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Feature Points</label>
                {temp.bullets.map((b, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <input className="flex-1 p-4 bg-white border border-slate-100 rounded-xl outline-none focus:border-blue-400" value={b} onChange={(e) => updateBullet(i, e.target.value)} />
                    <button onClick={() => remBullet(i)} className="text-red-400 hover:text-red-600 px-2 cursor-pointer">&times;</button>
                  </div>
                ))}
                <button onClick={addBullet} className="w-full py-4 border-2 border-dashed border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">+ Add Bullet</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-10 border-t bg-gray-50/50 flex justify-end gap-6">
        <button onClick={onClose} className="px-8 py-3 text-slate-400 font-bold hover:text-red-500 transition-colors cursor-pointer">Cancel </button>
        <button onClick={() => onSave(temp)} className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold shadow-lg cursor-pointer hover:bg-black transition-all uppercase text-xs">Save Changes</button>
      </div>
    </div>
  );
};


export default EditCareer;