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
  const { token } = useResumeStore();

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

  // Fetch watermarked preview and check status
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (id && id !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPreview();
      checkPaymentStatus();
    }
  }, [id, token, navigate, fetchPreview, checkPaymentStatus]);

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
      <div className="max-w-5xl mx-auto">

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
          <div className="space-y-6">
            
            {/* Payment / Download Box */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {isPaid ? (
                <div className="space-y-4">
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
                    <p className="font-bold text-lg">Resume Unlocked!</p>
                    <p className="text-sm">You have {remainingDownloads} downloads left.</p>
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
                      <h4 className="font-bold text-gray-900 mb-3">Cover Letter</h4>
                      {coverLetterText ? (
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg text-xs
                            text-gray-600 max-h-32 overflow-y-auto">
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
                    <p className="text-gray-500 text-sm font-semibold">Select a Plan</p>
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
                            <span className="font-bold text-sm text-gray-800">{planMeta.name}</span>
                            <p className="text-xs text-gray-400 mt-0.5">{planMeta.desc}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-sm text-gray-800">{displayPrice}</span>
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
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs text-center">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Shortcuts */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/build')}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                font-semibold hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
              >
                <span className="text-gray-700">← Edit Resume</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                font-semibold hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
              >
                <span className="text-gray-700">📁 My Resumes</span>
              </button>
            </div>

            {/* Help Box */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Need help?</h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                If you face any issues during payment or download, reach out to our support.
              </p>
              <a href="mailto:synchabit@gmail.com"
                className="text-blue-600 text-xs font-semibold hover:underline">
                synchabit@gmail.com
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
