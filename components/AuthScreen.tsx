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
  Lock,
  Mail,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/context';
import { getFriendlyAuthErrorMessage } from '@/lib/firebase/auth';

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
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    isConfigured,
    missingConfig,
    profile,
  } = useAuth();

  const [authType, setAuthType] = useState<'signin' | 'signup'>(
    initialMode === 'signin' ? 'signin' : 'signup'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Legal & Support modals
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'support' | null>(null);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (authType === 'signup') {
        await signUpWithEmail(trimmedEmail, password);
        onSuccess('new', trimmedEmail);
      } else {
        await signInWithEmail(trimmedEmail, password);
        const isReturning = profile?.onboardingCompleted ?? true;
        onSuccess(isReturning ? 'returning' : 'new', trimmedEmail);
      }
    } catch (err: any) {
      const code = err?.code || err?.message || 'Authentication failed';
      setErrorMessage(getFriendlyAuthErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
      return;
    }

    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      const isReturning = profile?.onboardingCompleted ?? false;
      onSuccess(isReturning ? 'returning' : 'new', email || 'founder@launchproof.com');
    } catch (err: any) {
      const code = err?.code || err?.message || 'Google sign in failed';
      setErrorMessage(getFriendlyAuthErrorMessage(code));
    } finally {
      setIsGoogleLoading(false);
    }
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
          Firebase Authentication
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
            {authType === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>

          <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 font-normal leading-relaxed max-w-[290px]">
            {authType === 'signup'
              ? 'Test your product before your first real users do.'
              : 'Sign in to access your product checks and reports.'}
          </p>
        </div>

        {/* Missing Firebase Configuration Notice */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left animate-in fade-in duration-200">
            <div className="flex items-start gap-2 text-amber-900 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Missing Firebase configuration</p>
                <p className="font-normal text-[11px] text-amber-800 mt-1 leading-relaxed">
                  The following environment variables are required in the Secrets panel:
                </p>
                <ul className="list-disc list-inside text-[10px] font-mono text-amber-900 mt-1 space-y-0.5">
                  {missingConfig.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            GOOGLE AUTHENTICATION (PRIMARY SOCIAL)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <button
          id="btn-google-auth"
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
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-bold text-slate-800 mb-1"
            >
              Email address
            </label>
            
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 px-3.5 pl-9 rounded-xl border border-slate-200/90 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/15"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password-input"
              className="block text-xs font-bold text-slate-800 mb-1"
            >
              Password
            </label>
            
            <div className="relative">
              <input
                id="auth-password-input"
                type="password"
                required
                minLength={6}
                autoComplete={authType === 'signup' ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 px-3.5 pl-9 rounded-xl border border-slate-200/90 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/15"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            id="btn-auth-continue"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-12 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer disabled:opacity-60 mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>{authType === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle (Sign In vs Create Account) */}
        <div className="mt-4 text-center">
          {authType === 'signup' ? (
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthType('signin');
                  setErrorMessage(null);
                }}
                className="text-[#0066ff] hover:underline font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthType('signup');
                  setErrorMessage(null);
                }}
                className="text-[#0066ff] hover:underline font-semibold cursor-pointer"
              >
                Create one
              </button>
            </p>
          )}
        </div>

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
