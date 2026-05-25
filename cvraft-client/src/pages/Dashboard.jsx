import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';
import ResumeCard from '../components/ResumeCard';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useResumeStore();

  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/resume/all');
      setResumes(res.data.resumes || []);
    } catch (err) {
      setError('Failed to load resumes. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (err) {
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
            text-sm rounded-xl px-4 py-3 mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-gray-400 mt-4 text-sm">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (

          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-500 mb-6">
              Build your first resume in 60 seconds!
            </p>
            <Link
              to="/build"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl
              font-semibold hover:bg-blue-700 transition shadow-md">
              Build My Resume →
            </Link>
          </div>

        ) : (

          /* Resume Grid */
          <div>
            {/* Purchased */}
            {purchased.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex
                  items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"/>
                  Purchased Resumes
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {purchased.map(resume => (
                    <ResumeCard
                      key={resume._id}
                      resume={resume}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Previews */}
            {previews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex
                  items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"/>
                  Preview Only
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    — Pay to unlock download
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {previews.map(resume => (
                    <ResumeCard
                      key={resume._id}
                      resume={resume}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirm Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex
            items-center justify-center z-50 px-6">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full
              shadow-xl text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Resume?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                This action cannot be undone. The resume will be
                permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200
                  text-gray-600 font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-xl bg-red-500
                  hover:bg-red-600 text-white font-semibold transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
