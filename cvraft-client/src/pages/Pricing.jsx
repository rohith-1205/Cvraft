import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    price: '₹299',
    color: 'border-gray-200',
    btnColor: 'bg-gray-800 hover:bg-gray-900',
    features: ['1 Resume Download', '3 Templates', 'PDF Export', 'Standard Support'],
    plan: 'basic'
  },
  {
    name: 'Pro',
    price: '₹499',
    color: 'border-blue-500',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    badge: '⭐ Most Popular',
    features: ['1 Resume Download', 'All 5 Templates', 'PDF Export', 'ATS Score Check', 'Priority Support'],
    plan: 'pro'
  },
  {
    name: 'Bundle',
    price: '₹799',
    color: 'border-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: ['3 Resume Downloads', 'All 5 Templates', 'Cover Letter Included', 'PDF Export', 'Priority Support'],
    plan: 'bundle'
  }
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Simple, One-Time Pricing
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            No subscriptions. No monthly fees. Pay once and your resume
            is yours forever.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`bg-white rounded-2xl border-2 ${plan.color}
              p-8 relative hover:shadow-lg transition`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2
                  bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">
                {plan.price}
              </div>
              <p className="text-gray-400 text-sm mb-6">one-time payment</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold text-base">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                state={{ plan: plan.plan }}
                className={`block text-center ${plan.btnColor} text-white
                py-3 rounded-xl font-semibold transition`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 max-w-2xl mx-auto">
            {[
              {
                q: 'Is the preview really free?',
                a: 'Yes! You can generate and preview your resume for free. Pay only when you want to download the clean PDF.'
              },
              {
                q: 'What payment methods are accepted?',
                a: 'We accept all UPI apps (GPay, PhonePe, Paytm), debit cards, credit cards and net banking via Razorpay.'
              },
              {
                q: 'Can I edit my resume after generating?',
                a: 'Yes — go back to Builder, update your text and generate a new resume anytime.'
              },
              {
                q: 'Is my data safe?',
                a: 'Absolutely. Your resume data is stored securely and never shared with third parties.'
              }
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-5">
                <h4 className="font-semibold text-gray-900 mb-2">❓ {item.q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
