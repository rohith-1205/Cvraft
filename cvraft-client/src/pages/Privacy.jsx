import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-blue-100 mt-2">Last updated: May 25, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Cvraft ("Company," "we," "us," "our," or "Service Provider") operates the Cvraft website and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="mt-4">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services. By accessing and using the Cvraft website, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Personal Information You Provide</h3>
            <p>
              When you register for an account, create a resume, or make a payment, we collect:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>Name and email address</li>
              <li>Phone number (optional)</li>
              <li>Resume content and personal information you upload</li>
              <li>Payment information (processed securely by Razorpay)</li>
              <li>Account preferences and settings</li>
              <li>Communication records with our support team</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <p>
              When you use our Services, we automatically collect:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>IP address and location (for international payment support)</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent</li>
              <li>Device type and device identifiers</li>
              <li>Referral source and cookies/local storage data</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Resume Content</h3>
            <p>
              Your resume content is sensitive personal information. We treat it with the highest level of care and security. Your resume is encrypted and stored securely on our servers.
            </p>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li><strong>Service Delivery:</strong> To create and maintain your account, process payments, and generate your resume</li>
              <li><strong>Communication:</strong> To send service updates, respond to inquiries, and provide customer support</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve our Services</li>
              <li><strong>Marketing:</strong> To send promotional emails (with your consent)</li>
              <li><strong>Security:</strong> To detect fraud, prevent misuse, and protect your account</li>
              <li><strong>Compliance:</strong> To comply with legal obligations and payment processor requirements (Razorpay)</li>
              <li><strong>Analytics:</strong> To understand user behavior and service performance</li>
            </ul>
          </section>

          {/* 4. How We Share Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Service Providers</h3>
            <p>
              We share your information with trusted service providers who assist us in operating our website and conducting our business, including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li><strong>Razorpay:</strong> Payment processor (handles payment information securely)</li>
              <li><strong>Hosting Providers:</strong> Cloud infrastructure partners</li>
              <li><strong>Email Services:</strong> For transactional and marketing emails</li>
              <li><strong>Analytics Tools:</strong> To understand user behavior</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in response to valid requests by public authorities (court orders, subpoenas, etc.).
            </p>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p>
              We implement comprehensive security measures to protect your personal information, including HTTPS encryption, secure hashing for passwords, and restricted access to data servers. Razorpay handles all payment processing on their secure PCI-DSS compliant infrastructure.
            </p>
          </section>

          {/* 6. Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to remember your preferences, understand how you use our Services, and detect/prevent fraud. You can control cookie settings in your browser, but disabling them may affect service functionality.
            </p>
          </section>

          {/* 7. Changes to This Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
            </p>
          </section>

          {/* 8. Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
              <p className="font-semibold text-gray-900">Cvraft Privacy Team</p>
              <p className="text-gray-700 mt-2">
                📧 Email: <a href="mailto:synchabit@gmail.com" className="text-blue-600 hover:underline">synchabit@gmail.com</a>
              </p>
              <p className="text-gray-700 mt-4 text-sm">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              ← Back to Home
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => navigate('/terms')}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Terms & Conditions →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Privacy;
