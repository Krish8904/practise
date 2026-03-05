import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { ShieldCheck, Zap, FileText } from "lucide-react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = captchaRef.current.getValue();
    if (!token) {
      alert("Please verify captcha");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          captchaToken: token,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/admin");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }

    captchaRef.current.reset();
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-120 shrink-0 bg-[#1a1a1a] p-12">
        {/* logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4a7c59] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.35)" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.35)" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.15)" />
            </svg>
          </div>
          <span className="text-white font-light text-lg tracking-tight" style={{ fontFamily: "'poppins', serif" }}>
            Sub<em>Duxion</em>
          </span>
        </div>

        {/* middle content */}
        <div>
          <p className="text-[#4a7c59] text-xs font-medium tracking-widest uppercase mb-5">Admin Portal</p>
          <h2 className="text-white font-light text-4xl leading-tight tracking-tight mb-6" style={{ fontFamily: "'poppins', serif" }}>
            Manage everything<br /><em className="text-[#7ab98a]">from one place.</em>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed font-light max-w-xs">
            Full control over content, users, and platform settings. Restricted to authorized personnel only.
          </p>

          {/* feature list */}
          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, label: "Secure Dashboard" },
              { icon: Zap, label: "Real-time Control" },
              { icon: FileText, label: "Full Audit Logs" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4  text-[#7ab98a]" />
                  </div>
                  <span className="text-white/60 text-sm font-light">
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* bottom note */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]" />
          <span className="text-white/30 text-xs">Restricted access · Encrypted connection</span>
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-2 h-2 rounded-sm bg-[#4a7c59]" />
            </div>
            <span className="text-[#1a1a1a] font-light text-lg tracking-tight" style={{ fontFamily: "'poppins', serif" }}>
              Sub<em>Duxion</em>
            </span>
          </div>

          {/* heading */}
          <p className="text-[#4a7c59] text-xs font-medium tracking-widest uppercase mb-3">Sign In</p>
          <h1 className="text-[#1a1a1a] text-3xl font-light tracking-tight mb-2" style={{ fontFamily: "'poppins', serif" }}>
            Welcome <em>back</em>
          </h1>
          <p className="text-[#999] text-sm font-light mb-10 leading-relaxed">
            Enter your credentials to access the admin dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#555] mb-2 tracking-wide">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#d4d0c8] rounded-xl px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#ccc] font-light outline-none transition focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10"
              />
            </div>

            {/* captcha */}
            <div className="bg-[#eceae4] border border-[#d4d0c8] rounded-xl p-4 flex justify-center">
              <ReCAPTCHA
                sitekey="6LcKkWcsAAAAAMewdhYKJElKUj0Jgy4ysdjvJBGr"
                ref={captchaRef}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#4a7c59] text-[#f5f3ef] text-sm font-medium py-4 rounded-full transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign in to Dashboard
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">↗</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#d4d0c8] flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]" />
            <span className="text-[#bbb] text-xs">Protected by reCAPTCHA</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;