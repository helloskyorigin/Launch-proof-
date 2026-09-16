'use client';

import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingScreenProps {
  onNavigate?: (screen: string) => void;
  onSelectPlan?: (planId: string) => void;
}

export function PricingScreen({ onNavigate, onSelectPlan }: PricingScreenProps) {
  const [activePlan, setActivePlan] = useState<'free' | 'audit' | 'pro'>('free');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAuditClick = () => {
    if (onSelectPlan) {
      onSelectPlan('audit');
    } else if (onNavigate) {
      onNavigate('new-check');
    } else {
      showNotification('Launch Audit selected. Redirecting to check...');
    }
  };

  const handleProUpgrade = () => {
    if (onSelectPlan) {
      onSelectPlan('pro');
    } else {
      setActivePlan('pro');
      showNotification('Upgraded to Pro plan ($9/mo or ₹499/mo in India)');
    }
  };

  return (
    <div className="w-full px-5 pt-3 pb-24 flex flex-col select-none animate-in fade-in duration-200">
      {/* Page Intro */}
      <div className="mt-1 mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Pricing
        </h1>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          Choose how you want to test
        </p>
        <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
          Start free. Upgrade when you need deeper checks.
        </p>
      </div>

      {/* 3 Pricing Cards */}
      <div className="space-y-4">
        {/* PLAN 1 — FREE */}
        <div
          id="pricing-card-free"
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.025)] flex flex-col transition-all"
        >
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-base font-bold text-slate-950 tracking-tight">
              Free
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                $0
              </span>
              <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-normal mb-3.5">
            For builders getting started
          </p>

          <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>1 check / month</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>First-User Readiness Score</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Top 3 blockers</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              id="btn-plan-free"
              disabled
              aria-disabled="true"
              className="w-full py-2.5 px-4 bg-slate-100 text-slate-500 font-medium rounded-xl text-xs sm:text-[13px] text-center cursor-default"
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* PLAN 2 — ONE-TIME LAUNCH AUDIT */}
        <div
          id="pricing-card-launch-audit"
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.025)] flex flex-col transition-all"
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-slate-950 tracking-tight">
                Launch Audit
              </h2>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-slate-950 tracking-tight">
                  $5
                </span>
                <span className="text-xs text-slate-400 font-normal">one-time</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                India: ₹399
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-normal mb-3.5">
            A one-time product check with no subscription.
          </p>

          <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>1 in-depth product check</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Full analysis & readiness score</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>No subscription required</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              id="btn-plan-launch-audit"
              onClick={handleAuditClick}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span>Run a Launch Audit</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* PLAN 3 — PRO */}
        <div
          id="pricing-card-pro"
          className="bg-white rounded-2xl p-5 border border-[#0066ff]/40 shadow-[0_4px_20px_rgba(0,102,255,0.06)] flex flex-col transition-all relative"
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-base font-bold text-slate-950 tracking-tight">
                Pro
              </h2>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-[#0066ff] tracking-tight">
                  $9
                </span>
                <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <div className="text-[11px] text-[#0066ff] font-semibold mt-0.5">
                ₹499 / month in India
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-normal mb-3.5">
            For builders who check regularly
          </p>

          <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span className="font-semibold text-slate-900">20 checks / month</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Full analysis</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Browser journey</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Evidence</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] shrink-0" />
              <span>Re-check</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#0066ff] stroke-[2.2] stroke-[2.2] shrink-0" />
              <span>History</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              id="btn-plan-pro"
              onClick={handleProUpgrade}
              className="w-full py-2.5 px-4 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,102,255,0.2)]"
            >
              <span>{activePlan === 'pro' ? 'Current Plan (Pro)' : 'Upgrade to Pro →'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast feedback */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}
    </div>
  );
}
