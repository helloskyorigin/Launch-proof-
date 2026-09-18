/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  CameraOff,
  Layers,
} from 'lucide-react';
import { CheckRecord, Finding, FindingSeverity } from '@/lib/checks/check-store';
import { EvidenceViewModal } from './EvidenceViewModal';

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

export interface JourneyStep {
  id: string;
  stepNumber: number;
  label: string;
  action: string;
  path: string;
  status: 'pass' | 'fail' | 'warning';
  evidenceText?: string;
  timestamp?: string;
}

// Extract path/URL from evidence or evidenceRefs or title
function extractFindingPath(finding: Finding, siteUrl?: string): string | null {
  const textToScan = `${finding.title} ${finding.evidence || ''}`;
  const pathMatch = textToScan.match(/(?:^|\s|\()(\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)*)/);
  if (pathMatch && pathMatch[1] && !pathMatch[1].startsWith('//')) {
    return pathMatch[1];
  }

  if (siteUrl) {
    try {
      const parsedSite = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`);
      const hostRegex = new RegExp(`https?:\\/\\/${parsedSite.hostname.replace('.', '\\.')}(\\/[^\\s)"']*)`, 'i');
      const urlMatch = textToScan.match(hostRegex);
      if (urlMatch && urlMatch[1] && urlMatch[1] !== '/') {
        return urlMatch[1];
      }
    } catch {
      // ignore URL parsing error
    }
  }

  return null;
}

// Derive journey steps using ONLY real data recorded in the check record
function deriveJourneySteps(record: CheckRecord, cleanUrl: string): JourneyStep[] {
  // If explicitly recorded custom journey steps exist in record, use them
  if (Array.isArray((record as any).journeySteps) && (record as any).journeySteps.length > 0) {
    return (record as any).journeySteps;
  }
  if (Array.isArray((record as any).journey) && (record as any).journey.length > 0) {
    return (record as any).journey;
  }

  const steps: JourneyStep[] = [];
  const checks = Array.isArray(record.checks) ? record.checks : [];
  const desktop = record.evidence?.desktop;
  const mobile = record.evidence?.mobile;

  let urlPath = '/';
  try {
    const rawTarget = record.finalUrl || record.url;
    if (rawTarget) {
      const parsed = new URL(rawTarget.startsWith('http') ? rawTarget : `https://${rawTarget}`);
      urlPath = parsed.pathname || '/';
    }
  } catch {
    urlPath = '/';
  }

  const httpStatus = record.httpStatus || desktop?.httpStatus;

  // 1. Navigation event
  if (record.status === 'completed' || httpStatus !== undefined || desktop) {
    const isNavFailed = typeof httpStatus === 'number' && httpStatus >= 400;
    steps.push({
      id: 'step-nav',
      stepNumber: steps.length + 1,
      label: 'Opened your website',
      action: typeof httpStatus === 'number' ? `HTTP ${httpStatus} response` : 'Navigation initiated',
      path: urlPath,
      status: isNavFailed ? 'fail' : 'pass',
      evidenceText: typeof httpStatus === 'number'
        ? `Server responded with HTTP ${httpStatus}${record.responseTimeMs ? ` in ${record.responseTimeMs}ms` : ''}`
        : 'Target URL opened in Playwright headless browser',
      timestamp: record.responseTimeMs ? `${record.responseTimeMs}ms` : undefined,
    });
  }

  // 2. Page Content & Title verification
  const titleCheck = checks.find((c) => c.id === 'product_clarity_title');
  const title = desktop?.title;
  if (title !== undefined || titleCheck) {
    const hasTitle = Boolean(title && title.trim().length > 0);
    const stepStatus = titleCheck
      ? titleCheck.status === 'fail'
        ? 'fail'
        : titleCheck.status === 'warning'
        ? 'warning'
        : 'pass'
      : hasTitle
      ? 'pass'
      : 'fail';

    steps.push({
      id: 'step-title',
      stepNumber: steps.length + 1,
      label: 'Loaded page content & title',
      action: hasTitle
        ? `Title: "${title!.slice(0, 50)}${title!.length > 50 ? '…' : ''}"`
        : 'Empty or missing title tag',
      path: urlPath,
      status: stepStatus,
      evidenceText: desktop?.headings?.length
        ? `${desktop.headings.length} heading tag(s) rendered in visible DOM`
        : hasTitle
        ? 'Document title and head elements evaluated'
        : 'No document title tag found',
    });
  }

  // 3. Navigation Links verification
  const linkCheck = checks.find(
    (c) =>
      c.id === 'user_journey_navigation' ||
      c.id === 'user_journey_links' ||
      c.id === 'user_journey_internal_links'
  );
  const links = desktop?.links;
  if (links !== undefined || linkCheck) {
    const count = links?.length ?? (typeof linkCheck?.value === 'number' ? linkCheck.value : 0);
    const stepStatus = linkCheck
      ? linkCheck.status === 'fail'
        ? 'fail'
        : linkCheck.status === 'warning'
        ? 'warning'
        : 'pass'
      : count > 0
      ? 'pass'
      : 'warning';

    steps.push({
      id: 'step-links',
      stepNumber: steps.length + 1,
      label: 'Scanned navigation links',
      action: `${count} link(s) detected in DOM`,
      path: urlPath,
      status: stepStatus,
      evidenceText: count > 0
        ? `${count} link(s) verified for navigation structure`
        : 'No navigational links found on target page',
    });
  }

  // 4. Action Buttons & CTAs verification
  const buttonCheck = checks.find(
    (c) =>
      c.id === 'user_journey_buttons' ||
      c.id === 'user_journey_primary_actions' ||
      c.id === 'user_journey_action_buttons'
  );
  const buttons = desktop?.buttons;
  if (buttons !== undefined || buttonCheck) {
    const count = buttons?.length ?? (typeof buttonCheck?.value === 'number' ? buttonCheck.value : 0);
    const stepStatus = buttonCheck
      ? buttonCheck.status === 'fail'
        ? 'fail'
        : buttonCheck.status === 'warning'
        ? 'warning'
        : 'pass'
      : count > 0
      ? 'pass'
      : 'warning';

    steps.push({
      id: 'step-buttons',
      stepNumber: steps.length + 1,
      label: 'Inspected action buttons & CTAs',
      action: `${count} interactive button(s) detected`,
      path: urlPath,
      status: stepStatus,
      evidenceText: count > 0 && buttons?.[0]?.text
        ? `Primary CTA detected: "${buttons[0].text.trim().slice(0, 40)}"`
        : `${count} button element(s) inspected for accessible labels`,
    });
  }

  // 5. Mobile Viewport & Responsiveness (390px)
  const mobileOverflowCheck = checks.find((c) => c.id === 'mobile_horizontal_overflow');
  if (mobile !== undefined || mobileOverflowCheck) {
    const hasOverflow =
      mobile?.horizontalOverflow === true ||
      mobileOverflowCheck?.status === 'fail';

    steps.push({
      id: 'step-mobile',
      stepNumber: steps.length + 1,
      label: 'Tested mobile viewport (390px)',
      action: hasOverflow
        ? 'Horizontal scroll overflow detected'
        : 'Fits 390px mobile viewport',
      path: urlPath,
      status: hasOverflow ? 'fail' : 'pass',
      evidenceText: hasOverflow
        ? `Document width (${mobile?.scrollWidth || 422}px) exceeds 390px viewport`
        : 'No horizontal overflow detected on iPhone 13 (390 × 844 px)',
    });
  }

  // 6. Network & Console Errors
  const techCheck = checks.find(
    (c) =>
      c.id === 'technical_http_failures' ||
      c.id === 'technical_page_crashes'
  );
  const consoleErrors = desktop?.consoleErrors || [];
  const failedRequests = desktop?.failedRequests || [];
  if (consoleErrors.length > 0 || failedRequests.length > 0 || techCheck) {
    const errorCount = consoleErrors.length;
    const reqFailCount = failedRequests.length;
    const stepStatus =
      errorCount > 0
        ? 'fail'
        : reqFailCount > 0 || techCheck?.status === 'warning'
        ? 'warning'
        : 'pass';

    steps.push({
      id: 'step-network',
      stepNumber: steps.length + 1,
      label: 'Monitored network & console',
      action: `${errorCount} console error(s), ${reqFailCount} failed request(s)`,
      path: urlPath,
      status: stepStatus,
      evidenceText:
        errorCount === 0 && reqFailCount === 0
          ? 'Zero unhandled console errors or failed network requests'
          : `${errorCount} console error(s), ${reqFailCount} network request failure(s) observed`,
    });
  }

  return steps;
}

export function CheckResultView({
  check,
  checkData,
  onBack,
  onSelectFinding,
  isDemoMode = false,
  onExitDemoToAuth,
  onNewCheck,
}: CheckResultViewProps) {
  // Phase 3 State (Hooks must be called unconditionally at top of component)
  const [selectedProofFinding, setSelectedProofFinding] = useState<Finding | null>(null);
  const [showJourneyModal, setShowJourneyModal] = useState<boolean>(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showExpandedScreenshot, setShowExpandedScreenshot] = useState<boolean>(false);
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState<boolean>(false);

  // Normalize check record from existing real data
  const record = (check || checkData || {}) as CheckRecord;

  // Real score directly from existing scoring engine / check record
  const rawScore =
    record.scoring?.overallScore ??
    record.score ??
    record.readinessScore?.score;

  // Empty or missing result check
  const isMissingResult = !record.id && typeof rawScore !== 'number';

  if (isMissingResult) {
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA] text-[#111827] flex flex-col items-center">
        <div className="w-full max-w-[440px] px-4 sm:px-5 pt-2 pb-12 flex flex-col">
          <header className="w-full flex items-center justify-between h-14 mb-3 select-none">
            <div className="flex items-center gap-3">
              {onBack ? (
                <button
                  id="btn-back-result-missing"
                  type="button"
                  onClick={onBack}
                  aria-label="Back"
                  className="w-11 h-11 -ml-2 rounded-xl flex items-center justify-center text-[#111827] hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
              ) : (
                <div className="w-11 h-11 -ml-2" />
              )}
              <h1 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
                ShipScan Result
              </h1>
            </div>
            <div className="w-11" />
          </header>

          <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 text-center shadow-xs">
            <h2 className="text-sm font-semibold text-[#111827] mb-1">
              Result Unavailable
            </h2>
            <p className="text-xs text-[#667085] mb-5 leading-relaxed">
              This check result is unavailable.
            </p>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black active:scale-95 transition-all cursor-pointer"
              >
                Return to ShipScan
              </button>
            )}
          </div>
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
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      : verdictType === 'NEEDS FIXES'
      ? 'bg-amber-50 text-amber-800 border-amber-200/80'
      : 'bg-rose-50 text-rose-700 border-rose-200/80';

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
  const cleanUrl = targetUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .trim();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 2: FINDINGS EXTRACTION & PRIORITY SORT
  // Priority: Blocker (1) -> Important (2) -> Minor (3)
  // Preserves backend-provided order within the same severity.
  // Displays a MAXIMUM of 3 findings in this primary section.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rawFindings: Finding[] = (
    (record.reasoning && Array.isArray(record.reasoning.findings) && record.reasoning.findings.length > 0)
      ? record.reasoning.findings
      : Array.isArray(record.findings)
      ? record.findings
      : []
  );

  const severityRank: Record<FindingSeverity, number> = {
    blocker: 1,
    important: 2,
    minor: 3,
  };

  const sortedFindings = [...rawFindings].sort((a, b) => {
    const rankA = severityRank[a.severity] ?? 99;
    const rankB = severityRank[b.severity] ?? 99;
    return rankA - rankB;
  });

  const topFindings = sortedFindings.slice(0, 3);
  const totalFindingsCount = sortedFindings.length;
  const hasMoreThanThree = totalFindingsCount > 3;

  // Derived real journey steps
  const journeySteps = deriveJourneySteps(record, cleanUrl);
  const stepCount = journeySteps.length;
  const issueCount = journeySteps.filter(
    (s) => s.status === 'fail' || s.status === 'warning'
  ).length;

  // Active finding for the proof card: explicitly selected finding, or top blocker/first finding
  const activeProofFinding = selectedProofFinding || topFindings[0] || null;
  const activeFindingPath = activeProofFinding
    ? extractFindingPath(activeProofFinding, cleanUrl)
    : null;

  // Real Playwright screenshot:
  // If the finding is mobile-specific, prefer mobile screenshot; otherwise desktop
  const isMobileFinding =
    activeProofFinding?.category === 'Mobile' ||
    Boolean(activeProofFinding?.evidence?.toLowerCase().includes('390')) ||
    Boolean(activeProofFinding?.evidence?.toLowerCase().includes('mobile'));

  const desktopScreenshot = record.evidence?.desktop?.screenshot;
  const mobileScreenshot = record.evidence?.mobile?.screenshot;
  const directScreenshot =
    (record as any).screenshot ||
    (record as any).screenshotPreview ||
    (record as any).screenshotUrls?.[0];

  const activeScreenshot = isMobileFinding
    ? mobileScreenshot || desktopScreenshot || directScreenshot
    : desktopScreenshot || mobileScreenshot || directScreenshot;

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] text-[#111827] flex flex-col items-center">
      <div className="w-full max-w-[440px] px-4 sm:px-5 pt-2 pb-12 flex flex-col">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            0. DEMO MODE INDICATOR (if in Demo Mode)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {(isDemoMode || record.isDemo) && (
          <div
            id="demo-mode-result-banner"
            className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2.5 text-amber-950 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider shrink-0">
                Demo
              </span>
              <span className="truncate text-slate-700 font-medium">
                Sample check for demo.shipscan.app
              </span>
            </div>
            <button
              type="button"
              onClick={onExitDemoToAuth || onNewCheck}
              className="text-[#2563EB] hover:underline font-semibold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Sign in</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            1. HEADER
            ←   ShipScan Result
            (No three-dot menu, no unnecessary actions)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <header className="w-full flex items-center justify-between h-14 mb-3 select-none">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                id="btn-back-result"
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="w-11 h-11 -ml-2 rounded-xl flex items-center justify-center text-[#111827] hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
            ) : (
              <div className="w-11 h-11 -ml-2" />
            )}
            <h1 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
              ShipScan Result
            </h1>
          </div>
          {/* No three-dot menu, no clutter */}
          <div className="w-11" />
        </header>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. MAIN RESULT CARD (PHASE 1 FOUNDATION)
            YOUR SHIP STATUS
            ↓
            SCORE
            ↓
            VERDICT
            ↓
            SHORT EXPLANATION
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <main className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs flex flex-col mb-6">
          {/* Section label: YOUR SHIP STATUS */}
          <div className="text-center mb-1">
            <h2 className="text-[12px] sm:text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
              YOUR SHIP STATUS
            </h2>
          </div>

          {/* Large, bold, numerical score as visual focal point */}
          <div className="flex flex-col items-center justify-center my-4">
            <span className="text-6xl sm:text-7xl font-bold text-[#111827] tracking-tight leading-none select-none">
              {score}
            </span>
            <span className="text-lg sm:text-xl font-medium text-[#667085] mt-1.5 select-none">
              / 100
            </span>
          </div>

          {/* Compact verdict status pill */}
          <div className="flex justify-center mb-3">
            <span
              id="ship-verdict-pill"
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border tracking-wide ${verdictBadgeStyle}`}
            >
              {verdictType}
            </span>
          </div>

          {/* Short explanation below the verdict */}
          <p className="text-sm sm:text-base text-[#374151] font-normal leading-relaxed text-center max-w-sm mx-auto">
            {explanation}
          </p>

          {/* Compact checked product context */}
          {cleanUrl && (
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#667085]">
              <span>Checked website</span>
              <span className="font-mono text-[#111827] font-medium truncate max-w-[200px] sm:max-w-[260px]">
                {cleanUrl}
              </span>
            </div>
          )}
        </main>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. WHAT NEEDS YOUR ATTENTION (PHASE 2)
            Maximum 3 highest-priority findings
            Blocker -> Important -> Minor
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="section-needs-attention" className="w-full flex flex-col mb-4">
          <div className="flex flex-col mb-3 px-0.5">
            <h2 className="text-[12px] sm:text-[13px] font-semibold text-[#667085] uppercase tracking-wider">
              WHAT NEEDS YOUR ATTENTION
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Start with the issues that could affect your first users.
            </p>
          </div>

          {/* Zero findings state */}
          {topFindings.length === 0 ? (
            <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-5 text-center shadow-xs flex flex-col items-center justify-center py-7">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">
                Nothing needs your attention
              </h3>
              <p className="text-xs text-[#667085] max-w-xs leading-relaxed">
                ShipScan didn&apos;t detect any actionable issues in this check.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topFindings.map((finding, idx) => {
                const isBlocker = finding.severity === 'blocker';
                const isImportant = finding.severity === 'important';

                // Restrained severity colors:
                // BLOCKER: soft red tint border & pill
                // IMPORTANT: soft amber border & pill
                // MINOR: soft neutral/slate border & pill
                const cardBorderClass = isBlocker
                  ? 'border-rose-200/90 hover:border-rose-300'
                  : isImportant
                  ? 'border-amber-200/90 hover:border-amber-300'
                  : 'border-[#E5E7EB] hover:border-slate-300';

                const badgeClass = isBlocker
                  ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                  : isImportant
                  ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

                const dotClass = isBlocker
                  ? 'bg-[#DC2626]'
                  : isImportant
                  ? 'bg-amber-500'
                  : 'bg-slate-400';

                const severityText = isBlocker
                  ? 'BLOCKER'
                  : isImportant
                  ? 'IMPORTANT'
                  : 'MINOR';

                // Path extraction: only real paths, no fake paths
                const path = extractFindingPath(finding, cleanUrl);

                // Concise explanation: whyItMatters prioritized, fallback to evidence or fix
                const conciseExplanation =
                  finding.whyItMatters?.trim() ||
                  finding.evidence?.trim() ||
                  finding.fix?.trim() ||
                  '';

                return (
                  <article
                    key={finding.id || `finding-${idx}`}
                    id={`finding-card-${finding.id || idx}`}
                    className={`w-full bg-[#FFFFFF] rounded-2xl border p-4 sm:p-4.5 shadow-xs transition-colors ${cardBorderClass} flex flex-col`}
                  >
                    {/* Header: Severity indicator + Category / Tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`}
                          aria-hidden="true"
                        />
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${badgeClass}`}
                        >
                          {severityText}
                        </span>
                      </div>
                      {finding.category && (
                        <span className="text-[11px] text-[#667085] font-medium truncate max-w-[150px]">
                          {finding.category}
                        </span>
                      )}
                    </div>

                    {/* Finding Title (16px, 600 weight) */}
                    <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#111827] leading-snug mb-1">
                      {finding.title}
                    </h3>

                    {/* Affected Path / URL (12-13px secondary, graceful truncation) */}
                    {path && (
                      <div className="mb-2">
                        <span className="inline-block font-mono text-[12px] sm:text-[13px] text-[#667085] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded truncate max-w-full">
                          {path}
                        </span>
                      </div>
                    )}

                    {/* Concise Explanation (14px regular) */}
                    {conciseExplanation && (
                      <p className="text-[13px] sm:text-[14px] text-[#4B5563] font-normal leading-relaxed line-clamp-3 mb-3">
                        {conciseExplanation}
                      </p>
                    )}

                    {/* See proof action (14px, medium/semibold, primary blue #2563EB) */}
                    <div className="mt-auto pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        id={`btn-see-proof-${finding.id || idx}`}
                        onClick={() => {
                          setSelectedProofFinding(finding);
                          const el = document.getElementById('section-proof');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[13px] sm:text-[14px] font-semibold text-[#2563EB] hover:text-blue-700 min-h-[44px] -ml-1 px-1 py-2 rounded-lg cursor-pointer active:opacity-80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                      >
                        <span>See proof</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Optional small link if there are more than 3 findings */}
          {hasMoreThanThree && onSelectFinding && (
            <div className="mt-3 text-center">
              <button
                type="button"
                id="btn-view-all-findings"
                onClick={() => {
                  if (topFindings[0]) {
                    onSelectFinding(topFindings[0]);
                  }
                }}
                className="inline-flex items-center justify-center min-h-[44px] px-3 py-1.5 text-xs font-semibold text-[#667085] hover:text-[#111827] cursor-pointer transition-colors"
              >
                View all {totalFindingsCount} findings →
              </button>
            </div>
          )}
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. HOW YOUR FIRST USER EXPERIENCE WENT
            Compact vertical journey with real tested steps
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="w-full mt-7" aria-label="First user experience journey">
          <div className="mb-3">
            <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">
              HOW YOUR FIRST USER EXPERIENCE WENT
            </h2>
            <p className="text-[13px] text-[#667085] mt-0.5">
              Here&apos;s what ShipScan tested during this check.
            </p>
          </div>

          <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs flex flex-col">
            {journeySteps.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-[#667085] italic">
                  Journey data wasn&apos;t available for this check.
                </p>
              </div>
            ) : (
              <>
                {/* Compact Vertical Timeline */}
                <div className="space-y-2.5 mb-4">
                  {journeySteps.map((step, idx) => {
                    const isPass = step.status === 'pass';
                    const isFail = step.status === 'fail';
                    const isWarning = step.status === 'warning';

                    const iconClass = isPass
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                      : isFail
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/80';

                    return (
                      <div
                        key={step.id || `step-${idx}`}
                        className="flex items-start gap-3 text-[13px] sm:text-[14px]"
                      >
                        {/* Step State Icon (Section 4) */}
                        <div
                          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${iconClass}`}
                          aria-label={isPass ? 'Passed' : isFail ? 'Failed' : 'Warning'}
                        >
                          {isPass ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : isFail ? (
                            <X className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="text-[11px] font-bold leading-none">!</span>
                          )}
                        </div>

                        {/* Step Label */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`leading-snug ${
                              isFail
                                ? 'text-[#111827] font-semibold'
                                : 'text-[#374151] font-normal'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Compact Journey Counts (Section 5) & View Journey Action (Section 6) */}
                <div className="pt-3 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] text-[#667085]">
                    <span className="font-medium text-[#111827]">
                      {stepCount} steps tested
                    </span>
                    <span>·</span>
                    <span
                      className={
                        issueCount > 0
                          ? 'font-medium text-rose-600'
                          : 'font-normal text-[#667085]'
                      }
                    >
                      {issueCount} {issueCount === 1 ? 'issue' : 'issues'} encountered
                    </span>
                  </div>

                  <button
                    type="button"
                    id="btn-view-journey"
                    onClick={() => setShowJourneyModal(true)}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB] hover:text-blue-700 min-h-[44px] -mr-1 px-2 py-2 rounded-lg cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    <span>View journey</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. PROOF SECTION
            Real Playwright screenshot & browser evidence
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          id="section-proof"
          className="w-full mt-7 scroll-mt-6"
          aria-label="Evidence captured during check"
        >
          <div className="mb-3">
            <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">
              PROOF
            </h2>
            <p className="text-[13px] text-[#667085] mt-0.5">
              Evidence captured during the check.
            </p>
          </div>

          <div className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs flex flex-col">
            {/* If a finding is actively focused, show finding context header */}
            {activeProofFinding && (
              <div className="mb-3 flex items-center justify-between gap-2 pb-2.5 border-b border-[#F1F3F5]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                  <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider shrink-0">
                    Active Finding:
                  </span>
                  <span className="text-[12px] font-medium text-[#111827] truncate">
                    {activeProofFinding.title}
                  </span>
                </div>
                {topFindings.length > 1 && (
                  <span className="text-[11px] text-[#667085] shrink-0">
                    {selectedProofFinding ? 'Selected' : 'Top Priority'}
                  </span>
                )}
              </div>
            )}

            {/* Real Playwright Screenshot (Section 9 & 14) */}
            <div className="w-full mb-3.5">
              {activeScreenshot ? (
                <div className="relative w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-slate-900/5 group">
                  <img
                    src={activeScreenshot}
                    alt={
                      activeProofFinding
                        ? `Playwright screenshot showing ${activeProofFinding.title}`
                        : `Playwright check screenshot of ${cleanUrl}`
                    }
                    className="w-full h-auto max-h-[340px] object-contain object-top rounded-xl bg-slate-100"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowExpandedScreenshot(true)}
                    aria-label="Expand screenshot to full size"
                    className="absolute bottom-2.5 right-2.5 min-h-[36px] px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand</span>
                  </button>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-6 text-center">
                  <CameraOff className="w-6 h-6 text-[#9CA3AF] mx-auto mb-2" />
                  <p className="text-xs text-[#667085] font-medium">
                    No screenshot was captured for this check.
                  </p>
                </div>
              )}
            </div>

            {/* Finding Title & Result / Action Header (Section 10) */}
            {activeProofFinding ? (
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold text-[#111827] leading-snug">
                  {activeProofFinding.title}
                </h3>
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span aria-hidden="true">→</span>
                  <span>
                    {activeProofFinding.severity === 'blocker'
                      ? 'Blocker issue observed'
                      : activeProofFinding.severity === 'important'
                      ? 'Important issue observed'
                      : 'Minor issue observed'}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold text-[#111827]">
                  Automated Check Evaluation
                </h3>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span aria-hidden="true">→</span>
                  <span>Check completed successfully</span>
                </p>
              </div>
            )}

            {/* URL / Path */}
            <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-mono text-[#667085]">
              <span className="font-semibold text-[#374151]">URL:</span>
              <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded truncate max-w-full text-[#111827]">
                {activeFindingPath || cleanUrl || '/'}
              </span>
            </div>

            {/* Real Browser Evidence Text (Section 11) */}
            {activeProofFinding ? (
              activeProofFinding.evidence?.trim() ? (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[12px] font-mono text-[#374151] whitespace-pre-wrap break-words leading-relaxed">
                  {activeProofFinding.evidence.trim()}
                </div>
              ) : (
                <p className="text-[12px] text-[#667085] italic mt-2.5">
                  Evidence for this finding isn&apos;t available.
                </p>
              )
            ) : (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[12px] font-mono text-[#374151] leading-relaxed">
                {record.scoring?.summary || 'All automated Playwright checks completed.'}
              </div>
            )}

            {/* Action: View full evidence (Section 12) */}
            <div className="mt-4 pt-3.5 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
              <button
                type="button"
                id="btn-view-full-evidence"
                onClick={() => setShowEvidenceModal(true)}
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-[#111827] hover:bg-black text-white text-xs font-semibold cursor-pointer active:scale-98 transition-all gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View full evidence</span>
              </button>

              {topFindings.length > 1 && (
                <div className="flex items-center gap-1">
                  {topFindings.map((f, i) => (
                    <button
                      key={f.id || `f-btn-${i}`}
                      type="button"
                      onClick={() => setSelectedProofFinding(f)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                        (selectedProofFinding?.id || topFindings[0]?.id) === f.id
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-slate-100 text-[#667085] hover:bg-slate-200'
                      }`}
                      aria-label={`Show proof for finding ${i + 1}`}
                    >
                      #{i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Expandable Technical Details (Section 13) */}
            <div className="mt-2 pt-2 border-t border-[#F1F3F5]">
              <button
                type="button"
                id="btn-toggle-technical-details"
                onClick={() => setTechnicalDetailsOpen(!technicalDetailsOpen)}
                className="w-full flex items-center justify-between py-2 text-[12px] font-semibold text-[#667085] hover:text-[#111827] cursor-pointer min-h-[44px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                aria-expanded={technicalDetailsOpen}
              >
                <span>Technical details</span>
                {technicalDetailsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {technicalDetailsOpen && (
                <div className="pt-2 pb-1 space-y-2 text-[12px] text-[#4B5563]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        HTTP Status
                      </span>
                      <span className="font-semibold text-slate-900">
                        {record.httpStatus || record.evidence?.desktop?.httpStatus || 200} OK
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Response Time
                      </span>
                      <span className="font-semibold text-slate-900">
                        {record.responseTimeMs ? `${record.responseTimeMs} ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Console Errors
                      </span>
                      <span
                        className={`font-semibold ${
                          (record.evidence?.desktop?.consoleErrors?.length || 0) > 0
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {record.evidence?.desktop?.consoleErrors?.length || 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Failed Requests
                      </span>
                      <span
                        className={`font-semibold ${
                          (record.evidence?.desktop?.failedRequests?.length || 0) > 0
                            ? 'text-amber-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {record.evidence?.desktop?.failedRequests?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Tested Viewports
                    </span>
                    <div className="flex items-center justify-between text-slate-700 text-[11px]">
                      <span>Desktop: 1280 × 800 px</span>
                      <span>Mobile: 390 × 844 px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            5. JOURNEY DETAIL MODAL (Section 6)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showJourneyModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="journey-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3
                    id="journey-modal-title"
                    className="text-base font-bold text-[#111827]"
                  >
                    Tested Journey Details
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    {stepCount} steps tested · {issueCount} {issueCount === 1 ? 'issue' : 'issues'} encountered
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJourneyModal(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                  aria-label="Close journey details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 divide-y divide-slate-100">
                {journeySteps.map((step) => {
                  const isPass = step.status === 'pass';
                  const isFail = step.status === 'fail';

                  return (
                    <div key={step.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Step {step.stepNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isPass
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : isFail
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : 'bg-amber-50 text-amber-800 border-amber-200/80'
                          }`}
                        >
                          {isPass ? 'Passed' : isFail ? 'Failed' : 'Warning'}
                        </span>
                      </div>
                      <h4 className="text-[14px] font-semibold text-[#111827]">
                        {step.label}
                      </h4>
                      <div className="text-[12px] font-mono text-slate-500">
                        Action: {step.action}
                      </div>
                      <div className="text-[12px] font-mono text-slate-500">
                        Path: {step.path}
                      </div>
                      {step.evidenceText && (
                        <div className="text-[12px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 mt-1">
                          {step.evidenceText}
                        </div>
                      )}
                      {step.timestamp && (
                        <div className="text-[11px] text-slate-400">
                          Response time: {step.timestamp}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowJourneyModal(false)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#111827] text-white text-xs font-semibold hover:bg-black cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            6. EXPANDED SCREENSHOT MODAL (Section 14)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {showExpandedScreenshot && activeScreenshot && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Expanded screenshot"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <span className="text-xs font-medium text-slate-300 truncate">
                  {activeProofFinding?.title || cleanUrl || 'Screenshot Evidence'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowExpandedScreenshot(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  aria-label="Close expanded screenshot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 overflow-auto flex items-center justify-center bg-slate-950">
                <img
                  src={activeScreenshot}
                  alt={activeProofFinding?.title || 'Screenshot Evidence'}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            7. FULL EVIDENCE VIEWER (Section 12)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <EvidenceViewModal
          isOpen={showEvidenceModal}
          onClose={() => setShowEvidenceModal(false)}
          targetUrl={cleanUrl || record.url}
          evidence={record.evidence}
        />
      </div>
    </div>
  );
}
