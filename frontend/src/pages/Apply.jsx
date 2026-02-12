import React, { useState, useRef } from "react";

const Apply = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResume(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("middleName", middleName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("coverLetter", coverLetter);

    if (resume) {
      formData.append("resume", resume);
    }

    try {
      const res = await fetch("http://localhost:5000/api/career/apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("success", data.message || "Application submitted successfully!");

        setFirstName("");
        setMiddleName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setCoverLetter("");
        setResume(null);
      } else {
        showNotification("error", data.error || "Failed to submit application");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-15 px-4 py-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-slide-in ${notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="shrink-0">
              {notification.type === "success" ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {notification.type === "success" ? "Success!" : "Error"}
              </p>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setNotification(null)}
              className="shrink-0 ml-2 hover:opacity-75 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Intro Text */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">Join Our Team</h1>
        <p className="text-gray-700 max-w-3xl mx-auto">
          We're excited to learn more about you! Fill out the form below and submit your resume to apply for your desired role at SubDuxion.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md space-y-6"
      >

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Cover Letter
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Write your cover letter here..."
            disabled={isSubmitting}
          />
        </div>

        <div
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed h-35 rounded-lg p-6 text-center cursor-pointer ${dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !isSubmitting && inputRef.current.click()}
        >
          {resume ? (
            <p className="text-gray-700 font-semibold">{resume.name}</p>
          ) : (
            <p className="text-gray-400">
              Drag & Drop your resume here <br /> or click to upload
            </p>
          )}
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.doc,.docx"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-[30%] px-6 py-3 rounded-xl font-bold transition shadow-lg ${isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              } text-white`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>


            ) : (
              "Apply"
            )}
          </button>
        </div>
      </form>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Apply; 