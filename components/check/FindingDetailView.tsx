'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  Plus,
  ExternalLink,
  Info,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Finding } from '@/lib/checkMockData';

export interface FindingDetailProps {
  finding: Finding;
  targetUrl: string;
  onBack: () => void;
  onAddToFixPlan?: (findingId: string) => void;
  onViewFixPlan?: () => void;
  isInFixPlan?: boolean;
}

export function FindingDetailView({
  finding,
  targetUrl,
  onBack,
  onAddToFixPlan,
  onViewFixPlan,
  isInFixPlan = false,
}: FindingDetailProps) {
  const [added, setAdded] = useState(isInFixPlan);

  const handleToggleFixPlan = () => {
    setAdded(!added);
    if (onAddToFixPlan) {
      onAddToFixPlan(finding.id);
    }
  };

  const isCritical = finding.severity === 'Critical';

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-14 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between h-10 mb-4">
        <button
          id="btn-back-finding-detail"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Finding
        </span>

        <div className="w-16 flex justify-end">
          {onViewFixPlan && (
            <button
              type="button"
              onClick={onViewFixPlan}
              className="text-xs font-semibold text-[#0066ff] hover:underline cursor-pointer"
            >
              Fix Plan
            </button>
          )}
        </div>
      </div>

      {/* Main Finding Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-7 flex flex-col space-y-6">
        {/* Category & Severity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {finding.category}
            </span>
            <span>·</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                isCritical
                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{finding.severity}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
            {finding.title}
          </h1>
        </div>

        {/* Section 1: Why it matters */}
        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Why it matters</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {finding.whyItMatters}
          </p>
        </div>

        {/* Section 2: Evidence */}
        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Evidence</span>
          </h2>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="truncate max-w-[240px] font-semibold text-slate-800">
                {targetUrl || 'https://myawesomeproduct.com'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-sans font-medium">
                Viewport: 390px
              </span>
            </div>

            {/* Simulated Visual Evidence Container */}
            <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-2xs overflow-hidden">
              <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-semibold text-slate-700">{finding.evidenceLabel}</span>
              </div>

              <div className="p-3 rounded-lg border-2 border-dashed border-rose-300 bg-rose-50/40 text-xs text-rose-900 leading-relaxed font-mono">
                {finding.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: What to fix */}
        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>What to fix</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {finding.whatToFix}
          </p>
        </div>

        {/* Section 4: Recommended fix (Actionable fix card) */}
        <div className="border-t border-slate-100 pt-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Recommended Fix
          </span>
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100/90 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <p className="font-semibold text-slate-950 mb-1">
              Concrete Recommendation:
            </p>
            <p className="text-slate-700">{finding.recommendedFix}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-add-to-fix-plan"
            type="button"
            onClick={handleToggleFixPlan}
            className={`flex-1 h-12 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              added
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-[#0066ff] hover:bg-[#0055d4] text-white shadow-[0_2px_8px_rgba(0,102,255,0.25)]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Fix Plan</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.4]" />
                <span>Add to Fix Plan</span>
              </>
            )}
          </button>

          <button
            id="btn-return-results"
            type="button"
            onClick={onBack}
            className="h-12 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}
