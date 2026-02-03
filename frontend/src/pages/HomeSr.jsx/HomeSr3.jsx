import React, { useState, useEffect } from "react";
import axios from "axios";

const HomeSr3 = ({ section, homeData, onClose, onRefresh }) => {
  // Determine the key based on section ID
  const isWhatWeDo = section.id === "whatWeDo";
  const isStats = section.id === "stats";
  const listKey = isWhatWeDo ? "items" : "steps";

  const [title, setTitle] = useState("");
  const [listData, setListData] = useState([]);
  const [pos, setPos] = useState(1); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (homeData?.sections?.[section.id]) {
      const currentSection = homeData.sections[section.id];
      setTitle(currentSection.title || "");
      setListData(currentSection[listKey] || []);
      setPos(currentSection.position ?? currentSection.pos ?? 1);
    }
  }, [section, homeData, listKey]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSections = { ...homeData.sections };
      const numericPos = Number(pos);

      updatedSections[section.id] = {
        ...updatedSections[section.id],
        ...(isStats ? {} : { title: title }),
        [listKey]: listData,
        pos: numericPos,
        position: numericPos 
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/home`, {
        sections: updatedSections,
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const newList = [...listData];
    newList[index][field] = value;
    setListData(newList);
  };

  const addItem = () => {
    let newItem;
    if (isStats) {
      newItem = { value: "0", label: "New Stat", color: "blue-600" };
    } else if (isWhatWeDo) {
      newItem = { heading: "", description: "" };
    } else {
      newItem = { title: "", description: "" };
    }
    setListData([...listData, newItem]);
  };

  const deleteItem = (index) => {
    setListData(listData.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-[100%] h-[100%] shadow-2xl flex flex-col overflow-hidden font-poppins">

        <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10">
          <span className="font-bold text-gray-700 uppercase tracking-widest text-sm">
            Editing Standard Section: <span className="text-blue-600">{section.name}</span>
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-white">
          <div className="max-w-4xl mx-auto space-y-6 text-left">

            <div className="grid grid-cols-2 gap-8">
              {!isStats && (
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section Title</label>
                  <input
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-12 font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              )}
              
              <div className={isStats ? "col-span-2" : "col-span-1"}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Order Position</label>
                <select 
                  value={pos} 
                  onChange={(e) => setPos(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-white outline-none h-12"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => <option key={n} value={n}>Slot {n}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pt-4">
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  {isStats ? "Stats Counter" : "Cards / Steps"}
                </label>
                <button onClick={addItem} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 uppercase font-bold tracking-wider">+ Add New Item</button>
              </div>

              {listData.map((item, idx) => (
                <div key={idx} className="p-6 border rounded-xl bg-gray-50 relative group">
                  <button
                    onClick={() => deleteItem(idx)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-[10px] uppercase"
                  >
                    Remove Item
                  </button>

                  {isStats ? (
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Value</label>
                        <input
                          className="w-full bg-transparent font-bold text-3xl text-blue-600 outline-none border-b border-transparent focus:border-blue-200 transition-colors"
                          value={item.value}
                          onChange={(e) => updateItem(idx, "value", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Label</label>
                        <input
                          className="w-full bg-transparent font-medium text-gray-700 text-lg outline-none border-b border-transparent focus:border-blue-200 transition-colors"
                          value={item.label}
                          onChange={(e) => updateItem(idx, "label", e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        className="w-full bg-transparent font-bold text-gray-800 mb-2 outline-none border-b border-transparent focus:border-blue-300"
                        placeholder="Heading/Title"
                        value={isWhatWeDo ? item.heading : item.title}
                        onChange={(e) => updateItem(idx, isWhatWeDo ? "heading" : "title", e.target.value)}
                      />
                      <textarea
                        className="w-full bg-transparent text-sm text-gray-600 outline-none resize-none"
                        placeholder="Description..."
                        rows="2"
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-start items-center bg-gray-50 px-10 gap-4">
            <button
              onClick={handleSave}
              className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={onClose} className="text-gray-500 font-bold px-6 text-xs uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default HomeSr3;