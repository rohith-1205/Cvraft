import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';
import { usePricing, formatPrice } from '../utils/pricing';

const MobilePDFPreview = ({ url, isPdfjsLoaded }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    let renderTasks = [];

    const renderPDF = async () => {
      if (!isPdfjsLoaded) return;
      try {
        setLoading(true);
        const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
        if (!pdfjsLib) return;

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (!active) return;

        setLoading(false);

        // Clear any existing contents to prepare for clean redraw
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Render each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (!active) return;

          // Get container width to scale the canvas responsively
          const containerWidth = containerRef.current?.clientWidth || (window.innerWidth - 48);
          
          // Calculate scale based on container width
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const scale = containerWidth / unscaledViewport.width;
          const viewport = page.getViewport({ scale });

          // Create canvas element
          const canvas = document.createElement('canvas');
          canvas.className = "w-full shadow-sm rounded-lg mb-4 bg-white last:mb-0";
          containerRef.current?.appendChild(canvas);

          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          const renderTask = page.render(renderContext);
          renderTasks.push(renderTask);
          await renderTask.promise;
        }
      } catch (err) {
        console.error('Error rendering PDF:', err);
      }
    };

    renderPDF();

    return () => {
      active = false;
      renderTasks.forEach(task => {
        try {
          task.cancel();
        } catch {
          // Task might already be completed/cancelled
        }
      });
    };
  }, [url, isPdfjsLoaded, width]);

  if (!isPdfjsLoaded || loading) {
    return (
      <div className="w-full h-[580px] flex items-center justify-center bg-gray-50 text-gray-400 rounded-b-2xl">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-3">⏳</div>
          <p className="text-sm">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center p-3 bg-gray-100 max-h-[580px] overflow-y-auto rounded-b-2xl"
    />
  );
};

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, setRawText, setCurrentResumeId } = useResumeStore();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPayLoading, setIsPayLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPdfjsLoaded, setIsPdfjsLoaded] = useState(() => {
    return !!(window.pdfjsLib || window['pdfjs-dist/build/pdf']);
  });
  const [error, setError] = useState('');
  const [remainingDownloads, setRemainingDownloads] = useState(0);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [isCoverLetterLoading, setIsCoverLetterLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  // Editor states
  const [sidebarTab, setSidebarTab] = useState('downloads'); // downloads | edit
  const [activeSection, setActiveSection] = useState('personal'); // personal | education | experience | projects | skills | extras
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Detect country and get localized pricing — Razorpay still charges INR internally
  const { pricing, isLoading: isPricingLoading } = usePricing();

  // Detect mobile and load pdf.js script dynamically
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    let script = document.getElementById('pdfjs-script');
    if (script) {
      const isLoaded = !!(window.pdfjsLib || window['pdfjs-dist/build/pdf']);
      if (isLoaded) {
        setTimeout(() => {
          setIsPdfjsLoaded(true);
        }, 0);
      } else {
        const handleLoad = () => {
          const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
          if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setIsPdfjsLoaded(true);
          }
        };
        script.addEventListener('load', handleLoad);
        return () => script.removeEventListener('load', handleLoad);
      }
      return;
    }

    script = document.createElement('script');
    script.id = 'pdfjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    const handleOnload = () => {
      const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setIsPdfjsLoaded(true);
      }
    };
    script.onload = handleOnload;
    document.body.appendChild(script);
  }, [isMobile]);

  const fetchPreview = useCallback(async () => {
    try {
      const response = await api.get(
        `/api/resume/${id}/preview`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Preview fetch error:', err);
    }
  }, [id]);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const res = await api.get(`/api/payment/status/${id}`);
      setIsPaid(res.data.isPaid);
      setRemainingDownloads(res.data.remainingDownloads || 0);
      setHasCoverLetter(res.data.hasCoverLetter || false);

      if (res.data.isPaid && res.data.hasCoverLetter) {
        const resumeRes = await api.get(`/api/resume/${id}`);
        if (resumeRes.data.resume?.coverLetterText) {
          setCoverLetterText(resumeRes.data.resume.coverLetterText);
        }
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  }, [id]);

  const fetchResumeData = useCallback(async () => {
    try {
      const res = await api.get(`/api/resume/${id}`);
      if (res.data.success && res.data.resume) {
        setFormData(res.data.resume.structuredData);
        const fetchedRawInput = res.data.resume.rawInput || '';
        setRawInput(fetchedRawInput);
        setRawText(fetchedRawInput);
        setCurrentResumeId(id);
      }
    } catch (err) {
      console.error('Error fetching resume data:', err);
    }
  }, [id, setRawText, setCurrentResumeId]);

  // Editor mutation handlers
  const handleFieldChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => {
      const updatedSection = [...(prev[section] || [])];
      updatedSection[index] = {
        ...updatedSection[index],
        [field]: value
      };
      return {
        ...prev,
        [section]: updatedSection
      };
    });
  };

  const handlePointChange = (section, itemIndex, pointIndex, value) => {
    setFormData(prev => {
      const updatedItems = [...(prev[section] || [])];
      const updatedPoints = [...(updatedItems[itemIndex]?.points || [])];
      updatedPoints[pointIndex] = value;
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        points: updatedPoints
      };
      return {
        ...prev,
        [section]: updatedItems
      };
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...(prev.education || []), { degree: '', college: '', year: '', cgpa: '' }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), { company: '', role: '', duration: '', points: [''] }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index)
    }));
  };

  const addExperiencePoint = (expIndex) => {
    setFormData(prev => {
      const updatedExp = [...(prev.experience || [])];
      updatedExp[expIndex] = {
        ...updatedExp[expIndex],
        points: [...(updatedExp[expIndex]?.points || []), '']
      };
      return { ...prev, experience: updatedExp };
    });
  };

  const removeExperiencePoint = (expIndex, pointIndex) => {
    setFormData(prev => {
      const updatedExp = [...(prev.experience || [])];
      updatedExp[expIndex] = {
        ...updatedExp[expIndex],
        points: (updatedExp[expIndex]?.points || []).filter((_, i) => i !== pointIndex)
      };
      return { ...prev, experience: updatedExp };
    });
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { name: '', techStack: '', points: [''] }]
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  };

  const addProjectPoint = (projIndex) => {
    setFormData(prev => {
      const updatedProj = [...(prev.projects || [])];
      updatedProj[projIndex] = {
        ...updatedProj[projIndex],
        points: [...(updatedProj[projIndex]?.points || []), '']
      };
      return { ...prev, projects: updatedProj };
    });
  };

  const removeProjectPoint = (projIndex, pointIndex) => {
    setFormData(prev => {
      const updatedProj = [...(prev.projects || [])];
      updatedProj[projIndex] = {
        ...updatedProj[projIndex],
        points: (updatedProj[projIndex]?.points || []).filter((_, i) => i !== pointIndex)
      };
      return { ...prev, projects: updatedProj };
    });
  };

  const handleSkillsChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...(prev.skills || {}),
        [category]: value.split(',').map(s => s.trim())
      }
    }));
  };

  const handleExtrasChange = (section, index, value) => {
    setFormData(prev => {
      const updated = [...(prev[section] || [])];
      updated[index] = value;
      return { ...prev, [section]: updated };
    });
  };

  const addExtraItem = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), '']
    }));
  };

  const removeExtraItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError('');
    try {
      const res = await api.put(`/api/resume/${id}`, {
        structuredData: formData
      });
      if (res.data.success) {
        await fetchPreview();
      }
    } catch (err) {
      console.error('Failed to update resume:', err);
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegeneratePrompt = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const res = await api.put(`/api/resume/${id}`, {
        rawInput: rawInput
      });
      if (res.data.success) {
        await fetchPreview();
        if (res.data.resume?.structuredData) {
          setFormData(res.data.resume.structuredData);
        }
      }
    } catch (err) {
      console.error('Failed to regenerate resume:', err);
      setError(err.response?.data?.message || 'Failed to regenerate resume.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch watermarked preview, check status, and load structured data
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (id && id !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPreview();
      checkPaymentStatus();
      fetchResumeData();
    }
  }, [id, token, navigate, fetchPreview, checkPaymentStatus, fetchResumeData]);

  // Disable Right Click & Screenshot Shortcuts for Unpaid users
  useEffect(() => {
    if (!isPaid) {
      const handleContextMenu = (e) => e.preventDefault();
      const handleKeyDown = (e) => {
        if (
          e.key === 'PrintScreen' ||
          (e.ctrlKey && e.key === 'p') ||
          (e.metaKey && e.shiftKey && e.key === '3') ||
          (e.metaKey && e.shiftKey && e.key === '4')
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isPaid]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(
        `/api/payment/download/${id}`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cvraft_resume_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download resume PDF.');
    }
  };

  const handleDownloadCoverLetter = async () => {
    try {
      const response = await api.get(
        `/api/resume/${id}/cover-letter/pdf`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cvraft_cover_letter_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download cover letter error:', err);
      setError('Failed to download cover letter PDF.');
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsCoverLetterLoading(true);
    setError('');
    try {
      const res = await api.post(`/api/resume/${id}/cover-letter`);
      if (res.data.success) {
        setCoverLetterText(res.data.text);
      }
    } catch (err) {
      console.error('Generate cover letter error:', err);
      setError(err.response?.data?.message || 'Failed to generate cover letter.');
    } finally {
      setIsCoverLetterLoading(false);
    }
  };

  const handlePayment = async (plan = 'pro') => {
    if (!token) {
      navigate('/login');
      return;
    }

    setIsPayLoading(true);
    setError('');

    try {
      // Step 1 — Create Razorpay order
      const orderRes = await api.post('/api/payment/create-order', {
        resumeId: id,
        plan
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      // Step 2 — Open Razorpay modal
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Cvraft',
        description: 'Resume Download',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Step 3 — Verify payment
            const verifyRes = await api.post('/api/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              resumeId: id
            });

            if (verifyRes.data.success) {
              setIsPaid(true);
              navigate('/success', { state: { resumeId: id } });
            }
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setIsPayLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
      });
      razorpay.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setIsPayLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Your Resume Preview
          </h1>
          <p className="text-gray-500">
            {isPaid
              ? '✅ Payment complete — download your resume below'
              : '👇 Preview your resume below — pay to download the clean PDF'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* PDF Preview */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100
              overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"/>
                <div className="w-3 h-3 rounded-full bg-yellow-400"/>
                <div className="w-3 h-3 rounded-full bg-green-400"/>
                <span className="text-gray-400 text-xs ml-2">resume_preview.pdf</span>
              </div>

              {pdfUrl ? (
                <div className="relative">
                  {isMobile ? (
                    <MobilePDFPreview url={pdfUrl} isPdfjsLoaded={isPdfjsLoaded} />
                  ) : (
                    <iframe
                      src={`${pdfUrl}#toolbar=0`}
                      className="w-full h-[580px]"
                      title="Resume Preview"
                    />
                  )}
                  {/* Watermark overlay */}
                  {!isPaid && (
                    <div className="absolute inset-0 pointer-events-none flex
                      items-center justify-center">
                      <div className="text-gray-300 text-5xl font-extrabold
                        opacity-20 rotate-[-35deg] select-none tracking-widest">
                        PREVIEW ONLY
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📄</div>
                    <p>No preview available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Sidebar Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSidebarTab('downloads')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'downloads'
                    ? 'bg-white shadow-sm font-extrabold'
                    : 'hover:opacity-80'
                }`}
                style={{ color: sidebarTab === 'downloads' ? '#0f172a' : '#556b82' }}
              >
                ⚙️ Downloads & Plans
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('edit')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'edit'
                    ? 'bg-white shadow-sm font-extrabold'
                    : 'hover:opacity-80'
                }`}
                style={{ color: sidebarTab === 'edit' ? '#0f172a' : '#556b82' }}
              >
                ✏️ Edit Content
              </button>
            </div>

            {sidebarTab === 'downloads' && (
              <div className="space-y-6">
                {/* Payment / Download Box */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  {isPaid ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center border border-green-200">
                        <p className="font-bold text-lg" style={{ color: '#166534' }}>Resume Unlocked!</p>
                        <p className="text-sm" style={{ color: '#166534' }}>You have {remainingDownloads} downloads left.</p>
                      </div>
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl
                        font-bold text-lg hover:bg-blue-700 transition shadow-lg
                        flex items-center justify-center gap-2">
                        <span>⬇️</span> Download PDF
                      </button>
                      
                      {/* Cover Letter Section for Pro/Bundle */}
                      {hasCoverLetter && (
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="font-bold text-slate-800 mb-3">Cover Letter</h4>
                          {coverLetterText ? (
                            <div className="space-y-3">
                              <div className="bg-gray-50 p-3 rounded-lg text-xs
                                text-slate-600 max-h-32 overflow-y-auto leading-relaxed border border-gray-200">
                                {coverLetterText}
                              </div>
                              <button
                                onClick={handleDownloadCoverLetter}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl
                                font-semibold hover:bg-indigo-700 transition flex
                                items-center justify-center gap-2">
                                <span>📄</span> Download CL
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleGenerateCoverLetter}
                              disabled={isCoverLetterLoading}
                              className="w-full border-2 border-indigo-600 text-indigo-600
                              py-3 rounded-xl font-semibold hover:bg-indigo-50
                              transition disabled:opacity-50">
                              {isCoverLetterLoading ? 'Generating...' : '✨ Generate AI Cover Letter'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="text-center">
                        <p className="text-slate-500 text-sm font-semibold">Select a Plan</p>
                      </div>

                      <div className="space-y-2.5">
                        {['basic', 'pro', 'bundle'].map((planKey) => {
                          const planMeta = {
                            basic: { name: 'Basic', desc: '1 Resume Download' },
                            pro: { name: 'Pro (Popular)', desc: '1 Resume + ATS check' },
                            bundle: { name: 'Bundle', desc: '3 Resumes + Cover Letter' }
                          }[planKey];
                          
                          const planPricing = pricing.plans[planKey];
                          const displayPrice = isPricingLoading ? '...' : formatPrice(planPricing.displayAmount, pricing.currency, pricing.locale);
                          const isSelected = selectedPlan === planKey;
                          
                          return (
                            <button
                              key={planKey}
                              type="button"
                              onClick={() => setSelectedPlan(planKey)}
                              className={`w-full text-left p-3.5 rounded-xl border-2 transition flex items-center justify-between ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                                  : 'border-gray-100 hover:border-gray-200 bg-white'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-sm text-slate-800">{planMeta.name}</span>
                                <p className="text-xs text-slate-400 mt-0.5">{planMeta.desc}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-sm text-slate-800">{displayPrice}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePayment(selectedPlan)}
                        disabled={isPayLoading}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl
                        font-bold text-base hover:bg-blue-700 transition shadow-lg
                        disabled:opacity-50">
                        {isPayLoading ? 'Processing...' : 'Unlock Now'}
                      </button>

                      <ul className="space-y-1.5 pt-1">
                        {['Clean PDF Export', 'ATS Optimized', 'Priority Support'].map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="text-green-600 font-bold">✓</span> {f}
                          </li>
                        ))}
                      </ul>

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs text-center border border-red-200">
                          {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Shortcuts */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setRawText(rawInput);
                      navigate('/build');
                    }}
                    className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                    font-semibold hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2 text-slate-700"
                  >
                    <span>← Edit Resume</span>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                    font-semibold hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2 text-slate-700"
                  >
                    <span>📁 My Resumes</span>
                  </button>
                </div>

                {/* Help Box */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="font-bold text-slate-800 mb-2">Need help?</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    If you face any issues during payment or download, reach out to our support.
                  </p>
                  <a href="mailto:synchabit@gmail.com"
                    className="text-blue-600 text-xs font-semibold hover:underline">
                    synchabit@gmail.com
                  </a>
                </div>
              </div>
            )}

            {sidebarTab === 'edit' && (
              formData ? (
                <div className="space-y-4">
                  {/* Editor Accordions */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 max-h-[580px] overflow-y-auto">
                    
                    {/* Accordion 0: AI Prompt / Raw Input Details */}
                    <div className="border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'rawInput' ? '' : 'rawInput')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>✨ Edit Raw Input (Regenerate AI)</span>
                        <span className="text-xs">{activeSection === 'rawInput' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'rawInput' && (
                        <div className="pt-3 space-y-3">
                          <div className="bg-yellow-50 border border-yellow-100 p-2.5 rounded-lg">
                            <p className="text-[11px] text-yellow-800 leading-normal">
                              ⚠️ <strong>Warning:</strong> Re-running the AI will overwrite any manual section changes you made below.
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Raw Details Prompt</label>
                            <textarea
                              value={rawInput}
                              onChange={(e) => {
                                setRawInput(e.target.value);
                                setRawText(e.target.value);
                              }}
                              rows={6}
                              className="w-full border border-gray-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                              placeholder="Paste your raw details here..."
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRegeneratePrompt}
                            disabled={isRegenerating || !rawInput.trim()}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isRegenerating ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Regenerating...
                              </>
                            ) : '✨ Re-run AI Extraction'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accordion 1: Personal Info & Summary */}
                    <div className="border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>👤 Contact & Summary</span>
                        <span className="text-xs">{activeSection === 'personal' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'personal' && (
                        <div className="pt-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => handleFieldChange('name', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                              <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                              <input
                                type="text"
                                value={formData.phone || ''}
                                onChange={(e) => handleFieldChange('phone', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn</label>
                              <input
                                type="text"
                                value={formData.linkedin || ''}
                                onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub</label>
                              <input
                                type="text"
                                value={formData.github || ''}
                                onChange={(e) => handleFieldChange('github', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Professional Summary</label>
                            <textarea
                              value={formData.summary || ''}
                              onChange={(e) => handleFieldChange('summary', e.target.value)}
                              rows={4}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion 2: Education */}
                    <div className="border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'education' ? '' : 'education')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>🎓 Education</span>
                        <span className="text-xs">{activeSection === 'education' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'education' && (
                        <div className="pt-3 space-y-4">
                          {(formData.education || []).map((edu, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl space-y-2 relative border border-gray-100">
                              <button
                                type="button"
                                onClick={() => removeEducation(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                              >
                                Remove
                              </button>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">College / University</label>
                                <input
                                  type="text"
                                  value={edu.college || ''}
                                  onChange={(e) => handleArrayChange('education', idx, 'college', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Degree</label>
                                <input
                                  type="text"
                                  value={edu.degree || ''}
                                  onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                                  <input
                                    type="text"
                                    value={edu.year || ''}
                                    onChange={(e) => handleArrayChange('education', idx, 'year', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">CGPA / GPA</label>
                                  <input
                                    type="text"
                                    value={edu.cgpa || ''}
                                    onChange={(e) => handleArrayChange('education', idx, 'cgpa', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addEducation}
                            className="w-full border border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-400 py-2 rounded-xl text-xs font-bold transition"
                          >
                            + Add Education
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accordion 3: Experience */}
                    <div className="border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>💼 Work Experience</span>
                        <span className="text-xs">{activeSection === 'experience' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'experience' && (
                        <div className="pt-3 space-y-4">
                          {(formData.experience || []).map((exp, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl space-y-3 relative border border-gray-100">
                              <button
                                type="button"
                                onClick={() => removeExperience(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                              >
                                Remove
                              </button>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Company</label>
                                <input
                                  type="text"
                                  value={exp.company || ''}
                                  onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
                                <input
                                  type="text"
                                  value={exp.role || ''}
                                  onChange={(e) => handleArrayChange('experience', idx, 'role', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Duration</label>
                                <input
                                  type="text"
                                  value={exp.duration || ''}
                                  onChange={(e) => handleArrayChange('experience', idx, 'duration', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              
                              {/* Experience Points */}
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 mb-1">Bullet Points</label>
                                {(exp.points || []).map((pt, ptIdx) => (
                                  <div key={ptIdx} className="flex gap-2 items-center">
                                    <span className="text-gray-400 text-xs">•</span>
                                    <input
                                      type="text"
                                      value={pt || ''}
                                      onChange={(e) => handlePointChange('experience', idx, ptIdx, e.target.value)}
                                      className="flex-1 border border-gray-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeExperiencePoint(idx, ptIdx)}
                                      className="text-gray-400 hover:text-red-500 text-xs font-bold px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addExperiencePoint(idx)}
                                  className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1 mt-1"
                                >
                                  + Add Point
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addExperience}
                            className="w-full border border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-400 py-2 rounded-xl text-xs font-bold transition"
                          >
                            + Add Experience
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accordion 4: Projects */}
                    <div className="border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'projects' ? '' : 'projects')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>🎨 Projects</span>
                        <span className="text-xs">{activeSection === 'projects' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'projects' && (
                        <div className="pt-3 space-y-4">
                          {(formData.projects || []).map((proj, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl space-y-3 relative border border-gray-100">
                              <button
                                type="button"
                                onClick={() => removeProject(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                              >
                                Remove
                              </button>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Project Name</label>
                                <input
                                  type="text"
                                  value={proj.name || ''}
                                  onChange={(e) => handleArrayChange('projects', idx, 'name', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Tech Stack</label>
                                <input
                                  type="text"
                                  value={proj.techStack || ''}
                                  onChange={(e) => handleArrayChange('projects', idx, 'techStack', e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              
                              {/* Project Points */}
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 mb-1">Bullet Points</label>
                                {(proj.points || []).map((pt, ptIdx) => (
                                  <div key={ptIdx} className="flex gap-2 items-center">
                                    <span className="text-gray-400 text-xs">•</span>
                                    <input
                                      type="text"
                                      value={pt || ''}
                                      onChange={(e) => handlePointChange('projects', idx, ptIdx, e.target.value)}
                                      className="flex-1 border border-gray-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeProjectPoint(idx, ptIdx)}
                                      className="text-gray-400 hover:text-red-500 text-xs font-bold px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addProjectPoint(idx)}
                                  className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1 mt-1"
                                >
                                  + Add Point
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addProject}
                            className="w-full border border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-400 py-2 rounded-xl text-xs font-bold transition"
                          >
                            + Add Project
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accordion 5: Technical Skills */}
                    <div className="border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>🛠️ Technical Skills</span>
                        <span className="text-xs">{activeSection === 'skills' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'skills' && (
                        <div className="pt-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Languages (comma-separated)</label>
                            <input
                              type="text"
                              value={(formData.skills?.languages || []).join(', ')}
                              onChange={(e) => handleSkillsChange('languages', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Frameworks (comma-separated)</label>
                            <input
                              type="text"
                              value={(formData.skills?.frameworks || []).join(', ')}
                              onChange={(e) => handleSkillsChange('frameworks', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Tools (comma-separated)</label>
                            <input
                              type="text"
                              value={(formData.skills?.tools || []).join(', ')}
                              onChange={(e) => handleSkillsChange('tools', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion 6: Achievements & Certifications */}
                    <div className="pb-1">
                      <button
                        type="button"
                        onClick={() => setActiveSection(activeSection === 'extras' ? '' : 'extras')}
                        className="w-full flex justify-between items-center py-1 text-left font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                      >
                        <span>🏆 Achievements & Certs</span>
                        <span className="text-xs">{activeSection === 'extras' ? '▲' : '▼'}</span>
                      </button>
                      {activeSection === 'extras' && (
                        <div className="pt-3 space-y-4">
                          {/* Achievements */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-600">Achievements</label>
                            {(formData.achievements || []).map((a, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={a || ''}
                                  onChange={(e) => handleExtrasChange('achievements', idx, e.target.value)}
                                  className="flex-1 border border-gray-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExtraItem('achievements', idx)}
                                  className="text-gray-400 hover:text-red-500 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addExtraItem('achievements')}
                              className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                            >
                              + Add Achievement
                            </button>
                          </div>

                          {/* Certifications */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-600">Certifications</label>
                            {(formData.certifications || []).map((c, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={c || ''}
                                  onChange={(e) => handleExtrasChange('certifications', idx, e.target.value)}
                                  className="flex-1 border border-gray-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExtraItem('certifications', idx)}
                                  className="text-gray-400 hover:text-red-500 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addExtraItem('certifications')}
                              className="text-blue-500 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                            >
                              + Add Certification
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Save button */}
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Saving & Recompiling...
                      </>
                    ) : '✨ Save & Update Preview'}
                  </button>

                  {/* Navigation Shortcut inside Edit tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setRawText(rawInput);
                      navigate('/build');
                    }}
                    className="w-full bg-white rounded-xl border border-gray-200 py-3 text-xs font-bold text-slate-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <span>← Edit on Builder Page (Full Options)</span>
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs text-center border border-red-200">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400">
                  <div className="animate-spin text-2xl mb-2">⏳</div>
                  <p className="text-xs">Loading resume details...</p>
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
