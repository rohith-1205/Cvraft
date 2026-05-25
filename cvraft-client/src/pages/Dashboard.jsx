import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';
import ResumeCard from '../components/ResumeCard';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const { user } = useResumeStore();

  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/api/resume/all');
      setResumes(res.data.resumes || []);
    } catch {
      setError('Failed to load resumes. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResumes();
  }, [fetchResumes]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/resume/${deleteId}`);
      setResumes(resumes.filter(r => r._id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch {
      setError('Failed to delete resume.');
    }
  };

  const purchased = resumes.filter(r => r.paymentStatus === 'completed');
  const previews  = resumes.filter(r => r.paymentStatus === 'pending');

  return (
    <div className="min-h-screen bg-transparent py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between
          items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              My Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name || 'there'} 👋
            </p>
          </div>
          <Link
            to="/build"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6
            py-3 rounded-xl font-semibold shadow-md transition">
            + Build New Resume
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Resumes', value: resumes.length,   icon: '📄', color: 'bg-blue-50   text-blue-700'   },
            { label: 'Purchased',     value: purchased.length, icon: '✅', color: 'bg-green-50  text-green-700'  },
            { label: 'Previews',      value: previews.length,  icon: '👁️', color: 'bg-yellow-50 text-yellow-700' }
          ].map((stat) => (
            <div key={stat.label}
              className="bg-white rounded-2xl border border-gray-100
              shadow-sm p-5 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-3xl font-extrabold mb-1 ${stat.color
                .split(' ')[1]}`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-xs font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
            px-4 py-3 rounded-xl mb-8 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold">×</button>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border
            border-dashed border-gray-200">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-500 mb-8">
              Start building your first professional resume in seconds.
            </p>
            <Link
              to="/build"
              className="inline-block bg-blue-600 text-white px-8 py-3
              rounded-xl font-semibold hover:bg-blue-700 transition">
              Create My First Resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center
          justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Are you sure?
            </h3>
            <p className="text-gray-500 text-center mb-8">
              This will permanently delete your resume. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl
                font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl
                font-semibold hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
