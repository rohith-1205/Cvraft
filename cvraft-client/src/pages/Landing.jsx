import { Link } from 'react-router-dom';
import useResumeStore from '../store/resumeStore';
import { usePricing, formatPrice } from '../utils/pricing';
import Reveal from '../components/Reveal';

const features = [
  {
    icon: '✍️',
    title: 'Just Type Naturally',
    desc: 'Paste your details in plain English — no forms, no fields, no stress.'
  },
  {
    icon: '🤖',
    title: 'AI Structures It',
    desc: 'Our AI reads your text and extracts every detail professionally.'
  },
  {
    icon: '📄',
    title: 'LaTeX Quality PDF',
    desc: 'Get a stunning, ATS-friendly PDF that stands out from Word resumes.'
  },
  {
    icon: '⚡',
    title: 'Ready in 60 Seconds',
    desc: 'From raw text to beautiful PDF in under a minute. No waiting.'
  },
  {
    icon: '🔒',
    title: 'One-Time Payment',
    desc: 'No subscriptions. Pay once, download your resume, done.'
  },
  {
    icon: '🎯',
    title: 'ATS Optimized',
    desc: 'Every template is designed to pass Applicant Tracking Systems.'
  }
];

// Plan metadata only — prices come from the usePricing hook based on detected country
const plans = [
  {
    name: 'Basic',
    key: 'basic',
    color: 'border-gray-200',
    btnColor: 'bg-gray-800 hover:bg-gray-900',
    features: ['1 Resume Download', '3 Templates', 'PDF Export', 'Standard Support']
  },
  {
    name: 'Pro',
    key: 'pro',
    color: 'border-blue-500',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    badge: '⭐ Most Popular',
    features: ['1 Resume Download', 'All 5 Templates', 'PDF Export', 'ATS Score Check', 'Priority Support']
  },
  {
    name: 'Bundle',
    key: 'bundle',
    color: 'border-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: ['3 Resume Downloads', 'All 5 Templates', 'Cover Letter', 'PDF Export', 'Priority Support']
  }
];

const Landing = () => {
  const { token } = useResumeStore();
  // Detect user country and get localized pricing config
  const { pricing, isLoading } = usePricing();
  return (
    <div className="w-full">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950/30 via-indigo-950/20 to-transparent text-white py-28 px-6">
        {/* Glow Orbs for Visual Depth */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-float-delay" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal delay={100} duration={0.8}>
            <div className="inline-block bg-blue-500/10 border border-blue-400/20 text-blue-300
              px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-md">
              Powered by AI + LaTeX
            </div>
          </Reveal>

          <Reveal delay={250} duration={0.8}>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Build Your Professional CV with AI —<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">we'll craft the rest.</span>
            </h1>
          </Reveal>

          <Reveal delay={400} duration={0.8}>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Paste your raw details in plain English. Our AI structures it into
              a beautiful, ATS-friendly LaTeX resume PDF in 60 seconds.
            </p>
          </Reveal>

          <Reveal delay={550} duration={0.8}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={token ? "/build" : "/register"}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-8 py-4 rounded-xl
                font-bold text-lg hover:from-amber-300 hover:to-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400 focus-visible:outline-none">
                Build My Resume → Free Preview
              </Link>
              <Link to="/pricing"
                className="border-2 border-white/40 text-white bg-white/5 backdrop-blur-sm px-8 py-4 rounded-xl
                font-bold text-lg hover:bg-white hover:text-slate-950 transition-all duration-300 hover:scale-105 shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:outline-none">
                View Pricing
              </Link>
            </div>
          </Reveal>

          <Reveal delay={700} duration={0.8}>
            <p className="text-slate-400 text-sm mt-8 font-medium">
              ✅ No subscription &nbsp;•&nbsp; ✅ One-time payment &nbsp;•&nbsp;
              ✅ Instant download
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal delay={100}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 mb-14">Three simple steps to your dream resume</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste Your Details', desc: 'Type or paste anything — education, experience, skills in plain English.' },
              { step: '02', title: 'AI Does The Work', desc: 'Our AI structures your content professionally and beautifully.' },
              { step: '03', title: 'Download Your PDF', desc: 'Pay once and download your stunning LaTeX-quality resume instantly.' }
            ].map((item, index) => (
              <Reveal key={item.step} delay={200 + index * 150} duration={0.6}>
                <div className="bg-pink-light border border-pink-200 rounded-2xl p-8 flex flex-col items-center text-center hover:scale-[1.04] hover:-translate-y-2 transition-all duration-300 ease-out">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl flex
                    items-center justify-center text-xl font-bold mb-5 shadow-lg shadow-rose-500/25">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <Reveal delay={100}>
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
              Why Students Love Cvraft
            </h2>
            <p className="text-gray-500 text-center mb-14">
              Built specifically for students and early professionals
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, index) => (
              <Reveal key={f.title} delay={200 + index * 100} duration={0.5}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100/60
                  hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-[0_20px_45px_-15px_rgba(37,99,235,0.08)] transition-all duration-300 ease-out h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 flex items-center justify-center text-2xl mb-4 border border-blue-500/10">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-grow">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <Reveal delay={100}>
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
              Simple, One-Time Pricing
            </h2>
            <p className="text-gray-500 text-center mb-14">
              No subscriptions. No hidden fees. Pay once, yours forever.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => {
              // Resolve localized display price for this plan
              const planPricing = pricing.plans[plan.key];
              const displayPrice = isLoading
                ? null
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
                        {/* Localized price with loading skeleton */}
                        {isLoading ? (
                          <span className="inline-block w-20 h-9 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          displayPrice
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-6">one-time payment</p>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link to={token ? "/build" : "/register"}
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
          <Reveal delay={600}>
            <p className="text-center text-xs text-gray-400 mt-8">
              🌍 Prices shown in your local currency. Secure international payments supported.
              Final charged amount may vary slightly based on exchange rates.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-24 px-6 bg-transparent relative overflow-hidden">
        {/* Subtle Ambient Orb for CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <Reveal delay={100}>
          <div className="bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-950 border border-white/10 rounded-3xl py-16 px-6 max-w-4xl mx-auto text-center relative z-10 shadow-2xl backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">
              Ready to craft your perfect resume?
            </h2>
            <p className="text-slate-300 mb-8 text-lg font-light max-w-xl mx-auto">
              Join thousands of students who landed their dream jobs with Cvraft.
            </p>
            <Link to={token ? "/build" : "/register"}
              className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-10 py-4 rounded-xl
              font-bold text-lg hover:from-amber-300 hover:to-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400 focus-visible:outline-none">
              Start For Free →
            </Link>
          </div>
        </Reveal>
      </section>

    </div>
  );
};

export default Landing;
