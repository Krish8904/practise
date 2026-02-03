import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AddSection from "../../components/AddSection";
import NewSectionEditor from "./NewSectionEditor";

const EditService = ({ pageTitle }) => {
  const [serviceData, setServiceData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});

  // --- FILTER & SEARCH STATE --
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ content: "", subtext: "", order: "" });

  // --- MULTI-COLUMN SORT STATE --
  const [activeSortColumn, setActiveSortColumn] = useState("pos");
  const [pos_order, setPosOrder] = useState("asc");
  const [main_text_order, setMainTextOrder] = useState("asc");
  const [subtext_order, setSubtextOrder] = useState("asc");

  // -- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;
  // --- INFINITE SCROLL STATE ---
  const [showAllRows, setShowAllRows] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observer = useRef(null);

  // --- DYNAMIC TABLE DATA ---
  const tableData = React.useMemo(() => {
    return Object.keys(serviceData.sections || {}).map((key) => {
      const section = serviceData.sections[key];
      const cards = section?.items || section;

      const getPosition = () => {
        if (section.position !== undefined) return section.position;
        if (key === "hero") return 1;
        if (key === "services") return 2;
        if (key === "cta") return 3;
        return 99;
      };

      return {
        id: key,
        name: section.name || key.charAt(0).toUpperCase() + key.slice(1),
        primary: section.mainText || section.title || "Services section",
        secondary:
          section.secondaryText ||
          section.text ||
          (Array.isArray(cards) ? `${cards.length} Cards` : "Text Content"),
        pos: getPosition(),
        type: section.type || "core"
      };
    });
  }, [serviceData.sections]);

  // --- STEP 1: FILTER THE DATA ---
  const filteredData = React.useMemo(() => {
    return tableData.filter(row => {
      const matchContent = (row.primary || "").toLowerCase().includes(searchQuery.content.toLowerCase());
      const matchSubtext = (row.secondary || "").toLowerCase().includes(searchQuery.subtext.toLowerCase());
      const matchOrder = searchQuery.order === "" || row.pos.toString() === searchQuery.order;
      return matchContent && matchSubtext && matchOrder;
    });
  }, [tableData, searchQuery.content, searchQuery.subtext, searchQuery.order]);

  // --- STEP 2: SORT THE ENTIRE DATASET ---
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

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/services`);
      setServiceData(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleEditClick = (row) => {
    setEditingSection(row);

    const sectionData = serviceData.sections[row.id];

    if (row.id === "services") {
      setFormData(JSON.parse(JSON.stringify(sectionData.items || [])));
    } else {
      setFormData(JSON.parse(JSON.stringify(sectionData || {})));
    }
  };


  const handleDeleteSection = async (sectionId) => {
    try {
      // Fetch fresh data from API (not stale local state)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/services`);
      const currentPage = response.data;

      const updatedSections = { ...currentPage.sections };
      delete updatedSections[sectionId];

      // Reset ALL positions to 1,2,3... (handles nested too)
      const sectionsWithPosition = Object.entries(updatedSections)
        .filter(([id, section]) => typeof section === 'object' && section.position !== undefined)
        .map(([id, section]) => ({ id, section }));

      sectionsWithPosition.sort((a, b) => a.section.position - b.section.position);

      sectionsWithPosition.forEach(({ id, section }, index) => {
        updatedSections[id] = { ...section, position: index + 1 };
      });

      // Save back to API
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/services`, {
        ...currentPage,
        sections: updatedSections,
      });

      await fetchData(); // Refresh table
      setEditingSection(null);
      alert("Service section deleted and positions reset!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };


  const addNewService = () => {
    const newCard = { title: "New Service", desc: "Description here", img: "default.jpg", color: "border-blue-600" };
    setFormData([...formData, newCard]);
  };

  const deleteService = (index) => {
    if (window.confirm("Are you sure you want to delete this service card?")) {
      const updated = formData.filter((_, i) => i !== index);
      setFormData(updated);
    }
  };

  const handleSave = async () => {
    try {
      let updatedSections = { ...serviceData.sections };

      if (editingSection.id === "services") {
        updatedSections["services"] = {
          ...updatedSections["services"],
          items: formData,
        };
      } else {
        updatedSections[editingSection.id] = formData;
      }

      const finalPayload = { ...serviceData, sections: updatedSections };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/services`, finalPayload);
      setServiceData(finalPayload);
      setEditingSection(null);
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving changes.");
    }
  };

  if (loading) return <p className="text-center mt-20 font-bold text-gray-400 uppercase tracking-widest">Loading Services...</p>;

  // --- STEP 3: PAGINATE THE SORTED RESULTS ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Show initial 2 rows, or all rows if scrolled
  const currentRows = showAllRows ? sortedData : sortedData.slice(0, rowsPerPage);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="p-10 font-poppins bg-white min-h-screen text-left">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold text-slate-800">Services</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowFullPreview(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium">
            Preview
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className={`${(searchQuery.content || searchQuery.subtext || searchQuery.order) ? 'bg-orange-500' : 'bg-blue-600'} text-white px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer transition-colors font-medium`}
          >
            Filter {(searchQuery.content || searchQuery.subtext || searchQuery.order) && "Active"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Create Service
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full text-left border-collapse border border-gray-300 shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            {/* SR COLUMN */}
            <th
              className="p-4 border border-gray-300 w-32 text-center cursor-pointer hover:bg-gray-200 transition-all select-none group"
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

            {/* MAIN CONTENT */}
            <th
              className="p-4 border border-gray-300 font-bold cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("main_text"); setMainTextOrder(main_text_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>Main Content</span>
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

            {/* SUBTEXT */}
            <th
              className="p-4 border border-gray-300 font-bold cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("subtext"); setSubtextOrder(subtext_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>Subtext/Info</span>
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

            {/* ORDER COLUMN */}
            <th
              className="p-4 border border-gray-300 w-24 text-center cursor-pointer hover:bg-gray-200 group"
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

            <th className="p-4 border border-gray-300 w-24 text-center font-bold">Action</th>
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
              <td className="p-4 border border-gray-300 font-medium whitespace-pre-wrap text-gray-800">{row.primary}</td>
              <td className="p-4 border border-gray-300 text-gray-500 text-sm">{row.secondary}</td>
              <td className="p-4 border border-gray-300 text-center font-semibold text-blue-600 bg-blue-50/30">{row.pos}</td>
              <td className="p-4 border border-gray-300 text-center">
                <button
                  onClick={() => handleEditClick(row)}
                  className="text-blue-500 p-2 border cursor-pointer border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic font-medium">No results found matching your filter...</td></tr>
          )}
          {isLoadingMore && (
            <tr>
              <td colSpan="5" style={{ height: "120px" }}>
                <div className="flex flex-col justify-center items-center h-full gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-400 font-medium">Loading more sections...</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION BAR */}
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

      {/* FILTER MODAL POPUP */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-10000 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Filter Services</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-red-500 text-3xl leading-none cursor-pointer">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Search Content</label>
                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search titles..." value={searchQuery.content} onChange={(e) => { setSearchQuery({ ...searchQuery, content: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Search Info</label>
                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search descriptions..." value={searchQuery.subtext} onChange={(e) => { setSearchQuery({ ...searchQuery, subtext: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Order (Pos)</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search position..." value={searchQuery.order} onChange={(e) => { setSearchQuery({ ...searchQuery, order: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => { setSearchQuery({ content: "", subtext: "", order: "" }); setShowFilterModal(false); setCurrentPage(1); setShowAllRows(false); }} className="px-6 py-2 text-gray-500 font-bold text-sm cursor-pointer">Clear</button>
              <button onClick={() => setShowFilterModal(false)} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold text-sm cursor-pointer shadow-lg hover:bg-black">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POPUP */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/70 z-500 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-[100%] h-[100%] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10">
              <span className="font-bold text-gray-700 uppercase tracking-widest text-sm">Editing: {editingSection.name}</span>
              <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              <div className="max-w-5xl mx-auto">
                {(editingSection.id === 'hero' || editingSection.id === 'cta') && (
                  <div className="space-y-6">
                    <div>
                      <label className="block font-bold mb-2 text-gray-600 uppercase text-xs">{editingSection.id === 'hero' ? 'Main Text' : 'CTA Title'}</label>
                      <textarea className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" rows="3" value={formData.mainText || formData.title || ""}
                        onChange={(e) => setFormData(editingSection.id === 'hero' ? { ...formData, mainText: e.target.value } : { ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-2 text-gray-600 uppercase text-xs">{editingSection.id === 'hero' ? 'Secondary Text' : 'CTA Sub-text'}</label>
                      <textarea className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700" rows="4" value={formData.secondaryText || formData.text || ""}
                        onChange={(e) => setFormData(editingSection.id === 'hero' ? { ...formData, secondaryText: e.target.value } : { ...formData, text: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="font-bold mb-2 text-gray-600 uppercase text-xs">Button Text</label>
                        <input className="p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" type="text" value={formData.buttonText || ""} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} />
                      </div>
                      {editingSection.id === 'cta' && (
                        <div className="flex flex-col">
                          <label className="font-bold mb-2 text-gray-600 uppercase text-xs">Button Link</label>
                          <input className="p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" type="text" value={formData.link || ""} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {editingSection.id === 'services' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.isArray(formData) && formData.map((item, idx) => (
                        <div key={idx} className="p-5 border rounded-2xl bg-slate-50 relative group shadow-sm">
                          <button onClick={() => deleteService(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 cursor-pointer transition-colors font-bold uppercase text-[10px]">Delete</button>
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Title</label>
                            <input className="w-full p-2 border rounded font-bold outline-none focus:border-blue-500" type="text" value={item.title || ""} onChange={(e) => {
                              const updated = [...formData]; updated[idx].title = e.target.value; setFormData(updated);
                            }} />
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500" rows="3" value={item.desc || ""} onChange={(e) => {
                              const updated = [...formData]; updated[idx].desc = e.target.value; setFormData(updated);
                            }} />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase">Image Name</label>
                                <input className="w-full p-2 border rounded text-xs" type="text" value={item.img || ""} onChange={(e) => {
                                  const updated = [...formData]; updated[idx].img = e.target.value; setFormData(updated);
                                }} />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase">Color Class</label>
                                <input className="w-full p-2 border rounded text-xs" type="text" value={item.color || ""} onChange={(e) => {
                                  const updated = [...formData]; updated[idx].color = e.target.value; setFormData(updated);
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addNewService} className="bg-blue-600 text-white cursor-pointer px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md">
                      <span className="text-lg">+</span> Add New Service Card
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 px-10">
              <button onClick={() => setEditingSection(null)} className="px-8 py-2 font-bold text-gray-500 cursor-pointer hover:bg-gray-200 rounded-xl transition-all uppercase text-xs">Cancel</button>
              <button onClick={handleSave}

                className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold shadow-lg cursor-pointer hover:bg-black transition-all uppercase text-xs">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddSection
          pageName="services"
          onClose={() => setShowAddModal(false)}
          onSectionAdded={() => {
            fetchData();
            setShowAllRows(false);
          }}
        />
      )}
      {/* FULL PREVIEW MODAL */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/60 z-600 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white w-[95%] h-[95%] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10 text-left">
              <span className="font-bold uppercase tracking-widest text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full">Live Services Preview</span>
              <button onClick={() => setShowFullPreview(false)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white py-16 px-10">
              <div className="max-w-7xl mx-auto space-y-24 font-poppins text-left">
                {Object.keys(serviceData.sections || {})
                  .sort((a, b) => getPos(a, serviceData.sections[a]) - getPos(b, serviceData.sections[b]))

                  .map((key) => {
                    const s = serviceData.sections[key];

                    if (key === "hero") {
                      return (
                        <div key={key} className="flex flex-col md:flex-row items-start gap-12">
                          <div className="md:w-1/2">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900">{s.mainText}</h1>
                          </div>
                          <div className="md:w-1/2">
                            <p className="text-gray-700 text-lg mt-0 md:mt-15 mb-6 leading-relaxed">{s.secondaryText}</p>
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold">{s.buttonText}</button>
                          </div>
                        </div>
                      );
                    }

                    if (key === "services") {
                      return (
                        <div key={key} className="text-center">
                          <h1 className="text-5xl text-blue-600 font-semibold mb-16">Our Services</h1>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 justify-items-center">
                            {(s.items || s).map((card, idx) => (

                              <div key={idx} className={`flex flex-col items-center w-full max-w-xl bg-white shadow-md rounded-xl border-l-4 ${card.color}`}>
                                <div className="p-8 text-center">
                                  <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                                  <p className="text-gray-700">{card.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (key === "cta") {
                      return (
                        <div key={key} className="text-center py-16 bg-blue-50 rounded-2xl">
                          <h2 className="text-4xl font-bold mb-4">{s.title}</h2>
                          <p className="text-gray-600 text-lg mb-6">{s.text}</p>
                          <a
                            href={s.link}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold inline-block"
                          >
                            {s.buttonText}
                          </a>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={key}
                        className="py-10"
                        style={{ textAlign: s.alignment || 'left' }}
                      >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{s.mainText}</h2>
                        <p className="text-gray-600 text-lg whitespace-pre-wrap">{s.secondaryText}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end bg-gray-50 px-10">
              <button onClick={() => setShowFullPreview(false)} className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold uppercase text-xs cursor-pointer shadow-lg">Close Preview</button>
            </div>
          </div>
        </div>
      )}
      {editingSection && editingSection.type === "custom" && (
        <NewSectionEditor
          section={editingSection}
          pageData={serviceData}
          pageName="services"
          onClose={() => setEditingSection(null)}
          onRefresh={fetchData}
          onDelete={handleDeleteSection}
        />
      )}
    </div>
  );
};

export default EditService;