import React, { useEffect, useState } from "react";
import axios from "axios";

const CallInquiries = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const confirmBooking = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, { status: "confirmed" });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Call Inquiries</h1>
            <p className="text-slate-500">Manage your scheduled consultation calls</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
              <span className="text-slate-600 text-sm font-medium">Total: </span>
              <span className="text-blue-600 text-sm font-bold">{bookings.length}</span>
            </div>
            <div className="bg-green-50 px-5 py-2.5 rounded-full border border-green-200">
              <span className="text-green-700 text-sm font-medium">Confirmed: </span>
              <span className="text-green-700 text-sm font-bold">
                {bookings.filter(b => b.status === 'confirmed').length}
              </span>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No calls scheduled yet</h3>
            <p className="text-slate-500">Your upcoming consultation calls will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {bookings.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 group relative"
              >
                {/* Status Badge */}
                {item.status === 'confirmed' && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 mx-12 my-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Confirmed
                  </div>
                )}

                <div className="p-6 ">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 capitalize leading-tight">{item.name}</h3>
                        <p className="text-blue-600 text-sm font-medium mt-0.5">{item.phone}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteBooking(item._id)} 
                      className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                      title="Delete booking"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Topic Section */}
                  <div className="mb-5 pb-5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Discussion Topic <span className="text-xl">↴</span></p>
                    <p className="text-slate-700 font-medium leading-relaxed break-words">{item.topic}</p>
                  </div>

                  {/* Date & Time Section */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-linear-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date</p>
                      </div>
                      <p className="font-bold text-slate-800">{item.date}</p>
                    </div>
                    
                    <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Time</p>
                      </div>
                      <p className="font-bold text-blue-900">{item.time}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => confirmBooking(item._id)}
                    disabled={item.status === 'confirmed'}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      item.status === 'confirmed' 
                        ? "bg-green-500 text-white cursor-not-allowed shadow-md" 
                        : "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    {item.status === 'confirmed' ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Call Confirmed
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirm Call
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallInquiries;