import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FolderPlus,
  Trash2,
  Pencil,
  LayoutDashboard,
  SquarePlus,
  MapPin,
  Clock,
  ArrowLeft,
  Plus,
  Layers,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const emptyJob = {
  title: "",
  location: "",
  type: "",
  experience: "",
  description: "",
};

export default function ManageJobs() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/api/pages/career`);
      const data =
        res.data?.sections?.jobCategoriesSection?.jobCategories || [];
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (updatedCategories) => {
    try {
      const res = await axios.get(`${API}/api/pages/career`);
      const current = res.data;

      const updatedSections = {
        ...current.sections,
        jobCategoriesSection: {
          ...current.sections.jobCategoriesSection,
          jobCategories: updatedCategories,
        },
      };

      await axios.put(`${API}/api/pages/career`, {
        sections: updatedSections,
      });

      setCategories(updatedCategories);
    } catch (err) {
      console.error(err);
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const updated = [...categories, { category: newCategory, jobs: [] }];
    handleSave(updated);
    setNewCategory("");
  };

  const remCategory = (catIndex) => {
    const updated = categories.filter((_, i) => i !== catIndex);
    handleSave(updated);
  };

  const updateCatName = (catIndex, value) => {
    const updated = [...categories];
    updated[catIndex].category = value;
    handleSave(updated);
  };

  const addJob = (catIndex) => {
    setEditing({ catIndex, jobIndex: null });
    setJobForm(emptyJob);
  };

  const updateJob = (catIndex, jobIndex) => {
    setEditing({ catIndex, jobIndex });
    setJobForm(categories[catIndex].jobs[jobIndex]);
  };

  const handleSaveJob = () => {
    const { catIndex, jobIndex } = editing;
    const updated = [...categories];

    if (jobIndex === null) {
      updated[catIndex].jobs.push(jobForm);
    } else {
      updated[catIndex].jobs[jobIndex] = jobForm;
    }

    handleSave(updated);
    setEditing(null);
  };

  const remJob = (catIndex, jobIndex) => {
    const updated = [...categories];
    updated[catIndex].jobs = updated[catIndex].jobs.filter(
      (_, i) => i !== jobIndex
    );
    handleSave(updated);
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-12 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-2xl shadow-inner">
            <Briefcase className="text-blue-600" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Manage Career Openings
            </h2>
            <p className="text-gray-500 pt-2">
              Manage departments and job listings shown on your website :
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

      {/* Add Category */}
      <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border flex gap-4 items-center">
        <FolderPlus className="text-blue-600" size={22} />
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add new department (e.g. Engineering, Marketing)"
          className="border px-4 py-3 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          onClick={addCategory}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-3 rounded-xl font-medium shadow"
        >
          Add
        </button>
      </div>

      {/* Categories */}
      {categories.map((cat, catIndex) => (
        <div
          key={catIndex}
          className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6"
        >
          {/* Category Header */}
          <div className="flex justify-between items-center border-b pb-5">
            <div className="flex items-center gap-3">
              <Layers className="text-blue-600" />
              <input
                value={cat.category}
                onChange={(e) => updateCatName(catIndex, e.target.value)}
                className="text-2xl font-semibold outline-none focus:text-blue-600 bg-transparent  h-10 leading-loose"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addJob(catIndex)}
                className="flex items-center gap-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm shadow"
              >
                <SquarePlus size={16} />
                Add Job
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Delete this department?")) {
                    remCategory(catIndex);
                  }
                }}
                className="flex items-center gap-2 cursor-pointer bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-red-600 text-sm"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          {/* Jobs */}
          {cat.jobs.map((job, jobIndex) => (
            <div
              key={jobIndex}
              className="border border-slate-200 rounded-2xl p-6 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white hover:shadow-lg transition"
            >
              <div className="space-y-2">
                <p className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
                  <Briefcase size={18} />
                  {job.title}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-6">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {job.type}
                  </span>
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => updateJob(catIndex, jobIndex)}
                  className="bg-blue-100 hover:bg-blue-200 p-3 cursor-pointer rounded-xl text-blue-600"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this job?")) {
                      remJob(catIndex, jobIndex);
                    }
                  }}
                  className="bg-red-100 hover:bg-red-200 p-3 rounded-xl cursor-pointer text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[75vw] h-[83vh] p-10 rounded-2xl shadow-2xl flex flex-col">

            {/* Header */}
            <div>
              <h3 className="text-3xl font-bold text-slate-800">Edit Job</h3>
              <p className="text-slate-500 mt-1">
                Fill in the job details below to update this opening
              </p>
            </div>

            {/* Form Area */}
            <div className="flex-1 flex flex-col gap-6 mt-6">

              {/* Title + Location in one row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Job Title
                  </label>
                  <input
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    className="border mt-2 w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Location
                  </label>
                  <select
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location: e.target.value })
                    }
                    className="border mt-2 w-full px-4 py-3 rounded-xl"
                  >
                    <option value="">Select Location</option>
                    <option>On Site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Employment Type
                </label>
                <select
                  value={jobForm.type}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, type: e.target.value })
                  }
                  className="border mt-2 w-full px-4 py-3 rounded-xl"
                >
                  <option value="">Select Type</option>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                </select>
              </div>

              {/* Description fills remaining space */}
              <div className="flex flex-col flex-1">
                <label className="text-sm font-semibold text-slate-600">
                  Job Description
                </label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                  className="border mt-2 w-full px-4 py-3 rounded-xl flex-1 resize-none"
                />
              </div>

            </div>

            {/* Buttons fixed at bottom */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={() => setEditing(null)}
                className="px-6 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                className="bg-blue-600 text-white px-8 py-2 rounded-xl shadow"
              >
                Save Job
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}