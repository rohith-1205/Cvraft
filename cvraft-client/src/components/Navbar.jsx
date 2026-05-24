import { Link, useNavigate } from 'react-router-dom';
import useResumeStore from '../store/resumeStore';

const Navbar = () => {
  const { token, logout } = useResumeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Cv<span className="text-blue-600">raft</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/pricing"
            className="text-gray-600 hover:text-blue-600 font-medium transition">
            Pricing
          </Link>
          {token ? (
            <>
              <Link to="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 font-medium transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition">
                Login
              </Link>
              <Link to="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg
                font-medium hover:bg-blue-700 transition shadow-sm">
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
