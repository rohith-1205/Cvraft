import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';

const Register = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useResumeStore();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/build');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex
              items-center justify-center shadow-md">
              <span className="text-blue-600 font-extrabold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-white">
              Cv<span className="text-yellow-300">raft</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-500 mt-1">
            Free preview — pay only to download
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border
          border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-xl px-4
                py-3 text-sm focus:outline-none focus:ring-2
                focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="yourname@example.com"
                className="w-full border border-gray-200 rounded-xl px-4
                py-3 text-sm focus:outline-none focus:ring-2
                focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10
                  py-3 text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.228-2.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold
                text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10
                  py-3 text-sm focus:outline-none focus:ring-2
                  focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.228-2.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200
                text-red-600 text-sm rounded-xl px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-base
              transition mt-2 ${isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}>
              {isLoading ? 'Creating account...' : 'Create Account →'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login"
              className="text-blue-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* Trust */}
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your data is secure · No spam · Cancel anytime
        </p>

      </div>
    </div>
  );
};

export default Register;
