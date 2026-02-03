import React, { useState } from "react";
import axios from "axios";


const AddSection = ({ onClose, onSectionAdded, pageName }) => {
  const [formData, setFormData] = useState({
    sectionName: "",
    title: "",
    description: "",
    alignment: "left",
    position: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,



    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Fetch current page data
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      const currentPage = response.data;

      const newSectionId = "custom_" + Date.now();

      // 2️⃣ Determine new section position
      const existingSections = Object.values(currentPage.sections || {});
      const maxPosition = existingSections.length > 0
        ? Math.max(...existingSections.map(sec => sec.position ?? 0))
        : 0;

      // If user entered a position, use it; otherwise, place at the end
      const targetPosition = formData.position && formData.position > 0
        ? parseInt(formData.position)
        : maxPosition + 1;

      // 3️⃣ Shift positions of existing sections if needed
      const updatedSections = {};
      Object.entries(currentPage.sections || {}).forEach(([id, section]) => {
        if (section.position !== undefined) {
          updatedSections[id] = {
            ...section,
            position: section.position >= targetPosition ? section.position + 1 : section.position
          };
        } else {
          updatedSections[id] = section;
        }
      });

      // 4️⃣ Add the new section
      updatedSections[newSectionId] = {
        name: formData.sectionName,
        mainText: formData.title,
        secondaryText: formData.description,
        alignment: formData.alignment,
        position: targetPosition,
        type: "custom",
      };

      // 5️⃣ Sort sections by position so they stay consistent
      const sectionsWithPosition = Object.entries(updatedSections)
        .map(([id, section]) => ({ id, section }))
        .sort((a, b) => (a.section.position ?? 999) - (b.section.position ?? 999));

      sectionsWithPosition.forEach(({ id, section }, idx) => {
        updatedSections[id] = { ...section, position: idx + 1 };
      });

      // 6️⃣ Save updated sections to API
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, {
        sections: updatedSections,
      });

      onSectionAdded();
      onClose();
    } catch (err) {
      console.error("Add Section Error:", err);
      setError(err.response?.data?.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/70 z-[500] flex items-center justify-center backdrop-blur-sm font-poppins text-left">
      {/* Container set to 98% width and height */}
      <div className="bg-white w-[100%] h-[100%]  shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 px-10">
          <div className="flex flex-col">

            <span className="font-bold text-slate-700 uppercase tracking-widest text-sm">Create New Section</span>

          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer transition-colors"
          >
            &times;
          </button>
        </div>


        {/* MAIN FORM AREA */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          <div className="max-w-3xl mx-auto"> {/* Centered max-width for better readability without preview */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-xl font-bold text-sm shadow-sm">
                  {error}
                </div>
              )}


              <div className="space-y-6">



                {/* Main Heading */}
                <div>
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Main Content </label>
                  <textarea
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    rows="2"
                    placeholder="What should the title be?"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                    required
                  />
                </div>


                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Subtext / Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Enter the description for this section..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-600 leading-relaxed"
                  />
                </div>


                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Text Alignment</label>
                    <select
                      name="alignment"
                      value={formData.alignment}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                    >
                      <option value="left">Left Aligned</option>
                      <option value="center">Center Aligned</option>
                      <option value="right">Right Aligned</option>
                    </select>
                  </div>


                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Position Order</label>
                    <input
                      type="number"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-blue-600"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>


        {/* FOOTER */}
        <div className="p-8 border-t flex justify-end gap-4 bg-gray-50 px-10">


          <button
            onClick={onClose}
            className="px-10 py-3 font-bold text-slate-500 cursor-pointer hover:bg-gray-200 rounded-xl transition-all uppercase text-xs tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-slate-900 text-white px-14 py-3 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer shadow-xl hover:bg-black transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default AddSection;