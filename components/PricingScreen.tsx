'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface PricingScreenProps {
  onNavigate?: (screen: string) => void;
  onSelectPlan?: (planId: string) => void;
}

type BillingCycle = 'monthly' | 'annual';
type PlanTier = 'free' | 'pro' | 'pro-plus';

export function PricingScreen({ onNavigate, onSelectPlan }: PricingScreenProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('pro');
  const [showAllProFeatures, setShowAllProFeatures] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleCtaClick = (plan: PlanTier) => {
    if (plan === 'free') {
      return;
    }
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      const planName = plan === 'pro' ? 'Pro' : 'Pro+';
      const priceText =
        plan === 'pro'
          ? billingCycle === 'annual'
            ? '$90/year'
            : '$9/month'
          : billingCycle === 'annual'
          ? '$190/year'
          : '$19/month';
      showToast(`Selected ${planName} (${priceText})`);
    }
  };

  // Plan data definitions
  const plans = {
    free: {
      id: 'free' as const,
      name: 'Free',
      description: 'For builders getting started',
      priceDisplay: '$0',
      periodText: billingCycle === 'monthly' ? '/ month' : '',
      subPriceText: '',
      isCurrent: true,
      ctaText: 'Current Plan',
      features: [
        '1 check / month',
        'First-User Readiness Score',
        'Top 3 blockers',
        'Basic evidence',
        'Limited report',
      ],
      extraFeatures: [] as string[],
    },
    pro: {
      id: 'pro' as const,
      name: 'Pro',
      description: 'For builders who check regularly',
      priceDisplay: billingCycle === 'monthly' ? '$9' : '$7.50',
      periodText: '/ month',
      subPriceText: billingCycle === 'annual' ? '$90 / year billed annually' : '',
      isCurrent: false,
      ctaText: 'Upgrade to Pro →',
      features: [
        '20 checks / month',
        'Full first-user analysis',
        'User Journey',
        'Mobile Check',
        'Product Clarity',
        'Trust',
      ],
      extraFeatures: [
        'Technical checks',
        'Evidence',
        'Exact Fix Plan',
        'Re-check',
        'History',
        'Share Report',
      ],
    },
    'pro-plus': {
      id: 'pro-plus' as const,
      name: 'Pro+',
      description: 'For deeper and more frequent testing',
      priceDisplay: billingCycle === 'monthly' ? '$19' : '$15.83',
      periodText: '/ month',
      subPriceText: billingCycle === 'annual' ? '$190 / year billed annually' : '',
      isCurrent: false,
      ctaText: 'Upgrade to Pro+ →',
      features: [
        '60 checks / month',
        'Everything in Pro',
        'Deeper journey analysis',
        'More frequent re-checking',
        'Advanced comparison & history',
        'Priority analysis',
      ],
      extraFeatures: [] as string[],
    },
  };

  const activePlanData = plans[selectedPlan];

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col select-none animate-in fade-in duration-200">
      {/* 1. PAGE INTRO: Compact header */}
      <div className="mb-3.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
          Plans &amp; Billing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
          Choose the plan that fits how you test.
        </p>
      </div>

      {/* 2. BILLING TOGGLE: Monthly vs Annual */}
      <div className="w-full flex flex-col items-center mb-3">
        <div
          id="billing-cycle-toggle"
          className="w-full max-w-[280px] p-1 bg-slate-100/90 rounded-xl grid grid-cols-2 gap-1"
        >
          <button
            id="tab-billing-monthly"
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`min-h-[38px] py-1.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly
          </button>
          <button
            id="tab-billing-annual"
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`min-h-[38px] py-1.5 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${
              billingCycle === 'annual'
                ? 'bg-white text-[#0066ff] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Annual</span>
          </button>
        </div>

        {/* Small premium savings label shown only on Annual */}
        {billingCycle === 'annual' && (
          <div className="mt-2 inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-2.5 py-0.5 rounded-full animate-in fade-in duration-150">
            Save 17% — Get 2 Months Free
          </div>
        )}
      </div>

      {/* 3. MOBILE PLAN SELECTOR: [ Free ] [ Pro ] [ Pro+ ] */}
      <div
        id="mobile-plan-selector"
        className="w-full p-1 bg-slate-100/90 rounded-xl grid grid-cols-3 gap-1 mb-3.5 select-none"
      >
        {/* Free Plan Tab */}
        <button
          id="tab-plan-free"
          type="button"
          onClick={() => {
            setSelectedPlan('free');
            setShowAllProFeatures(false);
          }}
          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
            selectedPlan === 'free'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Free</span>
          <span className="text-[10px] text-slate-400 font-normal">Current</span>
        </button>

        {/* Pro Plan Tab (Strongest Visual Emphasis) */}
        <button
          id="tab-plan-pro"
          type="button"
          onClick={() => setSelectedPlan('pro')}
          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
            selectedPlan === 'pro'
              ? 'bg-white text-[#0066ff] shadow-xs ring-1 ring-[#0066ff]/20'
              : 'bg-white/50 text-[#0066ff] hover:bg-white hover:text-[#0055d4]'
          }`}
        >
          <div className="flex items-center gap-1">
            <span>Pro</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0066ff]" />
          </div>
          <span className="text-[10px] text-[#0066ff]/80 font-medium">Popular</span>
        </button>

        {/* Pro+ Plan Tab */}
        <button
          id="tab-plan-pro-plus"
          type="button"
          onClick={() => {
            setSelectedPlan('pro-plus');
            setShowAllProFeatures(false);
          }}
          className={`min-h-[44px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
            selectedPlan === 'pro-plus'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Pro+</span>
          <span className="text-[10px] text-slate-400 font-normal">Deep Checks</span>
        </button>
      </div>

      {/* 4. SELECTED PLAN PANEL (Shows ONE focused plan card at a time) */}
      <div
        id={`card-plan-${activePlanData.id}`}
        key={activePlanData.id}
        className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all animate-in fade-in duration-200 ${
          activePlanData.id === 'pro'
            ? 'border-[#0066ff]/40 shadow-[0_4px_24px_rgba(0,102,255,0.06)]'
            : 'border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
        }`}
      >
        {/* Header: Plan Name & Price */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {activePlanData.name}
              </h2>
              {activePlanData.id === 'pro' && (
                <span className="text-[10px] font-bold text-[#0066ff] bg-blue-50 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {activePlanData.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-baseline justify-end gap-1">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  activePlanData.id === 'pro' ? 'text-[#0066ff]' : 'text-slate-950'
                }`}
              >
                {activePlanData.priceDisplay}
              </span>
              {activePlanData.periodText && (
                <span className="text-xs text-slate-400 font-normal">
                  {activePlanData.periodText}
                </span>
              )}
            </div>
            {activePlanData.subPriceText && (
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {activePlanData.subPriceText}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 my-4" />

        {/* Core Features List */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Plan Features
          </p>
          <div className="space-y-2 text-xs sm:text-[13px] text-slate-700">
            {activePlanData.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0066ff] stroke-[2.4] shrink-0" />
                <span className="font-medium text-slate-800">{feature}</span>
              </div>
            ))}

            {/* Expanded Features for Pro */}
            {activePlanData.id === 'pro' && showAllProFeatures && (
              <div className="space-y-2 pt-1 border-t border-slate-100/80 animate-in fade-in duration-150">
                {activePlanData.extraFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0066ff] stroke-[2.4] shrink-0" />
                    <span className="font-medium text-slate-800">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline "View all features" toggle for Pro */}
          {activePlanData.id === 'pro' && (
            <button
              id="btn-toggle-all-features"
              type="button"
              onClick={() => setShowAllProFeatures(!showAllProFeatures)}
              className="mt-2 pt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0066ff] hover:text-[#0055d4] hover:underline cursor-pointer"
            >
              <span>{showAllProFeatures ? 'Show less' : 'View all features'}</span>
              {showAllProFeatures ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Primary CTA */}
        <div className="mt-5 pt-1">
          {activePlanData.isCurrent ? (
            <button
              id="btn-cta-current-plan"
              disabled
              aria-disabled="true"
              className="w-full py-3 px-4 min-h-[48px] bg-slate-100 text-slate-400 font-semibold rounded-xl text-xs sm:text-sm text-center cursor-default border border-slate-200/50"
            >
              {activePlanData.ctaText}
            </button>
          ) : (
            <button
              id={`btn-cta-${activePlanData.id}`}
              type="button"
              onClick={() => handleCtaClick(activePlanData.id)}
              className="w-full py-3.5 px-6 min-h-[48px] bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,102,255,0.22)] select-none"
            >
              <span>{activePlanData.ctaText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}
    </div>
  );
}
