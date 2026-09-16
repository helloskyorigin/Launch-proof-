'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  X,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'check' | 'signin';
  onSuccess: (userType: 'new' | 'returning', email: string, name?: string) => void;
  onBackToLanding: () => void;
}

export function AuthScreen({
  initialMode = 'check',
  onSuccess,
  onBackToLanding,
}: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Legal & Support modals
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'support' | null>(null);

  // Known returning emails for seamless production-like simulation
  const knownReturningEmails = ['satyam@example.com', 'founder@launchproof.com', 'test@example.com'];

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();

    if (!trimmed) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    // Realistic auth evaluation
    setTimeout(() => {
      setIsLoading(false);

      const isReturning =
        initialMode === 'signin' && knownReturningEmails.includes(trimmed.toLowerCase());

      if (isReturning) {
        onSuccess('returning', trimmed, 'Satyam');
      } else {
        const username = trimmed.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
        onSuccess('new', trimmed, formattedName || 'Founder');
      }
    }, 450);
  };

  const handleGoogleAuth = () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    // Seamless Google Auth simulation
    setTimeout(() => {
      setIsGoogleLoading(false);
      if (initialMode === 'signin') {
        onSuccess('returning', 'satyam@example.com', 'Satyam');
      } else {
        // New user automatically routes into the 3-step onboarding flow
        onSuccess('new', 'founder@launchproof.com', 'Founder');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between items-center px-4 py-5 sm:py-8 antialiased selection:bg-[#0066ff] selection:text-white">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP NAVIGATION BAR
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[420px] flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-2 px-2.5 rounded-lg hover:bg-slate-200/50 cursor-pointer -ml-2"
          aria-label="Back to website"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Back to website</span>
        </button>

        <span className="text-[11px] font-medium text-slate-400">
          Secure Authentication
        </span>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          UNIFIED AUTHENTICATION CONTAINER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[420px] bg-white sm:border sm:border-slate-200/80 rounded-2xl sm:shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col my-auto text-left">
        
        {/* BRANDING: Logo + Welcome Heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#0066ff] text-white flex items-center justify-center font-black text-xl shadow-xs mb-3.5 select-none">
            L
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Welcome to LaunchProof
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 font-normal leading-relaxed max-w-[290px]">
            Test your product before your first real users do.
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            GOOGLE AUTHENTICATION (PRIMARY SOCIAL)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading || isGoogleLoading}
          className="w-full h-12 px-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/90 active:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <span className="w-4 h-4 border-2 border-slate-300 border-t-[#0066ff] rounded-full animate-spin" />
              <span>Connecting to Google...</span>
            </div>
          ) : (
            <>
              {/* Official Google 4-Color Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            DIVIDER
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <span className="relative bg-white px-3 text-[11px] text-slate-400 font-medium">
            or continue with email
          </span>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            EMAIL AUTHENTICATION FORM
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Email address
            </label>
            
            <input
              id="auth-email-input"
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isLoading || isGoogleLoading}
              className={`w-full h-12 px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:ring-2 ${
                errorMessage
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200/90 focus:border-[#0066ff] focus:ring-[#0066ff]/15'
              }`}
            />

            {/* Validation / Error state */}
            {errorMessage && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Primary Continue Button */}
          <button
            id="btn-auth-continue"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Continuing...</span>
              </div>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
              </>
            )}
          </button>
        </form>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TERMS & PRIVACY
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="mt-5 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="text-slate-600 hover:text-slate-950 underline underline-offset-2 cursor-pointer font-medium"
            >
              Terms
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="text-slate-600 hover:text-slate-950 underline underline-offset-2 cursor-pointer font-medium"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM HELP & SUPPORT
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[420px] mt-6 text-center">
        <span className="text-xs text-slate-400 mr-1.5">Need help?</span>
        <button
          type="button"
          onClick={() => setActiveModal('support')}
          className="text-xs font-semibold text-slate-600 hover:text-[#0066ff] transition-colors cursor-pointer"
        >
          Help & Support
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          LEGAL & SUPPORT MODAL DIALOGS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-slate-200/90 flex flex-col animate-in zoom-in-95 duration-150 text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                {activeModal === 'support' && <HelpCircle className="w-4 h-4 text-[#0066ff]" />}
                {activeModal === 'terms' && <FileText className="w-4 h-4 text-[#0066ff]" />}
                {activeModal === 'privacy' && <Shield className="w-4 h-4 text-[#0066ff]" />}
                <h3 className="text-sm font-bold text-slate-950">
                  {activeModal === 'support'
                    ? 'Help & Support'
                    : activeModal === 'terms'
                    ? 'Terms of Service'
                    : 'Privacy Policy'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              {activeModal === 'support' && (
                <>
                  <p>Have questions about logging into LaunchProof?</p>
                  <p className="font-semibold text-slate-900">
                    Contact: support@launchproof.app
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    We respond to builder and founder inquiries promptly.
                  </p>
                </>
              )}
              {activeModal === 'terms' && (
                <>
                  <p>
                    By using LaunchProof, you agree to evaluate web properties you own or have
                    permission to inspect.
                  </p>
                  <p>
                    Automated first-user simulations and readiness scores are provided for quality
                    assurance and product improvement.
                  </p>
                </>
              )}
              {activeModal === 'privacy' && (
                <>
                  <p>
                    We respect your privacy. We only collect your email address and authentication
                    identifiers to manage your account and store your audit history.
                  </p>
                  <p>Your reports and product audit data are never shared with third parties.</p>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
