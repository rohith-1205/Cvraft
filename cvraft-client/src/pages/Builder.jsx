import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';

const templates = [
  { id: 'T001', name: 'Classic',  desc: 'Clean ATS-friendly',       icon: '📄' },
  { id: 'T002', name: 'Modern',   desc: 'Bold colored header',       icon: '🎨' },
  { id: 'T003', name: 'Minimal',  desc: 'Ultra clean whitespace',    icon: '✨' },
  { id: 'T004', name: 'ATS Pro',  desc: 'Maximum ATS compatibility', icon: '🎯' },
  { id: 'T005', name: 'Academic', desc: 'Research focused',          icon: '🎓' },
];

const PLACEHOLDER = `Example — paste naturally:

My name is Arjun Mehta. I studied B.E Computer Science at VIT Vellore, graduating 2025 with 8.9 CGPA.
I did internship at Zoho for 3 months working on Django REST APIs and MySQL.
Built a project called ShopEasy using React, Node.js and MongoDB.
Skills: Python, JavaScript, React, Node.js, Git, Docker.
Won Smart India Hackathon 2024. Contact: arjun@gmail.com | linkedin.com/in/arjun`;

const FONT_FAMILIES = {
  F001: 'Lora, Georgia, "Times New Roman", serif',
  F002: 'Helvetica, Arial, sans-serif',
  F003: '"EB Garamond", Garamond, Georgia, serif',
  F004: 'Roboto, "Segoe UI", sans-serif',
  F005: 'Inconsolata, "Fira Code", Monaco, monospace'
};

const Builder = () => {
  const navigate = useNavigate();
  const { 
    token, 
    selectedTemplate, 
    setSelectedTemplate,
    rawText: storeRawText,
    setRawText: setStoreRawText,
    currentResumeId
  } = useResumeStore();

  const [rawText,          setRawText]          = useState(storeRawText || '');
  const [selectedFont,     setSelectedFont]     = useState('F001');
  const [selectedColor,    setSelectedColor]    = useState('C001');
  const [fonts,            setFonts]            = useState([]);
  const [colors,           setColors]           = useState([]);
  const [isLoading,        setIsLoading]        = useState(false);
  const [error,            setError]            = useState('');
  const [charCount,        setCharCount]        = useState((storeRawText || '').length);

  // Sync store rawText to local state
  useEffect(() => {
    setRawText(storeRawText || '');
    setCharCount((storeRawText || '').length);
  }, [storeRawText]);

  // Fetch font and color options from backend
  useEffect(() => {
    api.get('/api/resume/options')
      .then(res => {
        setFonts(res.data.fonts);
        setColors(res.data.colors);
      })
      .catch(err => console.error('Options fetch error:', err));
  }, []);

  const handleTextChange = (e) => {
    setRawText(e.target.value);
    setStoreRawText(e.target.value);
    setCharCount(e.target.value.length);
    setError('');
  };

  const handleGenerate = async () => {
    if (!token) { navigate('/login'); return; }
    if (rawText.trim().length < 50) {
      setError('Please provide more details — at least 50 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/resume/generate', {
        rawText,
        templateId: selectedTemplate,
        fontId:     selectedFont,
        colorId:    selectedColor
      });

      navigate(`/preview/${response.data.resumeId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {currentResumeId && (
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => navigate(`/preview/${currentResumeId}`)}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-blue-100 text-sm font-semibold text-slate-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-300 shadow-sm"
            >
              <span className="transition-transform group-hover:-translate-x-1 duration-300">←</span> 
              Cancel & Return to Preview
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Build Your Resume
          </h1>
          <p className="text-gray-500 text-lg">
            Paste your details — pick your style — generate!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Left — Text Input */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border
              border-gray-100 p-6">
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
                className="w-full border border-gray-200 rounded-xl p-4
                text-sm text-gray-700 resize-none focus:outline-none
                focus:ring-2 focus:ring-blue-400 leading-relaxed"
              />
              {error && (
                <div className="mt-3 bg-red-50 border border-red-200
                  text-red-600 text-sm rounded-lg px-4 py-3">
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
                <li>• Include name, email, phone, LinkedIn and GitHub</li>
                <li>• Mention college, degree, year and CGPA</li>
                <li>• Describe internships with company and work done</li>
                <li>• List projects with tech stack used</li>
                <li>• Add achievements or certifications</li>
              </ul>
            </div>
          </div>

          {/* Right — Style Options */}
          <div className="space-y-5">

            {/* Template Picker */}
            <div className="bg-white rounded-2xl shadow-sm border
              border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                📄 Template
              </h3>
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl
                    border-2 transition ${selectedTemplate === t.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <div>
                        <div className={`font-semibold text-xs
                          ${selectedTemplate === t.id
                            ? 'text-blue-700' : 'text-gray-800'}`}>
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-400">{t.desc}</div>
                      </div>
                      {selectedTemplate === t.id && (
                        <span className="ml-auto text-blue-500 text-xs font-bold">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Picker */}
            <div className="bg-white rounded-2xl shadow-sm border
              border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                🔤 Font Style
              </h3>
              <div className="space-y-2">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl
                    border-2 transition ${selectedFont === f.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-base font-semibold transition-colors
                          ${selectedFont === f.id
                            ? 'text-purple-800' : 'text-gray-800'}`}
                          style={{ fontFamily: FONT_FAMILIES[f.id] || 'inherit' }}>
                          {f.name}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5"
                          style={{ fontFamily: FONT_FAMILIES[f.id] || 'inherit' }}>
                          John Doe — Software Engineer
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-medium text-gray-500 select-none bg-gray-50 px-2 py-0.5 rounded border border-gray-100"
                          style={{ fontFamily: FONT_FAMILIES[f.id] || 'inherit' }}>
                          Aa
                        </span>
                        {selectedFont === f.id && (
                          <span className="text-purple-600 text-sm font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="bg-white rounded-2xl shadow-sm border
              border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                🎨 Color Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    title={c.name}
                    className={`relative h-10 rounded-xl border-2 transition
                    ${selectedColor === c.id
                      ? 'border-gray-900 scale-105 shadow-md'
                      : 'border-transparent hover:border-gray-300'}`}
                    style={{ backgroundColor: `#${c.hex}` }}>
                    {selectedColor === c.id && (
                      <span className="absolute inset-0 flex items-center
                        justify-center text-white font-bold text-sm">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {/* Selected color name */}
              <p className="text-xs text-gray-400 mt-2 text-center">
                {colors.find(c => c.id === selectedColor)?.name || ''}
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg
              transition shadow-lg ${isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"
                    fill="none">
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
            <div className="bg-green-50 border border-green-100 rounded-xl
              p-4 text-center">
              <p className="text-green-800 text-sm font-medium">
                🆓 Preview is free!
              </p>
              <p className="text-green-600 text-xs mt-1">
                Pay only ₹149 onwards to download
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
