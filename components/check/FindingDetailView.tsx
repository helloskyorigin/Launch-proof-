'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  Plus,
  Info,
  Layers,
  Wrench,
} from 'lucide-react';
import { Finding } from '@/lib/checks/check-store';

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

  const isBlocker = finding.severity === 'blocker';
  const isImportant = finding.severity === 'important';

  const severityBadgeClass = isBlocker
    ? 'bg-rose-50 text-rose-700 border border-rose-200'
    : isImportant
    ? 'bg-amber-50 text-amber-800 border border-amber-200'
    : 'bg-slate-100 text-slate-700 border border-slate-200';

  const severityLabel = isBlocker ? 'BLOCKER' : isImportant ? 'IMPORTANT' : 'MINOR';
  const cleanUrl = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-16 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between h-10 mb-3">
        <button
          id="btn-back-finding-detail"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        {onViewFixPlan && (
          <button
            type="button"
            onClick={onViewFixPlan}
            className="text-xs font-semibold text-[#0066ff] hover:underline cursor-pointer"
          >
            Fix Plan →
          </button>
        )}
      </div>

      {/* Main Finding Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col space-y-5">
        {/* Category & Severity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {finding.category}
            </span>
            <span className="text-slate-300">·</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${severityBadgeClass}`}
            >
              {severityLabel}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">
            {finding.title}
          </h1>
        </div>

        {/* Section 1: Why it matters */}
        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Why it matters</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {finding.whyItMatters}
          </p>
        </div>

        {/* Section 2: Real Collected Evidence */}
        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Observed Evidence</span>
          </h2>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 space-y-2">
            <div className="text-[11px] font-mono text-slate-500 truncate">
              {cleanUrl}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
              <p className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap break-words">
                {finding.evidence}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Exact Fix */}
        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#0066ff]" />
            <span>Exact Fix</span>
          </h2>
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/90 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <p className="text-slate-800 leading-relaxed">{finding.fix}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-2">
          <button
            id="btn-add-to-fix-plan"
            type="button"
            onClick={handleToggleFixPlan}
            className={`flex-1 h-11 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              added
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                : 'bg-[#0066ff] hover:bg-[#0055d4] text-white shadow-2xs'
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
            className="h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}

