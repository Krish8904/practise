import React from "react";
import { Link } from "react-router";

const Touch = () => {
  return (
    <div className="max-w-5xl mt-20 mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl text-blue-600 font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 text-xxl">
          Our experts are always happy to discuss your challenge. Reach out, and we
          will connect  <br /> you with a member of our team.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Speak to our team</h2>
          <p className="text-gray-600 mb-4">Free 30-minute call to discuss your needs.</p>
          <a href="/call"> 
          <button className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700">            
            Book a Call
          </button>
          </a>
        </div>

        <div className="p-6 border rounded-lg shadow hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Email us directly</h2>
          <p className="text-gray-600 pb-6">Reach out for general enquiries.</p>
          <span className="bg-black text-white px-3 py-2 rounded">
            Email us directly by filling out the form below ↴
          </span>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          The opportunities are here. So why wait?
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              type="text"
              placeholder="Your first name"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              type="text"
              placeholder="Your last name"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Company</label>
            <input
              type="text"
              placeholder="Your company"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="Your email address"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="Your phone number"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              placeholder="How can we help you?"
              rows="5"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
          <div className="md:col-span-2 text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 cursor-pointer transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Touch;
