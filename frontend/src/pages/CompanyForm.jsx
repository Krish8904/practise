import React, { useState, useEffect } from "react";
import axios from "axios";
import { Building2, Globe, User, ChevronDown, X } from "lucide-react";

const CompanyForm = ({ editData = null, onSuccess = null, onClose = null }) => {
  const isEditMode = !!editData;

  const emptyForm = {
    companyName: "", companyEmail: "", website: "",
    countryCode: "+1", companyMobile: "",
    natureOfBusiness: [], channel: [], category: "", subcategory: [],
    firstName: "", middleName: "", lastName: "",
    personalEmail: "", personalCountryCode: "+1",
    personalMobile: "", gender: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [masterData, setMasterData] = useState({ natureOfBusiness: [], channel: [], category: [], subcategory: {} });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editData || !masterData.category.length) return;
    const findId = (list, name) => list.find((x) => x.name === name)?._id || "";
    const findIds = (list, names = []) => names.map((n) => list.find((x) => x.name === n)?._id).filter(Boolean);
    const catId = findId(masterData.category, editData.category);
    setFormData({
      companyName: editData.companyName || "", companyEmail: editData.companyEmail || "",
      website: editData.website || "", countryCode: editData.countryCode || "+1",
      companyMobile: editData.companyMobile || "",
      natureOfBusiness: findIds(masterData.natureOfBusiness, editData.natureOfBusiness),
      channel: findIds(masterData.channel, editData.channel), category: catId,
      subcategory: findIds(masterData.subcategory[catId] || [], editData.subcategory),
      firstName: editData.firstName || "", middleName: editData.middleName || "",
      lastName: editData.lastName || "", personalEmail: editData.personalEmail || "",
      personalCountryCode: editData.personalCountryCode || "+1",
      personalMobile: editData.personalMobile || "", gender: editData.gender || "",
    });
  }, [editData, masterData]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/masters/all");
        if (response.data.success) {
          const data = response.data.data;
          const subcategoryMap = {};
          (data.subcategory || []).forEach((sub) => {
            const catId = sub.category?._id || sub.category;
            if (!catId) return;
            if (!subcategoryMap[catId]) subcategoryMap[catId] = [];
            subcategoryMap[catId].push({ _id: sub._id, name: sub.name });
          });
          setMasterData({ natureOfBusiness: data.natureOfBusiness || [], channel: data.channel || [], category: data.category || [], subcategory: subcategoryMap });
        }
      } catch (err) {
        console.error("Failed to load master data:", err);
        showNotification("error", "Failed to load form options");
      } finally {
        setLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const countryCodes = [
    { code: "+1", country: "USA/Canada" }, { code: "+44", country: "UK" },
    { code: "+91", country: "India" }, { code: "+86", country: "China" },
    { code: "+81", country: "Japan" }, { code: "+49", country: "Germany" },
    { code: "+33", country: "France" }, { code: "+61", country: "Australia" },
    { code: "+971", country: "UAE" }, { code: "+65", country: "Singapore" },
  ];

  const getAvailableSubcategories = () => {
    if (!formData.category) return [];
    return masterData.subcategory[formData.category] || [];
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      if (field === "category") return { ...prev, category: value, subcategory: [] };
      const cur = prev[field];
      return { ...prev, [field]: cur.includes(value) ? cur.filter((i) => i !== value) : [...cur, value] };
    });
  };

  const toggleDropdown = (d) => setOpenDropdown(openDropdown === d ? null : d);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await axios.put("http://localhost:5000/api/companies/" + editData._id, formData);
      } else {
        response = await axios.post("http://localhost:5000/api/companies", formData);
      }
      if (response.data.success) {
        showNotification("success", isEditMode ? "Company updated successfully!" : "Company registered successfully!");
        if (!isEditMode) setFormData(emptyForm);
        if (onSuccess) setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── STYLED INPUT CLASS ──
  const inputCls = "w-full border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#bbb] font-light outline-none transition bg-[#f5f3ef] focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white";
  const selectCls = "border border-[#d4d0c8] rounded-xl px-3 py-3.5 text-sm text-[#1a1a1a] font-light outline-none transition bg-[#f5f3ef] focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white";

  function MultiDropdown({ id, label, value, options, onChange, placeholder, disabled }) {
    const getLabel = () => {
      if (Array.isArray(value)) {
        if (value.length === 0) return placeholder;
        return value.map((id) => options.find((o) => o._id === id)?.name || id).join(", ");
      }
      return options.find((o) => o._id === value)?.name || placeholder;
    };
    const hasValue = Array.isArray(value) ? value.length > 0 : !!value;

    return (
      <div>
        <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">{label}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && toggleDropdown(id)}
            disabled={disabled}
            className={`w-full border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-left flex items-center justify-between outline-none transition bg-[#f5f3ef] text-sm ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[#4a7c59]/50"} ${openDropdown === id ? "border-[#4a7c59] ring-2 ring-[#4a7c59]/10 bg-white" : ""}`}
          >
            <span className={`truncate ${hasValue ? "text-[#1a1a1a]" : "text-[#bbb]"}`}>{getLabel()}</span>
            <ChevronDown size={15} className={`shrink-0 text-[#aaa] transition-transform duration-200 ${openDropdown === id ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === id && (
            <div className="absolute z-20 w-full mt-1.5 bg-white border border-[#d4d0c8] rounded-xl shadow-xl max-h-56 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#bbb] text-center">No options available</div>
              ) : (
                options.map((item) => {
                  const checked = Array.isArray(value) ? value.includes(item._id) : value === item._id;
                  return (
                    <label key={item._id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-[#eceae4]" : "hover:bg-[#f5f3ef]"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${checked ? "bg-[#4a7c59] border-[#4a7c59]" : "border-[#d4d0c8] bg-white"}`}>
                        {checked && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" checked={checked} onChange={() => onChange(item._id)} className="hidden" />
                      <span className={`text-sm font-light ${checked ? "text-[#4a7c59] font-medium" : "text-[#555]"}`}>{item.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function SectionHeader({ icon: Icon, title, num }) {
    return (
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#d4d0c8]">
        <div className="w-10 h-10 rounded-xl bg-[#eceae4] border border-[#d4d0c8] flex items-center justify-center text-[#4a7c59] shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-normal text-[#1a1a1a] tracking-[-0.01em] m-0" style={{ fontFamily: "'poppins', serif" }}>{title}</h2>
        </div>
        <span className="text-xs text-[#bbb] font-light" style={{ fontFamily: "'poppins', serif" }}>{num}</span>
      </div>
    );
  }

  // ── TOAST ──
  const Toast = ({ zClass = "z-50" }) => notification && (
    <div className={`fixed top-6 right-6 ${zClass} max-w-md flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl animate-[slideIn_0.3s_ease-out] ${notification.type === "success" ? "bg-[#4a7c59] text-white" : "bg-red-500 text-white"}`}>
      <div className="shrink-0">
        {notification.type === "success" ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{notification.type === "success" ? "Success!" : "Error"}</p>
        <p className="text-sm mt-0.5 opacity-70">{notification.message}</p>
      </div>
      <button onClick={() => setNotification(null)} className="shrink-0 opacity-60 hover:opacity-100 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 bg-[#f5f3ef]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#d4d0c8] border-t-[#4a7c59]" />
        <p className="text-[#aaa] text-sm font-light">Loading form...</p>
      </div>
    );
  }

  // ── FORM BODY ──
  const formBody = (
    <div className="bg-white border border-[#d4d0c8] rounded-2xl p-10">

      {/* Step strip */}
      <div className="grid grid-cols-3 border border-[#d4d0c8] rounded-xl overflow-hidden mb-10">
        {[
          { n: "01", label: "Company Info", icon: Building2 },
          { n: "02", label: "Business Details", icon: Globe },
          { n: "03", label: "Contact Person", icon: User },
        ].map((s, i) => (
          <div key={s.label} className={`flex items-center gap-3 px-5 py-4 ${i < 2 ? "border-r border-[#d4d0c8]" : ""}`}>
            <span className="text-xs text-[#bbb] font-light shrink-0" style={{ fontFamily: "'poppins', serif" }}>{s.n}</span>
            <s.icon size={14} className="text-[#4a7c59] shrink-0" />
            <span className="text-xs font-medium text-[#555] whitespace-nowrap">{s.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* ── Company Information ── */}
        <div>
          <SectionHeader icon={Building2} title="Company Information" num="01" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Company Name *</label>
              <input name="companyName" type="text" placeholder="Enter company name"
                value={formData.companyName} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Company Email *</label>
              <input name="companyEmail" type="email" placeholder="company@example.com"
                value={formData.companyEmail} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Website</label>
              <input name="website" type="url" placeholder="https://www.example.com"
                value={formData.website} onChange={handleChange}
                className={inputCls} disabled={isSubmitting} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Company Mobile Number *</label>
              <div className="flex gap-2">
                <select name="countryCode" value={formData.countryCode} onChange={handleChange}
                  className={selectCls} disabled={isSubmitting}>
                  {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.country})</option>)}
                </select>
                <input name="companyMobile" type="tel" placeholder="Enter mobile number"
                  value={formData.companyMobile} onChange={handleChange}
                  className={inputCls + " flex-1"} required disabled={isSubmitting} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#d4d0c8]" />

        {/* ── Business Details ── */}
        <div>
          <SectionHeader icon={Globe} title="Business Details" num="02" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <MultiDropdown id="natureOfBusiness" label="Nature of Business *"
              value={formData.natureOfBusiness} options={masterData.natureOfBusiness}
              onChange={(v) => handleCheckboxChange("natureOfBusiness", v)}
              placeholder="Select nature of business" disabled={isSubmitting} />
            <MultiDropdown id="channel" label="Channel *"
              value={formData.channel} options={masterData.channel}
              onChange={(v) => handleCheckboxChange("channel", v)}
              placeholder="Select channels" disabled={isSubmitting} />
            <MultiDropdown id="category" label="Category *"
              value={formData.category} options={masterData.category}
              onChange={(v) => handleCheckboxChange("category", v)}
              placeholder="Select category" disabled={isSubmitting} />
            <div>
              <MultiDropdown id="subcategory" label="Subcategory *"
                value={formData.subcategory} options={getAvailableSubcategories()}
                onChange={(v) => handleCheckboxChange("subcategory", v)}
                placeholder={!formData.category ? "Select a category first" : "Select subcategories"}
                disabled={isSubmitting || !formData.category} />
              {formData.category && (
                <p className="mt-1.5 text-xs text-[#bbb] font-light">
                  Subcategories for: <span className="font-medium text-[#888]">{formData.category}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#d4d0c8]" />

        {/* ── Contact Person ── */}
        <div>
          <SectionHeader icon={User} title="Contact Person Details" num="03" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">First Name *</label>
              <input name="firstName" type="text" placeholder="First name"
                value={formData.firstName} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Middle Name</label>
              <input name="middleName" type="text" placeholder="Middle name"
                value={formData.middleName} onChange={handleChange}
                className={inputCls} disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Last Name *</label>
              <input name="lastName" type="text" placeholder="Last name"
                value={formData.lastName} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Personal Email *</label>
              <input name="personalEmail" type="email" placeholder="your.email@example.com"
                value={formData.personalEmail} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Gender *</label>
              <div className="flex gap-5 mt-3.5">
                {["male", "female", "other"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${formData.gender === g ? "border-[#4a7c59]" : "border-[#d4d0c8]"}`}>
                      {formData.gender === g && <div className="w-2 h-2 rounded-full bg-[#4a7c59]" />}
                    </div>
                    <input type="radio" name="gender" value={g}
                      checked={formData.gender === g} onChange={handleChange}
                      className="hidden" disabled={isSubmitting} />
                    <span className="text-sm text-[#555] font-light capitalize">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Personal Mobile Number *</label>
              <div className="flex gap-2">
                <select name="personalCountryCode" value={formData.personalCountryCode} onChange={handleChange}
                  className={selectCls} disabled={isSubmitting}>
                  {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.country})</option>)}
                </select>
                <input name="personalMobile" type="tel" placeholder="Enter mobile number"
                  value={formData.personalMobile} onChange={handleChange}
                  className={inputCls + " flex-1"} required disabled={isSubmitting} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex gap-3">

          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 bg-[#1a1a1a] text-[#f5f3ef] text-sm font-medium py-4 px-6 rounded-full transition-all duration-200 hover:bg-[#4a7c59] hover:-translate-y-0.5 hover:shadow-lg "
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs">
              ←
            </span>
            Go Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-3 text-[#f5f3ef] text-sm font-medium py-4 rounded-full transition-all duration-200 ${isSubmitting
                ? "bg-[#ccc] cursor-not-allowed"
                : "bg-[#1a1a1a] hover:bg-[#4a7c59] cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
              }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isEditMode ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                {isEditMode ? "Update Company" : "Register Company"}
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  ↗
                </span>
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  );

  // ── MODAL (edit mode) ──
  if (isEditMode && onClose) {
    return (
      <>
        <Toast zClass="z-[200]" />
        <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-black/60 py-8 px-4">
          <div className="bg-[#f5f3ef] rounded-2xl w-full max-w-5xl shadow-2xl relative">
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#d4d0c8]">
              <div>
                <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-1">Edit Mode</p>
                <h2 className="text-xl font-light text-[#1a1a1a] tracking-tight m-0" style={{ fontFamily: "'poppins', serif" }}>
                  Editing: <em className="italic text-[#4a7c59]">{editData.companyName}</em>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-[#d4d0c8] bg-white hover:border-red-300 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all duration-200"
              >
                <X size={16} className="text-[#aaa] hover:text-red-400 transition-colors" />
              </button>
            </div>
            <div className="px-8 py-6">{formBody}</div>
          </div>
        </div>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      </>
    );
  }

  // ── STANDALONE PAGE ──
  return (
    <>
      <Toast />
      <div className="w-full mt-20 bg-[#f5f3ef]">

        {/* Hero */}
        <div className="max-w-[1280px] mx-auto px-12 pt-20 pb-0">
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-12">
            <h1
              className="text-[clamp(3rem,5.5vw,4.5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
              style={{ fontFamily: "'poppins', serif" }}
            >
              Company <em className=" italic text-[#4a7c59]">Registration</em>
            </h1>
            <div className="flex flex-col items-end gap-4 pb-1.5">
              <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-[280px] m-0">
                Complete your company profile to unlock all features and partnership opportunities.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4a7c59]" />
                <span className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase">Partner With Us</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-[1280px] mx-auto px-12 pb-20">
          {formBody}
        </div>

      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  );
};

export default CompanyForm;