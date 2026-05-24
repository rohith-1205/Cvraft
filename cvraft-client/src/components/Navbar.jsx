import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">Cvraft</Link>
      <div className="flex gap-4">
        <Link to="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link>
        <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
        <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
