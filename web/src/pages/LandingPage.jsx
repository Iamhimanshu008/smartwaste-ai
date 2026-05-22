import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  MapPin,
  Smartphone,
  BarChart2,
  Recycle,
  Bell,
  Leaf,
  Download,
  ArrowRight,
  Shield,
  Users,
  Truck
} from 'lucide-react';

const APK_URL = import.meta.env.VITE_APK_DOWNLOAD_URL ||
  "https://github.com/Iamhimanshu008/smartwaste-ai/releases/download/v2.3.5/SmartWasteAI-v2.3.5.apk";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Dynamically append Noto Sans Devanagari font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Set page title for SEO best practices
    document.title = "Chhattisgarh State Waste Management Portal | SmartWaste AI";

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Official Chhattisgarh State Waste Management Portal. AI-powered real-time waste monitoring, route optimization, and recycling solutions.";
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-green-100 selection:text-green-800">

      {/* 1. TOP GOVERNMENT BAR */}
      <div id="top-gov-bar" className="bg-[#14532d] text-white py-2 px-4 sm:px-6 md:px-8 text-xs font-semibold flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-0 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span>Government of Chhattisgarh</span>
          <span className="text-white/40">|</span>
          <span
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            className="tracking-wide"
          >
            छत्तीसगढ़ शासन
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Swachh Chhattisgarh Mission</span>
          <span className="text-white/40">|</span>
          <span
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            className="tracking-wide"
          >
            स्वच्छ छत्तीसगढ़ मिशन
          </span>
        </div>
      </div>

      {/* 2. HEADER / NAVBAR */}
      <header id="main-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-[#16a34a] shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand area */}
          <Link to="/" id="brand-logo" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#14532d] flex items-center justify-center shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">SmartWaste AI</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-green-200">
                  v2.3.5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Chhattisgarh Waste Management System</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#top" className="text-sm font-semibold text-slate-600 hover:text-[#16a34a] transition-colors py-2">Home</a>
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-[#16a34a] transition-colors py-2">Features</a>
            <a href="#download" className="text-sm font-semibold text-slate-600 hover:text-[#16a34a] transition-colors py-2">Download</a>
            <Link
              to="/public"
              id="nav-link-public"
              className="text-sm font-semibold text-slate-600 hover:text-[#16a34a] transition-colors py-2"
            >
              Public Map
            </Link>
            <Link
              to="/login"
              id="nav-link-login"
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-[#16a34a] hover:bg-[#14532d] text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-inner">
            <a
              href="#top"
              onClick={() => setIsMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-[#16a34a] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-[#16a34a] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Features
            </a>
            <a
              href="#download"
              onClick={() => setIsMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-[#16a34a] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Download
            </a>
            <Link
              to="/public"
              onClick={() => setIsMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-[#16a34a] px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Public Map
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center text-base font-bold bg-[#16a34a] hover:bg-[#14532d] text-white py-3 rounded-xl transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 md:py-24 bg-gradient-to-b from-green-50/70 via-white to-[#f8fafc] overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-green-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-200 text-[#f97316] text-xs font-bold shadow-sm">
            <span>🏆 Climatathon 2026 — NIT Raipur</span>
          </div>

          {/* Hindi Slogan - Large & Bold with Noto Sans Devanagari */}
          <h1
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-[#f97316] mb-4 drop-shadow-sm"
          >
            स्वच्छ छत्तीसगढ़, स्मार्ट छत्तीसगढ़
          </h1>

          {/* English Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            AI-Powered Waste Management for Chhattisgarh
          </h2>

          {/* English Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-10">
            Empowering collectors, SHG workers, and administrators across Chhattisgarh with real-time AI waste monitoring and route optimization.
          </p>

          {/* Three CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <a
              href={APK_URL}
              download
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#14532d] text-white font-bold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              Download App v2.3.5
            </a>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#16a34a] border-2 border-[#16a34a] font-bold px-8 py-4 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/public"
              className="text-slate-600 hover:text-[#16a34a] font-semibold text-sm hover:underline px-4 py-2 transition-all"
            >
              View Public Map →
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
            {[
              { label: "Bins Monitored", count: "500+" },
              { label: "Active Collectors", count: "50+" },
              { label: "Zones Covered", count: "10+" },
              { label: "Collection Rate", count: "95%" }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border-2 border-[#16a34a]/20 shadow-sm hover:border-[#16a34a] hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-[#16a34a] mb-1">{stat.count}</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-green-200 mb-3">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Why SmartWaste AI for Chhattisgarh?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Built for the unique waste management challenges of Chhattisgarh's urban and rural zones
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Bot,
                title: "AI Image Analysis",
                desc: "Gemini 1.5 Flash powered bin scanning and fill level detection"
              },
              {
                icon: MapPin,
                title: "Route Optimization",
                desc: "VRP algorithm ensures efficient collection across all zones"
              },
              {
                icon: Smartphone,
                title: "Mobile App",
                desc: "Dedicated interface for collectors and SHG field workers"
              },
              {
                icon: BarChart2,
                title: "Real-time Dashboard",
                desc: "Admin analytics, zone monitoring, and export reports"
              },
              {
                icon: Recycle,
                title: "Recycler Marketplace",
                desc: "Connect collected waste directly to local recyclers"
              },
              {
                icon: Bell,
                title: "Push Notifications",
                desc: "Instant alerts to collectors when routes are generated"
              }
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-green-500/30 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-[#16a34a] flex items-center justify-center mb-6 group-hover:bg-[#16a34a] group-hover:text-white transition-colors duration-300 shadow-inner">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              From bin report to collection — fully automated
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-200 via-orange-200 to-green-200 -z-10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { step: "1", title: "Report", desc: "Citizen or SHG worker reports a bin via mobile app" },
                { step: "2", title: "AI Scan", desc: "Gemini 1.5 Flash analyzes fill level and waste type" },
                { step: "3", title: "Route Assigned", desc: "Optimizer assigns optimal route to collector" },
                { step: "4", title: "Collected", desc: "Collector completes route, data synced to dashboard" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-2xl shadow-inner group-hover:scale-105 group-hover:border-[#16a34a]/30 group-hover:bg-green-50 transition-all duration-300 mb-6 relative">
                    <span className="text-[#16a34a]">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-[240px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. ROLE-BASED ACCESS SECTION */}
      <section id="role-access" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Who Is It For?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              SmartWaste AI serves every stakeholder in the waste management chain
            </p>
          </div>

          {/* Roles Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: Shield,
                title: "Admin",
                desc: "Full platform control, analytics, user management"
              },
              {
                icon: Users,
                title: "SHG Worker",
                desc: "Submit bin reports, track collection points"
              },
              {
                icon: Truck,
                title: "Collector",
                desc: "View assigned routes, navigate to bins, log collections"
              },
              {
                icon: Recycle,
                title: "Recycler",
                desc: "Browse marketplace, place bids on collected waste"
              }
            ].map((role, idx) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#16a34a]/30 transition-all duration-300"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f97316] flex items-center justify-center mb-5">
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{role.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">{role.desc}</p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#16a34a] hover:text-[#14532d] transition-colors mt-auto group"
                  >
                    Login
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. DOWNLOAD SECTION */}
      <section id="download" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* LEFT - App Info */}
            <div className="flex flex-col items-start">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-200 mb-4">
                v2.3.5
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Download SmartWaste AI App
              </h2>
              <p className="text-slate-600 text-base mb-6">
                Available free for Android devices
              </p>

              {/* Requirements & Info */}
              <div className="text-sm font-semibold text-slate-500 mb-8 flex flex-wrap gap-x-4 gap-y-2 border-y border-slate-100 py-3 w-full">
                <span>Android 8.0+</span>
                <span className="text-slate-300">|</span>
                <span>Free</span>
                <span className="text-slate-300">|</span>
                <span>~88 MB</span>
              </div>

              {/* What's New List */}
              <div className="mb-8 w-full bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">What's new in v2.3.5:</h4>
                <ul className="space-y-3 text-slate-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500">✅</span>
                    <span>Vector icons replacing all emojis throughout app</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500">✅</span>
                    <span>Vector icons throughout app</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500">✅</span>
                    <span>Hindi / English bilingual support</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500">✅</span>
                    <span>Google Translate integration</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500">✅</span>
                    <span>News Feed screen</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500">✅</span>
                    <span>Safety Checklist for collectors</span>
                  </li>
                </ul>
              </div>

              {/* Download CTA */}
              <a
                href={APK_URL}
                download
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#14532d] text-white font-bold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mb-2"
              >
                <Download className="w-5 h-5" />
                Download APK v2.3.5
              </a>
              <span className="text-xs text-slate-400 font-medium">Direct APK download — no Play Store required</span>
            </div>

            {/* RIGHT - CSS Phone Mockup */}
            <div className="flex justify-center items-center">
              <div className="relative w-[280px] h-[550px] rounded-[48px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl p-4 overflow-hidden flex flex-col justify-between items-center select-none">

                {/* Phone Notch/Speaker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-900 rounded-full mb-1" />
                </div>

                {/* Subtle shine effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-10" />

                {/* Header mock screen */}
                <div className="w-full pt-8 flex justify-between items-center text-[10px] text-white/50 px-2 font-mono">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <div className="w-4 h-2.5 border border-white/40 rounded-sm flex items-center px-0.5">
                      <div className="w-full h-full bg-white/70 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Main Screen Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#16a34a] to-[#14532d] flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                    <Leaf className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-1">SmartWaste AI</h3>
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-bold mb-8">
                    v2.3.5
                  </span>

                  {/* Tiny mock widgets */}
                  <div className="w-full space-y-2">
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-left">
                      <div className="text-[9px] text-white/40 uppercase font-semibold">Active Zone</div>
                      <div className="text-xs text-white font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#16a34a]" /> Raipur, Sector 5
                      </div>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-left">
                      <div className="text-[9px] text-white/40 uppercase font-semibold">Today's collection</div>
                      <div className="text-xs text-white font-medium flex items-center gap-1">
                        <Truck className="w-3 h-3 text-[#f97316]" /> Route 14 Assigned
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="w-full pb-2 flex justify-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer id="main-footer" className="bg-[#14532d] text-white pt-16 pb-8 border-t-4 border-[#f97316]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12">

            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <Leaf className="w-5 h-5 text-[#14532d]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">SmartWaste AI V2</span>
              </div>
              <p className="text-sm text-green-100/80 leading-relaxed max-w-sm">
                Chhattisgarh Waste Management System tagline. A smart AI-powered utility system for citizens, SHGs, and collectors.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#f97316] pb-2 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm text-green-100/90">
                <li>
                  <Link to="/public" className="hover:text-orange-300 hover:underline transition-all">Public Map</Link>
                </li>
                <li>
                  <Link to="/public" className="hover:text-orange-300 hover:underline transition-all">Report Bin</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-orange-300 hover:underline transition-all">Login</Link>
                </li>
                <li>
                  <a href={APK_URL} download className="hover:text-orange-300 hover:underline transition-all">Download App</a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#f97316] pb-2 inline-block">
                Contact &amp; About
              </h4>
              <ul className="space-y-3 text-sm text-green-100/90">
                <li>Team CodeX</li>
                <li>Kalinga University</li>
                <li>Climatathon 2026</li>
                <li>NIT Raipur</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-green-200">
            <div>
              © 2026 SmartWaste AI V2 | Team CodeX | Kalinga University | Climatathon 2026 — NIT Raipur
            </div>
            <div className="flex gap-4">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
