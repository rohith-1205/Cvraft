import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';

const templates = [
  { id: 'T001', name: 'Classic', desc: 'Clean ATS-friendly single column', icon: '📄' },
  { id: 'T002', name: 'Modern',  desc: 'Two column with colored header',   icon: '🎨' },
  { id: 'T003', name: 'Minimal', desc: 'Ultra clean with whitespace',       icon: '✨' },
  { id: 'T004', name: 'ATS Pro', desc: 'Maximum ATS compatibility',         icon: '🎯' },
  { id: 'T005', name: 'Academic', desc: 'Research and publication focused', icon: '🎓' },
];

const PLACEHOLDER = `Example — just paste naturally like this:

My name is Priya Sharma. I studied B.E Computer Science at PSG Tech Coimbatore, graduating in 2024 with 8.7 CGPA.

I did a 3-month internship at TCS Chennai where I worked on React dashboards and REST APIs using Node.js and MongoDB. I also built a project called MediTrack — a hospital appointment system using React, Firebase and Tailwind CSS that helped 200+ patients book appointments online.

My skills include JavaScript, Python, React, Node.js, MongoDB, Git and Docker. I won 2nd place at Smart India Hackathon 2023 and have solved 400+ problems on LeetCode.

Contact: priya@gmail.com | linkedin.com/in/priya | github.com/priya`;

const Builder = () => {
  const navigate = useNavigate();
  const { token, setCurrentResumeId, selectedTemplate, setSelectedTemplate } = useResumeStore();

  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    setRawText(e.target.value);
    setCharCount(e.target.value.length);
    setError('');
  };

  const handleGenerate = async () => {
    // Check login
    if (!token) {
      navigate('/login');
      return;
    }

    // Validate input
    if (rawText.trim().length < 50) {
      setError('Please provide more details — at least 50 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post(
        '/api/resume/generate',
        { rawText, templateId: selectedTemplate },
        { responseType: 'blob' }
      );

      // Get resume ID from response headers
      const resumeId = response.headers['x-resume-id'];
      setCurrentResumeId(resumeId);

      // Create blob URL for preview
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      // Navigate to preview
      navigate(`/preview/${resumeId}`, { state: { pdfUrl: blobUrl } });

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Build Your Resume
          </h1>
          <p className="text-gray-500 text-lg">
            Paste your details in plain English — our AI does the rest
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Left — Text Input */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-3">
                <label className="font-semibold text-gray-900">
                  📝 Your Details
                </label>
                <span className={`text-xs font-medium px-2 py-1 rounded-full
                  ${charCount < 50
                    ? 'bg-red-50 text-red-500'
                    : 'bg-green-50 text-green-600'}`}>
                  {charCount} chars
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={handleTextChange}
                placeholder={PLACEHOLDER}
                rows={16}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm
                text-gray-700 resize-none focus:outline-none focus:ring-2
                focus:ring-blue-400 focus:border-transparent leading-relaxed"
              />
              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-600
                  text-sm rounded-lg px-4 py-3">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-800 text-sm font-semibold mb-2">
                💡 Tips for best results:
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Include your name, email, phone, LinkedIn and GitHub</li>
                <li>• Mention college name, degree, year and CGPA</li>
                <li>• Describe internships with company name and work done</li>
                <li>• List projects with tech stack used</li>
                <li>• Add any achievements or certifications</li>
              </ul>
            </div>
          </div>

          {/* Right — Template + Generate */}
          <div className="space-y-6">

            {/* Template Picker */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                🎨 Choose Template
              </h3>
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2
                    transition ${selectedTemplate === t.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <div className={`font-semibold text-sm
                          ${selectedTemplate === t.id
                            ? 'text-blue-700'
                            : 'text-gray-800'}`}>
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-400">{t.desc}</div>
                      </div>
                      {selectedTemplate === t.id && (
                        <span className="ml-auto text-blue-500 font-bold">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition
              shadow-lg ${isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Generating...
                </span>
              ) : '✨ Generate Resume'}
            </button>

            {/* Price note */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4
              text-center">
              <p className="text-green-800 text-sm font-medium">
                🆓 Preview is free!
              </p>
              <p className="text-green-600 text-xs mt-1">
                Pay only ₹499 to download the clean PDF
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
