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
  Award
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#F0FDF4] font-sans overflow-x-hidden text-[#1E3A5F]">
      
      {/* SECTION 1 - TOP GOV BAR */}
      <div className="w-full bg-[#14532D] py-2 px-4 flex justify-between items-center text-white text-xs sm:text-sm shadow-sm relative z-50">
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
      <nav className="w-full bg-white sticky top-0 z-40 border-b-2 border-[#16A34A] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" height="48" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#14532D] leading-tight">Swachhata Chakra Portal</span>
                <span className="text-xs font-medium text-gray-500">Digital Waste Management System</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 font-medium">
              <Link to="/" className="text-[#16A34A] hover:text-[#14532D] transition-colors border-b-2 border-[#16A34A] py-1">Home</Link>
              <a href="#about" className="text-gray-600 hover:text-[#16A34A] transition-colors">About</a>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#16A34A] transition-colors">Dashboard</Link>
              <Link to="/public" className="text-gray-600 hover:text-[#16A34A] transition-colors">Public Map</Link>
              <Link to="/login" className="text-gray-600 hover:text-[#16A34A] transition-colors">Login</Link>
              <Link to="/login" className="bg-[#EA580C] hover:bg-[#c2410a] text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5">
                Register →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* SECTION 3 - HERO SECTION */}
      <section className="w-full bg-gradient-to-br from-[#14532D] to-[#166534] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#16A34A]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 relative z-10">
          
          <div className="flex-1 text-center lg:text-left text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#EA580C]/20 border border-[#EA580C]/50 text-[#FFF7ED] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></span>
              Climatathon 2026 — NIT Raipur
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-[#FFF7ED]" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
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
              <Link to="/login" className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#c2410a] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-900/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                Get Started →
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-2 border-white/80 text-white px-8 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                View Live Dashboard →
              </Link>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#16A34A] rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
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
      <div className="w-full bg-white border-t-4 border-[#16A34A] shadow-md relative z-20 -mt-6 rounded-t-3xl max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">♻️</div>
            <div className="text-2xl font-bold text-[#14532D]">5 MT</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Waste Processed This Month</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-[#14532D]">110+</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Collectors Online</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">₹</div>
            <div className="text-2xl font-bold text-[#14532D]">1.5 Lakh</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Revenue Generated</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-[#14532D]">100%</div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Machine Functional</div>
          </div>
        </div>
      </div>

      {/* SECTION 5 - THE PROBLEM */}
      <section id="about" className="w-full bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-6">
              <span className="text-sm font-bold text-red-600 tracking-widest uppercase">The Reality</span>
              <h3 className="text-4xl font-extrabold text-[#1E3A5F] leading-tight">
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
            
            <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-[#16A34A]/10 border border-[#16A34A]/20">
              <span className="text-sm font-bold text-[#16A34A] tracking-widest uppercase">The Digital Solution</span>
              <ul className="space-y-6 mt-8">
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-[#F0FDF4] transition-colors border border-transparent hover:border-[#16A34A]/30">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
                  </div>
                  <span className="text-lg font-semibold text-[#1E3A5F]">Real-time automated reporting</span>
                </li>
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-[#F0FDF4] transition-colors border border-transparent hover:border-[#16A34A]/30">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
                  </div>
                  <span className="text-lg font-semibold text-[#1E3A5F]">District & Block level drilldown</span>
                </li>
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-[#F0FDF4] transition-colors border border-transparent hover:border-[#16A34A]/30">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
                  </div>
                  <span className="text-lg font-semibold text-[#1E3A5F]">Machine health & usage intelligence</span>
                </li>
                <li className="flex items-center gap-5 p-4 rounded-xl hover:bg-[#F0FDF4] transition-colors border border-transparent hover:border-[#16A34A]/30">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
                  </div>
                  <span className="text-lg font-semibold text-[#1E3A5F]">End-to-end financial transparency</span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 6 - INTEGRATED WORKFLOW */}
      <section className="w-full bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-extrabold text-[#1E3A5F] mb-4">Integrated Digital Workflow</h3>
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
              <div key={i} className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border-t-4 border-t-[#16A34A] border-l border-r border-b border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center mb-6 text-[#16A34A]">
                  <card.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-[#1E3A5F] mb-3">{card.title}</h4>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - GAMIFICATION */}
      <section className="w-full bg-[#16A34A] py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="text-white space-y-8">
              <div>
                <h3 className="text-5xl font-black mb-4">Plasti-Dhan Wallet</h3>
                <p className="text-2xl text-green-100 font-medium">Wealth out of Waste — SBM 2026 Aligned</p>
              </div>
              
              <div className="bg-[#14532D] p-6 rounded-2xl border border-green-500/30 shadow-2xl inline-block">
                <div className="text-xl font-bold mb-2 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-400" /> Points Formula
                </div>
                <div className="text-green-50 space-y-1">
                  <p className="text-lg">10 grams = <span className="font-bold text-white">1 Point</span></p>
                  <p className="text-lg">Grade A waste = <span className="font-bold text-white bg-green-600 px-2 py-0.5 rounded">1.5× Bonus</span></p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h4 className="text-lg font-bold text-green-200 uppercase tracking-widest">Redemption Examples</h4>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <span className="text-3xl">🏛️</span>
                  <div>
                    <div className="font-bold text-xl">5000 pts</div>
                    <div className="text-green-100">₹50 Panchayat Tax Rebate</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <span className="text-3xl">📱</span>
                  <div>
                    <div className="font-bold text-xl">2000 pts</div>
                    <div className="text-green-100">1GB Mobile Recharge</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <span className="text-3xl">🛒</span>
                  <div>
                    <div className="font-bold text-xl">500 pts</div>
                    <div className="text-green-100">Local Store Voucher</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-12 h-12 text-[#EA580C]" />
                </div>
                <div className="text-6xl font-black text-[#14532D] mb-2">85 Points</div>
                <p className="text-lg text-gray-500 font-medium mb-10">Earned by depositing 850g Grade A plastic</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold text-[#1E3A5F]">
                    <span>Current Tier: Bronze</span>
                    <span>15 pts to Silver</span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#EA580C] w-[85%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 8 - CTA / REGISTER */}
      <section className="w-full bg-[#14532D] py-24 text-center px-4">
        <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Register your unit today</h3>
        <p className="text-xl text-green-100 max-w-2xl mx-auto mb-12">
          Join the central network for transparent, efficient plastic waste management.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/login" className="bg-white text-[#14532D] hover:bg-gray-100 px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-transform hover:-translate-y-1">
            Register as Collector
          </Link>
          <Link to="/login" className="bg-[#EA580C] text-white hover:bg-[#c2410a] px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-transform hover:-translate-y-1">
            Register as Citizen
          </Link>
        </div>
      </section>

      {/* SECTION 9 - FOOTER */}
      <footer className="w-full bg-[#0d361c] text-green-50 pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-green-900/50">
        <div className="max-w-7xl mx-auto">
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
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
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
          
          <div className="pt-8 border-t border-green-800/50 text-center text-sm text-green-300/60 font-medium">
            © 2026 Swachhata Chakra Portal | Team CodeX | Kalinga University | Climatathon 2026 — NIT Raipur | SBM Rule 2026 Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
