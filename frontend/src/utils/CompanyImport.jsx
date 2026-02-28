import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileSpreadsheet } from "lucide-react";

const API = "http://localhost:5000/api";
const COLUMN_MAP = {
  "Company": "companyName",
  "Company Email": "companyEmail",
  "Website": "website",
  "Nature of Business": "natureOfBusiness",
  "Channel": "channel",             
  "Category": "category",            
  "Subcategory": "subcategory",      
  "Company Mobile": "companyMobile",
  "Contact Person": "_contactPerson",        "Gender": "gender",
  "Personal Email": "personalEmail",
  "Personal Mobile": "personalMobile",
};

const splitCell = (val) =>
  val == null || val === ""
    ? []
    : String(val).split(/[,;]/).map((s) => s.trim()).filter(Boolean);

const buildMap = (arr = []) => {
  const m = {};
  arr.forEach((d) => {
    if (d.name) m[d.name.trim().toLowerCase()] = d._id;
  });
  return m;
};

export default function CompanyImport({ onSuccess }) {
  const fileRef = useRef(null);

  const [lookups, setLookups] = useState(null);
  const [lookupsError, setLookupsError] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [rows, setRows] = useState([]);         // raw parsed rows (names as strings)
  const [resolvedRows, setResolvedRows] = useState([]);         // rows with ObjectIds
  const [warnings, setWarnings] = useState([]);         // unresolved name warnings
  const [apiErrors, setApiErrors] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ── Fetch all lookup data in one call via /api/masters/all ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/masters/all`);
        const d = res.data.data;
        setLookups({
          categories: buildMap(d.category),
          natures: buildMap(d.natureOfBusiness),
          channels: buildMap(d.channel),
          subcategories: buildMap(d.subcategory),
        });
      } catch (err) {
        console.error("Failed to load lookups:", err);
        setLookupsError(true);
      }
    };
    load();
  }, []);

  /* ── Resolve a single raw row's string values → ObjectIds ── */
  const resolveRow = (raw, warns) => {
    const resolved = { ...raw };

    /* category → single ObjectId string */
    if (raw.category) {
      const id = lookups.categories[raw.category.toLowerCase()];
      if (id) resolved.category = id;
      else {
        warns.push(`Category not found: "${raw.category}" (${raw.companyName})`);
        delete resolved.category;
      }
    }

    /* natureOfBusiness → ObjectId[] */
    const natures = splitCell(raw.natureOfBusiness);
    resolved.natureOfBusiness = natures
      .map((n) => {
        const id = lookups.natures[n.toLowerCase()];
        if (!id) warns.push(`Nature of Business not found: "${n}" (${raw.companyName})`);
        return id;
      })
      .filter(Boolean);

    /* channel → ObjectId[] */
    const channels = splitCell(raw.channel);
    resolved.channel = channels
      .map((c) => {
        const id = lookups.channels[c.toLowerCase()];
        if (!id) warns.push(`Channel not found: "${c}" (${raw.companyName})`);
        return id;
      })
      .filter(Boolean);

    /* subcategory → ObjectId[] */
    const subs = splitCell(raw.subcategory);
    resolved.subcategory = subs
      .map((s) => {
        const id = lookups.subcategories[s.toLowerCase()];
        if (!id) warns.push(`Subcategory not found: "${s}" (${raw.companyName})`);
        return id;
      })
      .filter(Boolean);

    return resolved;
  };

  /* ── 1. Open file picker ── */
  const handleButtonClick = () => {
    setShowModal(true);
  };

  const processFile = async (file) => {
    setFileName(file.name);
    setStatus("parsing");
    setApiErrors([]);
    setWarnings([]);
    setUploadResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawArr = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const mapped = rawArr
        .map((row) => {
          const obj = {};
          for (const [excelCol, fieldName] of Object.entries(COLUMN_MAP)) {
            const val = row[excelCol];
            if (val != null && val !== "") obj[fieldName] = String(val).trim();
          }

          if (obj._contactPerson) {
            const parts = obj._contactPerson.trim().split(/\s+/);
            obj.firstName = parts[0] ?? "";
            obj.lastName = parts.slice(1).join(" ") || "";
            delete obj._contactPerson;
          }

          return obj;
        })
        .filter((r) => r.companyName);

      setRows(mapped);

      if (lookups) {
        const warns = [];
        const resolved = mapped.map((r) => resolveRow(r, warns));
        setResolvedRows(resolved);
        setWarnings(warns);
      }

      setStatus("preview");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setApiErrors(["Failed to parse file."]);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await processFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  /* ── 3. Confirm → POST /api/companies/bulk ── */
  const handleUpload = async () => {
    if (!resolvedRows.length) return;
    setStatus("uploading");

    try {
      const res = await axios.post(`${API}/companies/bulk`, { companies: resolvedRows });

      if (res.data.success) {
        setUploadResult(res.data);
        setStatus("done");
        onSuccess?.();
      } else {
        setApiErrors([res.data.message ?? "Unknown error"]);
        setStatus("error");
      }
    } catch (err) {
      setApiErrors([err.response?.data?.message ?? err.message]);
      setStatus("error");
    }
  };

  /* ── Close / Reset ── */
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      setStatus("idle");
      setRows([]);
      setResolvedRows([]);
      setWarnings([]);
      setApiErrors([]);
      setFileName("");
      setUploadResult(null);
    }, 200);
  };

  /* ─────────────────────────── RENDER ────────────────────────── */
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Import Button */}
      <button
        onClick={handleButtonClick}
        disabled={lookupsError}
        title={lookupsError ? "Could not load lookup data from server" : "Import from Excel / CSV"}
        className="inline-flex items-center gap-2 px-4 mr-1.5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg border border-blue-600 hover:bg-white hover:text-blue-600 transition-all shrink-0 whitespace-nowrap cursor-pointer"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <Upload size={14} />
        Import
      </button>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
          onClick={handleClose}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
            style={{ maxWidth: 780, maxHeight: "88vh", margin: "0 16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                  <FileSpreadsheet size={18} className="text-green-600" />
                </div>
                <div>
                  <h2
                    className="text-base font-bold text-gray-900"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Import Companies
                  </h2>

                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto px-12 py-10">

              {/* Idle → Drag & Drop */}
              {status === "idle" && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"

                >
                  <div className="p-3 text-blue-600  "><Upload size={28} /></div>
                  <p className="text-sm font-semibold text-gray-800">
                    Drag & drop your Excel file here
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    or click below to browse (.xlsx, .xls, .csv)
                  </p>

                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    Choose File
                  </button>
                </div>
              )}

              {/* Parsing spinner */}
              {status === "parsing" && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={36} className="text-blue-500 animate-spin" />
                  <p className="text-sm font-medium text-gray-600">Reading file…</p>
                </div>
              )}

              {/* Uploading spinner */}
              {status === "uploading" && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={36} className="text-violet-500 animate-spin" />
                  <p className="text-sm font-medium text-gray-600">
                    Uploading {resolvedRows.length} companies…
                  </p>
                </div>
              )}

              {/* Preview */}
              {status === "preview" && (
                <>
                  <div className="flex items-center gap-2 mb-4">

                    <p className="text-sm font-medium text-gray-600">
                      <span className="font-bold text-gray-900">{rows.length}</span>{" "}
                      companies found. Review before importing.
                    </p>
                    {warnings.length > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        {warnings.length} warning{warnings.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 max-h-28 overflow-y-auto">
                      <p className="text-xs font-semibold text-amber-700 mb-1">
                        ⚠ These names didn't match any DB record and will be left empty:
                      </p>
                      {warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-600">{w}</p>
                      ))}
                    </div>
                  )}

                  {/* Preview table — shows original string values for readability */}
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-max w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {["#", "Company Name", "Category", "Nature of Business", "Channel", "Email", "Contact Person"].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rows.slice(0, 8).map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400 tabular-nums">{i + 1}</td>
                            <td className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{r.companyName}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.category}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.natureOfBusiness}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.channel}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.companyEmail}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                              {[r.firstName, r.lastName].filter(Boolean).join(" ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 8 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      …and {rows.length - 8} more rows
                    </p>
                  )}

                  {/* Lookups not loaded warning */}
                  {!lookups && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                      <p className="text-xs text-red-600 font-semibold">
                        ⚠ Lookup data (categories, channels, etc.) failed to load.
                        Category / channel IDs won't be resolved correctly.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Success */}
              {status === "done" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CheckCircle size={48} className="text-green-500" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">Import Complete!</p>
                    {uploadResult && (
                      <p className="text-sm text-gray-500 mt-1">
                        {uploadResult.insertedCount ?? uploadResult.inserted ?? resolvedRows.length}{" "}
                        companies added successfully.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <AlertCircle size={48} className="text-red-500" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">Import Failed</p>
                  </div>
                  <div className="w-full rounded-lg bg-red-50 border border-red-200 p-3 max-h-40 overflow-y-auto">
                    {apiErrors.map((e, i) => (
                      <p key={i} className="text-xs text-red-600">{e}</p>
                    ))}
                  </div>
                  <button
                    onClick={handleButtonClick}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                  >
                    Try another file
                  </button>
                </div>
              )}
              {fileName && (
                <p className="mt-5 text-xs font-semibold  text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full">
                  📄 {fileName}
                </p>
              )}
            </div>

            {/* ── Footer ── */}
            {status === "preview" && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!lookups}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Import {rows.length} Companies
                </button>
              </div>
            )}

            {status === "done" && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}