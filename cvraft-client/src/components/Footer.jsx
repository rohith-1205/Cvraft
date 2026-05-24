import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-white font-bold">Cvraft</span>
            <span className="text-gray-500 text-sm ml-2">
              — Beautifully crafted resumes
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/login"   className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>

        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
          © 2026 Cvraft. All rights reserved. Built with ❤️ in India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
