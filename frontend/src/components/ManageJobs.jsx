import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Briefcase, FolderPlus, Trash2, Pencil,
  MapPin, Plus, Layers, ArrowLeft, X,
  ChevronDown,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const emptyJob = { title: "", location: "", type: "", experience: "", description: "" };

const DEPT_GRADIENTS = [
  { from: "from-blue-500", to: "to-blue-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  { from: "from-violet-500", to: "to-violet-600", light: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  { from: "from-emerald-500", to: "to-emerald-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  { from: "from-orange-500", to: "to-orange-600", light: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
  { from: "from-pink-500", to: "to-pink-600", light: "bg-pink-50", text: "text-pink-600", border: "border-pink-100" },
  { from: "from-cyan-500", to: "to-cyan-600", light: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100" },
];

const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer pr-10"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

export default function ManageJobs() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [editing, setEditing] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/api/pages/career`);
      const data = res.data?.sections?.jobCategoriesSection?.jobCategories || [];
      setCategories(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (updatedCategories) => {
    try {
      const res = await axios.get(`${API}/api/pages/career`);
      const current = res.data;
      await axios.put(`${API}/api/pages/career`, {
        sections: {
          ...current.sections,
          jobCategoriesSection: {
            ...current.sections.jobCategoriesSection,
            jobCategories: updatedCategories,
          },
        },
      });
      setCategories(updatedCategories);
    } catch (err) { console.error(err); }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    handleSave([...categories, { category: newCategory, jobs: [] }]);
    setNewCategory("");
  };
  const remCategory = (i) => {
    if (activeCat === i) setActiveCat(null);
    handleSave(categories.filter((_, idx) => idx !== i));
  };
  const updateCatName = (i, value) => {
    const u = [...categories]; u[i].category = value; handleSave(u);
  };
  const addJob = () => { setEditing({ jobIndex: null }); setJobForm(emptyJob); };
  const updateJob = (jobIndex) => { setEditing({ jobIndex }); setJobForm(categories[activeCat].jobs[jobIndex]); };
  const handleSaveJob = () => {
    const { jobIndex } = editing;
    const u = [...categories];
    if (jobIndex === null) u[activeCat].jobs.push(jobForm);
    else u[activeCat].jobs[jobIndex] = jobForm;
    handleSave(u); setEditing(null);
  };
  const remJob = (jobIndex) => {
    const u = [...categories];
    u[activeCat].jobs = u[activeCat].jobs.filter((_, i) => i !== jobIndex);
    handleSave(u);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalRoles = categories.reduce((a, c) => a + c.jobs.length, 0);
  const currentCat = activeCat !== null ? categories[activeCat] : null;
  const currentGradient = activeCat !== null ? DEPT_GRADIENTS[activeCat % DEPT_GRADIENTS.length] : null;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── DEPARTMENTS VIEW ───────────────────────────────────── */}
      {activeCat === null ? (
        <>
          <div className="flex items-start mt-10 justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">Career Openings</h2>
              <p className="text-slate-500 text-sm">
                Manage departments and job listings shown on your website
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                  {categories.length} depts · {totalRoles} roles
                </span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold ml-5  tracking-wide text-slate-600 mb-3">New Department</p>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                <FolderPlus size={18} className="text-white" />
              </div>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder="e.g. Engineering, Marketing, Design..."
                className="flex-1 text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              <button onClick={addCategory} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition cursor-pointer">
                Add
              </button>
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="text-sm font-bold tracking-wide ml-5 text-slate-600 mb-3">Departments</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat, i) => {
                  const g = DEPT_GRADIENTS[i % DEPT_GRADIENTS.length];
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveCat(i)}
                      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up"
                    >
                      <div className={`h-1 w-full bg-linear-to-r ${g.from} ${g.to}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div className={`w-12 h-12 bg-linear-to-br ${g.from} ${g.to} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <Layers size={20} className="text-white" />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this department?")) remCategory(i); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl truncate mb-1">{cat.category}</h3>
                        <p className="text-sm text-slate-400">{cat.jobs.length} {cat.jobs.length === 1 ? "open role" : "open roles"}</p>
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex -space-x-1">
                            {cat.jobs.slice(0, 4).map((_, j) => (
                              <div key={j} className={`w-5 h-5 rounded-full ${g.light} border-2 border-white flex items-center justify-center`}>
                                <Briefcase size={9} className={g.text} />
                              </div>
                            ))}
                            {cat.jobs.length === 0 && <span className="text-xs text-slate-400">No roles yet</span>}
                          </div>
                          <span className={`text-xs font-semibold ${g.text} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                            Manage →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Layers size={22} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No departments yet</p>
              <p className="text-slate-300 text-xs mt-1">Add one above to get started</p>
            </div>
          )}
        </>
      ) : (
        // ── JOBS VIEW ──────────────────────────────────────────
        <>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveCat(null)}
                className="w-9 h-9 rounded-md border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer shadow-sm shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <input
                  value={currentCat.category}
                  onChange={(e) => updateCatName(activeCat, e.target.value)}
                  className="text-3xl font-bold text-slate-900 bg-transparent outline-none focus:text-blue-600 transition-colors leading-none block"
                />
                <p className="text-slate-500 text-sm mt-1">
                  {currentCat.jobs.length} {currentCat.jobs.length === 1 ? "role" : "roles"} in this department
                </p>
              </div>
            </div>
            <button
              onClick={addJob}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus size={15} /> Add Role
            </button>
          </div>

          <div>
            <p className="text-sm font-bold tracking-wide text-slate-600 mb-3">Active Roles <span className="text-lg">↴</span></p>
            {currentCat.jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-16 text-center">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${currentGradient.from} ${currentGradient.to} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Briefcase size={18} className="text-white" />
                </div>
                <p className="text-slate-700 font-semibold text-sm mb-1">No roles yet</p>
                <p className="text-slate-400 text-xs mb-4">Start adding positions to the {currentCat.category} department</p>
                <button
                  onClick={addJob}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition cursor-pointer shadow-sm"
                >
                  <Plus size={14} /> Add First Role
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="col-span-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</div>
                  <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</div>
                  <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</div>
                  <div className="col-span-1" />
                </div>
                <div className="divide-y divide-slate-50">
                  {currentCat.jobs.map((job, jobIndex) => (
                    <div
                      key={jobIndex}
                      className="group grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors animate-fade-in-up"
                    >
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${currentGradient.from} ${currentGradient.to} flex items-center justify-center shrink-0`}>
                          <Briefcase size={13} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                      </div>
                      <div className="col-span-3">
                        {job.location ? (
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <MapPin size={11} className="shrink-0" />{job.location}
                          </span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </div>
                      <div className="col-span-3">
                        {job.type ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {job.type}
                          </span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateJob(jobIndex)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { if (window.confirm("Delete this job?")) remJob(jobIndex); }} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

     {/* ── Modal ── */}
      {editing && currentGradient && (
        <div className="fixed inset-0 m-0 bg-slate-700/20 backdrop-blur flex items-center justify-center z-50 p-6 ">
          <div className="bg-white w-full rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] max-w-[95vw]">

            {/* Modal hero header — icon + text side by side */}
            <div className={`bg-linear-to-br ${currentGradient.from} ${currentGradient.to} px-8 py-6 relative flex items-center gap-5`}>
              <button
                onClick={() => setEditing(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Briefcase size={24} className="text-white" />
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white leading-tight">
                  {editing.jobIndex === null ? "Add New Role" : "Edit Role"}
                </h3>
                <p className="text-white/70 text-md ">{currentCat?.category} Department</p>
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Job Title</label>
                <input
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <SelectField
                  label="Location"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  options={["On Site", "Remote", "Hybrid"]}
                  placeholder="Select location"
                />
                <SelectField
                  label="Employment Type"
                  value={jobForm.type}
                  onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  options={["Full Time", "Part Time", "Contract"]}
                  placeholder="Select type"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Job Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe responsibilities, requirements, and what makes this role exciting..."
                  rows={6}
                  className="w-full border h-25 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setEditing(null)}
                className="text-sm font-medium px-4 mr-3 bg-red-500 text-white hover:bg-white hover:text-red-500 border py-2.5 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                className={`bg-linear-to-r ${currentGradient.from} ${currentGradient.to} hover:opacity-90 text-white text-sm font-bold px-7 py-2.5 rounded-lg shadow-sm transition cursor-pointer`}
              >
                {editing.jobIndex === null ? "Add Role" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
      `}</style>
    </div>
  );
}