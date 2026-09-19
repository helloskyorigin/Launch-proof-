'use client';

import React from 'react';
import { ArrowLeft, MoreHorizontal, Loader2 } from 'lucide-react';
import { CheckRecord, Finding } from '@/lib/checks/check-store';

export interface CheckResultViewProps {
  check?: CheckRecord;
  checkData?: any;
  onBack?: () => void;
  onSelectFinding?: (finding: Finding) => void;
  onViewFixPlan?: () => void;
  onStartRecheck?: () => void;
  onNewCheck?: () => void;
  onShare?: () => void;
  isDemoMode?: boolean;
  onExitDemoToAuth?: () => void;
}

export type VerdictType = 'READY' | 'NEEDS FIXES' | 'NOT READY';

export function CheckResultView({
  check,
  checkData,
  onBack,
}: CheckResultViewProps) {
  // Normalize check record from existing real data
  const record = (check || checkData || {}) as CheckRecord;

  // Real score directly from existing scoring engine / check record
  const rawScore =
    record.scoring?.overallScore ??
    record.score ??
    record.readinessScore?.score;

  // Empty/missing result loading state
  const isMissingResult = !record.id && typeof rawScore !== 'number';

  if (isMissingResult) {
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA] text-[#111827] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px] bg-white rounded-2xl border border-[#E5E7EB] p-6 text-center shadow-xs">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin mb-3 mx-auto stroke-[2.2]" />
          <h2 className="text-sm font-semibold text-[#111827] mb-1">
            Preparing your result...
          </h2>
          <p className="text-xs text-[#667085]">
            Evaluating your website experience
          </p>
        </div>
      </div>
    );
  }

  const score = typeof rawScore === 'number' ? rawScore : 0;

  // Real verdict directly from existing backend / scoring logic
  const rawVerdict =
    record.scoring?.verdict ||
    record.verdict ||
    record.readinessScore?.verdict ||
    '';

  const normalizedVerdict = String(rawVerdict).trim().toUpperCase().replace(/_/g, ' ');

  let verdictType: VerdictType = 'NOT READY';
  if (normalizedVerdict.includes('READY') && !normalizedVerdict.includes('NOT')) {
    verdictType = 'READY';
  } else if (
    normalizedVerdict.includes('NEEDS') ||
    normalizedVerdict.includes('ATTENTION') ||
    normalizedVerdict.includes('FIX')
  ) {
    verdictType = 'NEEDS FIXES';
  } else if (normalizedVerdict.includes('NOT')) {
    verdictType = 'NOT READY';
  } else if (typeof rawScore === 'number') {
    // If verdict field is missing, align with backend scoring engine thresholds
    verdictType = rawScore >= 85 ? 'READY' : rawScore >= 70 ? 'NEEDS FIXES' : 'NOT READY';
  }

  // Verdict pill color rules (subtle colors, no saturated backgrounds)
  const verdictBadgeStyle =
    verdictType === 'READY'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : verdictType === 'NEEDS FIXES'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  // Verdict explanation: use existing backend result summary if available,
  // otherwise fallback to deterministic UI copy based ONLY on actual verdict
  let explanation = '';
  if (
    record.scoring?.summary &&
    typeof record.scoring.summary === 'string' &&
    record.scoring.summary.trim()
  ) {
    explanation = record.scoring.summary.trim();
  } else {
    if (verdictType === 'READY') {
      explanation = 'No critical first-user issues were detected in this check.';
    } else if (verdictType === 'NEEDS FIXES') {
      explanation =
        'Some issues could affect the first-user experience. Review the recommended fixes before launch.';
    } else {
      explanation =
        'Critical first-user issues were detected. Fix the highest-priority issues before inviting users.';
    }
  }

  // Product context (subtle and compact)
  const targetUrl = record.finalUrl || record.url || '';
  const displayUrl = targetUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .trim();

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] text-[#111827] flex flex-col items-center">
      <div className="w-full max-w-[440px] px-4 sm:px-5 pt-2 pb-12 flex flex-col">
        {/* HEADER */}
        <header className="w-full flex items-center justify-between h-14 mb-3 select-none">
          {onBack ? (
            <button
              id="btn-back-result"
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#111827] hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          ) : (
            <div className="w-10 h-10 -ml-2" />
          )}

          <button
            type="button"
            aria-label="More options"
            className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center text-[#667085] hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </header>

        {/* CHECKED WEBSITE */}
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-[11px] font-bold text-[#667085] tracking-widest uppercase mb-1.5 select-none">
            SHIPSCAN RESULT
          </span>
          <span className="text-xs font-mono text-[#667085] bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1 rounded-lg truncate max-w-full font-medium">
            {displayUrl}
          </span>
        </div>

        {/* MAIN RESULT CARD / YOUR SHIP STATUS */}
        <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs flex flex-col items-center">
          {/* YOUR SHIP STATUS */}
          <span className="text-[11px] font-bold text-[#667085] tracking-widest uppercase mb-4 select-none">
            YOUR SHIP STATUS
          </span>

          {/* SCORE */}
          <div className="flex items-baseline justify-center select-none mb-3">
            <span className="text-7xl font-bold text-[#111827] tracking-tight leading-none">
              {score}
            </span>
            <span className="text-xl font-semibold text-[#667085] ml-1">
              / 100
            </span>
          </div>

          {/* VERDICT */}
          <div className="mb-4">
            <span
              id="ship-verdict-pill"
              className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${verdictBadgeStyle}`}
            >
              {verdictType}
            </span>
          </div>

          {/* SHORT EXPLANATION */}
          <p className="text-sm sm:text-base text-[#667085] leading-relaxed text-center font-normal max-w-xs sm:max-w-sm">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
