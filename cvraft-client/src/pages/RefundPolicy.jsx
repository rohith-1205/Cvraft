import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-100 hover:text-white transition"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">Refund Policy</h1>
          <p className="text-blue-100 mt-2">Last updated: May 25, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Cvcraft is a digital service that provides instant access to resume PDFs upon successful payment. Due to the nature of digital products and immediate delivery, refund eligibility is limited.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Key Point:</strong> Once your PDF resume is generated and delivered, it cannot be returned like a physical product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Eligibility</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">✅ You May Be Eligible for Refund If:</h3>
            <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg space-y-3">
              <div className="flex gap-3">
                <span className="text-green-600 font-bold text-xl">1</span>
                <div>
                  <p className="font-semibold text-gray-800">Payment failed or double-charged</p>
                  <p className="text-sm text-gray-600">You were charged but did not receive PDF access</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold text-xl">2</span>
                <div>
                  <p className="font-semibold text-gray-800">Service technical failure</p>
                  <p className="text-sm text-gray-600">Cvraft's server prevented PDF generation/download</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold text-xl">3</span>
                <div>
                  <p className="font-semibold text-gray-800">Within 48 hours of purchase</p>
                  <p className="text-sm text-gray-600">Request refund before 48 hours if unsatisfied</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold text-xl">4</span>
                <div>
                  <p className="font-semibold text-gray-800">Fraudulent charge</p>
                  <p className="text-sm text-gray-600">Unauthorized payment from your account</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3">❌ Non-Refundable Scenarios:</h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg space-y-3">
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">✕</span>
                <div>
                  <p className="font-semibold text-gray-800">Changed your mind about the purchase</p>
                  <p className="text-sm text-gray-600">Buyer's remorse is not grounds for refund</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">✕</span>
                <div>
                  <p className="font-semibold text-gray-800">PDF already downloaded and used</p>
                  <p className="text-sm text-gray-600">Digital product cannot be "returned"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">✕</span>
                <div>
                  <p className="font-semibold text-gray-800">More than 48 hours after purchase</p>
                  <p className="text-sm text-gray-600">Refund window has closed</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">✕</span>
                <div>
                  <p className="font-semibold text-gray-800">Not satisfied with resume quality/design</p>
                  <p className="text-sm text-gray-600">Service performs as described; design is your choice</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">✕</span>
                <div>
                  <p className="font-semibold text-gray-800">Didn't get job/interview after using Cvraft</p>
                  <p className="text-sm text-gray-600">We don't guarantee employment outcomes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">✕</span>
                <div>
                  <p className="font-semibold text-gray-800">Account was used for fraud/abuse</p>
                  <p className="text-sm text-gray-600">No refunds for policy violations</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Step 1: Email Us</h3>
                <p className="text-gray-600 mb-2">Send your refund request to:</p>
                <a href="mailto:synchabit@gmail.com" className="text-blue-600 hover:underline text-lg font-semibold">
                  synchabit@gmail.com
                </a>
                <p className="text-gray-600 text-sm mt-3">
                  Include: Your email, order ID (from confirmation), and reason for refund request.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Step 2: Provide Details</h3>
                <p className="text-gray-600 mb-3">Your email should include:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>Your account email address</li>
                  <li>Razorpay Order ID (from email receipt)</li>
                  <li>Payment amount and date</li>
                  <li>Reason for refund (technical issue? within 48 hours?)</li>
                  <li>Any error messages or screenshots</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Step 3: We Review</h3>
                <p className="text-gray-600 mb-2">
                  We will review your request within <strong>7 business days</strong>.
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  If approved, refund will be processed to your original payment method (2-5 business days).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chargeback & Dispute Process</h2>
            <p className="text-gray-600 leading-relaxed">
              If you file a chargeback or dispute with your bank/payment provider without contacting us first:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2 mt-3">
              <li>Your account will be flagged</li>
              <li>We will provide transaction evidence to your bank</li>
              <li>Future purchases may be blocked</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Always contact us first</strong> at <a href="mailto:synchabit@gmail.com" className="text-blue-600 hover:underline">synchabit@gmail.com</a>. We resolve legitimate issues quickly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-semibold text-gray-900">Send Request</p>
                  <p className="text-sm text-gray-600">Within 48 hours of purchase (preferred)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="font-semibold text-gray-900">Cvcraft Reviews</p>
                  <p className="text-sm text-gray-600">2-7 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-gray-900">Approval/Denial Email</p>
                  <p className="text-sm text-gray-600">Decision communicated via email</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-semibold text-gray-900">Refund Processed</p>
                  <p className="text-sm text-gray-600">If approved, 2-5 business days to your account</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Cancellation</h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Important:</strong> Cvcraft does NOT have recurring subscriptions. All plans are one-time payments.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Once you've purchased a plan, you own it permanently. You will not be charged again unless you make another purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exceptions & Special Cases</h2>
            <p className="text-gray-600 leading-relaxed">
              Some refund requests may qualify under special circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2 mt-3">
              <li><strong>Underage users:</strong> We will refund and delete data if required by law</li>
              <li><strong>Data deletion requests:</strong> If you request data deletion, we may refund associated payments</li>
              <li><strong>Regional regulations:</strong> Some countries (EU, etc.) have consumer protections we honor</li>
              <li><strong>Repeated failed attempts:</strong> Multiple payment failures = refund eligible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Q: What if I didn't use my resume yet?</h4>
                <p className="text-gray-600">A: If within 48 hours of purchase, you're eligible for refund. After 48 hours, it's non-refundable (you have access).</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Q: Can I get a refund 30 days after purchase?</h4>
                <p className="text-gray-600">A: No. The refund window is 48 hours only. After that, the purchase is final.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Q: What if Razorpay charged me twice?</h4>
                <p className="text-gray-600">A: Contact us immediately with screenshots. Double charges are refunded in full within 24 hours.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Q: Can I get refund if I changed my plan choice?</h4>
                <p className="text-gray-600">A: No. Changing your mind is not grounds for refund. Buy the plan you want.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Q: What if the PDF quality was poor?</h4>
                <p className="text-gray-600">A: We take quality seriously. If there's a technical issue (broken formatting, etc.), contact us for a re-generate or refund.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              Questions about this Refund Policy or your refund status?
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mt-4">
              <p className="text-gray-700 font-semibold mb-3">Email Us:</p>
              <a href="mailto:synchabit@gmail.com" className="text-blue-600 hover:underline text-lg">
                synchabit@gmail.com
              </a>
              <p className="text-gray-600 text-sm mt-4">
                Response time: 2-24 hours for urgent issues
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
