import React from "react";

const SectionForm = ({ mode, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState(initialData || {
    name: '', mainText: '', secondaryText: '', alignment: 'Center', position: 999
  });

  return (
    <div className="p-10 font-poppins bg-white min-h-screen">
      <div className="flex justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-600">
          {mode === 'add' ? 'Add New Section' : `Edit: ${formData.name}`}
        </h2>
        <button onClick={onCancel} className="text-gray-500 font-semibold border px-4 py-1 rounded-xl">
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-xl border p-10 max-w-4xl space-y-6">
        <input 
          className="w-full p-3 border rounded-lg"
          placeholder="Section Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {/* ... add your other inputs here ... */}
        <button 
          onClick={() => onSave(formData)}
          className="bg-blue-600 text-white px-10 py-2 rounded-xl font-bold"
        >
          Save Section
        </button>
      </div>
    </div>
  );
};

export default SectionForm;