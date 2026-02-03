import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = () => {
    if (window.scrollY > lastScrollY) {
      setShowHeader(false); 
    } else {
      setShowHeader(true); 
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  const navLinks = [
    { path: "services", label: "Services" },
    { path: "company", label: "Company" },
    { path: "career", label: "Career" },
    { path: "usecases", label: "Use Cases" }, 
    { path: "adminlogin", label: "Admin Login" }, 
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-white shadow-md transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center h-22 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold">
          <Link to="/">SubDuxion</Link>
        </h2>

        <ul className="flex gap-10 items-center text-lg text-gray-800 ml-auto">
          {navLinks.map((link) => (
            <li key={link.path} className="relative group">
              <NavLink
                to={`/${link.path}`}
                className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 group-hover:after:w-full"
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          <li>
            <NavLink to="/contact">
              <button className="border border-black bg-black text-white px-6 py-2 rounded-lg hover:bg-white hover:text-black hover:border-black cursor-pointer transition-colors duration-300">
                Get in Touch
              </button>
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
}
