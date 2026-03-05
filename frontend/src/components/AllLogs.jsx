import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, Filter, Search } from "lucide-react";

export default function AllLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/api/logs");

      // Ensure logs is always an array
      const data = Array.isArray(res.data.logs)
        ? res.data.logs
        : Array.isArray(res.data)
          ? res.data
          : [];
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = (logs || [])
    .filter((log) =>
      log.message?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((log) => {
      if (typeFilter === "all") return true;
      if (typeFilter === "create") return log.message?.toLowerCase().includes("added");
      if (typeFilter === "update") return log.message?.toLowerCase().includes("updated");
      if (typeFilter === "delete") return log.message?.toLowerCase().includes("section deleted");
      if (typeFilter === "booking") return log.type === "booking";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return <p className="p-6 text-slate-700">Loading logs...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!filteredLogs.length) {
    return <p className="p-6 text-slate-500">No logs found.</p>;
  }

  return (
    <div className="space-y-6 p-0 animate-fade-in">
      <h2 className="text-4xl font-bold text-blue-500">All Activity Logs</h2>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex flex-col md:flex-row gap-4 md:items-center">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 bg-slate-200 px-4 py-3 rounded-xl">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-700"
          />
        </div>

        {/* Custom Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-slate-200 px-4 py-3 rounded-xl cursor-pointer">
            <Filter size={18} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-transparent pr-8 outline-none text-slate-700 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="booking">Booking</option>
            </select>

            {/* Arrow */}
            <div className="pointer-events-none absolute right-3 text-slate-400">▼</div>
          </div>
        </div>
      </div>

      {/* Logs Cards */}
      <div className="max-h-150 overflow-y-auto space-y-4 pr-2">
        {filteredLogs.map((log, index) => (
          <div
            key={log._id || index} // fallback key
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <p className="font-semibold text-slate-800">{log.message || "No message"}</p>
              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                {log.type || "N/A"}
              </span>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
              <Clock size={12} />
              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown time"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}