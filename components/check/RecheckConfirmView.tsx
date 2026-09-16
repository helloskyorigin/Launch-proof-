'use client';

import React from 'react';
import { ArrowLeft, RotateCcw, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export interface RecheckConfirmProps {
  previousScore: number;
  productName: string;
  onBack: () => void;
  onRunRecheck: () => void;
}

export function RecheckConfirmView({
  previousScore = 74,
  productName,
  onBack,
  onRunRecheck,
}: RecheckConfirmProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-14 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between h-10 mb-4">
        <button
          id="btn-back-recheck-setup"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Re-Check
        </span>

        <div className="w-10" />
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Check again
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
          Run LaunchProof again to see what changed.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col space-y-6">
        {/* Previous Result Block */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Previous Result
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {previousScore} <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Previous Check
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Today
            </span>
          </div>
        </div>

        {/* Informational comparison notice */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0066ff] flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 stroke-[2.3]" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <p className="font-bold text-slate-950 mb-0.5">
              Comparison Mode Active
            </p>
            <p className="text-slate-600">
              Your next check will compare the new result with this one, showing resolved blockers, score delta, and updated readiness.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-run-recheck"
            type="button"
            onClick={onRunRecheck}
            className="flex-1 h-12 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.25)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.3]" />
            <span>Run Re-check</span>
          </button>

          <button
            id="btn-cancel-recheck"
            type="button"
            onClick={onBack}
            className="h-12 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
