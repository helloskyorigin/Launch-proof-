'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Check,
  Send,
  ShieldCheck,
  Mail,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/context';
import { updateUserProfile } from '@/lib/firebase/firestore';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

type SubScreen = 'main' | 'profile' | 'security' | 'appearance' | 'feedback' | 'help_sub';

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen>('main');

  // User Profile state
  const initialName = user?.displayName || profile?.name || user?.email?.split('@')[0] || 'Founder';
  const initialEmail = user?.email || profile?.email || 'founder@launchproof.com';

  const [userName, setUserName] = useState(initialName);
  const [userEmail, setUserEmail] = useState(initialEmail);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const [tempEmail, setTempEmail] = useState(initialEmail);

  // Sync when profile loads
  React.useEffect(() => {
    if (user || profile) {
      const name = user?.displayName || profile?.name || user?.email?.split('@')[0] || 'Founder';
      const email = user?.email || profile?.email || 'founder@launchproof.com';
      setUserName(name);
      setUserEmail(email);
      setTempName(name);
      setTempEmail(email);
    }
  }, [user, profile]);

  // Preferences
  const [appearance, setAppearance] = useState<'Light' | 'Dark' | 'System'>('System');

  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState<'general' | 'bug' | 'feature'>('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Logout modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = tempName.trim() || 'Founder';
    setUserName(updatedName);
    setIsEditingProfile(false);

    if (user?.uid) {
      try {
        await updateUserProfile(user.uid, { name: updatedName });
        await refreshProfile();
      } catch (err) {
        console.error('Failed to update profile in Firestore:', err);
      }
    }
    showToast('Profile updated');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSent(false);
      setActiveSubScreen('main');
      showToast('Thank you for your feedback!');
    }, 1200);
  };

  // =========================================================================
  // SUB-SCREEN 1: PROFILE
  // =========================================================================
  if (activeSubScreen === 'profile') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col select-none animate-in fade-in duration-200">
        <div className="flex items-center justify-between h-9 mb-4">
          <button
            type="button"
            onClick={() => {
              setIsEditingProfile(false);
              setActiveSubScreen('main');
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100/80 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
            <span>Back</span>
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase">
            Profile
          </span>
        </div>

        <div className="mb-5 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
            Personal Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Manage your personal identity and contact details.
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col space-y-5">
          {/* Avatar Area */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-xl flex items-center justify-center shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-slate-950">{userName}</p>
              <p className="text-xs text-slate-500">{userEmail}</p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5">
                Full Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-3 min-h-[46px] bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] focus:bg-white transition-all shadow-2xs"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5">
                Email Address
              </label>
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                className="w-full px-4 py-3 min-h-[46px] bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] focus:bg-white transition-all shadow-2xs"
                placeholder="name@company.com"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 min-h-[46px] bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,102,255,0.2)]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUB-SCREEN 2: SECURITY
  // =========================================================================
  if (activeSubScreen === 'security') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col select-none animate-in fade-in duration-200">
        <div className="flex items-center justify-between h-9 mb-4">
          <button
            type="button"
            onClick={() => setActiveSubScreen('main')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100/80 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
            <span>Back</span>
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase">
            Security
          </span>
        </div>

        <div className="mb-5 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
            Sign-in &amp; Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Manage your credentials and authenticated sessions.
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col space-y-5">
          {/* Sign-in Method */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Mail className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">Email &amp; Password</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <div className="border-t border-slate-100" />

          {/* Password control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">Password</p>
                <p className="text-xs text-slate-500">Last changed 3 months ago</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Password reset email sent')}
              className="text-xs font-semibold text-[#0066ff] hover:text-[#0055d4] hover:underline px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Update
            </button>
          </div>

          <div className="border-t border-slate-100" />

          {/* Account Security status */}
          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 stroke-[2.2] shrink-0" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Session Secure</span> · Signed in on Chrome (Current device)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUB-SCREEN 3: APPEARANCE
  // =========================================================================
  if (activeSubScreen === 'appearance') {
    const modes: Array<'Light' | 'Dark' | 'System'> = ['Light', 'Dark', 'System'];

    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col select-none animate-in fade-in duration-200">
        <div className="flex items-center justify-between h-9 mb-4">
          <button
            type="button"
            onClick={() => setActiveSubScreen('main')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100/80 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
            <span>Back</span>
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase">
            Appearance
          </span>
        </div>

        <div className="mb-5 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
            Appearance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Choose how LaunchProof looks on your device.
          </p>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
          {modes.map((mode) => {
            const isSelected = appearance === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAppearance(mode);
                  showToast(`Appearance set to ${mode}`);
                }}
                className="w-full min-h-[64px] px-5 py-4 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900">
                  {mode}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#0066ff] bg-[#0066ff] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.8]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUB-SCREEN 4: FEEDBACK
  // =========================================================================
  if (activeSubScreen === 'feedback') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col select-none animate-in fade-in duration-200">
        <div className="flex items-center justify-between h-9 mb-4">
          <button
            type="button"
            onClick={() => setActiveSubScreen('main')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100/80 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
            <span>Back</span>
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase">
            Feedback
          </span>
        </div>

        <div className="mb-5 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
            Send Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Help us improve LaunchProof for all builders.
          </p>
        </div>

        <form
          onSubmit={handleSubmitFeedback}
          className="bg-white rounded-[20px] p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4"
        >
          {/* Category Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5">
              Feedback Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'general', label: 'General' },
                { id: 'feature', label: 'Idea' },
                { id: 'bug', label: 'Issue' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFeedbackCategory(cat.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    feedbackCategory === cat.id
                      ? 'bg-blue-50/80 border-[#0066ff] text-[#0066ff] ring-1 ring-[#0066ff]/20'
                      : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5">
              Your Message
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you love or what could be improved..."
              className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] focus:bg-white transition-all shadow-2xs resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!feedbackText.trim() || feedbackSent}
              className={`w-full py-3 px-6 min-h-[46px] font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                feedbackText.trim() && !feedbackSent
                  ? 'bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white shadow-[0_2px_12px_rgba(0,102,255,0.2)] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
              }`}
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
              <span>{feedbackSent ? 'Sent!' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // MAIN SETTINGS SCREEN (Navigation Hub)
  // =========================================================================
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-20 flex flex-col select-none animate-in fade-in duration-200">
      {/* 1. TITLE & SUBTITLE */}
      <div className="mb-7 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-2">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-7">
        {/* SECTION 1 — ACCOUNT */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
            ACCOUNT
          </h2>
          <div className="bg-white rounded-[20px] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
            {/* Profile Row */}
            <button
              id="btn-settings-profile"
              type="button"
              onClick={() => {
                setTempName(userName);
                setTempEmail(userEmail);
                setActiveSubScreen('profile');
              }}
              className="w-full min-h-[70px] px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  Profile
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Name, email &amp; avatar
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>

            {/* Security Row */}
            <button
              id="btn-settings-security"
              type="button"
              onClick={() => setActiveSubScreen('security')}
              className="w-full min-h-[70px] px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  Security
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Sign-in &amp; security
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>
          </div>
        </div>

        {/* SECTION 2 — PLAN */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
            PLAN
          </h2>
          <div className="bg-white rounded-[20px] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Current Plan Row */}
            <button
              id="btn-settings-plan"
              type="button"
              onClick={() => onNavigate('pricing')}
              className="w-full min-h-[70px] px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  Current plan
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Free
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>
          </div>
        </div>

        {/* SECTION 3 — PREFERENCES */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
            PREFERENCES
          </h2>
          <div className="bg-white rounded-[20px] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Appearance Row */}
            <button
              id="btn-settings-appearance"
              type="button"
              onClick={() => setActiveSubScreen('appearance')}
              className="w-full min-h-[70px] px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  Appearance
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {appearance}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>
          </div>
        </div>

        {/* SECTION 4 — SUPPORT */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
            SUPPORT
          </h2>
          <div className="bg-white rounded-[20px] border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
            {/* Help & Support Row */}
            <button
              id="btn-settings-help"
              type="button"
              onClick={() => onNavigate('help')}
              className="w-full min-h-[70px] px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <span className="text-sm sm:text-base font-semibold text-slate-900">
                Help &amp; Support
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>

            {/* Feedback Row */}
            <button
              id="btn-settings-feedback"
              type="button"
              onClick={() => setActiveSubScreen('feedback')}
              className="w-full min-h-[70px] px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer text-left"
            >
              <span className="text-sm sm:text-base font-semibold text-slate-900">
                Feedback
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>
          </div>
        </div>

        {/* DANGER / ACCOUNT ACTION: Log out with generous separation */}
        <div className="pt-4 flex justify-center">
          <button
            id="btn-settings-logout"
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-600 active:text-rose-700 py-3 px-6 rounded-xl hover:bg-rose-50/60 active:bg-rose-100/60 transition-all cursor-pointer min-h-[44px]"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 border border-slate-200/90 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-bold text-slate-950">
                Log out of LaunchProof?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You will need to sign in again to access your product checks and settings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  showToast('Logged out of LaunchProof');
                  try {
                    await signOut();
                  } catch (err) {
                    console.error('Sign out error:', err);
                  }
                  onNavigate('landing');
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
