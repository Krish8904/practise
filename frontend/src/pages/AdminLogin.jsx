import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔵 Form submitted!");
    console.log("🔵 Email:", formData.email);
    console.log("🔵 Password:", formData.password);

    const token = captchaRef.current.getValue();
    console.log("🔵 Captcha token:", token);
    console.log("🔵 Token length:", token?.length);

    if (!token) {
      console.error("❌ No captcha token!");
      alert("Please verify captcha");
      return;
    }

    console.log("🔵 About to send fetch request...");

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

      console.log("🔵 Fetch completed! Status:", res.status);

      const data = await res.json();
      console.log("🔵 Response data:", data);

      if (res.ok) {
        console.log("✅ Login successful!");
        navigate("/admin");
      } else {
        console.error("❌ Login failed:", data.message);
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("🔥 Fetch error:", err);
      alert("Server error: " + err.message);
    }

    captchaRef.current.reset();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Admin Login</h1>
        <p className="text-gray-600">
          Secure access for administrators only. Please enter your credentials.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Secure Dashboard</h2>
          <p className="text-gray-600">
            Manage users, content, and platform settings from one place.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Admin Access Only</h2>
          <p className="text-gray-600">
            This area is restricted to authorized personnel.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg max-w-xl mx-auto">
        <h2 className="text-2xl text-blue-600 font-bold mb-6 text-center">
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* CAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6LcKkWcsAAAAAMewdhYKJElKUj0Jgy4ysdjvJBGr"
              ref={captchaRef}
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition cursor-pointer w-50 rounded-xl"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;