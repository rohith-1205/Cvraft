import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';
import { usePricing, formatPrice } from '../utils/pricing';

const Preview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useResumeStore();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPayLoading, setIsPayLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');
  const [remainingDownloads, setRemainingDownloads] = useState(0);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [isCoverLetterLoading, setIsCoverLetterLoading] = useState(false);

  // Detect country and get localized pricing — Razorpay still charges INR internally
  const { pricing, isLoading: isPricingLoading } = usePricing();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Fetch watermarked preview and check status
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (id && id !== 'undefined') {
      fetchPreview();
      checkPaymentStatus();
    }
  }, [id]);

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

  const fetchPreview = async () => {
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
  };

  const checkPaymentStatus = async () => {
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
  };

  const handleUnlockWithBundle = async () => {
    setIsPayLoading(true);
    setError('');
    try {
      const res = await api.post('/api/payment/unlock-with-bundle', {
        resumeId: id
      });
      if (res.data.success) {
        setIsPaid(true);
        fetchPreview();
        checkPaymentStatus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock resume using bundle.');
    } finally {
      setIsPayLoading(false);
    }
  };

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
          } catch (err) {
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
                  <iframe
                    src={`${pdfUrl}#toolbar=0`}
                    className="w-full h-[700px]"
                    title="Resume Preview"
                  />
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
                    <button
                      onClick={() => navigate('/build')}
                      className="mt-4 text-blue-600 hover:underline text-sm">
                      ← Go back to Builder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">

            {/* Status Card */}
            <div className={`rounded-2xl p-5 border-2 ${isPaid
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'}`}>
              <div className="text-2xl mb-2">{isPaid ? '✅' : '🔒'}</div>
              <h3 className="font-bold text-gray-900 mb-1">
                {isPaid ? 'Resume Unlocked!' : 'Preview Mode'}
              </h3>
              <p className="text-sm text-gray-500">
                {isPaid
                  ? 'Your resume is ready to download as a clean PDF.'
                  : 'This is a watermarked preview. Pay to get the clean download.'}
              </p>
            </div>

            {/* Download Button for Paid Users */}
            {isPaid && (
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base transition shadow-md flex items-center justify-center gap-2"
              >
                📥 Download Resume PDF
              </button>
            )}

            {/* Cover Letter Section */}
            {isPaid && hasCoverLetter && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>✉️</span> Cover Letter
                </h3>
                {coverLetterText ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Your AI-generated cover letter matching your theme is ready!
                    </p>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 max-h-40 overflow-y-auto text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-line select-text">
                      {coverLetterText}
                    </div>
                    <button
                      onClick={handleDownloadCoverLetter}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
                    >
                      📥 Download Cover Letter PDF
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Generate a professional, matching cover letter based on your resume details.
                    </p>
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={isCoverLetterLoading}
                      className={`w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition shadow-sm ${isCoverLetterLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isCoverLetterLoading ? 'Generating Cover Letter...' : '✨ Generate Cover Letter'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bundle Unlock Card */}
            {!isPaid && remainingDownloads > 0 && (
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg space-y-3">
                <div className="text-2xl">🎉</div>
                <h3 className="font-bold text-lg">Bundle Active</h3>
                <p className="text-xs text-purple-100">
                  You have <strong>{remainingDownloads} unused downloads</strong> remaining in your account bundle!
                </p>
                <button
                  onClick={handleUnlockWithBundle}
                  disabled={isPayLoading}
                  className="w-full py-3 rounded-xl bg-white hover:bg-purple-50 text-indigo-700 font-bold text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  🔓 Unlock This Resume (Uses 1)
                </button>
              </div>
            )}

            {/* Plans */}
            {!isPaid && remainingDownloads === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100
                shadow-sm p-5 space-y-3">
                <h3 className="font-bold text-gray-900 mb-1">
                  Choose Your Plan
                </h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  💳 Select a plan below to proceed to secure checkout and download your clean, watermark-free PDF.
                </p>

                {[
                  { plan: 'basic',  label: 'Basic',
                    desc: '1 resume, 3 templates' },
                  { plan: 'pro',    label: 'Pro ⭐',
                    desc: 'All templates + ATS score', popular: true },
                  { plan: 'bundle', label: 'Bundle',
                    desc: '3 resumes + cover letter' }
                ].map((p) => {
                  // Display localized price; Razorpay always receives INR paise internally
                  const planPricing = pricing.plans[p.plan];
                  const displayPrice = isPricingLoading
                    ? '...'
                    : formatPrice(planPricing.displayAmount, pricing.currency, pricing.locale);

                  return (
                    <button
                      key={p.plan}
                      onClick={() => handlePayment(p.plan)}
                      disabled={isPayLoading}
                      className={`w-full py-3 px-4 rounded-xl font-semibold
                      text-sm transition flex justify-between items-center
                      ${p.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200'
                      } ${isPayLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span>{p.label}</span>
                      <div className="text-right">
                        {/* Localized display price — Razorpay internally charges INR */}
                        <div className="font-bold">
                          {isPricingLoading
                            ? <span className="inline-block w-12 h-4 bg-current opacity-20 rounded animate-pulse" />
                            : displayPrice
                          }
                        </div>
                        <div className={`text-xs ${p.popular ? 'text-blue-200' : 'text-gray-400'}`}>
                          {p.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* International pricing disclaimer */}
                <p className="text-[10px] text-gray-400 text-center pt-1">
                  🌍 Secure international payments supported. Final charged amount
                  may vary slightly based on exchange rates.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600
                text-sm rounded-xl px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => navigate('/build')}
                className="w-full py-3 rounded-xl border-2 border-white/20
                text-white font-semibold hover:bg-white/10 transition text-sm">
                ← Edit Resume
              </button>
              {token && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-xl border-2 border-white/20
                  text-white font-semibold hover:bg-white/10 transition text-sm">
                  📁 My Resumes
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-xl p-4 text-center space-y-1">
              <p className="text-xs text-gray-500">🔒 Secured by Razorpay</p>
              <p className="text-xs text-gray-500">✅ UPI · Cards · Net Banking</p>
              <p className="text-xs text-gray-500">💯 Instant PDF delivery</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
