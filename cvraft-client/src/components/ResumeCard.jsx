import { useNavigate } from 'react-router-dom';

const statusConfig = {
  pending: {
    label: 'Preview Only',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '🔒'
  },
  completed: {
    label: 'Purchased',
    color: 'bg-green-100 text-green-700',
    icon: '✅'
  }
};

const templateNames = {
  T001: 'Classic',
  T002: 'Modern',
  T003: 'Minimal',
  T004: 'ATS Pro',
  T005: 'Academic'
};

const ResumeCard = ({ resume, onDelete }) => {
  const navigate = useNavigate();
  const status = statusConfig[resume.paymentStatus] || statusConfig.pending;
  const date = new Date(resume.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      hover:shadow-md transition p-6">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {resume.structuredData?.name || 'Untitled Resume'}
          </h3>
          <p className="text-gray-400 text-sm mt-0.5">{date}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full
          ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="flex gap-3 mb-5">
        <span className="bg-blue-50 text-blue-700 text-xs font-medium
          px-3 py-1 rounded-full">
          📄 {templateNames[resume.templateId] || 'Classic'}
        </span>
        <span className="bg-gray-50 text-gray-600 text-xs font-medium
          px-3 py-1 rounded-full">
          ID: {resume._id.slice(-6)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/preview/${resume._id}`)}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
          text-white text-sm font-semibold transition">
          {resume.paymentStatus === 'completed' ? '⬇️ Download' : '👁️ Preview'}
        </button>
        <button
          onClick={() => navigate('/build')}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200
          text-gray-600 hover:bg-gray-50 text-sm font-semibold transition">
          ✏️
        </button>
        <button
          onClick={() => onDelete(resume._id)}
          className="px-4 py-2.5 rounded-xl border-2 border-red-100
          text-red-400 hover:bg-red-50 text-sm font-semibold transition">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
