'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Smartphone,
  Compass,
  FileCheck2,
  ShieldCheck,
  ListOrdered,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export interface ReportItem {
  id: string;
  name: string;
  url: string;
  productType: string;
  date: string;
  score: number;
  status: 'Ready' | 'Needs Fix';
  blockersCount: number;
  importantCount: number;
  passedCount: number;
  totalChecks: number;
  verdict: string;
  categories: {
    userJourney: { score: number; status: string; findings: FindingItem[] };
    mobileCheck: { score: number; status: string; findings: FindingItem[] };
    productClarity: { score: number; status: string; findings: FindingItem[] };
    trustConversion: { score: number; status: string; findings: FindingItem[] };
  };
  fixPlan: { step: number; title: string; category: string; impact: string }[];
}

export interface FindingItem {
  id: string;
  title: string;
  severity: 'blocker' | 'important' | 'passed';
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
}

interface DetailedReportViewProps {
  report: ReportItem;
  onBack: () => void;
  onShare: (report: ReportItem) => void;
  onRecheck: (url: string) => void;
}

export function DetailedReportView({
  report,
  onBack,
  onShare,
  onRecheck,
}: DetailedReportViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'mobile' | 'clarity' | 'trust' | 'fixplan'>('overview');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({
    'f-1': true,
    'f-2': true,
  });

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isReady = report.status === 'Ready';

  // Extract all findings for the active tab or overview
  const getDisplayedFindings = () => {
    if (activeTab === 'journey') return report.categories.userJourney.findings;
    if (activeTab === 'mobile') return report.categories.mobileCheck.findings;
    if (activeTab === 'clarity') return report.categories.productClarity.findings;
    if (activeTab === 'trust') return report.categories.trustConversion.findings;
    // Overview: show all blockers and important findings
    return [
      ...report.categories.userJourney.findings,
      ...report.categories.mobileCheck.findings,
      ...report.categories.productClarity.findings,
      ...report.categories.trustConversion.findings,
    ];
  };

  const displayedFindings = getDisplayedFindings();

  return (
    <div className="w-full px-4 sm:px-5 pt-2 pb-20 flex flex-col animate-in fade-in duration-200">
      {/* Top Header Bar with navigation */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          id="btn-back-to-reports"
          onClick={onBack}
          aria-label="Back to Reports"
          className="w-9 h-9 -ml-1.5 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <div className="flex-1 min-w-0 px-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
            <span>Report</span>
            <span>·</span>
            <span className="text-slate-800 font-bold truncate">{report.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-share-detailed-report"
            onClick={() => onShare(report)}
            aria-label="Share Report"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Score & Verdict Card */}
      <div
        id="card-report-hero-score"
        className="w-full bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col mb-5"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isReady
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}
              >
                {isReady ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Ready to Launch</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Needs Fix Before Launch</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {report.date}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {report.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{report.productType}</span>
              <span>·</span>
              <a
                href={report.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#0066ff] hover:underline inline-flex items-center gap-0.5"
              >
                <span>Visit site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Large Readiness Score Gauge */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border shadow-xs ${
                isReady
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                  : 'bg-amber-50/50 border-amber-100 text-amber-800'
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                {report.score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                /100
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tight text-center">
              First-User Readiness
            </span>
          </div>
        </div>

        {/* Verdict Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 mb-5">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Verdict
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {report.verdict}
          </p>
        </div>

        {/* 3 Metric Pills Row: Blockers, Important findings, Passed checks */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">
              <span>Blockers</span>
            </div>
            <p
              className={`text-lg sm:text-xl font-black ${
                report.blockersCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {report.blockersCount}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">
              <span>Important findings</span>
            </div>
            <p
              className={`text-lg sm:text-xl font-black ${
                report.importantCount > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {report.importantCount}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">
              <span>Passed checks</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-600">
              {report.passedCount}
              <span className="text-xs text-slate-400 font-normal">/{report.totalChecks}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs: User Journey, Mobile Check, Product Clarity, Trust & Conversion, Fix Plan */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>All Findings</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'journey'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>User Journey</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'mobile'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Check</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('clarity')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'clarity'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Product Clarity</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trust')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'trust'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trust & Conversion</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fixplan')}
          className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'fixplan'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Fix Plan</span>
          </span>
        </button>
      </div>

      {/* Content Area: Fix Plan View or Findings List */}
      {activeTab === 'fixplan' ? (
        <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recommended Fix Order
              </h3>
              <p className="text-xs text-slate-400">
                Prioritized by impact on first-time user activation
              </p>
            </div>
            <span className="text-xs font-bold text-[#0066ff] bg-[#ebf4ff] px-2.5 py-1 rounded-lg">
              {report.fixPlan.length} Steps
            </span>
          </div>

          <div className="space-y-3">
            {report.fixPlan.map((plan) => (
              <div
                key={plan.step}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#ebf4ff] text-[#0066ff] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  0{plan.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {plan.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full shrink-0">
                      {plan.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Category: <span className="text-slate-700">{plan.category}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Findings List with Evidence, Why it matters, Recommended Fix */
        <div className="space-y-3.5">
          {displayedFindings.map((finding) => {
            const isExpanded = expandedFindings[finding.id] !== false;
            const isBlocker = finding.severity === 'blocker';
            const isImportant = finding.severity === 'important';
            const isPassed = finding.severity === 'passed';

            return (
              <div
                key={finding.id}
                className={`w-full bg-white rounded-2xl sm:rounded-3xl border transition-all overflow-hidden ${
                  isBlocker
                    ? 'border-rose-200/80 shadow-[0_4px_20px_rgba(244,63,94,0.05)]'
                    : isImportant
                    ? 'border-amber-200/80 shadow-[0_4px_20px_rgba(245,158,11,0.04)]'
                    : 'border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                }`}
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => toggleFinding(finding.id)}
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isBlocker && (
                        <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                      {isImportant && (
                        <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {isPassed && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isBlocker
                              ? 'bg-rose-50 text-rose-700'
                              : isImportant
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isBlocker ? 'Blocker' : isImportant ? 'Important Finding' : 'Passed Check'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {finding.title}
                      </h4>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 mt-1">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-3.5 bg-slate-50/30">
                    {/* Evidence Callout */}
                    <div className="rounded-xl p-3.5 bg-white border border-slate-200/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                        <Info className="w-3.5 h-3.5 text-[#0066ff]" />
                        <span>Observed Evidence</span>
                      </div>
                      <p className="text-xs text-slate-600 font-mono leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {finding.evidence}
                      </p>
                    </div>

                    {/* Why It Matters */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Why It Matters
                      </h5>
                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                        {finding.whyItMatters}
                      </p>
                    </div>

                    {/* Recommended Fix */}
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0066ff] mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Fix</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed">
                        {finding.recommendedFix}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Floating/Sticky Action Bar */}
      <div className="mt-8 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
        <button
          id="btn-recheck-product"
          onClick={() => onRecheck(report.url)}
          className="w-full sm:flex-1 py-3.5 px-6 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,102,255,0.22)] transition-all cursor-pointer text-sm"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          <span>Re-check Product</span>
        </button>

        <button
          id="btn-share-report-bottom"
          onClick={() => onShare(report)}
          className="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Share Report</span>
        </button>
      </div>
    </div>
  );
}
