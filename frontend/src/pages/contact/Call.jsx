import React, { useState } from "react";
import axios from "axios";
import { Clock, BarChart2, Map, CalendarCheck, CheckCircle2 } from "lucide-react";

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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, { name, phone, topic, date, time });
      setShowSuccess(true);
      setName(""); setPhone(""); setTopic(""); setDate(""); setTime("");
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      alert("Failed to book call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const perks = [
    { icon: Clock, text: "30-minute strategy discussion", desc: "Focused and efficient — no fluff, just value." },
    { icon: BarChart2, text: "Technical & business evaluation", desc: "We assess your challenge from every angle." },
    { icon: Map, text: "Clear roadmap & recommendations", desc: "Walk away with a concrete path forward." },
  ];

  const steps = [
    { n: "01", label: "Fill the form", desc: "Tell us your name, number, and topic." },
    { n: "02", label: "We confirm your slot", desc: "Our team reaches out to lock in the time." },
    { n: "03", label: "Join the call", desc: "Connect with an expert, no commitment." },
  ];

  return (
    <>
      {/* Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-start gap-3 bg-[#4a7c59] text-white rounded-xl px-5 py-4 shadow-2xl animate-[slideIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)] min-w-72">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 opacity-80" />
          <div>
            <p className="font-medium text-sm">Call Booked!</p>
            <p className="text-xs mt-0.5 opacity-60">We'll contact you at the scheduled time.</p>
          </div>
        </div>
      )}

      <div className="w-full mt-20 bg-[#f5f3ef]">

        {/* ── HERO ── */}
        <div className="max-w-7xl mx-auto px-12 pt-20 pb-0">
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-10  items-end mb-22">
            <h1
              className="text-[clamp(3rem,5.5vw,5rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Book a <em className="not-italic  text-[#4a7c59]">Consultation</em>
            </h1>
            <div className="flex flex-col items-end gap-5 pb-1.5">
              <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-70 m-0">
                Schedule a one-on-one session with our experts and get a clear path forward for your project.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse" />
                <span className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase">Free Consultation</span>
              </div>
            </div>
          </div>

          {/* How it works — row list */}
          <div className="border-t border-b border-[#d4d0c8]">
            <div className="grid grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  className={`flex gap-5 items-start py-7 px-6 ${i < steps.length - 1 ? "border-r border-[#d4d0c8]" : ""}`}
                >
                  <span
                    className="text-xs text-[#bbb] font-light pt-0.5 shrink-0"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a] mb-1">{step.label}</p>
                    <p className="text-xs text-[#999] font-light leading-[1.6]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="max-w-7xl mx-auto px-12 pt-16 pb-0">
          <div className="grid grid-cols-[1fr_1fr] gap-16 items-start">

            {/* LEFT — what to expect */}
            <div>
              <div className="flex items-end justify-between mb-10 pb-6 border-b border-[#d4d0c8]">
                <h2
                  className="text-[clamp(1.8rem,3vw,2.4rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  What to <em className="not-italic text-[#4a7c59]">Expect</em>
                </h2>
                <span className="text-xs text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
                  {String(perks.length).padStart(2, "0")} Perks
                </span>
              </div>

              <ul className="list-none m-0 p-0">
                {perks.map((p, i) => (
                  <li
                    key={p.text}
                    className="flex gap-5 items-start py-5 border-b border-[#d4d0c8] first:border-t first:border-[#d4d0c8] group hover:bg-[#eceae4] hover:px-3 rounded-xl transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#eceae4] border border-[#d4d0c8] flex items-center justify-center text-[#4a7c59] shrink-0 transition-all duration-200 group-hover:bg-[#4a7c59] group-hover:text-white">
                      <p.icon size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a] mb-1">{p.text}</p>
                      <p className="text-xs text-[#999] font-light leading-[1.6]">{p.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* free note */}
              <div className="mt-8 flex items-center gap-3 bg-white border border-[#d4d0c8] rounded-2xl px-5 py-4">
                <div className="w-8 h-8 rounded-xl bg-[#dceede] flex items-center justify-center text-[#4a7c59] shrink-0 text-sm">
                  ✦
                </div>
                <p className="text-sm text-[#555] font-light leading-relaxed">
                  No commitment required — the call is <span className="font-medium text-[#4a7c59]">completely free.</span>
                </p>
              </div>
            </div>

            {/* RIGHT — form */}
            <div className="bg-white border border-[#d4d0c8] rounded-2xl p-10">
              <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-2">Schedule Your Call</p>
              <h3
                className="text-2xl font-light tracking-[-0.02em] text-[#1a1a1a] mb-8"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Let's find a <em className="not-italic  text-[#4a7c59]">time</em> that works
              </h3>

              <form onSubmit={handleBookCall} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Full Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name" required disabled={isSubmitting}
                    className="w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#bbb] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Phone Number</label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX" required disabled={isSubmitting}
                    className="w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#bbb] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Topic / Discussion</label>
                  <textarea
                    value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="What do you want to discuss?" rows={3} required disabled={isSubmitting}
                    className="w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#bbb] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Date</label>
                    <input
                      type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      required disabled={isSubmitting}
                      className="w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Time</label>
                    <input
                      type="time" value={time} onChange={(e) => setTime(e.target.value)}
                      required disabled={isSubmitting}
                      className="w-full bg-[#f5f3ef] border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 text-[#f5f3ef] text-sm font-medium py-4 rounded-full transition-all duration-200 mt-2 ${
                    isSubmitting
                      ? "bg-[#ccc] cursor-not-allowed"
                      : "bg-[#1a1a1a] hover:bg-[#4a7c59] cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Booking your call...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">↗</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── CTA STRIP ── */}
        <div className="max-w-7xl mx-auto px-12 pt-16 pb-20 grid grid-cols-[auto_1fr] gap-3 items-stretch">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] border-none px-8 rounded-2xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200"
          >
            ← Go Back
          </button>
          <div className="bg-[#1a1a1a] rounded-2xl px-12 py-10 flex items-center justify-between gap-8 relative overflow-hidden">
            <div
              className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(74,124,89,0.35) 0%, transparent 70%)" }}
            />
            <div className="relative z-10">
              <h2
                className="text-[clamp(1.3rem,2.5vw,2rem)] font-light text-[#f5f3ef] tracking-[-0.02em] leading-[1.2] m-0 mb-2"
                style={{ fontFamily: "'poppins', serif" }}
              >
                Not ready to call? <em className="not-italic text-[#7ab98a]">Write to us.</em>
              </h2>
              <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                Send a message and a real person from our team will get back to you within 24 hours.
              </p>
            </div>
            <a
              href="/contact"
              className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 no-underline shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
              Send a Message
            </a>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Call;