import React, { useState } from "react";
import axios from "axios";

export const HomeSr2 = ({ section, homeData, onClose, onRefresh }) => {
  const [stats, setStats] = useState(homeData.sections.stats || []);
  const [saving, setSaving] = useState(false);

  const handleStatChange = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
  };

  const handleIconDrop = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleStatChange(index, 'icon', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedSections = JSON.parse(JSON.stringify(homeData.sections));
      updatedSections.stats = stats;
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/home`, { sections: updatedSections });
      onRefresh();
      onClose();
    } catch (err) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[250] flex items-center justify-center p-2 font-['Poppins']">
      <div className="bg-white w-[95%] h-[95%] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white px-10">
          <h2 className="text-2xl font-bold text-slate-900">Edit <span className="text-blue-600">Stats Section</span></h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-4xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 border border-slate-200 rounded-xl space-y-4 shadow-sm">
                
                {/* ICON UPLOAD */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon (Drag & Drop)</label>
                  <div 
                    className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleIconDrop(idx, e.dataTransfer.files[0]);
                    }}
                  >
                    {stat.icon ? <img src={stat.icon} className="w-full h-full object-contain" alt="Icon" /> : <span className="text-xl text-slate-300">+</span>}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleIconDrop(idx, e.target.files[0])} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Value</label>
                    <input type="text" value={stat.value} onChange={(e) => handleStatChange(idx, 'value', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Color Theme</label>
                    <select value={stat.color} onChange={(e) => handleStatChange(idx, 'color', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 outline-none">
                      <option value="blue-600">Blue</option>
                      <option value="green-600">Green</option>
                      <option value="purple-600">Purple</option>
                      <option value="orange-600">Orange</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Label</label>
                  <input type="text" value={stat.label} onChange={(e) => handleStatChange(idx, 'label', e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER DROPDOWNS RESTORED */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-6 px-12">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-4 rounded-lg text-sm font-bold uppercase tracking-widest shadow-lg">
            {saving ? "Saving..." : "Save Stats"}
          </button>
          <button onClick={onClose} className="bg-slate-900 text-white px-14 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all">Cancel</button>
        </div>
      </div>
    </div>
  );
};