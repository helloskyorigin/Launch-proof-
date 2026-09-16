'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  User,
  Shield,
  CreditCard,
  Moon,
  LogOut,
  X,
  Check,
  Zap,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  // Plan state: default to 'free' for new user
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');

  // Appearance state: 'Light' | 'Dark' | 'System'
  const [appearance, setAppearance] = useState<'Light' | 'Dark' | 'System'>('System');

  // Modal states
  const [activeModal, setActiveModal] = useState<
    'profile' | 'security' | 'usage' | 'plan' | 'billing' | 'appearance' | 'logout' | null
  >(null);

  // User Profile state
  const [userName, setUserName] = useState('Satyam');
  const [userEmail, setUserEmail] = useState('satyam@example.com');
  const [profileSaved, setProfileSaved] = useState(false);

  // Plan values adhering strictly to V1 specification
  const planDetails = {
    free: {
      name: 'Free',
      price: '$0/month',
      checksUsed: 0,
      totalChecks: 1,
      label: '1 check/month',
      resetPeriod: 'Free plan · Resets monthly',
      percentage: 0,
    },
    pro: {
      name: 'Pro',
      price: '$9/month',
      indiaPrice: '₹499/month in India',
      checksUsed: 2,
      totalChecks: 20,
      label: '20 checks/month',
      resetPeriod: 'Pro plan · Resets monthly',
      percentage: 10,
    },
  }[currentPlan];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setActiveModal(null);
    }, 1000);
  };

  const handleLogoutConfirm = () => {
    setActiveModal(null);
    onNavigate('home');
  };

  return (
    <div className="w-full px-5 pt-2 pb-24 flex flex-col select-none animate-in fade-in duration-200">
      {/* PAGE HEADER */}
      <div className="mb-5 mt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          Manage your account and plan.
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. ACCOUNT */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
            ACCOUNT
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Profile Row */}
            <button
              id="settings-row-profile"
              onClick={() => setActiveModal('profile')}
              className="w-full py-3 px-4 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors text-left cursor-pointer border-b border-slate-100/80 group"
            >
              <div className="min-w-0 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  Profile
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
                  Name, email & avatar
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>

            {/* Account & Security Row */}
            <button
              id="settings-row-security"
              onClick={() => setActiveModal('security')}
              className="w-full py-3 px-4 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors text-left cursor-pointer group"
            >
              <div className="min-w-0 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  Account & Security
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
                  Sign-in and security
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>
          </div>
        </div>

        {/* 2. USAGE & PLAN */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
            USAGE & PLAN
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Usage Row */}
            <div
              id="settings-row-usage"
              className="w-full py-3 px-4 sm:px-5 border-b border-slate-100/80"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  Usage
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {planDetails.checksUsed} of {planDetails.totalChecks} check
                  {planDetails.totalChecks > 1 ? 's' : ''} used
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-[#0066ff] h-full rounded-full transition-all duration-300"
                  style={{ width: `${planDetails.percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {planDetails.resetPeriod}
              </div>
            </div>

            {/* Plan Row */}
            <div
              id="settings-row-plan"
              className="w-full py-3 px-4 sm:px-5 flex items-center justify-between"
            >
              <div className="min-w-0 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  Plan
                </div>
                <div className="text-xs text-slate-600 font-normal mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-900">
                    {planDetails.name}
                  </span>
                  <span>·</span>
                  <span>{planDetails.price}</span>
                  {currentPlan === 'pro' && (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="text-[#0066ff] font-medium text-[11px]">
                        ₹499/month in India
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                id="btn-settings-manage-plan"
                onClick={() => setActiveModal('plan')}
                className="flex items-center gap-1 shrink-0 text-xs font-semibold text-[#0066ff] hover:text-[#0055d4] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50/50"
              >
                <span>Manage Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. BILLING */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
            BILLING
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <button
              id="settings-row-billing"
              onClick={() => setActiveModal('billing')}
              className="w-full py-3 px-4 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors text-left cursor-pointer group"
            >
              <div className="min-w-0 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  Billing
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
                  Payment method, invoices & subscription
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>
          </div>
        </div>

        {/* 4. PREFERENCES (Appearance Only - No fake notifications) */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
            PREFERENCES
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <button
              id="settings-row-appearance"
              onClick={() => setActiveModal('appearance')}
              className="w-full py-3 px-4 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors text-left cursor-pointer group"
            >
              <div className="min-w-0 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  Appearance
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {appearance}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-xs text-slate-400 font-medium">
                <span>Light / Dark / System</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* 5. LOG OUT (Compact subtle destructive row) */}
        <div className="pt-2 flex justify-center">
          <button
            id="btn-settings-logout"
            onClick={() => setActiveModal('logout')}
            className="w-full sm:w-auto py-2.5 px-4 text-rose-600 hover:text-rose-700 hover:bg-rose-50/60 active:bg-rose-100/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODALS & SHEETS (FRONTEND PROTOTYPES)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* MODAL: PROFILE */}
      {activeModal === 'profile' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[24px] sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Profile</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div className="flex items-center gap-3.5 py-1">
                <div className="w-12 h-12 rounded-full bg-[#ebf4ff] text-[#0066ff] font-bold text-lg flex items-center justify-center border border-blue-100">
                  {userName ? userName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Avatar</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Initial badge from your name
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0066ff] hover:bg-[#0055d4] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  {profileSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACCOUNT & SECURITY */}
      {activeModal === 'security' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[24px] sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Sign-in & Security</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Password</div>
                  <div className="text-[11px] text-slate-400">Last updated 3 months ago</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Password reset email sent')}
                  className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  Update
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Two-Factor Authentication</div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Active</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('2FA Settings opened')}
                  className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  Manage
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-xs font-bold text-slate-900">Current Session</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Web browser · Active now
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full mt-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE PLAN */}
      {activeModal === 'plan' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[24px] sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Manage Plan</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500">
                Select your plan or view the full pricing table:
              </p>

              {/* Free Option */}
              <div
                onClick={() => setCurrentPlan('free')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentPlan === 'free'
                    ? 'border-[#0066ff] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Free</span>
                    <span className="text-xs font-semibold text-slate-500">$0/month</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    1 check/month · Readiness score · Top 3 blockers
                  </div>
                </div>
                {currentPlan === 'free' ? (
                  <span className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 shrink-0">Select</span>
                )}
              </div>

              {/* Pro Option */}
              <div
                onClick={() => setCurrentPlan('pro')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentPlan === 'pro'
                    ? 'border-[#0066ff] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Pro</span>
                    <span className="text-xs font-bold text-[#0066ff]">$9/month</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ₹499/month in India · 20 checks/month · Full analysis
                  </div>
                </div>
                {currentPlan === 'pro' ? (
                  <span className="w-5 h-5 rounded-full bg-[#0066ff] text-white flex items-center justify-center text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 shrink-0">Select</span>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    onNavigate('pricing');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View Full Pricing Table</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BILLING */}
      {activeModal === 'billing' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[24px] sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Billing</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {currentPlan === 'free' ? (
                /* Honest empty/free state: no fake cards, no fake invoices */
                <div className="text-center py-5 px-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
                    <CreditCard className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    No active subscription
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                    You are on the Free plan ($0/month). Payment methods and invoices will appear here when you upgrade or purchase an audit.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onNavigate('pricing');
                    }}
                    className="mt-4 py-2.5 px-4 bg-[#0066ff] hover:bg-[#0055d4] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Pricing & Upgrade →</span>
                  </button>
                </div>
              ) : (
                /* Pro active state */
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Pro Subscription</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">$9.00 / month · Auto-renews monthly</div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Active
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Payment Method</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Card on file</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Update payment method')}
                      className="text-xs text-[#0066ff] font-semibold hover:underline"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPEARANCE SELECTION SHEET */}
      {activeModal === 'appearance' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[24px] sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Appearance</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {(['Light', 'Dark', 'System'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setAppearance(opt);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    appearance === opt
                      ? 'border-[#0066ff] bg-blue-50/50 text-[#0066ff] font-bold shadow-2xs'
                      : 'border-slate-200/80 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        appearance === opt
                          ? 'border-[#0066ff] bg-[#0066ff]'
                          : 'border-slate-300'
                      }`}
                    >
                      {appearance === opt && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-xs font-semibold">{opt}</span>
                  </div>
                  {appearance === opt && (
                    <span className="text-[11px] font-semibold text-[#0066ff]">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG OUT CONFIRMATION */}
      {activeModal === 'logout' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs sm:max-w-sm bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col text-center animate-in zoom-in-95 duration-150"
          >
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>

            <h3 className="text-base font-bold text-slate-950">
              Log out of LaunchProof?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              You will need to sign in again to access your account.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-logout"
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
