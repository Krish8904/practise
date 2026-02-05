import React, { useEffect, useState } from "react";
import axios from "axios";

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Activity Logs</h1>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log._id}
            className="bg-white shadow-md border rounded-lg p-4"
          >
            <p className="text-gray-800 font-medium">{log.message}</p>
            <div className="text-sm text-gray-500 mt-2 flex justify-between">
              <span>Type: {log.type}</span>
              <span>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logs;