import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useResumeStore from '../store/resumeStore';

const Navbar = () => {
  const { token, user, logout } = useResumeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 0);
  };

  const isActive = (path) => location.pathname === path;

  const isOval = isScrolled && !menuOpen;

  const outerClasses = `sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${
    isOval ? 'py-3 px-4 md:px-8 bg-transparent' : 'py-0 px-0'
  }`;

  const innerClasses = `mx-auto transition-all duration-500 ease-in-out w-full ${
    isOval
      ? 'max-w-6xl bg-white/90 backdrop-blur-md border border-blue-200/40 rounded-full shadow-lg px-8 py-2.5'
      : `bg-white/80 backdrop-blur-md border border-t-transparent border-l-transparent border-r-transparent border-b-blue-100/50 px-6 py-4 ${
          menuOpen ? 'rounded-b-2xl border-b shadow-md' : 'rounded-none'
        }`
  }`;

  return (
    <nav className={outerClasses}>
      <div className={innerClasses}>
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex
              items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Cv<span className="text-blue-600">raft</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pricing"
              className={`font-medium transition text-sm
              ${isActive('/pricing')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'}`}>
              Pricing
            </Link>

            {token ? (
              <>
                <Link to="/build"
                  className={`font-medium transition text-sm
                  ${isActive('/build')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'}`}>
                  Builder
                </Link>
                <Link to="/dashboard"
                  className={`font-medium transition text-sm
                  ${isActive('/dashboard')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'}`}>
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex
                    items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500
                    font-medium transition text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-gray-600 hover:text-blue-600
                  font-medium transition text-sm">
                  Login
                </Link>
                <Link to="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg
                  font-medium hover:bg-blue-700 transition shadow-sm text-sm">
                  Get Started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-gray-600"/>
              <span className="block w-5 h-0.5 bg-gray-600"/>
              <span className="block w-5 h-0.5 bg-gray-600"/>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4
            space-y-3">
            <Link to="/pricing"
              onClick={() => setMenuOpen(false)}
              className="block text-gray-600 font-medium text-sm py-2">
              Pricing
            </Link>
            {token ? (
              <>
                <Link to="/build"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 font-medium text-sm py-2">
                  Builder
                </Link>
                <Link to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 font-medium text-sm py-2">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-red-500 font-medium text-sm py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-600 font-medium text-sm py-2">
                  Login
                </Link>
                <Link to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block bg-blue-600 text-white px-4 py-2.5
                  rounded-lg font-medium text-sm text-center">
                  Get Started →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
