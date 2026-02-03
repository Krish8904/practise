import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AddSection from "../../components/AddSection";
import NewSectionEditor from "./NewSectionEditor";
import ExportButton from "../../components/ExportButton";

const EditCompany = ({ pageTitle }) => {
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [showAddSection, setShowAddSection] = useState(false);

  // --- FILTER & SEARCH STATE ---
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ content: "", subtext: "", order: "" });

  // --- MULTI-COLUMN SORT STATE ---
  const [activeSortColumn, setActiveSortColumn] = useState("pos");
  const [pos_order, setPosOrder] = useState("asc");
  const [main_text_order, setMainTextOrder] = useState("asc");
  const [subtext_order, setSubtextOrder] = useState("asc");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  // --- INFINITE SCROLL STATE ---
  const [showAllRows, setShowAllRows] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observer = useRef(null);

  const s = companyData.sections || {};

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
        id: 'section1',
        name: 'Why We Exist & Believe',
        primary: s.section1?.left?.heading,
        secondary: `Points: ${s.section1?.right?.points?.length || 0} bullets`,
        align: s.section1?.alignment || "Left",
        pos: s.section1?.position || 2,
        isCustom: false
      },
      {
        id: 'section2',
        name: 'What Makes Us Different',
        primary: s.section2?.mainText,
        secondary: `Cards: ${s.section2?.cards?.map(c => c.heading).join(", ")}`,
        align: s.section2?.alignment || "Center",
        pos: s.section2?.position || 3,
        isCustom: false
      },
      {
        id: 'section3',
        name: 'How We Operate',
        primary: s.section3?.mainText,
        secondary: `Steps: ${s.section3?.steps?.map(s => s.heading).join(" → ")}`,
        align: s.section3?.alignment || "Center",
        pos: s.section3?.position || 4,
        isCustom: false
      },
      {
        id: 'section4',
        name: 'Momentum & CTA',
        primary: s.section4?.above?.mainText,
        secondary: `Button: ${s.section4?.button?.label} | Link: ${s.section4?.button?.link}`,
        align: s.section4?.alignment || "Center",
        pos: s.section4?.position || 5,
        isCustom: false
      }
    ];

    // Add custom sections
    Object.keys(s).forEach(key => {
      if (!['hero', 'section1', 'section2', 'section3', 'section4'].includes(key)) {
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

  // 1. FILTER FIRST
  const filteredData = React.useMemo(() => {
    return buildTableData.filter(row => {
      const matchContent = (row.primary || "").toLowerCase().includes(searchQuery.content.toLowerCase());
      const matchSubtext = (row.secondary || "").toLowerCase().includes(searchQuery.subtext.toLowerCase());
      const matchOrder = searchQuery.order === "" || row.pos.toString() === searchQuery.order;
      return matchContent && matchSubtext && matchOrder;
    });
  }, [buildTableData, searchQuery.content, searchQuery.subtext, searchQuery.order]);

  // 2. SORT THE ENTIRE FILTERED DATASET
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/company`);
      setCompanyData(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    let interval;
    if (!editingSection && !showFilterModal) {
      interval = setInterval(fetchData, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [editingSection, showFilterModal, fetchData]);

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

  const handleEditClick = (section) => {
    setEditingSection(section);
    setFormData(JSON.parse(JSON.stringify(companyData.sections[section.id] || {})));
  };

  const handleSave = async () => {
    try {
      const updatedSections = {
        ...companyData.sections,
        [editingSection.id]: formData
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/company`, {
        sections: updatedSections
      });

      await fetchData();
      setEditingSection(null);
      alert("✅ Changes saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving changes.");
    }
  };
  const handleDeleteSection = useCallback(async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section? This cannot be undone.")) return;

    try {
      // Fetch FRESH data from API (not stale local state)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/company`);
      const currentPage = response.data;

      const updatedSections = { ...currentPage.sections };
      delete updatedSections[sectionId];

      // Reset ALL positions to 1,2,3... consecutively (EXCLUDING core sections)
      const coreSections = ['hero', 'section1', 'section2', 'section3', 'section4'];
      const sectionsWithPosition = Object.entries(updatedSections)
        .filter(([id, section]) =>
          !coreSections.includes(id) &&  // Skip core sections
          typeof section === 'object' &&
          section.position !== undefined &&
          section.type === "custom"  // Only custom sections get repositioned
        )
        .map(([id, section]) => ({ id, section }));

      sectionsWithPosition.sort((a, b) => a.section.position - b.section.position);

      sectionsWithPosition.forEach(({ id, section }, index) => {
        updatedSections[id] = { ...section, position: index + 1 };
      });

      // Save back to API
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/company`, {
        ...currentPage,
        sections: updatedSections,
      });

      await fetchData(); // Refresh table
      alert("✅ Company section deleted and positions reset!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("❌ Delete failed: " + (err.response?.data?.message || err.message));
    }
  }, [fetchData]);

  if (loading) return <p className="text-center mt-20 font-bold text-gray-400 uppercase tracking-widest">Loading Company Content...</p>;

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

  return (
    <div className="p-5 font-poppins bg-white min-h-screen text-left">

      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col text-left">
          <h2 className="text-4xl font-bold text-slate-800">{'Company '}</h2>
        </div>
        <div className="flex gap-2">
          <button>
            <ExportButton data={currentRows} />
          </button>
          <button onClick={() => setShowFullPreview(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-all">Preview</button>

          <button
            onClick={() => setShowFilterModal(true)}
            className={`${(searchQuery.content || searchQuery.subtext || searchQuery.order) ? 'bg-orange-500' : 'bg-blue-600'} text-white px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer transition-all`}
          >
            Filter {(searchQuery.content || searchQuery.subtext || searchQuery.order) && "Active"}
          </button>

          <button
            onClick={() => setShowAddSection(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-all"
          >
            Create Company
          </button>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-gray-300 shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            {/* Sr */}
            <th
              className="p-4 border border-gray-300 w-32 text-center cursor-pointer hover:bg-gray-200 transition-all select-none group"
              onClick={() => {
                setActiveSortColumn("pos");
                setPosOrder(pos_order === "asc" ? "desc" : "asc");
                setCurrentPage(1);
                setShowAllRows(false);
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="font-bold">Sr.</span>
                <div className="flex flex-row gap-2 items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white border border-transparent group-hover:border-gray-200">
                  <svg className={`w-4 h-4 ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* Main Title */}
            <th
              className="p-4 border border-gray-300 font-bold cursor-pointer hover:bg-gray-200 transition-all select-none group"
              onClick={() => {
                setActiveSortColumn("main_text");
                setMainTextOrder(main_text_order === "asc" ? "desc" : "asc");
                setCurrentPage(1);
                setShowAllRows(false);
              }}
            >
              <div className="flex items-center justify-between">
                <span>Main Content Title</span>
                <div className="flex gap-1 items-center bg-gray-50 p-1 rounded-md group-hover:bg-white border border-transparent group-hover:border-gray-200">
                  <svg className={`w-3 h-3 ${activeSortColumn === 'main_text' && main_text_order === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-3 h-3 ${activeSortColumn === 'main_text' && main_text_order === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* Subtext */}
            <th
              className="p-4 border border-gray-300 font-bold cursor-pointer hover:bg-gray-200 transition-all select-none group"
              onClick={() => {
                setActiveSortColumn("subtext");
                setSubtextOrder(subtext_order === "asc" ? "desc" : "asc");
                setCurrentPage(1);
                setShowAllRows(false);
              }}
            >
              <div className="flex items-center justify-between">
                <span>Subtext / Component Info</span>
                <div className="flex gap-1 items-center bg-gray-50 p-1 rounded-md group-hover:bg-white border border-transparent group-hover:border-gray-200">
                  <svg className={`w-3 h-3 ${activeSortColumn === 'subtext' && subtext_order === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-3 h-3 ${activeSortColumn === 'subtext' && subtext_order === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* Align */}
            <th className="p-4 border border-gray-300 w-32 text-center font-bold">
              Align
            </th>

            {/* Order */}
            <th className="p-4 border border-gray-300 w-32 text-center font-bold">
              <div
                className="flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setActiveSortColumn("pos");
                  setPosOrder(pos_order === "asc" ? "desc" : "asc");
                  setCurrentPage(1);
                  setShowAllRows(false);
                }}
              >
                <span>Order</span>
                <div className="flex gap-1">
                  <svg className={`w-4 h-4 ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* Action */}
            <th className="p-4 border border-gray-300 w-24 text-center font-bold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {currentRows.map((row, idx) => (
            <tr
              key={idx}
              ref={idx === rowsPerPage - 1 && !showAllRows ? lastRowRef : null}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="p-4 border border-gray-300 text-center font-bold text-slate-400">
                {idx + 1}
              </td>
              <td className="p-4 border border-gray-300 font-medium whitespace-pre-wrap">
                {row.primary}
              </td>
              <td className="p-4 border border-gray-300 text-gray-500 text-sm">
                {row.secondary}
              </td>
              <td className="p-4 border border-gray-300 text-center text-xs font-bold text-gray-400 uppercase">
                {row.align}
              </td>
              <td className="p-4 border border-gray-300 text-center font-bold text-blue-600">
                {row.pos}
              </td>
              <td className="p-4 border border-gray-300 text-center">
                <button
                  onClick={() => handleEditClick(row)}
                  className="text-blue-500 p-2 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan="6" className="p-10 text-center text-gray-400 italic">
                No sections match your filter...
              </td>
            </tr>
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

      {/* --- PAGINATION & FOOTER --- */}
      <div className="flex items-center justify-between mt-4 py-2 px-4 border-t border-gray-100">
        <span className="text-[13px] text-gray-400 font-medium poppins">
          {filteredData.length > 0 ? 1 : 0}-{showAllRows ? filteredData.length : Math.min(rowsPerPage, filteredData.length)} of {filteredData.length}
        </span>

        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} className={`w-7 h-7 rounded text-xs cursor-pointer transition-all ${currentPage === i + 1 ? "bg-blue-50 text-blue-600 font-bold border border-blue-100" : "text-gray-400"}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => paginate(currentPage + 1)} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer">Next</button>
        </div>
      </div>

      {/* --- FILTER MODAL --- */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-10000 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-8">
              <h3 className="font-bold text-gray-700 uppercase tracking-widest text-sm text-left">Search & Filter</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-red-500 text-3xl leading-none cursor-pointer">&times;</button>
            </div>

            <div className="p-8 space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Main Content Title</label>
                <input
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Search headings..."
                  value={searchQuery.content}
                  onChange={(e) => {
                    setSearchQuery({ ...searchQuery, content: e.target.value });
                    setCurrentPage(1);
                    setShowAllRows(false);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subtext / Info</label>
                <input
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Search components..."
                  value={searchQuery.subtext}
                  onChange={(e) => {
                    setSearchQuery({ ...searchQuery, subtext: e.target.value });
                    setCurrentPage(1);
                    setShowAllRows(false);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section Order</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Exact position..."
                  value={searchQuery.order}
                  onChange={(e) => {
                    setSearchQuery({ ...searchQuery, order: e.target.value });
                    setCurrentPage(1);
                    setShowAllRows(false);
                  }}
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setSearchQuery({ content: "", subtext: "", order: "" });
                  setCurrentPage(1);
                  setShowAllRows(false);
                }}
                className="flex-1 py-3 text-gray-500 font-bold uppercase text-xs hover:text-red-500 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-black transition-all cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SECTION MODAL */}
      {showAddSection && (
        <AddSection
          pageName="company"
          onClose={() => setShowAddSection(false)}
          onSectionAdded={() => {
            fetchData();
            setCurrentPage(1);
            setShowAllRows(false);
          }}
        />
      )}

      {/* --- EDITING MODAL --- */}
      {editingSection && (
        editingSection.isCustom ? (
          <NewSectionEditor
            section={editingSection}
            pageData={companyData}
            pageName="company"
            onClose={() => setEditingSection(null)}
            onRefresh={fetchData}
            onDelete={handleDeleteSection}
          />

        ) : (
          <div className="fixed inset-0 bg-black/70 z-500 flex items-center justify-center backdrop-blur-sm text-left">
            <div className="bg-white w-[100%] h-[100%]  shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10">
                <span className="font-bold text-gray-700 uppercase tracking-widest text-sm font-poppins">Edit: {editingSection.name}</span>
                <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer transition-colors">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-5xl mx-auto">

                  {editingSection.id === 'hero' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Main Heading</label>
                        <textarea className="w-full p-4 border rounded-xl font-bold text-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows="2" value={formData.mainText || ""} onChange={(e) => setFormData({ ...formData, mainText: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Secondary Description</label>
                        <textarea className="w-full p-4 border rounded-xl text-gray-600 text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none" rows="4" value={formData.secondaryText || ""} onChange={(e) => setFormData({ ...formData, secondaryText: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {editingSection.id === 'section1' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h4 className="font-bold border-b pb-2 text-blue-600 uppercase text-xs tracking-wider">Left Side: Why we exist</h4>
                        <input className="w-full p-3 border rounded-lg font-bold outline-none focus:border-blue-500" value={formData.left?.heading || ""} onChange={(e) => setFormData({ ...formData, left: { ...formData.left, heading: e.target.value } })} />
                        <textarea className="w-full p-3 border rounded-lg h-48 outline-none focus:border-blue-500" value={formData.left?.text || ""} onChange={(e) => setFormData({ ...formData, left: { ...formData.left, text: e.target.value } })} />
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold border-b pb-2 text-blue-600 uppercase text-xs tracking-wider">Right Side: What we believe</h4>
                        <input className="w-full p-3 border rounded-lg font-bold outline-none focus:border-blue-500" value={formData.right?.heading || ""} onChange={(e) => setFormData({ ...formData, right: { ...formData.right, heading: e.target.value } })} />
                        {formData.right?.points?.map((p, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="text-gray-300 font-bold">•</span>
                            <input className="w-full p-3 border rounded-lg focus:border-blue-500 outline-none" value={p} onChange={(e) => {
                              const newPoints = [...formData.right.points]; newPoints[i] = e.target.value;
                              setFormData({ ...formData, right: { ...formData.right, points: newPoints } });
                            }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(editingSection.id === 'section2' || editingSection.id === 'section3') && (
                    <div className="space-y-6">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Section Main Title</label>
                      <input className="w-full p-4 border rounded-xl font-bold text-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.mainText || ""} onChange={(e) => setFormData({ ...formData, mainText: e.target.value })} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {(formData.cards || formData.steps)?.map((item, i) => (
                          <div key={i} className="p-6 border rounded-2xl bg-slate-50 shadow-sm space-y-3 relative">
                            <span className="absolute top-4 right-6 text-slate-200 font-black text-2xl">0{i + 1}</span>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card/Step Title</label>
                            <input className="w-full p-2 border rounded font-bold outline-none focus:border-blue-500" value={item.heading} onChange={(e) => {
                              const list = formData.cards ? [...formData.cards] : [...formData.steps];
                              list[i].heading = e.target.value;
                              setFormData({ ...formData, [formData.cards ? 'cards' : 'steps']: list });
                            }} />
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500" rows="3" value={item.description} onChange={(e) => {
                              const list = formData.cards ? [...formData.cards] : [...formData.steps];
                              list[i].description = e.target.value;
                              setFormData({ ...formData, [formData.cards ? 'cards' : 'steps']: list });
                            }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingSection.id === 'section4' && (
                    <div className="space-y-8">
                      <div className="p-8 border rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
                        <h4 className="text-blue-400 font-bold uppercase text-xs">Top Section (Momentum)</h4>
                        <input className="w-full bg-slate-800 p-4 border-none rounded-xl text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.above?.mainText} onChange={(e) => setFormData({ ...formData, above: { ...formData.above, mainText: e.target.value } })} />
                        <textarea className="w-full bg-slate-800 p-4 border-none rounded-xl text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.above?.secondaryText} onChange={(e) => setFormData({ ...formData, above: { ...formData.above, secondaryText: e.target.value } })} />
                      </div>
                      <div className="p-8 border rounded-3xl bg-slate-50 space-y-4">
                        <h4 className="text-gray-400 font-bold uppercase text-xs">Bottom Section (Contact)</h4>
                        <input className="w-full p-4 border rounded-xl text-xl font-bold outline-none focus:border-blue-600" value={formData.below?.mainText} onChange={(e) => setFormData({ ...formData, below: { ...formData.below, mainText: e.target.value } })} />
                        <textarea className="w-full p-4 border rounded-xl text-gray-600 outline-none focus:border-blue-600" value={formData.below?.secondaryText} onChange={(e) => setFormData({ ...formData, below: { ...formData.below, secondaryText: e.target.value } })} />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Button Text</label>
                            <input className="w-full p-3 border rounded-xl font-bold" value={formData.button?.label} onChange={(e) => setFormData({ ...formData, button: { ...formData.button, label: e.target.value } })} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Button Link</label>
                            <input className="w-full p-3 border rounded-xl" value={formData.button?.link} onChange={(e) => setFormData({ ...formData, button: { ...formData.button, link: e.target.value } })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 px-10">
                <button onClick={() => setEditingSection(null)} className="px-8 py-2 font-bold text-gray-500 hover:text-red-500 cursor-pointer transition-all uppercase text-xs">Cancel</button>
                <button onClick={handleSave} className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold shadow-lg cursor-pointer hover:bg-black transition-all uppercase text-xs tracking-widest">Save Changes</button>
              </div>
            </div>
          </div>
        )
      )}

      {/* --- PREVIEW MODAL --- */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/80 z-1000 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-[98%] h-[95%] rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10">
              <span className="font-bold uppercase tracking-widest text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full">Live Company Preview</span>
              <button onClick={() => setShowFullPreview(false)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              <div className="w-full">
                {getSortedSections().map((section) => {
                  const { id, data, isCustom } = section;

                  // Render custom sections
                  if (isCustom) {
                    return renderCustomSection(id);
                  }

                  // Render built-in sections
                  if (id === 'hero') {
                    return (
                      <section key={id} className="bg-gray-900 text-white py-24 text-center">
                        <div className="max-w-7xl mx-auto px-6">
                          <h1 className="text-5xl md:text-6xl font-bold mb-6">{data.mainText}</h1>
                          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">{data.secondaryText}</p>
                        </div>
                      </section>
                    );
                  }

                  if (id === 'section1') {
                    return (
                      <section key={id} className="py-24 text-left">
                        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
                          <div>
                            <h2 className="text-4xl font-bold mb-6 text-gray-900">{data.left?.heading}</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">{data.left?.text}</p>
                          </div>
                          <div className="bg-gray-100 rounded-32px p-12">
                            <h3 className="font-bold text-2xl mb-6 text-gray-800">{data.right?.heading}</h3>
                            <ul className="space-y-4 text-gray-700 text-lg">
                              {data.right?.points?.map((p, i) => (
                                <li key={i} className="flex gap-3 items-start"><span className="text-blue-600 font-black">•</span> {p}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </section>
                    );
                  }

                  if (id === 'section2') {
                    return (
                      <section key={id} className="bg-gray-50 py-24 text-center">
                        <div className="max-w-7xl mx-auto px-6">
                          <h2 className="text-4xl font-bold mb-16 text-gray-900">{data.mainText}</h2>
                          <div className="grid md:grid-cols-3 gap-8">
                            {data.cards?.map((card, i) => (
                              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm text-left border border-gray-100">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">{card.heading}</h3>
                                <p className="text-gray-600 leading-relaxed">{card.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  }

                  if (id === 'section3') {
                    return (
                      <section key={id} className="py-24 text-center">
                        <div className="max-w-6xl mx-auto px-6">
                          <h2 className="text-4xl font-bold mb-16 text-gray-900">{data.mainText}</h2>
                          <div className="grid md:grid-cols-4 gap-8">
                            {data.steps?.map((step, i) => (
                              <div key={i} className="bg-gray-100 rounded-[40px] p-8 border border-white shadow-sm">
                                <h4 className="font-bold text-xl text-gray-900 mb-2">{step.heading}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  }

                  if (id === 'section4') {
                    return (
                      <section key={id} className="bg-gray-900 text-white py-24 text-center">
                        <div className="max-w-6xl mx-auto px-6">
                          <h2 className="text-4xl text-blue-600 font-bold mb-6">{data.above?.mainText}</h2>
                          <p className="text-gray-300 text-lg mb-16 max-w-3xl mx-auto">{data.above?.secondaryText}</p>
                          <hr className="mb-16 opacity-20" />
                          <h2 className="text-4xl text-blue-600 font-bold mb-6">{data.below?.mainText}</h2>
                          <p className="text-gray-300 text-lg mb-10">{data.below?.secondaryText}</p>
                          <button className="bg-white text-black px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm">
                            {data.button?.label}
                          </button>
                        </div>
                      </section>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end bg-gray-50 px-10">
              <button onClick={() => setShowFullPreview(false)} className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold uppercase text-xs cursor-pointer shadow-lg hover:bg-black">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCompany;