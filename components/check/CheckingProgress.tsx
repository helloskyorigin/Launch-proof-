'use client';

import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';

export interface CheckingProgressProps {
  productName: string;
  isRecheck?: boolean;
  onComplete: () => void;
}

const CHECKING_STEPS = [
  { label: 'Understanding product', duration: 1100 },
  { label: 'Checking first impression', duration: 1000 },
  { label: 'Testing user journey', duration: 1100 },
  { label: 'Checking mobile experience', duration: 1000 },
  { label: 'Reviewing trust & conversion', duration: 1100 },
  { label: 'Checking technical signals', duration: 900 },
  { label: 'Preparing findings', duration: 800 },
];

export function CheckingProgress({ productName, isRecheck = false, onComplete }: CheckingProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStepIndex < CHECKING_STEPS.length) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, CHECKING_STEPS[currentStepIndex].duration);
    } else {
      // Completed all steps, automatically transition
      timer = setTimeout(() => {
        onComplete();
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [currentStepIndex, onComplete]);

  // Overall progress percentage
  const progressPercent = Math.min(100, Math.round((currentStepIndex / CHECKING_STEPS.length) * 100));

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-12 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col">
        {/* Top Animated Icon */}
        <div className="flex items-center justify-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100 shadow-2xs relative">
            <Loader2 className="w-6 h-6 animate-spin stroke-[2.3]" />
          </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {isRecheck ? 'Re-evaluating your product' : 'Checking your product'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            LaunchProof is working through the experience step by step.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-mono text-slate-600 max-w-[280px] truncate">
            <span>Target:</span>
            <span className="font-semibold text-slate-900 truncate">{productName}</span>
          </div>
        </div>

        {/* Subtle Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#0066ff] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Vertical Progress Checklist */}
        <div className="space-y-3">
          {CHECKING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'text-slate-900 font-medium'
                    : isActive
                    ? 'text-[#0066ff] font-bold scale-[1.01]'
                    : 'text-slate-400'
                }`}
              >
                {/* Step Status Icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs animate-in zoom-in-50 duration-150">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : isActive ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0066ff] border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-slate-100" />
                  )}
                </div>

                <span className="flex-1">{step.label}</span>

                {isActive && (
                  <span className="text-[10px] text-blue-500 font-medium animate-pulse">
                    evaluating...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtle dev bypass button */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={onComplete}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Skip to report →
          </button>
        </div>
      </div>
    </div>
  );
}
