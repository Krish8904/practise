import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ImagePlus, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";

const ImageManager = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageTimestamps, setImageTimestamps] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [replacingId, setReplacingId] = useState(null);
  const fileInputRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchPages = async () => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages`);
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch pages:", err);
      setError("Failed to load pages. Please check your connection and API URL.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    fetchPages();
  }, []);

  // Set default active tab once pages load
  useEffect(() => {
    const filtered = pages.filter((p) => ["home", "services"].includes(p.pageName.toLowerCase()));
    if (filtered.length && !activeTab) {
      setActiveTab(filtered[0].pageName);
    }
  }, [pages]);

  const extractImages = (obj, path = "sections") => {
    let results = [];
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        results = results.concat(extractImages(item, `${path}[${index}]`));
      });
    } else if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const newPath = `${path}.${key}`;
        if (key === "image" && typeof obj[key] === "string") {
          results.push({ path: newPath, value: obj[key] });
        } else {
          results = results.concat(extractImages(obj[key], newPath));
        }
      });
    }
    return results;
  };

  const getImageUrl = (value) => {
    if (!value) return "";
    const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
    const path = value.includes("/") ? value : `/uploads/${value}`;
    const timestamp = imageTimestamps[value] || Date.now();
    return `${base}${path}?t=${timestamp}`;
  };

  const updateImage = async (pageName, imgPath, newImg) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      const pageData = res.data;
      const pathParts = imgPath.split(".").filter((p) => p && p !== "sections");
      let current = pageData.sections;
      if (!current) throw new Error("Page sections not found");
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (part.includes("[")) {
          const key = part.substring(0, part.indexOf("["));
          const indexMatch = part.match(/\[(\d+)\]/);
          if (!indexMatch) throw new Error(`Invalid array path: ${part}`);
          const index = parseInt(indexMatch[1]);
          if (!current[key]) throw new Error(`Key not found: ${key}`);
          if (!Array.isArray(current[key])) throw new Error(`Expected array at ${key}`);
          if (index >= current[key].length) throw new Error(`Index out of bounds`);
          current = current[key][index];
        } else {
          if (!current[part]) throw new Error(`Key not found: ${part}`);
          current = current[part];
        }
      }
      const finalKey = pathParts[pathParts.length - 1];
      current[finalKey] = newImg;
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, pageData);
      setImageTimestamps(prev => ({ ...prev, [newImg]: Date.now() }));
      if (!isFetchingRef.current) await fetchPages();
      setSelected(null);
      setReplacingId(null);
      alert("Image updated successfully!");
    } catch (err) {
      console.error("Failed to update image:", err);
      alert(`Failed to update image: ${err.message}`);
    }
  };

  const deleteImage = async (imgValue) => {
    if (!window.confirm("Delete this image permanently?")) return;
    try {
      const fileName = imgValue.split("/").pop();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/images/delete/${fileName}`);
      if (!isFetchingRef.current) await fetchPages();
      alert("Image deleted successfully!");
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert(`Failed to delete image: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleFileChange = async (e) => {
    if (!e.target.files?.length || !selected) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    const oldFileName = selected.oldPath.split("/").pop();
    formData.append("oldFileName", oldFileName);
    try {
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/images/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newFilePath = uploadRes.data.filePath || uploadRes.data.path;
      if (!newFilePath) throw new Error("Backend didn't return the new file path");
      await updateImage(selected.page, selected.path, newFilePath);
      setSelected(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Failed to upload image: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-13 w-13 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 pl-1">Loading...</p>
        </div>
      </div>
    );
  }
  // ── ERROR ──
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-800 font-semibold mb-1">{error}</p>
          <p className="text-slate-400 text-sm">API: {import.meta.env.VITE_API_URL || 'Not configured'}</p>
        </div>
        <button
          onClick={() => { if (!isFetchingRef.current) fetchPages(); }}
          className="mt-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const filteredPages = pages.filter((p) => ["home", "services"].includes(p.pageName.toLowerCase()));
  const activePage = filteredPages.find(p => p.pageName === activeTab);
  const images = activePage?.sections ? extractImages(activePage.sections) : [];

  return (
    <div className="space-y-0">

      {/* ── TOP BAR ── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide  mb-2">
            Content Management <span className="text-lg" >↴</span>
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Media Library</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Total assets <span className="text-md pt-2" >↴</span> </p>
          <p className="text-2xl font-bold text-slate-900">
            {filteredPages.reduce((acc, p) => acc + (p.sections ? extractImages(p.sections).length : 0), 0)}
            
          </p>
        </div>
      </div>

      {/* ── PAGE TABS ── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-8">
        {filteredPages.map((page) => {
          const count = page.sections ? extractImages(page.sections).length : 0;
          return (
            <button
              key={page.pageName}
              onClick={() => setActiveTab(page.pageName)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === page.pageName
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <span className="capitalize">{page.pageName}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${activeTab === page.pageName
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-500"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── IMAGE LIST ── */}
      {images.length > 0 ? (
        <div className="space-y-3">
          {images.map((img, i) => {
            const filename = img.value.split('/').pop();
            const sectionName = img.path.split('.')[0] || 'Unknown';
            const isReplacing = replacingId === i;

            return (
              <div
                key={i}
                className="group flex items-center gap-5 bg-white border border-slate-100 rounded-2xl p-3 pr-5 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={getImageUrl(img.value)}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => (e.target.src = "https://via.placeholder.com/96x64?text=?")}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-semibold text-sm truncate mb-0.5">{filename}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-medium capitalize">
                      {sectionName}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-xs">{img.value}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => {
                      setSelected({ page: activePage.pageName, path: img.path, oldPath: img.value });
                      setReplacingId(i);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 active:scale-95 transition-all duration-150 cursor-pointer whitespace-nowrap"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Replace
                  </button>
                  <button
                    onClick={() => deleteImage(img.value)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 active:scale-95 transition-all duration-150 cursor-pointer"
                    title="Delete image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Always-visible replace button on mobile / small */}
                <div className="flex items-center gap-2 shrink-0 group-hover:hidden">
                  <button
                    onClick={() => {
                      setSelected({ page: activePage.pageName, path: img.path, oldPath: img.value });
                      setReplacingId(i);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 active:scale-95 transition-all duration-150 cursor-pointer md:hidden"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* ── EMPTY STATE ── */
        <div className="flex flex-col items-center justify-center py-24 gap-4 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-semibold text-sm mb-1">No images found</p>
            <p className="text-slate-400 text-xs">No images are configured in the {activeTab} page sections.</p>
          </div>
        </div>
      )}

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default ImageManager;