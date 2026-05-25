import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeId = location.state?.resumeId;

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!resumeId) navigate('/dashboard');
  }, [resumeId, navigate]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(
        `/api/payment/download/${resumeId}`,
        { responseType: 'blob' }
      );

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cvraft_resume_${resumeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        {/* Success Animation */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
            justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-gray-500 mb-8">
            Your resume is ready. Download your clean, professional PDF below.
          </p>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition
            shadow-md mb-4 ${isDownloading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Preparing PDF...
              </span>
            ) : '⬇️ Download Resume PDF'}
          </button>

          <div className="flex gap-3">
            <Link
              to="/build"
              className="flex-1 py-3 rounded-xl border-2 border-gray-200
              text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
              Build Another
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 py-3 rounded-xl border-2 border-gray-200
              text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
              My Dashboard
            </Link>
          </div>

          {/* Share prompt */}
          <div className="mt-8 bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 text-sm font-semibold mb-1">
              💙 Loved Cvraft?
            </p>
            <p className="text-blue-600 text-xs">
              Share with your friends who need a great resume!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Success;
