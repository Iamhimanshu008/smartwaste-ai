import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  UserPlus,
  ClipboardList,
  Activity,
  Award,
  QrCode,
  Scale,
  Recycle,
  Star,
  Landmark,
  Bell,
  FileText,
  Download,
  Image as PhotoIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const MitanCoin = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #B45309, #D97706)',
    fontSize: '12px',
    marginRight: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }}>🌾</span>
);

export default function LandingPage() {
  useEffect(() => {
    // Load Noto Sans Devanagari font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-sw-bg font-sans overflow-x-hidden text-sw-text-secondary">

      {/* SECTION 0 - NOTIFICATION BAR */}
      <div className="w-full bg-green-600 text-white text-sm relative z-[60] flex items-center overflow-hidden border-b border-green-700">
        <div className="whitespace-nowrap font-bold px-4 py-1.5 border-r border-green-500 bg-green-600 relative z-10 flex items-center gap-2">
          📢 Notifications:
        </div>
        <div className="overflow-hidden flex-1 relative group h-full">
          <div className="whitespace-nowrap inline-block animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] py-1.5">
            <span className="mx-4">📢 SWM Rules 2026 E-Book now available — Download below</span>
            <span className="mx-4">|</span>
            <span className="mx-4">🌱 Swachhata Chakra Portal will officially launched for Chhattisgarh Gram Panchayats</span>
            <span className="mx-4">|</span>
            <span className="mx-4">📱 Download Swachhata Chakra App v2.4.3 — Available Now</span>
            <span className="mx-4">|</span>
            <span className="mx-4">🏆 Climatathon 2026 — Unicef India X NIT Raipur — Team CodeX</span>
          </div>
        </div>
      </div>

      {/* SECTION 1 - TOP GOV BAR */}
      <div className="w-full bg-sw-dark py-2 px-4 flex justify-between items-center text-white text-xs sm:text-sm shadow-sm relative z-50">
        <div className="flex items-center gap-2">
          <img src="/cg-govt-logo.png" alt="CG Govt Logo" height="36" className="h-9 w-auto" />
          <span className="hidden sm:inline font-semibold">Government of Chhattisgarh | छत्तीसगढ़ शासन</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <img src="/unicef-logo.png" alt="UNICEF Logo" height="32" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="opacity-90">Swachh Bharat Mission 2026</span>
        </div>
      </div>

      {/* SECTION 2 - NAVBAR */}
      <nav className="w-full bg-white sticky top-0 z-40 border-b-2 border-sw-mid shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" height="48" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-sw-dark leading-tight">Swachhata Chakra Portal</span>
                <span className="text-xs font-medium text-gray-500">Digital Rural Waste Management System</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 font-medium">
              <Link to="/" className="text-sw-mid hover:text-sw-dark transition-colors border-b-2 border-sw-mid py-1">Home</Link>
              <a href="#about" className="text-gray-600 hover:text-sw-mid transition-colors">About</a>
              <Link to="/login" className="text-gray-600 hover:text-sw-mid transition-colors">Dashboard</Link>
              <Link to="/public" className="text-gray-600 hover:text-sw-mid transition-colors">Public Map</Link>
              <Link to="/login" className="text-gray-600 hover:text-sw-mid transition-colors">Login</Link>
              <Link to="/login" className="bg-sw-orange hover:bg-[#c2410a] text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5">
                Register →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes heroFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes marquee { 
          0% { transform: translateX(100%) } 
          100% { transform: translateX(-100%) } 
        }
        .hero-gradient {
          background: linear-gradient(-45deg, #0F3D1A, #1A6B2F, #1A3C8F, #0F3D1A);
          background-size: 400% 400%;
          animation: heroFlow 15s ease infinite;
        }
        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }
        .delay-1 { animation-delay: 1s; }
        .delay-2 { animation-delay: 2s; }
        .delay-3 { animation-delay: 3s; }
        .delay-4 { animation-delay: 4s; }
      `}</style>
      {/* SECTION 3 - HERO SECTION */}
      <section className="w-full hero-gradient py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sw-mid/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 relative z-10">

          <div className="flex-1 text-center lg:text-left text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-sw-orange/20 border border-sw-orange/50 text-sw-light px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-sw-orange animate-pulse"></span>
              Swachhata Chakra Portal for Rural Chhattisgarh
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-sw-light" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              स्वच्छ छत्तीसगढ़, समृद्ध छत्तीसगढ़
            </h1>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-white mt-4">
              Transforming Waste into Wealth
            </h2>

            <p className="text-lg sm:text-xl text-green-50 max-w-2xl mx-auto lg:mx-0 opacity-90 leading-relaxed font-light">
              An Integrated Plastic Waste Management Platform for Chhattisgarh's
              Gram Panchayats — powered by AI and IoT.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <Link to="/login" className="w-full sm:w-auto bg-sw-orange hover:bg-[#c2410a] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-900/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Get Started →
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-2 border-white/80 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                View Live Dashboard →
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-sw-mid rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>

              {/* Floating Icons */}
              <div className="absolute -top-10 -left-10 bg-white p-3 rounded-2xl shadow-xl floating-icon delay-1 z-20 hidden md:block border-2 border-sw-gold">
                <QrCode className="w-8 h-8 text-sw-dark" />
              </div>
              <div className="absolute top-20 -right-12 bg-white p-3 rounded-2xl shadow-xl floating-icon delay-2 z-20 hidden md:block border-2 border-sw-blue">
                <Scale className="w-8 h-8 text-sw-orange" />
              </div>
              <div className="absolute bottom-10 -left-8 bg-white p-3 rounded-2xl shadow-xl floating-icon delay-3 z-20 hidden md:block border-2 border-sw-mid">
                <Recycle className="w-8 h-8 text-sw-bright" />
              </div>
              <div className="absolute -bottom-10 right-10 bg-white p-3 rounded-2xl shadow-xl floating-icon delay-4 z-20 hidden md:block border-2 border-sw-gold">
                <Star className="w-8 h-8 text-sw-gold" />
              </div>
              <div className="absolute top-0 right-10 bg-white p-3 rounded-2xl shadow-xl floating-icon z-20 hidden md:block border-2 border-sw-dark">
                <Landmark className="w-8 h-8 text-sw-dark" />
              </div>

              <img
                src="/logo.png"
                alt="Swachhata Chakra Logo"
                width="320"
                className="relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.4))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - STATS BAR */}
      <div className="w-full bg-white border-t-4 border-sw-mid shadow-md relative z-20 -mt-6 rounded-t-3xl max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">♻️</div>
            <div className="text-2xl font-bold text-sw-dark">5 MT</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Waste Processed This Month</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-sw-dark">110+</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Collectors Online</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">₹</div>
            <div className="text-2xl font-bold text-sw-dark">1.5 Lakh</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Revenue Generated</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-sw-dark">100%</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Machine Functional</div>
          </div>
        </div>
      </div>

      {/* SECTION 4.5 - ABOUT THE PROJECT */}
      <section id="about" className="w-full bg-white py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-sw-text-secondary" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              Swachhata Chakra Kaise Kaam Karta Hai?
            </h3>
            <p className="text-xl text-gray-500 mt-4 font-medium">How Swachhata Chakra Works — Simple. Transparent. Rewarding.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-20 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center z-10 w-full md:w-1/5">
              <div className="w-24 h-24 rounded-full bg-sw-mid flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl">🏠</span>
              </div>
              <h4 className="font-bold text-lg text-sw-dark mb-1">From Home</h4>
              <p className="font-semibold text-gray-800 text-sm mb-1">Citizen brings plastic waste</p>
            </div>

            <div className="md:hidden text-sw-mid my-2 font-bold text-xl">↓</div>
            <div className="hidden md:block text-sw-mid font-bold text-2xl -mt-20">→</div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center z-10 w-full md:w-1/5">
              <div className="w-24 h-24 rounded-full bg-sw-orange flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl">⚖️</span>
              </div>
              <h4 className="font-bold text-lg text-sw-dark mb-1">Auto-Weighing</h4>
              <p className="font-semibold text-gray-800 text-sm mb-1">IoT Scale measures weight automatically</p>
            </div>

            <div className="md:hidden text-sw-mid my-2 font-bold text-xl">↓</div>
            <div className="hidden md:block text-sw-mid font-bold text-2xl -mt-20">→</div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center z-10 w-full md:w-1/5">
              <div className="w-24 h-24 rounded-full bg-sw-blue flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl">🤖</span>
              </div>
              <h4 className="font-bold text-lg text-sw-dark mb-1">AI Quality Check</h4>
              <p className="font-semibold text-gray-800 text-sm mb-1">Gemini AI analyzes plastic photo in seconds</p>
            </div>

            <div className="md:hidden text-sw-mid my-2 font-bold text-xl">↓</div>
            <div className="hidden md:block text-sw-mid font-bold text-2xl -mt-20">→</div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center z-10 w-full md:w-1/5">
              <div className="w-24 h-24 rounded-full bg-[#B45309] flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl">🌾</span>
              </div>
              <h4 className="font-bold text-lg text-sw-dark mb-1">Mitan-Mudra Credited</h4>
              <p className="font-semibold text-gray-800 text-sm mb-1">10 grams = 1 <MitanCoin /> Mitan-Mudra</p>
            </div>

            <div className="md:hidden text-sw-mid my-2 font-bold text-xl">↓</div>
            <div className="hidden md:block text-sw-mid font-bold text-2xl -mt-20">→</div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center z-10 w-full md:w-1/5">
              <div className="w-24 h-24 rounded-full bg-[#7C3AED] flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl">🏪</span>
              </div>
              <h4 className="font-bold text-lg text-sw-dark mb-1">Redeem Benefits</h4>
              <p className="font-semibold text-gray-800 text-sm mb-1">Redeem Mitan-Mudra for real local benefits</p>
            </div>
          </div>

          {/* Below the 5 steps — 3 "Why it's different" cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-sw-light p-8 rounded-2xl border border-sw-mid/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">📵</div>
              <h4 className="text-xl font-bold text-sw-dark mb-2">Zero Internet Needed</h4>
              <p className="text-gray-700">Collectors work all day without mobile data.<br />Data syncs when they return to Panchayat Office.</p>
            </div>

            <div className="bg-[#FFF7ED] p-8 rounded-2xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-xl font-bold text-sw-dark mb-2">100% Fraud-Proof</h4>
              <p className="text-gray-700">Weight comes directly from IoT scale via Bluetooth.<br />No collector can type a fake number.</p>
            </div>

            <div className="bg-[#F0F9FF] p-8 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🌱</div>
              <h4 className="text-xl font-bold text-sw-dark mb-2">SBM 2026 Compliant</h4>
              <p className="text-gray-700">Every transaction creates an audit trail for<br />Swachh Bharat Mission reporting automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - THE PROBLEM */}
      <section className="w-full bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="space-y-6">
              <span className="text-sm font-bold text-red-600 tracking-widest uppercase">The Reality</span>
              <h3 className="text-4xl font-extrabold text-sw-text-secondary leading-tight">
                Fragmented infrastructure limits true potential.
              </h3>
              <ul className="space-y-4 mt-8">
                <li className="flex items-start gap-4 text-gray-600 text-lg">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span>Paper-based, error-prone reporting</span>
                </li>
                <li className="flex items-start gap-4 text-gray-600 text-lg">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span>No district-level comparative analytics</span>
                </li>
                <li className="flex items-start gap-4 text-gray-600 text-lg">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span>Zero visibility into collector operations</span>
                </li>
                <li className="flex items-start gap-4 text-gray-600 text-lg">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <span>Opaque financial & operational metrics</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-sw-mid/10 border border-sw-mid/20">
              <span className="text-sm font-bold text-sw-mid tracking-widest uppercase">The Digital Solution</span>
              <ul className="space-y-6 mt-8">
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-sw-bg transition-colors border border-transparent hover:border-sw-mid/30">
                  <div className="w-12 h-12 rounded-full bg-sw-mid/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-sw-mid" />
                  </div>
                  <span className="text-lg font-semibold text-sw-text-secondary">Real-time automated reporting</span>
                </li>
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-sw-bg transition-colors border border-transparent hover:border-sw-mid/30">
                  <div className="w-12 h-12 rounded-full bg-sw-mid/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-sw-mid" />
                  </div>
                  <span className="text-lg font-semibold text-sw-text-secondary">District & Block level drilldown</span>
                </li>
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-sw-bg transition-colors border border-transparent hover:border-sw-mid/30">
                  <div className="w-12 h-12 rounded-full bg-sw-mid/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-sw-mid" />
                  </div>
                  <span className="text-lg font-semibold text-sw-text-secondary">Machine health & usage intelligence</span>
                </li>
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-sw-bg transition-colors border border-transparent hover:border-sw-mid/30">
                  <div className="w-12 h-12 rounded-full bg-sw-mid/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-sw-mid" />
                  </div>
                  <span className="text-lg font-semibold text-sw-text-secondary">End-to-end financial transparency</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6 - INTEGRATED WORKFLOW */}
      <section className="w-full bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-extrabold text-sw-text-secondary mb-4">Integrated Digital Workflow</h3>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-16">
            Four integrated portals ensuring seamless accountability from source to disposal.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              { icon: UserPlus, title: "Registration Portal", desc: "Onboarding for citizens, collectors, and SHG workers with QR card generation" },
              { icon: ClipboardList, title: "Reporting Portal", desc: "Offline-first daily collection logging with automatic sync when internet available" },
              { icon: Activity, title: "Monitoring Portal", desc: "IoT weight machine compliance, collector route tracking, and fraud detection" },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "State-level insights, ward analytics, and Swachh Bharat compliance exports" },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border-t-4 border-t-sw-mid border-l border-r border-b border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-sw-bg rounded-xl flex items-center justify-center mb-6 text-sw-mid">
                  <card.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-sw-text-secondary mb-3">{card.title}</h4>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6.5 - DOWNLOAD MOBILE APP */}
      <section className="w-full bg-sw-bg py-24 border-t border-sw-mid/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sw-mid/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-sw-text-secondary">Swachhata Chakra Mobile App</h3>
            <p className="text-xl text-gray-600 mt-4">For Waste Collector & Household — Offline-First Field App</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT - Features */}
            <div className="space-y-8">
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-sw-mid shrink-0" /> Works completely offline — no internet needed in field
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-sw-mid shrink-0" /> QR scan citizen identity instantly
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-sw-mid shrink-0" /> Bluetooth IoT scale auto-fills weight
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-sw-mid shrink-0" /> Hindi + English bilingual interface
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-sw-mid shrink-0" /> Morning route download + Afternoon sync
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <CheckCircle2 className="w-6 h-6 text-sw-mid shrink-0" /> Push notifications for route assignments
                </li>
              </ul>

              <div className="inline-block bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-600">
                v2.4.3 | Android 8.0+ | Free
              </div>

              <div>
                <a
                  href="https://github.com/Iamhimanshu008/swachhata-chakra/releases/download/v2.4.3/Swachhata-Chakra-v2.4.3.apk"
                  className="inline-flex items-center gap-3 bg-sw-mid hover:bg-sw-dark text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all hover:-translate-y-1"
                >
                  📱 Download APK v2.4.3
                </a>
                <p className="text-sm text-gray-500 mt-3 ml-2">Direct APK • No Play Store required • 88 MB</p>
              </div>
            </div>

            {/* RIGHT - Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-[300px] h-[600px] bg-white rounded-[3rem] border-8 border-sw-dark shadow-2xl relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
                {/* Notch */}
                <div className="absolute top-0 w-32 h-6 bg-sw-dark rounded-b-xl"></div>

                <img src="/logo.png" alt="App Logo" className="w-24 h-24 drop-shadow-xl mb-6" />
                <h4 className="text-2xl font-bold text-sw-dark text-center px-4 leading-tight">Swachhata<br />Chakra</h4>
                <div className="mt-4 bg-sw-mid text-white px-4 py-1 rounded-full text-sm font-bold">
                  v2.4.3
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-4 w-24 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6.6 - EVENTS AND SWM RULES */}
      <section className="w-full bg-white py-24 border-t border-sw-mid/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* LEFT - Events / Notice Board */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-green-600 pl-3">
                <h3 className="text-2xl font-bold text-sw-dark">Events / Notice Board</h3>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">1 New</span>
              </div>
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <span className="inline-block bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">22 May 2026</span>
                    <h4 className="font-bold text-gray-800 text-lg">Review VC on SBMG & SWM Rules with Collectors</h4>
                  </div>
                  <button className="shrink-0 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">View More</button>
                </div>
                <div className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <span className="inline-block bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">04 Jun 2026</span>
                    <h4 className="font-bold text-gray-800 text-lg">SWM Rules 2026 Orientation with CEOs ZP</h4>
                  </div>
                  <button className="shrink-0 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">View More</button>
                </div>
                <div className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <span className="inline-block bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">Coming Soon</span>
                    <h4 className="font-bold text-gray-800 text-lg">Ward-level pilot launch — Raipur District</h4>
                  </div>
                  <button disabled className="shrink-0 border border-gray-300 text-gray-400 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed">View More</button>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <button className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-green-600 hover:text-green-600 hover:bg-green-50 py-3 rounded-lg font-bold transition-colors">
                  + Add Notice
                </button>
              </div>
            </div>

            {/* RIGHT - SWM Rules 2026 Documents */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-orange-500 pl-3">
                <h3 className="text-2xl font-bold text-sw-dark">SWM Rules 2026 Related Documents</h3>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full">Official</span>
              </div>
              <div className="space-y-3">
                <a href="https://sbmrural.cgstate.gov.in/uploads/noticefiles/notice_swm_rules_2026_e_book_20260604_175711.pdf" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-3 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-700 group-hover:underline text-base">SWM RULES 2026 E-BOOK (Official)</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">NEW</span>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                </a>
                
                <a href="#" className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                    <h4 className="font-medium text-green-600 text-base">SWM Rules 2026 Orientation PPT — ZP (4 June 2026)</h4>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-sw-dark transition-colors" />
                </a>

                <a href="#" className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                    <h4 className="font-medium text-gray-700 group-hover:text-sw-dark text-base">Municipal Solid Waste Guidelines — 05.02.26</h4>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-sw-dark transition-colors" />
                </a>

                <a href="#" className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                    <h4 className="font-medium text-gray-700 group-hover:text-sw-dark text-base">Waste Management Order — 19.02.26</h4>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-sw-dark transition-colors" />
                </a>

                <a href="#" className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gray-400 shrink-0" />
                    <h4 className="font-medium text-gray-700 group-hover:text-sw-dark text-base">Dry Waste Collection Circular — 29.04.26</h4>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-sw-dark transition-colors" />
                </a>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <a href="#" className="inline-flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
                  View All Documents <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6.7 - GALLERY */}
      <section className="w-full bg-[#F0FDF4] py-24 relative z-10 border-t border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-extrabold text-green-800">Gallery</h3>
            <p className="text-xl text-green-600/80 mt-2 font-medium">Field activities and awareness programs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="flex flex-col group">
              <div className="relative h-[220px] rounded-xl overflow-hidden shadow-lg border-2 border-green-200 bg-[#D1FAE5] mb-3">
                <img 
                  src="/gallery/gallery1.jpg" 
                  alt="Gallery 1" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display='none'} 
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <PhotoIcon className="w-12 h-12 text-green-400 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-green-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                  <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Community waste collection drive</p>
                </div>
              </div>
              <span className="text-center text-green-900 font-bold text-sm">Swachh Bharat Drive</span>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col group">
              <div className="relative h-[220px] rounded-xl overflow-hidden shadow-lg border-2 border-green-200 bg-[#BBF7D0] mb-3">
                <img 
                  src="/gallery/gallery2.jpg" 
                  alt="Gallery 2" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display='none'} 
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <PhotoIcon className="w-12 h-12 text-green-400 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-green-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                  <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Village cleanliness awareness</p>
                </div>
              </div>
              <span className="text-center text-green-900 font-bold text-sm">Clean Village Campaign</span>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col group">
              <div className="relative h-[220px] rounded-xl overflow-hidden shadow-lg border-2 border-green-200 bg-[#A7F3D0] mb-3">
                <img 
                  src="/gallery/gallery3.jpg" 
                  alt="Gallery 3" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display='none'} 
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <PhotoIcon className="w-12 h-12 text-green-400 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-green-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                  <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">SWM awareness for citizens</p>
                </div>
              </div>
              <span className="text-center text-green-900 font-bold text-sm">Awareness Program</span>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col group">
              <div className="relative h-[220px] rounded-xl overflow-hidden shadow-lg border-2 border-green-200 bg-[#6EE7B7] mb-3">
                <img 
                  src="/gallery/gallery4.jpg" 
                  alt="Gallery 4" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display='none'} 
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <PhotoIcon className="w-12 h-12 text-green-400 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-green-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                  <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Laminated QR cards for households</p>
                </div>
              </div>
              <span className="text-center text-green-900 font-bold text-sm">QR Card Distribution</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 - GAMIFICATION */}
      <section className="w-full bg-sw-mid py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="text-white space-y-8">
              <div>
                <h3 className="text-5xl font-black mb-4">Mitan-Mudra Wallet</h3>
                <p className="text-2xl text-green-100 font-medium">Wealth out of Waste — SBM 2026 Aligned</p>
              </div>

              <div className="bg-sw-dark p-6 rounded-2xl border border-green-500/30 shadow-2xl inline-block">
                <div className="text-xl font-bold mb-2 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" /> Mitan-Mudra Formula
                </div>
                <div className="text-green-50 space-y-1">
                  <p className="text-lg">10 grams dry waste = <span className="font-bold text-white">1 <MitanCoin /> Mitan-Mudra</span></p>
                  <p className="text-lg">Grade A waste = <span className="font-bold text-white bg-green-600 px-2 py-0.5 rounded">1.5× Bonus Mitan-Mudra</span></p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-lg font-bold text-green-200 uppercase tracking-widest">Redemption Examples</h4>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <span className="text-3xl">🏛️</span>
                  <div>
                    <div className="font-bold text-xl flex items-center"><MitanCoin /> 5,000</div>
                    <div className="text-green-100">₹50 Panchayat Tax Rebate</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <span className="text-3xl">📱</span>
                  <div>
                    <div className="font-bold text-xl flex items-center"><MitanCoin /> 2,000</div>
                    <div className="text-green-100">1GB Mobile Recharge</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <span className="text-3xl">🛒</span>
                  <div>
                    <div className="font-bold text-xl flex items-center"><MitanCoin /> 500</div>
                    <div className="text-green-100">Local Store Voucher</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-12 h-12 text-sw-orange" />
                </div>
                <div className="text-5xl font-black text-sw-dark mb-2 flex items-center justify-center">85 <MitanCoin /> Mitan-Mudra</div>
                <p className="text-lg text-gray-500 font-medium mb-10">Earned by depositing 850g Grade A plastic</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold text-sw-text-secondary">
                    <span>Current Tier: Bronze</span>
                    <span>15 pts to Silver</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sw-mid to-sw-orange w-[85%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 8 - CTA / REGISTER */}
      <section className="w-full bg-sw-dark py-24 text-center px-4">
        <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Register your unit today</h3>
        <p className="text-xl text-green-100 max-w-2xl mx-auto mb-12">
          Join the central network for transparent, efficient plastic waste management.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/recyclers" className="bg-white text-sw-dark hover:bg-gray-100 px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-transform hover:-translate-y-1">
            Register as Recycler
          </Link>
          <Link to="/login" className="bg-sw-orange text-white hover:bg-[#c2410a] px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-transform hover:-translate-y-1">
            Register as Household
          </Link>
        </div>
      </section>

      {/* SECTION 9 - FOOTER */}
      <footer className="w-full bg-[#0d361c] text-green-50 pt-16 pb-8 border-t border-green-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-12 h-12" />
                <span className="text-2xl font-bold text-white">Swachhata Chakra</span>
              </div>
              <p className="text-green-200/80 leading-relaxed">
                An Integrated Plastic Waste Management Platform for Chhattisgarh's Gram Panchayats.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3 text-green-200/80">
                <li><Link to="/public" className="hover:text-white transition-colors">Public Map</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Portals Login</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-6">Supported By</h4>
              <div className="flex items-center gap-6">
                <img src="/cg-govt-logo.png" alt="CG Govt" className="h-16 w-auto bg-white/10 p-2 rounded-lg" />
                <img src="/unicef-logo.png" alt="UNICEF" className="h-12 w-auto bg-white/10 p-2 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className="w-full bg-[#14532D] text-white text-[12px] py-3 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
        <div>
          © 2026 Swachhata Chakra Portal
        </div>
        <div className="md:text-right">
          Designed & Developed by Team CodeX | NIT Raipur × Unicef India
        </div>
      </div>
    </div>
  );
}
