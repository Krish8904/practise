import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook , Instagram} from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  const links = [
    { label: "Services", path: "/services" },
    { label: "Use Cases", path: "/usecases" },
    { label: "About Us", path: "/company" },
    { label: "Careers", path: "/careers" },
    { label: "Contact", path: "/contact" },
    { label: "Inquire", path: "/contact" },
    { label: "Book a Call", path: "/call" },
    { label: "Apply for Jobs", path: "/career/applyforjobs" },
  ];

  return (
    <footer className="bg-[#1a1a1a] text-[#f5f3ef]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── TOP STRIP ── */}
      <div className="max-w-7xl mx-auto px-12 pt-10 pb-8 border-b border-white/10">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-12 items-start">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#4a7c59] flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.35)" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.35)" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.15)" />
                </svg>
              </div>
              <span className="text-white font-light text-2xl tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Sub<em>Duxion</em>
              </span>
            </div>
            <p className="text-[0.85rem] text-white/40 leading-[1.75] font-light max-w-65 m-0">
              We design, build, and operate intelligent systems for organizations worldwide — combining advanced technology, operational precision, and dependable performance to drive sustained competitive advantage.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-5">Quick Links</p>
            <ul className="list-none m-0 p-0 grid grid-cols-2 gap-y-3 gap-x-6">
              {links.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => navigate(l.path)}
                    className="text-[0.875rem] text-white/50 hover:text-white font-light cursor-pointer bg-transparent border-none p-0 transition-colors duration-150 text-left"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>

          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-5">Contact</p>
            <ul className="list-none m-0 p-0 space-y-3">
              {[
                { icon: Mail, text: "info@subduxion.com" },
                { icon: Phone, text: "999 999 9999" },
                { icon: MapPin, text: "High Tech Campus" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-[0.875rem] text-white/50 font-light">
                  <Icon size={14} className="text-[#4a7c59] shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <p className="text-xs text-[#4a7c59] font-medium tracking-widest uppercase mb-5">Follow Us</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-2.5 text-[0.875rem] text-white/50 hover:text-white font-light cursor-pointer bg-transparent border-none p-0 transition-colors duration-150 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#4a7c59] group-hover:border-[#4a7c59] transition-all duration-150">
                    <Icon size={13} />
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;