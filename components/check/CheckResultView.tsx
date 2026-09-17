'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
  RotateCcw,
  Check,
  Globe,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { CheckRecord, Finding } from '@/lib/checks/check-store';
import { EvidenceViewModal } from './EvidenceViewModal';

export interface CheckResultViewProps {
  check?: CheckRecord;
  checkData?: any;
  onBack?: () => void;
  onSelectFinding: (finding: Finding) => void;
  onViewFixPlan: () => void;
  onStartRecheck?: () => void;
  onNewCheck?: () => void;
  onShare?: () => void;
}

function getPassedCheckTitle(id: string): string {
  const titles: Record<string, string> = {
    product_clarity_title: 'Page Title Tag Present',
    product_clarity_meta_description: 'Search Meta Description Present',
    product_clarity_main_heading: 'Primary H1 Headline Defined',
    product_clarity_lead_paragraph: 'Product Explanation Found',
    product_clarity_pricing_page: 'Pricing / Plans Information Found',
    product_clarity_tagline_length: 'Concise Value Proposition',
    user_journey_interactive_elements: 'Interactive Calls to Action',
    user_journey_form_inputs: 'Input Forms & Lead Capture Available',
    user_journey_action_buttons: 'Clickable Buttons Discovered',
    user_journey_internal_links: 'Internal Navigation Pathways',
    user_journey_broken_link_anchors: 'No Broken Link Placeholders (#)',
    mobile_viewport_tag: 'Responsive Viewport Meta Tag',
    mobile_horizontal_overflow: 'No Horizontal Scroll Overflow',
    mobile_text_scaling: 'Mobile-Optimized Typography',
    mobile_interactive_sizing: 'Accessible Mobile Tap Targets',
    trust_https_used: 'Secure HTTPS Protocol',
    trust_privacy_or_terms: 'Privacy Policy or Terms of Service',
    trust_social_proof: 'Social Proof / Testimonials Present',
    trust_contact_details: 'Support Email or Contact Details',
    trust_copyright_current: 'Active / Current Copyright Year',
    technical_http_status_ok: 'HTTP Status 200 OK',
    technical_response_time: 'Fast Server Response Time',
    technical_console_errors: 'Zero Fatal Console Errors',
    technical_page_crashes: 'Zero Unhandled Page Exceptions',
    technical_http_failures: 'Zero Failed Network Requests',
  };
  return titles[id] || id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CheckResultView({
  check,
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
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  // Normalize check record
  const record = (check || checkData || {}) as CheckRecord;

  const scoring = record.scoring;

  const score = scoring ? scoring.overallScore : (record.score ?? 0);
  const verdictRaw = scoring ? scoring.verdict : (record.verdict ?? (score >= 80 ? 'Ready' : score >= 50 ? 'Needs Attention' : 'Not Ready'));
  const verdict = verdictRaw === 'READY' ? 'Ready' : (verdictRaw === 'NEEDS_ATTENTION' ? 'Needs Attention' : (verdictRaw === 'NOT_READY' ? 'Not Ready' : verdictRaw));

  const findings: Finding[] = record.findings || [];
  const blockers = findings.filter((f) => f.severity === 'blocker');
  const important = findings.filter((f) => f.severity === 'important');
  const minor = findings.filter((f) => f.severity === 'minor');

  const blockerCount = scoring ? scoring.counts.blockers : (record.blockerCount ?? blockers.length);
  const importantCount = scoring ? scoring.counts.important : (record.importantCount ?? important.length);
  const minorCount = scoring ? scoring.counts.minor : (record.minorCount ?? minor.length);

  const rawChecks = record.checks || [];
  const passedChecks = rawChecks.filter((c) => c.status === 'pass');
  const passedCount = scoring ? scoring.counts.passed : passedChecks.length;

  const breakdown = scoring ? {
    productClarity: scoring.categoryScores['Product Clarity'],
    userJourney: scoring.categoryScores['User Journey'],
    mobile: scoring.categoryScores['Mobile'],
    trust: scoring.categoryScores['Trust'],
    technical: scoring.categoryScores['Technical']
  } : (record.breakdown || {
    productClarity: 0,
    userJourney: 0,
    mobile: 0,
    trust: 0,
    technical: 0,
  });

  const targetUrl = record.finalUrl || record.url || 'example.com';
  const cleanUrl = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const handleShareClick = () => {
    if (onShare) {
      onShare();
      return;
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Verdict visual theme
  const verdictBadgeStyle =
    verdict === 'Ready'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : verdict === 'Needs Attention'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  const verdictLabel =
    verdict === 'Ready' ? 'READY' : verdict === 'Needs Attention' ? 'NEEDS ATTENTION' : 'NOT READY';

  // Dynamic readiness description
  let verdictSummary = scoring ? scoring.summary : 'Your product is ready for first users.';
  if (!scoring) {
    if (verdict === 'Ready') {
      if (minorCount > 0) {
        verdictSummary = `Your product is ready for first users. ${minorCount} minor optimization${
          minorCount === 1 ? '' : 's'
        } found.`;
      } else {
        verdictSummary = 'Your product is ready for first users. No critical blockers detected.';
      }
    } else if (verdict === 'Needs Attention') {
      const issueCount = blockerCount + importantCount;
      verdictSummary = `A few issues should be fixed before inviting first users (${issueCount} issue${
        issueCount === 1 ? '' : 's'
      } need attention).`;
    } else {
      verdictSummary = `Critical issues should be fixed before inviting first users (${
        blockerCount > 0 ? `${blockerCount} critical blocker${blockerCount === 1 ? '' : 's'}` : 'issues detected'
      }).`;
    }
  }

  // Sorted findings for "WHAT TO FIX FIRST" (Top 1-3)
  const rawFindings = [...blockers, ...important, ...minor];
  const sortedFindings = scoring?.fixPlan 
    ? (scoring.fixPlan.map(fp => rawFindings.find(r => r.id === fp.findingId)).filter(Boolean) as Finding[])
    : rawFindings;
    
  const topFixFirst = sortedFindings.slice(0, 3);
  const totalFixesCount = sortedFindings.length;

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-24 flex flex-col animate-in fade-in duration-200">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. HEADER
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex items-center justify-between h-11 mb-2">
        {onBack ? (
          <button
            id="btn-back-result"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="w-12" />
        )}

        <button
          type="button"
          onClick={handleShareClick}
          aria-label="Share result link"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. CHECKED PRODUCT
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#0066ff] shrink-0" />
          <span className="text-xs font-mono font-medium text-slate-700 truncate">
            {cleanUrl}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setEvidenceModalOpen(true)}
          className="text-xs font-semibold text-[#0066ff] hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View Evidence</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. MAIN READINESS CARD
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            First-User Readiness
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border tracking-wider ${verdictBadgeStyle}`}>
            {verdictLabel}
          </span>
        </div>

        {/* Visually Dominant Score */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl sm:text-6xl font-black text-slate-950 tracking-tight leading-none">
            {score}
          </span>
          <span className="text-lg font-bold text-slate-400">/ 100</span>
        </div>

        {/* Dynamic Summary */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {verdictSummary}
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. WHAT TO FIX FIRST
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            What to Fix First
          </h2>
          {topFixFirst.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Top priority {topFixFirst.length} of {totalFixesCount}
            </span>
          )}
        </div>

        {topFixFirst.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-950">✓ Nothing critical to fix.</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">Your core first-user checks passed.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {topFixFirst.map((finding, idx) => (
              <div
                key={finding.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col space-y-2 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-400 font-mono">0{idx + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">{finding.category}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`font-bold ${
                        finding.severity === 'blocker'
                          ? 'text-rose-600'
                          : finding.severity === 'important'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {finding.severity === 'blocker'
                        ? 'Blocker'
                        : finding.severity === 'important'
                        ? 'Important'
                        : 'Minor'}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {finding.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-2">
                  {finding.whyItMatters || finding.evidence}
                </p>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectFinding(finding)}
                    className="text-xs font-semibold text-[#0066ff] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View finding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. FIX PLAN (PRIMARY NEXT STEP)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
            Your Next Steps
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            {totalFixesCount === 0
              ? 'No pending fixes'
              : `${totalFixesCount} fix${totalFixesCount === 1 ? '' : 'es'} recommended`}
          </h3>
        </div>

        <button
          id="btn-view-fix-plan-hero"
          type="button"
          onClick={onViewFixPlan}
          disabled={totalFixesCount === 0}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0 ${
            totalFixesCount === 0 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-[#0066ff] hover:bg-[#0055d4] cursor-pointer'
          }`}
        >
          <span>{totalFixesCount === 0 ? 'No fixes needed' : 'View Fix Plan'}</span>
          {totalFixesCount > 0 && <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />}
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. CATEGORY OVERVIEW
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Category Check
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 text-center">
            <span className="text-[11px] text-slate-500 font-medium block truncate">Product Clarity</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{breakdown.productClarity}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 text-center">
            <span className="text-[11px] text-slate-500 font-medium block truncate">User Journey</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{breakdown.userJourney}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 text-center">
            <span className="text-[11px] text-slate-500 font-medium block truncate">Mobile</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{breakdown.mobile}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 text-center">
            <span className="text-[11px] text-slate-500 font-medium block truncate">Trust</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{breakdown.trust}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 font-medium block truncate">Technical</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{breakdown.technical}%</span>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. DETAILED FINDINGS (BLOCKERS)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>Blockers</span>
            {blockerCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                {blockerCount}
              </span>
            )}
          </h2>
        </div>

        {blockers.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>✓ No blockers detected</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {blockers.map((finding) => (
              <div
                key={finding.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col space-y-2 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {finding.category}
                  </span>
                  <span className="px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">
                    BLOCKER
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {finding.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {finding.whyItMatters}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[200px] font-mono text-[10px]">
                    Observed: {finding.evidence}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectFinding(finding)}
                    className="font-semibold text-[#0066ff] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <span>View finding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          8. DETAILED FINDINGS (IMPORTANT & MINOR)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>Important & Minor</span>
            {importantCount + minorCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                {importantCount + minorCount}
              </span>
            )}
          </h2>
        </div>

        {important.length === 0 && minor.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>✓ No additional optimizations required</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[...important, ...minor].map((finding) => (
              <div
                key={finding.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col space-y-2 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {finding.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      finding.severity === 'important'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {finding.severity}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {finding.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {finding.whyItMatters}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[200px] font-mono text-[10px]">
                    Observed: {finding.evidence}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectFinding(finding)}
                    className="font-semibold text-[#0066ff] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <span>View finding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          9. PASSED CHECKS (COLLAPSED BY DEFAULT)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setPassedExpanded(!passedExpanded)}
          className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                ✓ {passedCount} checks passed
              </span>
              <span className="text-[11px] text-slate-500">
                Everything essential checked successfully.
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold text-[#0066ff] flex items-center gap-1 shrink-0">
            <span>{passedExpanded ? 'Hide' : 'View passed checks'}</span>
            {passedExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {passedExpanded && (
          <div className="mt-2 bg-white rounded-xl border border-slate-200/80 p-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {passedChecks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No passed check rules recorded.</p>
            ) : (
              passedChecks.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2.5 py-1.5 border-b border-slate-50 last:border-0 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block">
                      {getPassedCheckTitle(c.id)}
                    </span>
                    {c.evidence?.[0] && (
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        {c.evidence[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          10. BOTTOM ACTIONS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.08)] p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-2">
        <button
          id="btn-bottom-fix-plan"
          type="button"
          onClick={onViewFixPlan}
          disabled={totalFixesCount === 0}
          className={`w-full sm:flex-1 h-11 rounded-xl active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all ${
            totalFixesCount === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-[#0066ff] hover:bg-[#0055d4] cursor-pointer'
          }`}
        >
          <span>
            {totalFixesCount === 0
              ? 'No fixes needed'
              : `View Fix Plan (${totalFixesCount} ${totalFixesCount === 1 ? 'fix' : 'fixes'})`}
          </span>
          {totalFixesCount > 0 && <ArrowRight className="w-4 h-4 stroke-[2.3]" />}
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

      {/* Evidence Viewer Modal */}
      <EvidenceViewModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        targetUrl={targetUrl}
        evidence={record.evidence}
      />
    </div>
  );
}

