import React, { useEffect, useState } from "react";
import axios from "axios";

const CallInquiries = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const confirmBooking = async (id) => {
  try {
    // This assumes you add a PUT route to your backend
    await axios.put(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, { status: "confirmed" });
    
    // Update local state so the UI reflects the change
    setBookings(bookings.map(b => b._id === id ? { ...b, status: "confirmed" } : b));
  } catch (err) {
    alert("Failed to confirm call");
  }
};
    
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  if (loading) return <div className="p-10 text-center text-gray-400 uppercase tracking-widest text-sm">Loading Bookings...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Call Inquiries</h2>
        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          {bookings.length} Total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((item) => (
          <div key={item._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <button onClick={() => deleteBooking(item._id)} className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1 capitalize">{item.name}</h3>
            <p className="text-blue-600 font-semibold mb-4">{item.phone}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Date</p>
                <p className="font-bold text-gray-700 text-sm">{item.date}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Time</p>
                <p className="font-bold text-gray-700 text-sm">{item.time}</p>
              </div>
            </div>

            <button 
              onClick={() => confirmBooking(item._id)}
              disabled={item.status === 'confirmed'}
              className={`w-full py-3 rounded-xl cursor-pointer font-bold text-sm transition-colors ${
                item.status === 'confirmed' 
                ? "bg-green-600 text-white cursor-default" 
                : "bg-slate-900 text-white group-hover:bg-blue-600"
              }`}
            >
              {item.status === 'confirmed' ? "✓ Call Confirmed" : "Confirm Call"}
            </button>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 italic">No scheduled calls found.</div>
        )}
      </div>
    </div>
  );
};

export default CallInquiries;