import React, { useState } from "react";
import axios from "axios";
import Map from "../components/Map";
import { useNavigate } from "react-router-dom";
import { PhoneCall, Building2, Mail, ArrowUpRight, Zap, Handshake, Sparkles } from "lucide-react";
import ChatBot from "../components/Chatbot";

const Touch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
      showNotification("success", "Email sent successfully!");
      setFormData({ firstName: "", lastName: "", company: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err.response?.data || err.message);
      showNotification("error", err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cards = [
    {
      icon: PhoneCall,
      label: "Book a Call",
      desc: "Schedule a consultation & speak directly with our experts. Choose a time that works best for you.",
      onClick: () => navigate("/call"),
    },
    {
      icon: Mail,
      label: "Email Us Directly",
      desc: "Prefer writing? Send us your message using the form below and we'll respond within 24 hours.",
      onClick: () => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: Building2,
      label: "Company Registration",
      desc: "Register your company with us and unlock partnership opportunities. Quick and easy process.",
      onClick: () => navigate("/companyform"),
    },
  ];

  const stats = [
    { icon: Zap, text: "Response within 24h" },
    { icon: Handshake, text: "500+ companies served" },
    { icon: Sparkles, text: "Free consultation" },

  ];

  return (
    <>
      {/* Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-[slideIn_0.3s_ease-out] ${notification.type === "success" ? "bg-[#4a7c59] text-white" : "bg-red-500 text-white"
            }`}
        >
          <div className="shrink-0">
            {notification.type === "success" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{notification.type === "success" ? "Success!" : "Error"}</p>
            <p className="text-sm mt-0.5 opacity-80">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="shrink-0 opacity-60 hover:opacity-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="w-full mt-20 bg-[#f5f3ef] font-[DM_Sans,sans-serif]">

        {/* ── HERO ── */}
        <div className="max-w-7xl mx-auto px-12 pt-20 pb-0">
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-10 items-end mb-10">
            <h1
              className="text-[clamp(6rem,5.5vw,5rem)] pb-5 font-light leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] m-0"
              style={{ fontFamily: "'poppins', serif" }}
            >
              Get in <em className="not-italic  text-[#4a7c59]">Touch</em>
            </h1>
            <div className="flex flex-col items-end gap-5 pb-1.5">
              <p className="text-sm text-[#888] leading-[1.75] font-light text-right max-w-70 m-0">
                Our experts are always happy to discuss your challenge. Reach out and we'll connect you with the right person.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {stats.map((s) => (
                  <span
                    key={s.text}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#555] bg-white border border-[#d4d0c8]"
                  >
                    <s.icon size={14}  className="text-[#4a7c59] " />
                    {s.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── THREE CARDS ── */}
          <div className="grid grid-cols-3 gap-5">
            {cards.map((c, i) => (
              <div
                key={c.label}
                onClick={c.onClick}
                className="group bg-white border border-[#d4d0c8] rounded-2xl p-8 cursor-pointer flex flex-col gap-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#4a7c59]/40"
              >
                <div
                  className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(circle, rgba(74,124,89,0.08) 0%, transparent 70%)", transform: "translate(40%,-40%)" }}
                />
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-[#eceae4] border border-[#d4d0c8] flex items-center justify-center text-[#4a7c59] transition-all duration-200 group-hover:bg-[#4a7c59] group-hover:text-white">
                    <c.icon size={25} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3
                   className="text-lg font-normal text-[#1a1a1a] tracking-[-0.01em] mb-2 transition-colors duration-200 group-hover:text-[#4a7c59]"
                    style={{ fontFamily: "'poppins', serif" }}
                  >
                    {c.label}
                  </h3>
                  <p className="text-sm text-[#999] leading-[1.7] font-light m-0">{c.desc}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#4a7c59] tracking-wide uppercase">Get started</span>
                  <div className="w-8 h-8 rounded-full border border-[#c8c4bc] flex items-center justify-center text-[#aaa] text-sm transition-all duration-250 -rotate-45 scale-90 group-hover:bg-[#4a7c59] group-hover:text-white group-hover:border-[#4a7c59] group-hover:rotate-0 group-hover:scale-100">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FORM ── */}
        <div className="max-w-7xl mx-auto px-12 pt-20 pb-0">
          <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#d4d0c8]">
            <h2
              className="text-[clamp(1.8rem,3vw,2.6rem)] font-light tracking-[-0.02em] text-[#1a1a1a] m-0 leading-[1.1]"
              style={{ fontFamily: "'poppins', serif" }}
            >
              Send us a <em className="not-italic  text-[#4a7c59]">message</em>
            </h2>
            <span className="text-xs text-[#aaa] tracking-[0.08em] uppercase font-medium pb-1">
              We reply within 24h
            </span>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-16 items-start">
            {/* form fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">First Name</label>
                  <input
                    name="firstName" type="text" placeholder="Your first name"
                    value={formData.firstName} onChange={handleChange} required disabled={isSubmitting}
                    className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Last Name</label>
                  <input
                    name="lastName" type="text" placeholder="Your last name"
                    value={formData.lastName} onChange={handleChange} required disabled={isSubmitting}
                    className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Phone Number</label>
                  <input
                    name="phone" type="tel" placeholder="Your phone number"
                    value={formData.phone} onChange={handleChange} disabled={isSubmitting}
                    className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Email</label>
                  <input
                    name="email" type="email" placeholder="Your email address"
                    value={formData.email} onChange={handleChange} required disabled={isSubmitting}
                    className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">Message</label>
                <textarea
                  name="message" placeholder="How can we help you?"
                  rows="5" value={formData.message} onChange={handleChange} required disabled={isSubmitting}
                  className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 resize-none"
                />
              </div>
              <button
                type="submit" disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-3 text-[#f5f3ef] text-sm font-medium py-4 rounded-full transition-all duration-200 ${isSubmitting
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">↗</span>
                  </>
                )}
              </button>
            </form>

            {/* right side info */}
            <div className="pt-2">
              <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-4">The opportunities are here</p>
              <p
                className="text-[clamp(1.4rem,2.5vw,2rem)] font-light leading-[1.45] tracking-[-0.02em] text-[#1a1a1a] mb-8"
                style={{ fontFamily: "'poppins', serif" }}
              >
                So why <em className="not-italic  text-[#4a7c59]">wait?</em>
              </p>
              <ul className="list-none m-0 p-0">
                {[
                  { num: "01", label: "Fill in your details", desc: "Basic info to help us route your query to the right person." },
                  { num: "02", label: "Send your message", desc: "Tell us what challenge you're facing or what you're looking for." },
                  { num: "03", label: "We respond within 24h", desc: "A real person from our team will get back to you promptly." },
                ].map((step) => (
                  <li key={step.num} className="flex gap-4 py-4 border-b border-[#d4d0c8] first:border-t first:border-[#d4d0c8]">
                    <span className="text-xs text-[#bbb] font-light pt-0.5 shrink-0" style={{ fontFamily: "'poppins', serif" }}>{step.num}</span>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a] mb-1">{step.label}</p>
                      <p className="text-xs text-[#999] font-light leading-[1.6]">{step.desc}</p>
                    </div>
                  </li>
                ))} 
              </ul>
            </div>
          </div>
        </div>

        {/* ── CTA STRIP ── */}
        <div className="max-w-7xl mx-auto px-12 pt-16 pb-20 grid grid-cols-[auto_1fr] gap-3 items-stretch">
          <button
            onClick={() => navigate("/call")}
            className="inline-flex items-center gap-2.5 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] border-none px-8 rounded-2xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200"
          >
            Book a Call ↗
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
                Ready to <em className="italic text-[#7ab98a]">start</em> a conversation?
              </h2>
              <p className="text-[rgba(245,243,239,0.45)] text-sm leading-[1.7] m-0 font-light max-w-sm">
                We partner with teams that want to move with purpose — balancing speed, quality, and long-term thinking.
              </p>
            </div>
            <button
              onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2.5 bg-[#f5f3ef] hover:bg-[#7ab98a] text-[#1a1a1a] px-7 py-3.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105 relative z-10 border-none shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-[#4a7c59] shrink-0" />
              Send a Message
            </button>
          </div>
        </div>

        {/* MAP */}
        <div><Map /></div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
      <ChatBot />
    </>
  );
};

export default Touch;