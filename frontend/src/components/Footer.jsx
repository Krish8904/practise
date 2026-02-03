import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Subduxion</h3>
            <p className="text-gray-400">
              Subduxion is a consulting company that design, build, and operate
              intelligent systems for organizations all over the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold ml-10 mb-4">Quick Links</h4>
            <div className="space-y-2 ml-10">
              <button 
                onClick={() => navigate("/services")} 
                className="block text-gray-400 hover:text-white"
              >
                Services
              </button>
              <button 
                onClick={() => navigate("/careers")} 
                className="block text-gray-400 hover:text-white"
              >
                Careers
              </button>
              <button 
                onClick={() => navigate("/usecases")} 
                className="block text-gray-400 hover:text-white"
              >
                Use Cases
              </button>
              <button 
                onClick={() => navigate("/contact")} 
                className="block text-gray-400 hover:text-white"
              >
                Contact
              </button>

            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2"><Mail size={16} /> info@example.com</p>
              <p className="flex items-center gap-2"><Phone size={16} /> 99999 99999</p>
              <p className="flex items-center gap-2"><MapPin size={16} /> High Tech Campus</p>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Linkedin className="cursor-pointer hover:text-blue-400" />
              <Twitter className="cursor-pointer hover:text-blue-400" />
              <Facebook className="cursor-pointer hover:text-blue-400" />
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
