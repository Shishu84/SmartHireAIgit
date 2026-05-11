import React from 'react';
import { BsRobot } from 'react-icons/bs';
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#f3f3f3] pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Column 1: Brand/About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-2 rounded-lg shadow-sm">
                <BsRobot size={18} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">SmartHire.AI</h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Elevate your  with our AI-powered interview platform.
              Practice real scenarios, improve your communication, and build professional confidence.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6 tracking-wide">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Home</Link>
              </li>
              <li>
                <Link to="/analyze" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Resume Analysis</Link>
              </li>
              <li>
                <Link to="/interview" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors text-sm font-bold">
                  Interview Room
                  <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider py-0.5 px-2 rounded-full font-bold">Core Feature</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources/Support */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6 tracking-wide">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/docs" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Documentation</Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium">Contact Details</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Form */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6 tracking-wide">Contact Us</h3>
            <p className="text-gray-500 text-sm mb-4">
              Have a question or feedback? Drop us a quick message!
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "mailto:Smarthireaigaya@gmail.com";
            }}>
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-shadow text-sm w-full shadow-sm"
                required
              />
              <textarea
                placeholder="How can we help?"
                rows="2"
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-shadow text-sm w-full shadow-sm resize-none"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-black text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-sm"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SmartHire.AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-black transition-colors text-sm font-medium">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-black transition-colors text-sm font-medium">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
