import { Link } from 'react-router-dom';
import {
    Bot, MapPin, Recycle, ArrowRight, Download, Leaf, Shield,
    BarChart3, Smartphone, Globe, ChevronRight, Zap, Github,
} from 'lucide-react';

const APK_DOWNLOAD_URL = '#apk-download';

/* ──────────── Reusable Glass Card ──────────── */
function GlassCard({ children, className = '' }) {
    return (
        <div className={`
            relative rounded-2xl p-6 
            bg-white/[0.04] backdrop-blur-xl 
            border border-white/[0.08] 
            shadow-[0_8px_32px_rgba(0,0,0,0.3)]
            hover:bg-white/[0.07] hover:border-green-400/20
            hover:shadow-[0_8px_40px_rgba(34,197,94,0.08)]
            transition-all duration-500 ease-out
            group
            ${className}
        `}>
            {children}
        </div>
    );
}

/* ──────────── Floating Particles Background ──────────── */
function ParticleField() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-green-400/10 blur-3xl animate-pulse-soft"
                    style={{
                        width: `${120 + i * 60}px`,
                        height: `${120 + i * 60}px`,
                        top: `${10 + i * 15}%`,
                        left: `${5 + i * 16}%`,
                        animationDelay: `${i * 0.7}s`,
                        animationDuration: `${4 + i}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ──────────── Stat Counter ──────────── */
function StatItem({ value, label, icon: Icon }) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="w-5 h-5 text-green-400" />
                <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{value}</span>
            </div>
            <span className="text-sm text-gray-400 font-medium">{label}</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════════════════ */
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
            <ParticleField />

            {/* ── NAVBAR ────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/70 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-shadow duration-300">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Smart<span className="text-green-400">Waste</span> AI
                        </span>
                    </Link>

                    {/* Nav Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/public"
                            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
                        >
                            <Globe className="w-4 h-4" />
                            Public View
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                        >
                            Login to Dashboard
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION ──────────────────────────────── */}
            <section className="relative pt-20 pb-28 md:pt-32 md:pb-36">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold tracking-wide uppercase animate-fade-in">
                            <Zap className="w-3.5 h-3.5" />
                            AI-Powered Platform — Chhattisgarh, India
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 animate-slide-up">
                            Revolutionizing{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                                Rural Waste
                            </span>
                            <br />
                            Management with AI
                        </h1>

                        {/* Sub-headline */}
                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            AI-powered waste segregation, smart collection routing, real-time bin tracking, 
                            and a direct marketplace connecting communities with recyclers.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <a
                                href={APK_DOWNLOAD_URL}
                                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                            >
                                <Download className="w-5 h-5 group-hover:animate-bounce" />
                                Download Mobile App
                                <span className="text-xs font-medium px-2 py-0.5 bg-white/20 rounded-md">.APK</span>
                            </a>
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white border-2 border-white/15 hover:border-green-400/40 hover:bg-white/5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                            >
                                Open Web Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-20 max-w-2xl mx-auto">
                        <GlassCard className="!p-6">
                            <div className="grid grid-cols-3 gap-6 divide-x divide-white/10">
                                <StatItem value="4" label="Active Zones" icon={MapPin} />
                                <StatItem value="100+" label="Smart Bins" icon={BarChart3} />
                                <StatItem value="24/7" label="AI Monitoring" icon={Shield} />
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* ── FEATURES GRID ─────────────────────────────── */}
            <section className="relative py-24 md:py-32">
                {/* Section divider gradient */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

                <div className="max-w-7xl mx-auto px-6">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                            How It <span className="text-green-400">Works</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            End-to-end waste management — from detection to recycling.
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <GlassCard>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-400/5 flex items-center justify-center mb-5 group-hover:from-green-400/30 group-hover:to-green-400/10 transition-all duration-500">
                                <Bot className="w-7 h-7 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">AI Waste Segregation</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Gemini AI analyzes uploaded photos to identify waste types, estimate fill levels, 
                                and flag urgency — all from a single photo taken by residents.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {['Gemini Vision', 'Auto-classify', '95% Accuracy'].map(tag => (
                                    <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-green-400/10 text-green-400/80 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Card 2 */}
                        <GlassCard>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 flex items-center justify-center mb-5 group-hover:from-emerald-400/30 group-hover:to-emerald-400/10 transition-all duration-500">
                                <MapPin className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Real-time Bin Tracking</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Live map showing every smart bin's status across zones. Collectors get 
                                AI-optimized routes so they reach the fullest bins first.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {['Live Map', 'Smart Routes', 'GPS Verified'].map(tag => (
                                    <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400/80 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Card 3 */}
                        <GlassCard>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-400/5 flex items-center justify-center mb-5 group-hover:from-teal-400/30 group-hover:to-teal-400/10 transition-all duration-500">
                                <Recycle className="w-7 h-7 text-teal-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Recycler Marketplace</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Verified recyclers bid on collected waste in real-time. 
                                Self-Help Groups earn fair prices, creating a circular economy for rural India.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {['Live Bids', 'Fair Pricing', 'Direct Sale'].map(tag => (
                                    <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-teal-400/10 text-teal-400/80 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* ── PLATFORM SECTION ──────────────────────────── */}
            <section className="relative py-24">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                            One System, <span className="text-green-400">Every Stakeholder</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            Dedicated dashboards for every role in the waste management chain.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl p-5 bg-green-500/[0.06] border border-green-500/10 hover:border-green-400/25 transition-all duration-300">
                            <div className="text-sm font-bold text-green-400 mb-1.5">Admin</div>
                            <p className="text-xs text-gray-500 leading-relaxed">Full platform control, analytics &amp; AI insights</p>
                        </div>
                        <div className="rounded-xl p-5 bg-emerald-500/[0.06] border border-emerald-500/10 hover:border-emerald-400/25 transition-all duration-300">
                            <div className="text-sm font-bold text-emerald-400 mb-1.5">Sub-Admin</div>
                            <p className="text-xs text-gray-500 leading-relaxed">Zone management, collector assignment &amp; routing</p>
                        </div>
                        <div className="rounded-xl p-5 bg-teal-500/[0.06] border border-teal-500/10 hover:border-teal-400/25 transition-all duration-300">
                            <div className="text-sm font-bold text-teal-400 mb-1.5">SHG</div>
                            <p className="text-xs text-gray-500 leading-relaxed">Bin monitoring, waste reporting &amp; scheduling</p>
                        </div>
                        <div className="rounded-xl p-5 bg-cyan-500/[0.06] border border-cyan-500/10 hover:border-cyan-400/25 transition-all duration-300">
                            <div className="text-sm font-bold text-cyan-400 mb-1.5">Collector</div>
                            <p className="text-xs text-gray-500 leading-relaxed">Route navigation, bin collection &amp; GPS tracking</p>
                        </div>
                    </div>

                    {/* Mobile App Callout */}
                    <GlassCard className="mt-12 !p-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <Smartphone className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Mobile App for Android</h3>
                                    <p className="text-sm text-gray-400">
                                        Public reporting, collector routes, and SHG tools — all in one app.
                                    </p>
                                </div>
                            </div>
                            <a
                                href={APK_DOWNLOAD_URL}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
                            >
                                <Download className="w-5 h-5" />
                                Download APK
                            </a>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────── */}
            <footer className="relative py-10 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span>© {new Date().getFullYear()} SmartWaste AI — Chhattisgarh, India</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link to="/public" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
                            Public View
                        </Link>
                        <Link to="/recyclers" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
                            Recycler Portal
                        </Link>
                        <a
                            href="https://github.com/Iamhimanshu008/smartwaste-ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            <Github className="w-4 h-4" />
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
