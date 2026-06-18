import { Link } from 'react-router-dom';
import useResumeStore from '../store/resumeStore';
import { usePricing, formatPrice } from '../utils/pricing';
import Reveal from '../components/Reveal';

/**
 * Pricing page — shows localized plan prices based on user's detected country.
 *
 * LOCALIZATION LOGIC:
 * - usePricing() detects country once via ipapi.co (cached in localStorage).
 * - formatPrice() uses Intl.NumberFormat to render the correct symbol/amount.
 * - Razorpay always charges INR internally; display price is cosmetic only.
 */

const PLAN_META = [
  {
    name: 'Basic',
    key: 'basic',
    color: 'border-gray-200',
    btnColor: 'bg-gray-800 hover:bg-gray-900',
    features: ['1 Resume Download', '3 Templates', 'PDF Export', 'Standard Support'],
  },
  {
    name: 'Pro',
    key: 'pro',
    color: 'border-blue-500',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    badge: '⭐ Most Popular',
    features: ['1 Resume Download', 'All 5 Templates', 'PDF Export', 'ATS Score Check', 'Priority Support'],
  },
  {
    name: 'Bundle',
    key: 'bundle',
    color: 'border-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: ['3 Resume Downloads', 'All 5 Templates', 'Cover Letter Included', 'PDF Export', 'Priority Support'],
  },
];

const Pricing = () => {
  const { token } = useResumeStore();
  // Detect country and resolve localized pricing config
  const { pricing, isLoading } = usePricing();

  return (
    <div className="min-h-screen bg-transparent py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <Reveal delay={100}>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Simple, One-Time Pricing
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto font-light">
              No subscriptions. No monthly fees. Pay once and your resume
              is yours forever.
            </p>
          </div>
        </Reveal>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-6">
          {PLAN_META.map((plan, index) => {
            // Get localized display price for this plan key
            const planPricing = pricing.plans[plan.key];
            const displayPrice = isLoading
              ? '...'
              : formatPrice(planPricing.displayAmount, pricing.currency, pricing.locale);

            const isPro = plan.badge;

            return (
              <Reveal key={plan.name} delay={200 + index * 150} duration={0.6} className="h-full">
                <div className={`bg-white rounded-2xl border-2 ${plan.color} p-8 relative
                  hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out h-full flex flex-col justify-between
                  ${isPro ? 'md:scale-[1.04] md:-translate-y-1 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)] ring-4 ring-blue-500/10' : ''}`}>
                  
                  <div>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2
                        bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-extrabold text-gray-900 mb-1 flex items-baseline">
                      {/* Display localized price — loading skeleton while detecting */}
                      {isLoading ? (
                        <span className="inline-block w-24 h-9 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        displayPrice
                      )}
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
                  </div>
                  
                  <Link
                    to={token ? "/build" : "/register"}
                    state={{ plan: plan.key }}
                    className={`block text-center ${plan.btnColor} text-white
                    py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:outline-none`}>
                    Get Started
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* International pricing note */}
        <Reveal delay={650}>
          <p className="text-center text-xs text-gray-400 mb-20">
            🌍 Prices shown in your local currency for reference. Secure international payments supported.
            Final charged amount may vary slightly based on exchange rates.
          </p>
        </Reveal>

        {/* FAQ */}
        <Reveal delay={400} duration={0.8}>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6 max-w-2xl mx-auto">
              {[
                {
                  q: 'Is the preview really free?',
                  a: 'Yes! You can generate and preview your resume for free. Pay only when you want to download the clean PDF.'
                },
                {
                  q: 'Why is a LaTeX resume better than a normal Word/PDF resume?',
                  a: 'LaTeX resumes are highly favored by recruiters and Applicant Tracking Systems (ATS) because they compile with perfect typographical precision. Unlike standard Word documents which often have messy formatting, hidden tables, and un-parseable columns, LaTeX-generated PDFs have clean semantic structures that ATS scanners can read flawlessly, maximizing your chances of getting shortlisted.'
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
                <div key={item.q} className="border-b border-gray-100/60 pb-5 last:border-0 last:pb-0">
                  <h4 className="font-semibold text-gray-900 mb-2">❓ {item.q}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
};

export default Pricing;
