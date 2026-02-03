import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import NewSectionEditor from "./NewSectionEditor";
import HomeSr1 from "../HomeSr.jsx/HomeSr1";
import HomeSr3 from "../HomeSr.jsx/HomeSr3";
import MainImage from "../../assets/images/main.avif";
import Second from "../../assets/images/second.avif";
import AddSection from "../../components/AddSection";

const EditHome = ({ pageTitle }) => {
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ content: "", subtext: "", order: "" });
  const [showAddSection, setShowAddSection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  // --- MULTI-COLUMN SORT STATE --
  const [activeSortColumn, setActiveSortColumn] = useState("pos");
  const [pos_order, setPosOrder] = useState("asc");
  const [main_text_order, setMainTextOrder] = useState("asc");
  const [subtext_order, setSubtextOrder] = useState("asc");

  // --- INFINITE SCROLL STATE ---
  const [showAllRows, setShowAllRows] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observer = useRef(null);

  const s = homeData.sections || {};

  const stats = s.stats?.steps || [];
  const whatWeDo = s.whatWeDo?.items || [];
  const howWeWork = s.howWeWork?.steps || [];
  const cta = s.cta || {
    mainText: "Ready to unlock value?",
    secondaryText: "Let's assess impact.",
    button: { label: "Plan a Free Quick Scan" }
  };

  const colorMap = {
    "blue-600": "text-blue-600",
    "green-600": "text-green-600",
    "purple-600": "text-purple-600",
    "orange-600": "text-orange-600",
  };

  // Build table data including custom sections
  const buildTableData = React.useMemo(() => {
    const baseData = [
      { id: 'hero', name: 'Hero Section', primary: s.hero?.mainText, secondary: s.hero?.secondaryText, align: s.hero?.alignment || "Left", pos: s.hero?.position || 1, isCustom: false },
      { id: 'intro', name: 'Intro Section', primary: "Applied AI Intro", secondary: s.intro?.secondaryText, align: s.intro?.alignment || "Right", pos: s.intro?.position || 2, isCustom: false },
      { id: 'stats', name: 'Stats Section', primary: "Performance Metrics", secondary: `${stats.length} Items`, align: "Center", pos: s.stats?.position || 3, isCustom: false },
      { id: 'whatWeDo', name: 'What We Do', primary: s.whatWeDo?.title || "What we do", secondary: `${whatWeDo.length} Service Cards`, align: s.whatWeDo?.alignment || "Left", pos: s.whatWeDo?.position || 4, isCustom: false },
      { id: 'howWeWork', name: 'How We Work', primary: s.howWeWork?.title || "How we work", secondary: `${howWeWork.length} Process Steps`, align: s.howWeWork?.alignment || "Center", pos: s.howWeWork?.position || 5, isCustom: false },
      { id: 'cta', name: 'CTA Section', primary: cta.mainText, secondary: cta.secondaryText, align: s.cta?.alignment || "Center", pos: s.cta?.position || 6, isCustom: false }
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
  }, [s, stats.length, whatWeDo.length, howWeWork.length, cta.mainText, cta.secondaryText]);

  // --- STEP 1: FILTER THE DATA --
  const filteredData = React.useMemo(() => {
    return buildTableData.filter(row => {
      const matchContent = (row.primary || "").toLowerCase().includes(searchQuery.content.toLowerCase());
      const matchSubtext = (row.secondary || "").toLowerCase().includes(searchQuery.subtext.toLowerCase());
      const matchOrder = searchQuery.order === "" || row.pos.toString() === searchQuery.order;
      return matchContent && matchSubtext && matchOrder;
    });
  }, [buildTableData, searchQuery.content, searchQuery.subtext, searchQuery.order]);

  // --- STEP 2: SORT THE ENTIRE FILTERED DATASET ---
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/home`);
      setHomeData(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, []);

  const handleDeleteSection = useCallback(async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section? This cannot be undone.")) return;

    try {
      // Fetch FRESH data from API (not stale local state)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/home`);
      const currentPage = response.data;

      const updatedSections = { ...currentPage.sections };
      delete updatedSections[sectionId];

      // Reset ALL positions to 1,2,3... consecutively
      const sectionsWithPosition = Object.entries(updatedSections)
        .filter(([id, section]) => typeof section === 'object' && section.position !== undefined)
        .map(([id, section]) => ({ id, section }));

      sectionsWithPosition.sort((a, b) => a.section.position - b.section.position);

      sectionsWithPosition.forEach(({ id, section }, index) => {
        updatedSections[id] = { ...section, position: index + 1 };
      });

      // Save back to API
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/home`, {
        ...currentPage,
        sections: updatedSections,
      });

      await fetchData(); // Refresh table
      alert("Home section deleted and positions reset!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  }, [fetchData]);


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

  if (loading) return <p className="text-center mt-12 font-semibold text-gray-600">Loading dashboard...</p>;

  // --- STEP 3: PAGINATE THE SORTED RESULTS ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Show initial 2 rows, or all rows if scrolled
  const currentRows = showAllRows ? sortedData : sortedData.slice(0, rowsPerPage);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get alignment text style
  const getAlignmentStyle = (align) => {
    const alignLower = align.toLowerCase();
    if (alignLower === "center") return "text-center";
    if (alignLower === "right") return "text-right";
    return "text-left";
  };

  // Render custom section in preview
  const renderCustomSection = (sectionId) => {
    const section = s[sectionId];
    if (!section) return null;

    const alignClass = getAlignmentStyle(section.alignment || "left");

    return (
      <div className={`space-y-6 p-10 bg-white rounded-xl border border-gray-100 ${alignClass}`}>
        <h2 className="text-4xl font-bold text-gray-900">{section.mainText}</h2>
        {section.secondaryText && (
          <p className="text-gray-700 max-w-3xl mx-auto">{section.secondaryText}</p>
        )}
      </div>
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
    <div className="p-10 font-poppins bg-white min-h-screen">

      {/* --- HEADER SECTION --- */}
      <div className='flex flex-row justify-between items-center w-full mb-10'>
        <h2 className="text-4xl font-bold text-slate-800">
          {'Home'}
        </h2>
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
            Create Home
          </button>
        </div>
      </div>

      <table className="w-full text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {/* --- SR COLUMN --- */}
            <th
              className="p-3 border border-gray-300 w-24 text-center cursor-pointer hover:bg-gray-200 transition-colors group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold">Sr.</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* --- MAIN CONTENT --- */}
            <th
              className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("main_text"); setMainTextOrder(main_text_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">Main Content</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'main_text' && main_text_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'main_text' && main_text_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* --- SUBTEXT --- */}
            <th
              className="p-3 border border-gray-300 cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("subtext"); setSubtextOrder(subtext_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">Subtext/Description</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'subtext' && subtext_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'subtext' && subtext_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* --- ALIGNMENT --- */}
            <th
              className="p-3 border border-gray-300 w-32 cursor-pointer hover:bg-gray-200 group"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold">Align</span>
              </div>
            </th>

            {/* --- ORDER COLUMN --- */}
            <th
              className="p-3 border border-gray-300 w-24 text-center cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold">Order</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg
                    className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"
                  >
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
              key={idx}
              ref={idx === rowsPerPage - 1 && !showAllRows ? lastRowRef : null}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 border border-gray-300 align-top text-center">
                {idx + 1}
              </td>
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
                <button onClick={() => setEditingSection(row)} className="text-blue-500 hover:text-white p-2 border border-blue-100 rounded-2xl  hover:bg-blue-600 transition-all cursor-pointer">
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

      {/* --- MINIMALIST PAGINATION NAVBAR --- */}
      <div className="flex items-center justify-between mt-4 py-2 px-4 border-t border-gray-100">
        <span className="text-[13px] text-gray-400">
          {filteredData.length > 0 ? 1 : 0}-{showAllRows ? filteredData.length : Math.min(rowsPerPage, filteredData.length)} of {filteredData.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
            className="p-1 px-3 text-xs font-medium text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer transition-colors"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`w-7 h-7 rounded text-xs cursor-pointer transition-all ${currentPage === i + 1 ? "bg-blue-50 text-blue-600  font-bold" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => paginate(currentPage + 1)}
            className="p-1 px-3 text-xs font-medium text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* --- FILTER MODAL POPUP --- */}
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
                  onChange={(e) => { setSearchQuery({ ...searchQuery, content: e.target.value }); setCurrentPage(1); setShowAllRows(false); }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subtext / Info</label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search descriptions..."
                  value={searchQuery.subtext}
                  onChange={(e) => { setSearchQuery({ ...searchQuery, subtext: e.target.value }); setCurrentPage(1); setShowAllRows(false); }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Order (Pos)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search position..."
                  value={searchQuery.order}
                  onChange={(e) => { setSearchQuery({ ...searchQuery, order: e.target.value }); setCurrentPage(1); setShowAllRows(false); }}
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => { setSearchQuery({ content: "", subtext: "", order: "" }); setShowFilterModal(false); setCurrentPage(1); setShowAllRows(false); }}
                className="px-6 py-2 text-gray-500 font-bold text-sm"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- EDIT MODAL LOGIC --- */}
      {editingSection && (
        editingSection.isCustom ? (
          <NewSectionEditor
            section={editingSection}
            pageData={homeData}
            pageName="home"
            onClose={() => setEditingSection(null)}
            onRefresh={fetchData}
            onDelete={handleDeleteSection}
          />

        ) : (
          /* 2. EXISTING logic for Core Sections */
          ['hero', 'intro', 'cta'].includes(editingSection.id) ? (
            <HomeSr1
              section={editingSection}
              homeData={homeData}
              onClose={() => setEditingSection(null)}
              onRefresh={fetchData}
            />
          ) : (
            <HomeSr3
              section={editingSection}
              homeData={homeData}
              onClose={() => setEditingSection(null)}
              onRefresh={fetchData}
            />
          )
        )
      )}

      {showAddSection && (
        <AddSection
          pageName="home"
          onClose={() => setShowAddSection(false)}
          onSectionAdded={() => {
            fetchData();
            setCurrentPage(1);
            setShowAllRows(false);
          }}
        />
      )}

      {showFullPreview && (
        <div className="fixed inset-0 bg-black/60 z-9999 flex items-center justify-center p-6 backdrop-blur-sm text-left">
          <div className="bg-white w-[95%] h-[95%] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10">
              <span className="font-bold uppercase tracking-widest text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full">Live Home Preview</span>
              <button onClick={() => setShowFullPreview(false)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white py-16">
              <div className="max-w-7xl mx-auto px-4 space-y-32 font-satoshi">

                {getSortedSections().map((section) => {
                  const { id, data, isCustom } = section;

                  // Render custom sections
                  if (isCustom) {
                    return (
                      <div key={id}>
                        {renderCustomSection(id)}
                      </div>
                    );
                  }

                  // Render built-in sections based on their ID
                  if (id === 'hero') {
                    return (
                      <div key={id} className="flex flex-col md:flex-row items-center gap-8">
                        <div>
                          <h1 className="text-5xl font-bold leading-tight ml-10 mb-6 text-gray-900 whitespace-pre-wrap">
                            {(data?.mainText || "").split("\n").map((line, i) => (
                              <span key={i}>{line.includes("hidden value") ? <span className="text-blue-600">{line}</span> : line}<br /></span>
                            ))}
                          </h1>
                          <p className="text-gray-700 ml-10 max-w-xl mb-6">{data?.secondaryText}</p>
                          <div className="flex ml-10 gap-6">
                            {Array.isArray(data?.buttons) && data.buttons.map((btn, i) => (
                              <button key={i} className={`px-6 py-3 rounded-lg ${i === 0 ? "bg-blue-600 text-white" : "border border-blue-600 text-blue-600"}`}>{btn.label}</button>
                            ))}
                          </div>
                        </div>
                        <img src={MainImage} alt="Main" className="h-70 w-250 rounded-xl shadow-lg object-cover" />
                      </div>
                    );
                  }

                  if (id === 'intro') {
                    return (
                      <div key={id} className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                          <img src={Second} alt="Secondary" className="ml-15 h-80 rounded-xl shadow-lg object-cover" />
                        </div>
                        <div className="md:w-1/2">
                          <h3 className="text-xl font-medium leading-relaxed text-gray-700">
                            {data?.secondaryText || "Applied AI built on data sovereignty..."}
                          </h3>
                        </div>
                      </div>
                    );
                  }

                  if (id === 'stats') {
                    return (
                      <div key={id} className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center items-center">
                        {stats.map((stat, i) => (
                          <div key={i} className={`pr-6 ${i !== stats.length - 1 ? "border-r border-gray-500" : ""}`}>
                            <h3 className={`text-4xl font-bold ${colorMap[stat.color] || "text-black"}`}>{stat.value}</h3>
                            <p className="text-gray-700 mt-2">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (id === 'whatWeDo') {
                    return (
                      <div key={id} className="space-y-12 ml-10">
                        <h2 className="text-4xl font-bold text-gray-900">{data?.title || "What We Do ↴"}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                          {whatWeDo.map((item, i) => (
                            <div key={i} className="p-6 border-l-4 border-blue-600 rounded-xl bg-white shadow-sm">
                              <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.heading}</h3>
                              <p className="text-gray-700">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (id === 'howWeWork') {
                    return (
                      <div key={id} className="space-y-12">
                        <h2 className="text-4xl font-bold pl-10 text-gray-900">{data?.title || "How We Work ↴"}</h2>
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                          {howWeWork.map((step, i) => (
                            <div key={i} className="p-4 bg-white rounded-xl shadow border border-gray-50">
                              <h3 className="font-semibold mb-2 text-gray-900">{step.title}</h3>
                              <p className="text-gray-700">{step.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (id === 'cta') {
                    return (
                      <div key={id} className="text-center space-y-6 p-10 bg-linear-to-r from-blue-50 to-white rounded-xl border border-blue-50">
                        <h2 className="text-4xl font-bold text-gray-900">{data?.mainText || cta.mainText}</h2>
                        <p className="max-w-xl mx-auto text-gray-700">{data?.secondaryText || cta.secondaryText}</p>
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg">
                          {data?.button?.label || "Plan a Free Quick Scan"}
                        </button>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end bg-gray-50 px-10">
              <button onClick={() => setShowFullPreview(false)} className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold cursor-pointer">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHome;