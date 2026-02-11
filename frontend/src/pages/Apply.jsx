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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      
      (data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-15 px-4 py-16">
      {/* Intro Text */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">Join Our Team</h1>
        <p className="text-gray-700 max-w-3xl mx-auto">
          We’re excited to learn more about you! Fill out the form below and submit your resume to apply for your desired role at SubDuxion.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md space-y-6"
      >
        {/* Row 1: Name */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Middle Name</label>
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Row 2: Email & Phone */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Row 3: Cover Letter */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Write your cover letter here..."
          />
        </div>

        {/* Row 4: Resume Upload */}
        <div
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed h-35 rounded-lg p-6 text-center cursor-pointer ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
          onClick={() => inputRef.current.click()}
        >
          {resume ? (
            <p className="text-gray-700 font-semibold">{resume.name}</p>
          ) : (
            <p className="text-gray-400 ">Drag & Drop your resume here or click to upload</p>
          )}
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.doc,.docx"
          />
        </div>

        <button
          type="submit"
          className="w-[50%] cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
        >
          Apply
        </button>
      </form>
    </div>
  );
};

export default Apply;