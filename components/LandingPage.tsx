'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Compass,
  Smartphone,
  ShieldCheck,
  Cpu,
  Menu,
  X,
  Link as LinkIcon,
  Search,
  FileText,
  Wrench,
  BarChart3,
  Eye,
  MousePointer,
  Settings,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp?: (initialUrl?: string) => void;
  onNavigateToAuth?: (mode: 'check' | 'signin') => void;
  onNavigateToOnboarding?: () => void;
  onTryDemo?: () => void;
}

export function LandingPage({
  onNavigateToAuth,
  onTryDemo,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Intersection Observer for scroll-triggered entrance animations
  useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-5');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'check') => {
    if (onNavigateToAuth) {
      onNavigateToAuth(mode === 'signin' ? 'signin' : 'check');
    }
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans antialiased selection:bg-[#0066ff] selection:text-white flex flex-col overflow-x-hidden">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HEADER (DESKTOP & MOBILE DRAWER)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100/90 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 text-slate-950 font-bold text-base sm:text-lg group cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0066ff] rounded-md p-1"
            aria-label="ShipScan Home"
          >
            <div className="w-6 h-6 rounded bg-[#0066ff] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:bg-[#0055d4] transition-colors">
              S
            </div>
            <span className="font-extrabold tracking-tight text-slate-950 text-base sm:text-lg">
              ShipScan
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-600" aria-label="Main Navigation">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {onTryDemo && (
              <button
                id="btn-landing-try-demo"
                onClick={onTryDemo}
                className="text-[13px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Try Demo
              </button>
            )}
            <button
              onClick={() => handleOpenAuth('signin')}
              className="text-[13px] font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              onClick={() => handleOpenAuth('check')}
              className="h-9 px-4 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.98] text-white font-semibold text-[13px] inline-flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle (Min 44px touch target) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="w-11 h-11 -mr-2 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="fixed top-0 right-0 w-full max-w-xs h-full bg-white shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#0066ff] text-white flex items-center justify-center font-black text-xs">
                      S
                    </div>
                    <span className="font-extrabold tracking-tight text-slate-950 text-base">ShipScan</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-11 h-11 -mr-2 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col py-6 space-y-2 text-base font-semibold text-slate-800">
                  {onTryDemo && (
                    <button
                      id="btn-mobile-try-demo"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onTryDemo();
                      }}
                      className="text-left py-3 px-2 rounded-lg bg-amber-50 text-amber-800 font-bold hover:bg-amber-100/80 transition-colors cursor-pointer"
                    >
                      Try Demo
                    </button>
                  )}
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-left py-3 px-2 rounded-lg hover:bg-slate-50 hover:text-[#0066ff] transition-colors cursor-pointer"
                  >
                    How it works
                  </button>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="text-left py-3 px-2 rounded-lg hover:bg-slate-50 hover:text-[#0066ff] transition-colors cursor-pointer"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="text-left py-3 px-2 rounded-lg hover:bg-slate-50 hover:text-[#0066ff] transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={() => handleOpenAuth('check')}
                  className="w-full h-12 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.25)] cursor-pointer"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. HERO SECTION & EXAMPLE REPORT
            (Desktop 2-column, Mobile stacked)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="pt-10 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column (Hero Content) */}
            <div className="lg:col-span-6 xl:col-span-6 text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold uppercase tracking-wider mb-4 border border-blue-100/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0066ff]" />
                <span>FIRST-USER READINESS</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-950 tracking-tight leading-[1.12] mb-4">
                Is your product<br className="hidden sm:inline" /> ready for real users?
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 font-normal max-w-lg mb-7 leading-relaxed">
                Test your website like a first-time user before you invite anyone.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <button
                  onClick={() => handleOpenAuth('check')}
                  className="h-12 px-6 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(0,102,255,0.22)] transition-all cursor-pointer"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.4]" />
                </button>
                <button
                  onClick={() => scrollToSection('example-report')}
                  className="h-12 px-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-sm inline-flex items-center justify-center transition-all cursor-pointer"
                >
                  See an example report
                </button>
              </div>

              {/* Micro-copy below CTAs */}
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                Find blockers. Understand why. Know what to fix next.
              </p>
            </div>

            {/* Right Column (Hero Visual: Example LaunchProof Report) */}
            <div
              id="example-report"
              className="lg:col-span-6 xl:col-span-6 relative w-full max-w-lg mx-auto lg:max-w-none scroll-mt-24"
            >
              {/* Playful curved annotation on desktop */}
              <div className="hidden xl:block absolute -top-8 -right-6 pointer-events-none select-none text-right">
                <div className="text-[13px] font-bold text-[#0066ff] transform rotate-6 max-w-[140px] leading-tight font-sans">
                  Spot issues before your users do.
                </div>
                <svg className="w-12 h-12 text-[#0066ff] transform rotate-12 ml-auto mt-1 opacity-75" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 10 C 24 16, 36 24, 38 38 M 38 38 L 30 36 M 38 38 L 38 28" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Report Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)] p-5 sm:p-7 text-left">
                {/* Header label */}
                <div className="text-[11px] font-bold text-[#0066ff] uppercase tracking-wider mb-2">
                  EXAMPLE LAUNCHPROOF REPORT
                </div>
                
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  FIRST-USER READINESS
                </div>

                {/* Score and status */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">74</span>
                    <span className="text-base sm:text-lg font-bold text-slate-400">/ 100</span>
                  </div>

                  <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-3 py-1.5 text-left">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Conditional
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      Fix before inviting users
                    </span>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                  <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-black text-rose-600 leading-none mb-1">3</div>
                    <div className="text-[11px] font-bold text-rose-600">Blockers</div>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-black text-amber-600 leading-none mb-1">5</div>
                    <div className="text-[11px] font-bold text-amber-600">Important</div>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 leading-none mb-1">18</div>
                    <div className="text-[11px] font-bold text-emerald-600">Passed</div>
                  </div>
                </div>

                {/* Finding Rows */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100/90 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-bold text-slate-900 truncate">Primary CTA is unclear</span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">Landing page</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100/90 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-bold text-slate-900 truncate">Pricing value is difficult to understand</span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">Pricing</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100/90 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900 truncate">HTTPS is enabled</span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">Technical</span>
                  </div>
                </div>

                {/* Bottom link */}
                <div className="pt-2 text-center">
                  <button
                    onClick={() => scrollToSection('evidence-section')}
                    className="text-[#0066ff] hover:text-[#0055d4] hover:underline font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>See full report</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. HOW IT WORKS
            (Desktop 5-part row, Mobile stacked vertical flow)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="how-it-works" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-3 text-left">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold uppercase tracking-wider mb-3 border border-blue-100/80">
                  HOW IT WORKS
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                  From product to launch confidence.
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md">
                A simple process to test, find, fix and improve.
              </p>
            </div>

            {/* Desktop Horizontal Workflow */}
            <div className="hidden lg:flex items-start justify-between gap-3">
              {[
                { icon: LinkIcon, num: '01', title: 'Submit', desc: 'Give your product URL or screenshots.' },
                { icon: Search, num: '02', title: 'Test', desc: 'We experience it like a first-time user.' },
                { icon: FileText, num: '03', title: 'Get insights', desc: 'See issues, evidence and a prioritized fix plan.' },
                { icon: Wrench, num: '04', title: 'Fix', desc: 'Make changes based on clear recommendations.' },
                { icon: BarChart3, num: '05', title: 'Re-check', desc: 'Run again to see what improved.' },
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex-1 flex flex-col items-start text-left p-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#0066ff] flex items-center justify-center mb-3.5 border border-blue-100/60 shadow-2xs">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mb-1">
                      <span className="text-[#0066ff] mr-1">{step.num}</span>
                      {step.title}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {idx < 4 && (
                    <div className="self-center text-slate-300 px-1 pt-2">
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile / Tablet Vertical Connected Flow (320px–1023px) */}
            <div className="lg:hidden flex flex-col space-y-4 max-w-md mx-auto text-left">
              {[
                { icon: LinkIcon, num: '01', title: 'Submit', desc: 'Give your product URL or screenshots.' },
                { icon: Search, num: '02', title: 'Test', desc: 'We experience it like a first-time user.' },
                { icon: FileText, num: '03', title: 'Get insights', desc: 'See issues, evidence and a prioritized fix plan.' },
                { icon: Wrench, num: '04', title: 'Fix', desc: 'Make changes based on clear recommendations.' },
                { icon: BarChart3, num: '05', title: 'Re-check', desc: 'Run again to see what improved.' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center shrink-0 border border-blue-100/80">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900 mb-0.5">
                      <span className="text-[#0066ff] mr-1.5">{step.num}</span>
                      {step.title}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. WHAT WE CHECK
            (Clean stacked cards / responsive grid)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-3 text-left">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold uppercase tracking-wider mb-3 border border-blue-100/80">
                  WHAT WE CHECK
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                  See what your first users may experience.
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md">
                LaunchProof checks the key areas that shape a first-time user&apos;s experience.
              </p>
            </div>

            {/* Responsive Categories Grid (5 columns on desktop, 2-3 on tablet, stacked on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  icon: Eye,
                  title: 'Product Clarity',
                  desc: 'Is the product\'s value immediately understandable?',
                },
                {
                  icon: MousePointer,
                  title: 'User Journey',
                  desc: 'Can users reach the core value without getting stuck?',
                },
                {
                  icon: Smartphone,
                  title: 'Mobile',
                  desc: 'Does the experience work properly on mobile?',
                },
                {
                  icon: ShieldCheck,
                  title: 'Trust',
                  desc: 'Does the product give users enough confidence to continue?',
                },
                {
                  icon: Settings,
                  title: 'Technical',
                  desc: 'Are there observable technical problems affecting the experience?',
                },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 text-left flex flex-col items-start hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-4 border border-blue-100/60">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 mb-1.5">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {cat.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            5. EVIDENCE-BACKED INSIGHTS
            (Desktop 2-column, Mobile stacked)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="evidence-section" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            
            {/* Eyebrow */}
            <div className="text-left mb-8">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold uppercase tracking-wider mb-3 border border-blue-100/80">
                EVIDENCE-BACKED INSIGHTS
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Heading & CTA */}
              <div className="lg:col-span-5 text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-4">
                  Don&apos;t just find problems.<br className="hidden sm:inline" /> Know what to fix first.
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-normal mb-8 leading-relaxed">
                  Each issue comes with real evidence, a clear explanation and a practical fix recommendation.
                </p>
                <button
                  onClick={() => scrollToSection('example-report')}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-[#0066ff] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <span>See an example report</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
                </button>
              </div>

              {/* Right Column: Visual Mockup + Finding Detail Panel */}
              <div className="lg:col-span-7 flex flex-col md:flex-row gap-5 items-stretch text-left">
                
                {/* Website Mockup with Pointer */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs relative flex flex-col justify-between overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <span className="ml-1 font-bold text-slate-800 text-xs">YourProduct</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Product</span>
                      <span>Pricing</span>
                      <span>Sign in</span>
                    </div>
                  </div>

                  {/* Browser Content */}
                  <div className="py-6 px-3 text-center flex flex-col items-center justify-center relative">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                      Build something your users love
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-5 max-w-[200px]">
                      The simplest way to turn your idea into reality
                    </p>

                    <div className="border border-slate-900 bg-slate-950 text-white text-xs font-semibold px-4 py-2 rounded-md">
                      Get started
                    </div>

                    {/* Red callout overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-28 border-2 border-rose-500/80 rounded-xl pointer-events-none flex items-start justify-end p-1">
                      <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                        Primary CTA is unclear
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
                    Visual inspection preview
                  </div>
                </div>

                {/* Finding Detail Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="inline-block px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider mb-2.5">
                      CRITICAL
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mb-3.5">
                      Primary CTA is unclear
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#0066ff] uppercase tracking-wider block mb-1">
                          EVIDENCE
                        </span>
                        <p className="text-slate-600 leading-relaxed font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                          The main action is not immediately distinguishable from secondary actions.
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                          WHY IT MATTERS
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          A first-time user may not know what to do next.
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#0066ff] uppercase tracking-wider block mb-1">
                          RECOMMENDED FIX
                        </span>
                        <p className="text-slate-900 font-semibold leading-relaxed">
                          Make the primary action visually dominant and use one clear action label.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            6. TRACK IMPROVEMENTS (FIX / RE-CHECK)
            (Desktop 2-column, Mobile stacked)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 text-left">
            
            {/* Left Column: Heading */}
            <div className="max-w-md">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold uppercase tracking-wider mb-3 border border-blue-100/80">
                TRACK IMPROVEMENTS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-3">
                Fix. Re-check. See the difference.
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                Track how your product improves after each round of fixes.
              </p>
            </div>

            {/* Right Column: Score Progression */}
            <div className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 bg-slate-50/70 border border-slate-200/90 rounded-2xl sm:rounded-3xl">
                
                {/* Score 1 */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-rose-200/80 p-4 sm:p-5 text-center min-w-[110px] sm:min-w-[120px] shadow-2xs">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-rose-600">74</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Initial</div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 sm:rotate-0 shrink-0" />

                {/* Score 2 */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-amber-200/80 p-4 sm:p-5 text-center min-w-[110px] sm:min-w-[120px] shadow-2xs">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-500">81</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">After fixes</div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 sm:rotate-0 shrink-0" />

                {/* Score 3 */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-emerald-200/80 p-4 sm:p-5 text-center min-w-[110px] sm:min-w-[120px] shadow-2xs">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">91</span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Ready</div>
                </div>

              </div>

              <p className="text-[11px] text-slate-400 font-medium text-center mt-3">
                Illustrative example. Not real user data.
              </p>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            7. PRICING SECTION
            (V1 Specification: Free, Pro, Pro+)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="pricing" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 scroll-mt-16">
          <div className="max-w-6xl mx-auto text-left">
            
            {/* Header & Toggle */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] text-[11px] font-bold uppercase tracking-wider mb-3 border border-blue-100/80">
                  PRICING
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                  Start testing before you start scaling.
                </h2>
              </div>

              {/* Monthly / Annual Toggle with Savings Badge */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs self-start md:self-auto">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <span>Annual</span>
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Annual Savings Banner */}
            {billingCycle === 'annual' && (
              <div className="mb-8 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center max-w-lg mx-auto">
                Save 17% — Get 2 Months Free on Annual Billing
              </div>
            )}

            {/* Pricing Cards Grid (Vertical Stack on Mobile, 3 Cols on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* 1. FREE PLAN */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
                <div>
                  <h3 className="text-base font-bold text-slate-950 mb-2">Free</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950">$0</span>
                    <span className="text-xs sm:text-sm font-medium text-slate-400">/ month</span>
                  </div>

                  <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600">
                    {[
                      '1 check / month',
                      'Readiness Score',
                      'Top 3 blockers',
                      'Basic evidence',
                      'Limited report',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#0066ff] shrink-0 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenAuth('signin')}
                  className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Get started
                </button>
              </div>

              {/* 2. PRO PLAN (Featured) */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#0066ff] p-6 sm:p-7 flex flex-col justify-between shadow-md relative">
                <div>
                  <h3 className="text-base font-bold text-[#0066ff] mb-2">Pro</h3>
                  
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950">
                      {billingCycle === 'monthly' ? '$9' : '$7.50'}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-400">/ month</span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium mb-6">
                    {billingCycle === 'monthly' ? (
                      'Billed monthly'
                    ) : (
                      <span className="text-emerald-700 font-semibold">$90 billed annually • Save $18</span>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-slate-700">
                    {[
                      '20 checks / month',
                      'Full first-user analysis',
                      'User Journey',
                      'Mobile Check',
                      'Product Clarity',
                      'Trust',
                      'Technical checks',
                      'Evidence',
                      'Exact Fix Plan',
                      'Re-check',
                      'History',
                      'Share Report',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#0066ff] shrink-0 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenAuth('check')}
                  className="w-full h-11 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-[0_2px_10px_rgba(0,102,255,0.25)] transition-all cursor-pointer"
                >
                  Get started
                </button>
              </div>

              {/* 3. PRO+ PLAN */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
                <div>
                  <h3 className="text-base font-bold text-slate-950 mb-2">Pro+</h3>
                  
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950">
                      {billingCycle === 'monthly' ? '$19' : '$15.83'}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-400">/ month</span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium mb-6">
                    {billingCycle === 'monthly' ? (
                      'Billed monthly'
                    ) : (
                      <span className="text-emerald-700 font-semibold">$190 billed annually • Save $38</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-600">
                    {[
                      '60 checks / month',
                      'Everything in Pro',
                      'Deeper journey analysis',
                      'More frequent re-checking',
                      'Advanced comparison/history',
                      'Priority analysis',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#0066ff] shrink-0 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenAuth('check')}
                  className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Get started
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            8. FINAL CTA (DARK CONTAINER AS IN REFERENCE)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="bg-slate-950 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-left shadow-xl">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                  Before real users find the problem,<br className="hidden sm:inline" /> find it yourself.
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-normal">
                  Run a first-user check and see what needs fixing before launch.
                </p>
              </div>

              <button
                onClick={() => handleOpenAuth('check')}
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,102,255,0.35)] transition-all shrink-0 cursor-pointer"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          9. FOOTER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="py-10 bg-white border-t border-slate-100 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-slate-950 font-bold">
              <div className="w-5 h-5 rounded bg-[#0066ff] text-white flex items-center justify-center font-black text-[10px]">
                L
              </div>
              <span className="tracking-tight text-sm">LaunchProof</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="text-xs text-slate-500">
              Built it? Test it before your first users do.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 cursor-pointer">How it works</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 cursor-pointer">Pricing</button>
            <button onClick={() => handleOpenAuth('signin')} className="hover:text-slate-900 cursor-pointer">Sign in</button>
            <button onClick={() => setActiveModal('support')} className="hover:text-slate-900 cursor-pointer">Help &amp; Support</button>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-900 cursor-pointer">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-slate-900 cursor-pointer">Terms</button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-8 pt-5 border-t border-slate-100 text-left">
          <p className="text-[11px] text-slate-400">
            &copy; 2026 LaunchProof. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Clean Modal for Support, Privacy, Terms */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {activeModal === 'support' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950 mb-2">Help &amp; Support</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Need assistance running a check or interpreting your readiness score? Reach out to our founder support team at{' '}
                  <span className="font-semibold text-slate-900">support@launchproof.app</span>.
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full h-10 rounded-xl bg-[#0066ff] text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950 mb-2">Privacy Policy</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  LaunchProof strictly respects builder privacy. We only analyze publicly accessible URLs or screenshots that you explicitly submit. Your check reports and fix plans are never shared with third parties.
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full h-10 rounded-xl bg-[#0066ff] text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950 mb-2">Terms of Service</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  By using LaunchProof, you agree to evaluate products you own or are authorized to test. Readiness scores provide automated recommendations to improve the first-user experience and do not guarantee commercial success.
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full h-10 rounded-xl bg-[#0066ff] text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
