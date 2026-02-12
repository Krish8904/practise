import React, { useState } from "react";
import axios from "axios";

const Call = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookCall = async (e) => {
    e.preventDefault();
    if (!name || !phone || !topic || !date || !time) return;

    setIsSubmitting(true);
    try {
      const payload = { name, phone, topic, date, time };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, payload);

      setShowSuccess(true);
      // Reset form
      setName("");
      setPhone("");
      setTopic("");
      setDate("");
      setTime("");

      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      alert("Failed to book call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto mt-10 px-4 py-20 font-poppins text-left">
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-semibold">✅ Call Booked</h4>
          <p className="text-sm opacity-90">We'll contact you at the scheduled time.</p>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl text-blue-600 font-bold mb-4">Book a Consultation Call</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Schedule a one-on-one session with our experts.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Left Info */}
        <div className="space-y-6">
          <h2 className="text-2xl text-blue-600 font-semibold">What to Expect</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-center gap-3"><span className="text-blue-500 font-bold">•</span> 30-minute strategy discussion</li>
            <li className="flex items-center gap-3"><span className="text-blue-500 font-bold">•</span> Technical & business evaluation</li>
            <li className="flex items-center gap-3"><span className="text-blue-500 font-bold">•</span> Clear roadmap & recommendations</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleBookCall} className="border rounded-2xl p-8 shadow-sm space-y-5 bg-white">
          <h3 className="text-2xl font-bold text-gray-800  mb-4">Schedule Your Call ↴</h3>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Your Name"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Topic / Discussion</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              placeholder="What do you want to discuss?"
              rows={3} // default visible rows
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl cursor-pointer font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
          >
            {isSubmitting ? "Booking you call..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Call;