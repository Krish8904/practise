import React, { useEffect, useState } from "react";
import axios from "axios";

const ContactInquiries = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/contact`
      );
      setContacts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/contact/${id}`
      );
      setContacts(contacts.filter((c) => c._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading messages...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Contact Inquiries
            </h1>
            <p className="text-slate-500">
              Manage messages submitted through your contact form
            </p>
          </div>

          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
            <span className="text-slate-600 text-sm font-medium">Total: </span>
            <span className="text-blue-600 text-sm font-bold">
              {contacts.length}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {contacts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18V8H3v8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No messages yet
            </h3>
            <p className="text-slate-500">
              Contact form submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {contacts.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-70 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
              >
                <div className="p-6 ">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18V8H3v8z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {item.firstName} {item.lastName}
                        </h3>
                        <p className="text-blue-600 text-sm font-medium">
                          {item.email}
                        </p>
                        {item.phone && (
                          <p className="text-slate-500 text-sm">
                            {item.phone}
                          </p>
                        )}
                        {item.company && (
                          <p className="text-slate-400 text-sm">
                            {item.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteContact(item._id)}
                      className="text-slate-300 cursor-pointer hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                      title="Delete message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Message Section */}
                  <div className="mb-5 pb-5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                      Message <span className="text-xl">↴</span>
                    </p>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line wreap-break-word">
                      {item.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="text-sm  text-slate-400">
                    Received: {new Date(item.createdAt).toLocaleString()}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInquiries;