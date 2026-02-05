import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AddSection from "../../components/AddSection";
import NewSectionEditor from "./NewSectionEditor";
import ExportButton from "../../components/ExportButton";

const EditUsecases = () => {
  const [pageData, setPageData] = useState(null);
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

  const pageName = "usecases";
  const observer = useRef(null);

  const s = pageData?.sections || {};

  // Build table data including custom sections
  const buildTableData = () => {
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
        id: 'usecases',
        name: 'Case Studies',
        primary: `${s.usecases?.items?.length || 0} Usecases`,
        secondary: "Portfolio of solutions",
        align: "Center",
        pos: s.usecases?.position || 2,
        isCustom: false
      },
      {
        id: 'cta',
        name: 'Footer CTA',
        primary: s.cta?.mainText,
        secondary: s.cta?.secondaryText,
        align: s.cta?.alignment || "Center",
        pos: s.cta?.position || 3,
        isCustom: false
      },
    ];

    // Add custom sections
    Object.keys(s).forEach(key => {
      const section = s[key];
      if (section && section.type === "custom") {
        baseData.push({
          id: key,
          name: section.name || key,
          primary: section.mainText,
          secondary: section.secondaryText,
          align: section.alignment || "Left",
          pos: section.position || 999,
          isCustom: true
        });
      }
    });

    return baseData;
  };

  const tableData = React.useMemo(() => buildTableData(), [pageData]);

  // --- STEP 1: FILTER THE DATA ---
  const filteredData = tableData.filter(row => {
    const matchContent = (row.primary || "").toLowerCase().includes(searchQuery.content.toLowerCase());
    const matchSubtext = (row.secondary || "").toLowerCase().includes(searchQuery.subtext.toLowerCase());
    const matchOrder = searchQuery.order === "" || row.pos.toString() === searchQuery.order;
    return matchContent && matchSubtext && matchOrder;
  });

  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      switch (activeSortColumn) {
        case "pos":
          return pos_order === "asc" ? a.pos - b.pos : b.pos - a.pos;

        case "main_text":
          return main_text_order === "asc"
            ? (a.primary || "").localeCompare(b.primary || "")
            : (b.primary || "").localeCompare(a.primary || "");

        case "subtext":
          return subtext_order === "asc"
            ? (a.secondary || "").localeCompare(b.secondary || "")
            : (b.secondary || "").localeCompare(a.secondary || "");

        default:
          return 0;
      }
    });
  }, [
    filteredData,
    activeSortColumn,
    pos_order,
    main_text_order,
    subtext_order,
  ]);

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

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      setPageData(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    let interval;
    if (!editingSection && !showFilterModal) {
      interval = setInterval(fetchData, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [editingSection, showFilterModal]);

  const handleEditClick = (section) => {
    setEditingSection(section);
    if (section.id === 'usecases') {
      setFormData(
        JSON.parse(JSON.stringify(pageData.sections.usecases?.items || []))
      );
    } else if (section.isCustom) {
      // For custom sections, formData is handled in NewSectionEditor
      setFormData(null);
    } else {
      setFormData(JSON.parse(JSON.stringify(pageData.sections[section.id] || {})));
    }
  };

  const handleSave = async () => {
    try {
      let updatedSections = { ...pageData.sections };

      // Handle different section types
      if (editingSection.id === 'usecases') {
        updatedSections.usecases = {
          ...pageData.sections.usecases,
          items: formData,
        };
      } else if (editingSection.isCustom) {
        // Custom sections are handled by NewSectionEditor
        // This shouldn't be called for custom sections
        console.warn("Custom sections should use NewSectionEditor");
        return;
      } else {
        // Hero, CTA, or other core sections
        updatedSections[editingSection.id] = {
          ...pageData.sections[editingSection.id],
          ...formData
        };
      }

      const finalPayload = { sections: updatedSections };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, finalPayload);
      await fetchData();
      setEditingSection(null);
      alert("✅ Changes saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      // Fetch fresh data
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      const currentPage = response.data;

      const updatedSections = { ...currentPage.sections };
      delete updatedSections[sectionId];

      // Reset positions
      const sectionsWithPosition = Object.entries(updatedSections)
        .filter(([id, section]) => typeof section === 'object' && section.position !== undefined)
        .map(([id, section]) => ({ id, section }));

      sectionsWithPosition.sort((a, b) => a.section.position - b.section.position);

      sectionsWithPosition.forEach(({ id, section }, index) => {
        updatedSections[id] = { ...section, position: index + 1 };
      });

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, {
        ...currentPage,
        sections: updatedSections
      });
      
      await fetchData();
      setEditingSection(null);
      alert("✅ Section deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p className="text-center mt-20 font-poppins text-gray-500 text-sm tracking-widest uppercase">Loading Usecases...</p>;

  // --- STEP 3: PAGINATE THE SORTED DATA ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Show initial 2 rows, or all rows if scrolled
  const currentRows = showAllRows ? sortedData : sortedData.slice(0, rowsPerPage);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get alignment style for preview
  const getAlignmentStyle = (align) => {
    const alignLower = align.toLowerCase();
    if (alignLower === "center") return "text-center";
    if (alignLower === "right") return "text-right";
    return "text-left";
  };

  // Render custom section in preview
  const renderCustomSection = (sectionId, position) => {
    const section = s[sectionId];
    if (!section) return null;

    const alignClass = getAlignmentStyle(section.alignment || "left");
    const bgClass = position % 2 !== 0 ? "bg-gray-50" : "bg-white";

    return (
      <section key={sectionId} className={`py-20 ${bgClass}`}>
        <div className={`max-w-6xl mx-auto px-6 ${alignClass}`}>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">{section.mainText}</h2>
          {section.secondaryText && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{section.secondaryText}</p>
          )}
        </div>
      </section>
    );
  };

  // Sort all sections by position for preview
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
    <div className="p-5 pt-2 font-poppins bg-white min-h-screen text-left">

      {/* --- HEADER --- */}
      <div className="flex flex-row justify-between items-center w-full mb-10">
        <h2 className="text-4xl font-bold text-slate-800">Use Cases</h2>
        <div className="flex justify-end gap-2">
          <button>
            <ExportButton data={currentRows} fileName="UseCasesPage" />
          </button>
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
            Create Usecase
          </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <table className="w-full text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-black">
            <th
              className="p-3 border border-gray-300 w-32 text-center cursor-pointer hover:bg-gray-200 transition-all select-none group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-3">
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
              <span className="font-bold">Alignment</span>
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
              <td className="p-3 border border-gray-300 align-top text-center text-gray-400 font-bold">
                {idx + 1}
              </td>
              <td className="p-3 border border-gray-300 font-medium whitespace-pre-wrap align-top">
                <div className="flex items-center gap-2">
                  <span>{row.primary}</span>
                  {row.isCustom && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Custom</span>
                  )}
                </div>
              </td>
              <td className="p-3 border border-gray-300 text-gray-600 align-top">{row.secondary}</td>
              <td className="p-3 border border-gray-300 align-top text-center">
                <span className="text-xs font-semibold text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                  {row.align || 'left'}
                </span>
              </td>
              <td className="p-3 border border-gray-300 align-top text-center font-semibold text-blue-600 bg-blue-50/30">{row.pos}</td>
              <td className="p-3 border border-gray-300 align-top text-center">
                <button onClick={() => handleEditClick(row)} className="text-blue-500 hover:text-white p-2 border border-blue-100 rounded-2xl hover:bg-blue-600 transition-all shadow-sm cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
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

      {/* --- PAGINATION --- */}
      <div className="flex items-center justify-between mt-4 py-2 px-4 border-t border-gray-100">
        <span className="text-[13px] text-gray-400 font-medium">
          {filteredData.length > 0 ? 1 : 0}-{showAllRows ? filteredData.length : Math.min(rowsPerPage, filteredData.length)} of {filteredData.length}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} className={`w-7 h-7 rounded text-xs cursor-pointer transition-all ${currentPage === i + 1 ? "bg-blue-50 text-blue-600 font-bold border border-blue-100" : "text-gray-400 hover:bg-gray-50"}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => paginate(currentPage + 1)} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer">Next</button>
        </div>
      </div>

      {/* --- FILTER MODAL --- */}
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
                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Search content..." value={searchQuery.content} onChange={(e) => { setSearchQuery({ ...searchQuery, content: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subtext / Info</label>
                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Search subtext..." value={searchQuery.subtext} onChange={(e) => { setSearchQuery({ ...searchQuery, subtext: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Order (Pos)</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Search position..." value={searchQuery.order} onChange={(e) => { setSearchQuery({ ...searchQuery, order: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => { setSearchQuery({ content: "", subtext: "", order: "" }); setShowFilterModal(false); setCurrentPage(1); setShowAllRows(false); }} className="px-6 py-2 text-gray-500 font-bold text-sm cursor-pointer">Clear</button>
              <button onClick={() => setShowFilterModal(false)} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-black transition-all">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SECTION MODAL --- */}
      {showAddSection && (
        <AddSection
          pageName="usecases"
          onClose={() => setShowAddSection(false)}
          onSectionAdded={() => {
            fetchData();
            setCurrentPage(1);
            setShowAllRows(false);
          }}
        />
      )}

      {/* --- PREVIEW MODAL --- */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/60 z-9999 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 px-10">
              <div className="flex items-center gap-4">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Live Use cases Preview</span>
              </div>
              <button onClick={() => setShowFullPreview(false)} className="text-gray-400 hover:text-red-500 text-4xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {getSortedSections().map((section, index) => {
                const { id, data, isCustom } = section;

                // Render custom sections
                if (isCustom) {
                  return renderCustomSection(id, index);
                }

                // Render built-in sections
                if (id === 'hero') {
                  return (
                    <section key={id} className="bg-gray-900 text-white py-24">
                      <div className="max-w-7xl mx-auto px-6 text-center">
                        <h1 className="text-5xl font-bold mb-6">{data?.mainText}</h1>
                        <p className="text-lg text-gray-300 max-w-3xl mx-auto">{data?.secondaryText}</p>
                      </div>
                    </section>
                  );
                }

                if (id === 'usecases') {
                  return s.usecases?.items?.map((uc, i) => (
                    <section key={`usecase-${i}`} className={`py-20 ${i % 2 !== 0 ? "bg-gray-50" : "bg-white"}`}>
                      <div className={`max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                        <div className={i % 2 !== 0 ? "order-1 md:order-2" : ""}>
                          <span className="text-blue-600 text-xl font-semibold">{uc.category}</span>
                          <h2 className="text-3xl font-bold mt-2 mb-4 text-black">{uc.title}</h2>
                          <p className="text-gray-600 mb-4">{uc.description}</p>
                          <ul className="space-y-2 text-gray-700">
                            {uc.highlights?.map((h, hIdx) => (
                              <li key={hIdx}>• {h}</li>
                            ))}
                          </ul>
                        </div>
                        <div className={`bg-gray-100 rounded-2xl p-8 shadow-sm ${i % 2 !== 0 ? "order-2 md:order-1" : ""}`}>
                          <h4 className="font-semibold mb-4 text-black">Outcome</h4>
                          <div className="flex flex-col gap-3">
                            {uc.outcome?.map((o, oIdx) => (
                              <div key={oIdx} className="flex items-start gap-3">
                                <span className="mt-1 text-blue-600">▶</span>
                                <p className="text-gray-600">{o}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  ));
                }

                if (id === 'cta') {
                  return (
                    <section key={id} className="bg-linear-to-b from-gray-900 to-black py-20 text-white">
                      <div className="max-w-6xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-6">{data?.mainText}</h2>
                        <p className="text-gray-300 max-w-3xl pb-3 mx-auto text-lg mb-8">{data?.secondaryText}</p>
                        <hr className="pb-10 opacity-20" />
                        <h2 className="text-4xl font-bold mb-4">{data?.contactText}</h2>
                        <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-6">{data?.contactDescription}</p>
                        <div className="flex justify-center gap-6">
                          <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold">Contact Us</button>
                          <button className="border-white px-8 py-4 font-bold border rounded-xl">About Us</button>
                        </div>
                      </div>
                    </section>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editingSection && (
        editingSection.isCustom ? (
          <NewSectionEditor
            section={editingSection}
            pageData={pageData}
            pageName={pageName}
            onClose={() => setEditingSection(null)}
            onRefresh={fetchData}
            onDelete={handleDeleteSection}
          />
        ) : (
          <div className="fixed inset-0 bg-black/70 z-500 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white w-[100%] h-[100%] shadow-2xl flex flex-col overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10">
                <span className="font-bold text-gray-700 uppercase tracking-widest text-sm">Editing: {editingSection.name}</span>
                <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-white">
                <div className="max-w-6xl mx-auto space-y-8 font-poppins text-left">
                  {(editingSection.id === 'hero' || editingSection.id === 'cta') && (
                    <div className="space-y-6">
                      <div>
                        <label className="block font-bold mb-2">Main Heading</label>
                        <textarea className="w-full p-4 border rounded-xl text-xl font-bold" rows="3" value={formData.mainText || ""} onChange={(e) => setFormData({ ...formData, mainText: e.target.value })} />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Secondary Text</label>
                        <textarea className="w-full p-4 border rounded-xl" rows="4" value={formData.secondaryText || ""} onChange={(e) => setFormData({ ...formData, secondaryText: e.target.value })} />
                      </div>
                      {editingSection.id === 'cta' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold mb-2">Contact Title</label>
                            <input className="w-full p-3 border rounded-lg" value={formData.contactText || ""} onChange={(e) => setFormData({ ...formData, contactText: e.target.value })} />
                          </div>
                          <div>
                            <label className="block font-bold mb-2">Contact Description</label>
                            <input className="w-full p-3 border rounded-lg" value={formData.contactDescription || ""} onChange={(e) => setFormData({ ...formData, contactDescription: e.target.value })} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {editingSection.id === 'usecases' && (
                    <div className="space-y-10">
                      {formData.map((uc, i) => (
                        <div key={i} className="p-8 border-2 rounded-2xl bg-gray-50 relative text-left">
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Category</label>
                              <input className="w-full p-3 border rounded-lg font-bold text-blue-600" value={uc.category} onChange={(e) => { const n = [...formData]; n[i].category = e.target.value; setFormData(n); }} />
                            </div>
                            <div>
                              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Title</label>
                              <input className="w-full p-3 border rounded-lg font-bold" value={uc.title} onChange={(e) => { const n = [...formData]; n[i].title = e.target.value; setFormData(n); }} />
                            </div>
                          </div>
                          <div className="mb-6">
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Description</label>
                            <textarea className="w-full p-3 border rounded-lg" rows="3" value={uc.description} onChange={(e) => { const n = [...formData]; n[i].description = e.target.value; setFormData(n); }} />
                          </div>
                          <div className="grid grid-cols-2 gap-10">
                            <div>
                              <label className="block font-bold mb-2 text-sm">Key Highlights</label>
                              {uc.highlights.map((h, hIdx) => (
                                <input key={hIdx} className="w-full p-2 border rounded-md mb-2 text-sm" value={h} onChange={(e) => { const n = [...formData]; n[i].highlights[hIdx] = e.target.value; setFormData(n); }} />
                              ))}
                            </div>
                            <div>
                              <label className="block font-bold mb-2 text-sm">Business Outcomes</label>
                              {uc.outcome.map((o, oIdx) => (
                                <textarea key={oIdx} className="w-full p-2 border rounded-md mb-2 text-sm" rows="2" value={o} onChange={(e) => { const n = [...formData]; n[i].outcome[oIdx] = e.target.value; setFormData(n); }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 px-10">
                <button onClick={() => setEditingSection(null)} className="px-8 py-2 font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all cursor-pointer">Cancel</button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all cursor-pointer">Save Changes</button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default EditUsecases;