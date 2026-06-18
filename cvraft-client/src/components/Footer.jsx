import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-gray-400 py-12 mt-auto relative border-t border-gray-950">
      {/* Subtle Premium Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-bold text-lg">Cvraft</span>
            </div>
            <span className="text-gray-500 text-sm">
              Beautifully crafted LaTeX-quality resumes with AI.
            </span>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="footer-link">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="mailto:synchabit@gmail.com" className="footer-link">Email Support</a></li>
              <li><Link to="/contact" className="footer-link">Contact Form</Link></li>
            </ul>
          </div>

        </div>
        <div className="border-t border-gray-900 mt-10 pt-6 text-center text-sm flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-500">
          <span>© 2026 Cvraft. All rights reserved.</span>
          <span>For queries contact <a href="mailto:synchabit@gmail.com" className="text-blue-400 hover:underline transition">synchabit@gmail.com</a></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
