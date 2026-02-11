import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ImagePlus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";


const ImageManager = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageTimestamps, setImageTimestamps] = useState({}); // NEW: Track when images were updated
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

  // FIXED: Add cache busting with timestamp
  const getImageUrl = (value) => {
    if (!value) return "";
    const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
    const path = value.includes("/") ? value : `/uploads/${value}`;

    // Use tracked timestamp if available, otherwise use current time
    const timestamp = imageTimestamps[value] || Date.now();
    return `${base}${path}?t=${timestamp}`;
  };

  const updateImage = async (pageName, imgPath, newImg) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      const pageData = res.data;

      const pathParts = imgPath.split(".").filter((p) => p && p !== "sections");
      let current = pageData.sections;

      if (!current) {
        throw new Error("Page sections not found");
      }

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        if (part.includes("[")) {
          const key = part.substring(0, part.indexOf("["));
          const indexMatch = part.match(/\[(\d+)\]/);

          if (!indexMatch) {
            throw new Error(`Invalid array path: ${part}`);
          }

          const index = parseInt(indexMatch[1]);

          if (!current[key]) {
            throw new Error(`Key not found: ${key}`);
          }

          if (!Array.isArray(current[key])) {
            throw new Error(`Expected array at ${key}, got ${typeof current[key]}`);
          }

          if (index >= current[key].length) {
            throw new Error(`Index ${index} out of bounds for ${key}`);
          }

          current = current[key][index];
        } else {
          if (!current[part]) {
            throw new Error(`Key not found: ${part}`);
          }

          current = current[part];
        }
      }

      const finalKey = pathParts[pathParts.length - 1];
      current[finalKey] = newImg;

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, pageData);

      // NEW: Update timestamp for this image to force reload
      setImageTimestamps(prev => ({
        ...prev,
        [newImg]: Date.now()
      }));

      if (!isFetchingRef.current) {
        await fetchPages();
      }

      setSelected(null);
      alert("Image updated successfully!");
    } catch (err) {
      console.error("Failed to update image:", err);
      alert(`Failed to update image: ${err.message}`);
    }
  };

  const deleteImage = async (imgValue) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const fileName = imgValue.split("/").pop();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/images/delete/${fileName}`);

      if (!isFetchingRef.current) {
        await fetchPages();
      }

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

      if (!newFilePath) {
        throw new Error("Backend didn't return the new file path");
      }

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
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600  mb-5">Media Management</h1>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-5">Media Management</h1>
        <div className="bg-red-50 p-12 rounded-xl shadow-sm border border-red-200 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-slate-600">API URL: {import.meta.env.VITE_API_URL || 'Not configured'}</p>
          <button
            onClick={() => {
              if (!isFetchingRef.current) {
                fetchPages();
              }
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredPages = pages.filter((p) => ["home", "services"].includes(p.pageName.toLowerCase()));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 pt-0 to-blue-50 p-6">
      <div className="w-full mx-auto">
        <div className="flex items-center w-full justify-between bg-white/80  p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl shadow-inner">
              <ImagePlus className="text-blue-600" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Media Management
              </h2>
              <p className="text-gray-500 pt-2">
                Update & Manage media across your website :
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 border px-6 py-3 rounded-xl cursor-pointer hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
        </div>

        {filteredPages.map((page) => {
          const images = page.sections ? extractImages(page.sections) : [];
          if (!images.length) return null;

          return (
            <div key={page.pageName} className="mb-12">
              <div className="flex items-center mt-8 gap-3 mb-6">
                <div className="h-1 w-8 bg-blue-600 rounded-full mb-3"></div>
                <h2 className="text-2xl font-bold mb-3 text-slate-800 capitalize">
                  {page.pageName} Page
                </h2>
                <span className="text-sm text-slate-500 bg-slate-200 px-3 py-1 mb-3 rounded-full">
                  {images.length} {images.length === 1 ? 'image' : 'images'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
                  >
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(img.value)}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        alt=""
                        onError={(e) => (e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found")}
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-xs font-medium truncate">
                            {img.value.split('/').pop()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelected({ page: page.pageName, path: img.path, oldPath: img.value });
                            fileInputRef.current?.click();
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Replace
                        </button>
                        <button
                          onClick={() => deleteImage(img.value)}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 active:scale-95 transition-all duration-200 border border-red-200 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredPages.length === 0 && (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-600 text-lg">No images found in Home or Services pages</p>
          </div>
        )}
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

    </div>
  );
};

export default ImageManager;