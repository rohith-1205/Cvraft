import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-blue-100 mt-2">Last updated: May 25, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Cvraft ("we," "us," or "our"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services Offered</h2>
            <p>
              Cvraft provides an AI-powered resume building platform. Users can input their professional details, select templates, and generate resumes. Access to download the final PDF version of the resume is a paid service.
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Digital Delivery</h3>
            <p>
              All products sold on Cvraft are digital. Upon successful payment, the resume download credits are instantly applied to your account, and you can download your resume immediately from the preview page. No physical shipping is involved.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payments and Pricing</h2>
            <p>
              Pricing for our plans is displayed on our Pricing page. All payments are processed securely through Razorpay. We reserve the right to change our pricing at any time. One-time payments grant you the specific number of downloads associated with the chosen plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p>
              The content, features, and functionality of Cvraft (excluding user-provided content) are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Cvraft be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our services. We do not guarantee employment or interview calls as a result of using our resumes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
            <p>
              For any questions regarding these Terms, please contact us at <a href="mailto:synchabit@gmail.com" className="text-blue-600 hover:underline">synchabit@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
