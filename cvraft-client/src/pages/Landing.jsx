import { Link } from 'react-router-dom';

const features = [
  {
    icon: '✍️',
    title: 'Just Type Naturally',
    desc: 'Paste your details in plain English — no forms, no fields, no stress.'
  },
  {
    icon: '🤖',
    title: 'AI Structures It',
    desc: 'Claude AI reads your text and extracts every detail professionally.'
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

const plans = [
  {
    name: 'Basic',
    price: '₹299',
    color: 'border-gray-200',
    btnColor: 'bg-gray-800 hover:bg-gray-900',
    features: ['1 Resume Download', '3 Templates', 'PDF Export', 'Standard Support']
  },
  {
    name: 'Pro',
    price: '₹499',
    color: 'border-blue-500',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    badge: '⭐ Most Popular',
    features: ['1 Resume Download', 'All 5 Templates', 'PDF Export', 'ATS Score Check', 'Priority Support']
  },
  {
    name: 'Bundle',
    price: '₹799',
    color: 'border-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    features: ['3 Resume Downloads', 'All 5 Templates', 'Cover Letter', 'PDF Export', 'Priority Support']
  }
];

const Landing = () => {
  return (
    <div className="w-full">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800
        text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-500 bg-opacity-40 text-blue-100
            px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🚀 Powered by Claude AI + LaTeX
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Just tell us about yourself —<br />
            <span className="text-yellow-300">we'll craft the rest.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Paste your raw details in plain English. Our AI structures it into
            a beautiful, ATS-friendly LaTeX resume PDF in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl
              font-bold text-lg hover:bg-yellow-300 transition shadow-lg">
              Build My Resume → Free Preview
            </Link>
            <Link to="/pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-xl
              font-bold text-lg hover:bg-white hover:text-blue-700 transition">
              View Pricing
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            ✅ No subscription &nbsp;•&nbsp; ✅ One-time payment &nbsp;•&nbsp;
            ✅ Instant download
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 mb-14">Three simple steps to your dream resume</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste Your Details', desc: 'Type or paste anything — education, experience, skills in plain English.' },
              { step: '02', title: 'AI Does The Work', desc: 'Claude AI structures your content professionally and beautifully.' },
              { step: '03', title: 'Download Your PDF', desc: 'Pay once and download your stunning LaTeX-quality resume instantly.' }
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex
                  items-center justify-center text-xl font-bold mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Why Students Love Cvraft
          </h2>
          <p className="text-gray-500 text-center mb-14">
            Built specifically for Indian students and early professionals
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                hover:shadow-md hover:border-blue-100 transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Simple, One-Time Pricing
          </h2>
          <p className="text-gray-500 text-center mb-14">
            No subscriptions. No hidden fees. Pay once, yours forever.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name}
                className={`rounded-2xl border-2 ${plan.color} p-8 relative
                hover:shadow-lg transition`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2
                    bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-6">
                  {plan.price}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    one-time
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center ${plan.btnColor} text-white
                  py-3 rounded-xl font-semibold transition`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700
        text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to craft your perfect resume?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of students who landed their dream jobs with Cvraft.
          </p>
          <Link to="/register"
            className="bg-yellow-400 text-gray-900 px-10 py-4 rounded-xl
            font-bold text-lg hover:bg-yellow-300 transition shadow-lg">
            Start For Free →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Landing;
