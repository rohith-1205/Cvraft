import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl font-extrabold text-blue-600 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl
          font-semibold hover:bg-blue-700 transition shadow-md">
          Go Home →
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
