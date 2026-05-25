import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useResumeStore from '../store/resumeStore';
import { usePricing, formatPrice } from '../utils/pricing';

const Preview = () => {
  const { id } = useParams();
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
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">Unlock your resume</p>
                    <div className="text-3xl font-extrabold text-gray-900">
                      {isPricingLoading ? '...' : formatPrice(pricing.plans.pro.displayAmount, pricing.currency, pricing.locale)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">one-time payment</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handlePayment('pro')}
                      disabled={isPayLoading}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl
                      font-bold text-lg hover:bg-blue-700 transition shadow-lg
                      disabled:opacity-50">
                      {isPayLoading ? 'Processing...' : 'Unlock Now'}
                    </button>
                    
                    {/* Bundle Option */}
                    <button
                      onClick={() => handlePayment('bundle')}
                      disabled={isPayLoading}
                      className="w-full bg-purple-600 text-white py-3 rounded-xl
                      font-semibold hover:bg-purple-700 transition text-sm
                      disabled:opacity-50">
                      Get Bundle (3 Resumes + CL)
                    </button>
                  </div>

                  <ul className="space-y-2">
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
