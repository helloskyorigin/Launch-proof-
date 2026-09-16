'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { CheckData, Finding } from '@/lib/checkMockData';

export interface CheckResultViewProps {
  checkData: CheckData;
  onBack: () => void;
  onSelectFinding: (finding: Finding) => void;
  onViewFixPlan: () => void;
  onStartRecheck?: () => void;
  onNewCheck?: () => void;
  onShare?: () => void;
}

export function CheckResultView({
  checkData,
  onBack,
  onSelectFinding,
  onViewFixPlan,
  onStartRecheck,
  onNewCheck,
  onShare,
}: CheckResultViewProps) {
  const [passedExpanded, setPassedExpanded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isRecheck = !!checkData.recheckComparison;
  const comparison = checkData.recheckComparison;

  const handleShareClick = () => {
    if (onShare) {
      onShare();
      return;
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-16 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between h-10 mb-3">
        <button
          id="btn-back-result"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Check Result
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShareClick}
            aria-label="Share result"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer relative"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Target Product Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 font-mono truncate max-w-[80%]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0066ff]" />
          <span className="truncate">{checkData.url || checkData.name}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {checkData.date}
        </span>
      </div>

      {/* Re-check Comparison Banner (If recheck completed) */}
      {isRecheck && comparison && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Re-check comparison
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black">
              +{comparison.improvement} points
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-white/80 border border-emerald-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">BLOCKERS</span>
              <span className="text-xs font-bold text-slate-900">
                {comparison.prevBlockers} → <span className="text-emerald-600">{comparison.newBlockers}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">IMPORTANT</span>
              <span className="text-xs font-bold text-slate-900">
                {comparison.prevImportant} → <span className="text-emerald-600">{comparison.newImportant}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">PASSED</span>
              <span className="text-xs font-bold text-slate-900">
                {comparison.prevPassed} → <span className="text-emerald-600">{comparison.newPassed}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Resolved in this check:
            </span>
            {comparison.fixedItems.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-emerald-900 font-medium">
                <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP RESULT SECTION: First-User Readiness */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            First-User Readiness
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              checkData.score >= 80
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {checkData.verdict}
          </span>
        </div>

        {/* Large Score */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
            {checkData.score}
          </span>
          <span className="text-lg font-bold text-slate-400">/ 100</span>
        </div>

        {/* Summary Note */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
          {checkData.summary}
        </p>

        {/* Compact Status Counts */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
          <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-base sm:text-lg font-black text-rose-700 block">
              {checkData.blockersCount}
            </span>
            <span className="text-[10px] font-bold text-rose-600/90 uppercase tracking-wider">
              Blockers
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <span className="text-base sm:text-lg font-black text-amber-700 block">
              {checkData.importantCount}
            </span>
            <span className="text-[10px] font-bold text-amber-600/90 uppercase tracking-wider">
              Important
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
            <span className="text-base sm:text-lg font-black text-emerald-700 block">
              {checkData.passedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600/90 uppercase tracking-wider">
              Passed
            </span>
          </div>
        </div>

        {/* Direct Action to Fix Plan */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            id="btn-view-fix-plan-top"
            type="button"
            onClick={onViewFixPlan}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-[#0066ff] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-100"
          >
            <span>View Fix Plan ({checkData.fixPlan.length} fixes)</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION: BLOCKERS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>Blockers</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
              {checkData.blockers.length}
            </span>
          </h2>
          <span className="text-[11px] text-slate-400">High priority issues</span>
        </div>

        <div className="space-y-3">
          {checkData.blockers.map((finding) => (
            <div
              key={finding.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col space-y-2.5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {finding.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">
                  {finding.severity}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-950 leading-snug">
                {finding.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {finding.explanation}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{finding.evidenceLabel}</span>
                </span>

                <button
                  type="button"
                  onClick={() => onSelectFinding(finding)}
                  className="font-bold text-[#0066ff] hover:underline inline-flex items-center gap-1 cursor-pointer ml-2 shrink-0"
                >
                  <span>View finding</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.4]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION: IMPORTANT
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>Important</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
              {checkData.important.length}
            </span>
          </h2>
          <span className="text-[11px] text-slate-400">Optimization opportunities</span>
        </div>

        <div className="space-y-3">
          {checkData.important.map((finding) => (
            <div
              key={finding.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col space-y-2 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {finding.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                  {finding.severity}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {finding.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {finding.explanation}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectFinding(finding)}
                  className="text-xs font-bold text-[#0066ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View finding</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.4]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION: PASSED
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-8">
        <div
          onClick={() => setPassedExpanded(!passedExpanded)}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Passed Checks ({checkData.passed.length})
              </h2>
              <p className="text-[11px] text-slate-400">
                Foundations and standards validated
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Toggle passed checks"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            {passedExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {passedExpanded && (
          <div className="mt-2.5 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {checkData.passed.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 py-1.5 border-b border-slate-50 last:border-0 text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Floating/Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.08)] p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2.5">
        <button
          id="btn-bottom-fix-plan"
          type="button"
          onClick={onViewFixPlan}
          className="w-full sm:flex-1 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.25)] transition-all cursor-pointer"
        >
          <span>View Fix Plan ({checkData.fixPlan.length} fixes)</span>
          <ArrowRight className="w-4 h-4 stroke-[2.3]" />
        </button>

        {onStartRecheck && (
          <button
            id="btn-bottom-recheck"
            type="button"
            onClick={onStartRecheck}
            className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-check</span>
          </button>
        )}

        {onNewCheck && (
          <button
            id="btn-bottom-newcheck"
            type="button"
            onClick={onNewCheck}
            className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer"
          >
            New Check
          </button>
        )}
      </div>
    </div>
  );
}
