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

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:synchabit@gmail.com" className="hover:text-white transition">Email Support</a></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Form</Link></li>
            </ul>
          </div>

        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-500">
          <span>© 2026 Cvraft. All rights reserved.</span>
          <span>For queries contact <a href="mailto:synchabit@gmail.com" className="text-blue-400 hover:underline">synchabit@gmail.com</a></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
