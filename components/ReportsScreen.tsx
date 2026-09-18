'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Globe,
  Share2,
  FileText,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { DetailedReportView, ReportItem } from './DetailedReportView';
import { ShareReportModal } from './ShareReportModal';

// Mock report items representing a user who has completed checks
const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    name: 'myproduct.com',
    url: 'https://myproduct.com',
    productType: 'SaaS · E-commerce',
    date: '15 Sep 2026 · 10:24 AM',
    score: 82,
    status: 'Ready',
    blockersCount: 0,
    importantCount: 3,
    passedCount: 26,
    totalChecks: 29,
    verdict:
      'Good onboarding readiness. First-time buyers experience a smooth checkout flow with minor copy ambiguities around refund policy.',
    categories: {
      userJourney: {
        score: 88,
        status: 'Ready',
        findings: [
          {
            id: 'f-1',
            title: 'Guest checkout flow requires 1 extra click',
            severity: 'important',
            evidence:
              'Button selector #cta-guest-checkout triggers an optional modal before navigating to stripe redirect.',
            whyItMatters:
              'First-time purchasers drop off by 7% when presented with multi-step account creation prompts.',
            recommendedFix:
              'Directly open checkout modal without intermediate confirmation screen.',
          },
        ],
      },
      mobileCheck: {
        score: 84,
        status: 'Ready',
        findings: [
          {
            id: 'f-2',
            title: 'Hero CTA tap target is 38px on small screens',
            severity: 'important',
            evidence:
              'Calculated height on 375px viewport: 38px (fails 44px minimum target requirement).',
            whyItMatters:
              'Mobile users frequently mis-tap or experience friction on primary conversion buttons.',
            recommendedFix:
              'Increase vertical padding to py-3.5 to achieve minimum 44px height.',
          },
        ],
      },
      productClarity: {
        score: 80,
        status: 'Ready',
        findings: [
          {
            id: 'f-3',
            title: 'Value proposition contains internal technical jargon',
            severity: 'important',
            evidence:
              'Subheadline references "distributed vector indexing" rather than user benefits.',
            whyItMatters:
              'Non-technical visitors cannot immediately understand what problem the software solves.',
            recommendedFix:
              'Revise subheadline to focus on speed and search accuracy outcomes.',
          },
        ],
      },
      trustConversion: {
        score: 90,
        status: 'Ready',
        findings: [
          {
            id: 'f-4',
            title: 'Security badges and SSL indicators validated',
            severity: 'passed',
            evidence:
              'Valid certificates, transparent pricing breakdown, and privacy policy links present in footer.',
            whyItMatters:
              'Builds immediate credibility for first-time credit card entries.',
            recommendedFix: 'Maintain current placement and badge visibility.',
          },
        ],
      },
    },
    fixPlan: [
      { step: 1, title: 'Expand hero CTA tap target to 44px', category: 'Mobile Check', impact: 'High' },
      { step: 2, title: 'Simplify guest checkout to single-click transition', category: 'User Journey', impact: 'High' },
      { step: 3, title: 'Clarify hero subheadline value proposition', category: 'Product Clarity', impact: 'Medium' },
    ],
  },
  {
    id: 'rep-2',
    name: 'beta.launchproof.dev',
    url: 'https://beta.launchproof.dev',
    productType: 'Web App · Developer Tool',
    date: '12 Sep 2026 · 06:18 PM',
    score: 64,
    status: 'Needs Fix',
    blockersCount: 2,
    importantCount: 4,
    passedCount: 20,
    totalChecks: 26,
    verdict:
      'Critical blockers detected in mobile navigation and authentication redirect. Users cannot finish sign-in on Safari iOS.',
    categories: {
      userJourney: {
        score: 58,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-5',
            title: 'GitHub OAuth popup blocked on mobile browsers',
            severity: 'blocker',
            evidence:
              'Window.open called inside asynchronous promise handler without direct user gesture binding.',
            whyItMatters:
              '100% of mobile Safari users are unable to authenticate into the developer tool.',
            recommendedFix:
              'Switch to top-level redirect flow with state token instead of popup window.',
          },
        ],
      },
      mobileCheck: {
        score: 60,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-6',
            title: 'Horizontal viewport scrolling caused by code block overflow',
            severity: 'blocker',
            evidence:
              'Pre tag inside docs card has width: max-content; causing 62px horizontal scroll on mobile.',
            whyItMatters:
              'Renders the entire page layout skewed and broken for smartphone visitors.',
            recommendedFix:
              'Add overflow-x-auto and max-w-full to code container styles.',
          },
        ],
      },
      productClarity: {
        score: 72,
        status: 'Ready',
        findings: [
          {
            id: 'f-7',
            title: 'CLI installation instructions are clear and copyable',
            severity: 'passed',
            evidence:
              'npm i -g launchproof-cli command has one-click copy button with active feedback.',
            whyItMatters:
              'Reduces time-to-first-command for developer users.',
            recommendedFix: 'None required.',
          },
        ],
      },
      trustConversion: {
        score: 66,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-8',
            title: 'Pricing tier features lack breakdown for team limits',
            severity: 'important',
            evidence:
              'Team seat allowance is not mentioned on the pricing page comparison table.',
            whyItMatters:
              'Developers evaluating for company use hesitate to upgrade without seat counts.',
            recommendedFix:
              'Add explicit seat counts per tier to the pricing card comparison.',
          },
        ],
      },
    },
    fixPlan: [
      { step: 1, title: 'Fix GitHub OAuth redirect flow for mobile browsers', category: 'User Journey', impact: 'Blocker' },
      { step: 2, title: 'Prevent code block container from causing horizontal page scroll', category: 'Mobile Check', impact: 'Blocker' },
      { step: 3, title: 'Add seat limit disclosures to Pro and Team pricing tiers', category: 'Trust & Conversion', impact: 'Medium' },
    ],
  },
  {
    id: 'rep-3',
    name: 'shopdemo.com',
    url: 'https://shopdemo.com',
    productType: 'E-commerce · D2C',
    date: '8 Sep 2026 · 02:11 PM',
    score: 91,
    status: 'Ready',
    blockersCount: 0,
    importantCount: 1,
    passedCount: 28,
    totalChecks: 29,
    verdict:
      'Exceptional visual polish, rapid page load time (0.7s LCP), and flawless mobile responsive cart interaction.',
    categories: {
      userJourney: {
        score: 94,
        status: 'Ready',
        findings: [
          {
            id: 'f-9',
            title: 'Add-to-cart drawer animation is responsive and tactile',
            severity: 'passed',
            evidence:
              'Cart slides in under 120ms with subtotal, free shipping progress bar, and 1-tap checkout.',
            whyItMatters:
              'Maximizes conversion velocity and reduces cart abandonment.',
            recommendedFix: 'Keep as high-performing benchmark.',
          },
        ],
      },
      mobileCheck: {
        score: 92,
        status: 'Ready',
        findings: [
          {
            id: 'f-10',
            title: 'Product gallery swipe gestures work smoothly without lag',
            severity: 'passed',
            evidence:
              'Touch drag sensitivity calibrated; image lazy-loading maintains 60fps scrolling.',
            whyItMatters: 'Engages mobile shoppers visually.',
            recommendedFix: 'No action needed.',
          },
        ],
      },
      productClarity: {
        score: 88,
        status: 'Ready',
        findings: [
          {
            id: 'f-11',
            title: 'Size chart modal is slightly difficult to find',
            severity: 'important',
            evidence:
              'Size chart link has 12px font and low contrast color (#94a3b8) on white background.',
            whyItMatters:
              'Can lead to customer sizing hesitation or post-purchase return rates.',
            recommendedFix:
              'Darken text color to #475569 and add a small ruler icon.',
          },
        ],
      },
      trustConversion: {
        score: 93,
        status: 'Ready',
        findings: [
          {
            id: 'f-12',
            title: 'Verified customer reviews with photo proof prominently shown',
            severity: 'passed',
            evidence:
              'Over 140 verified buyer reviews rendered directly below product purchase box.',
            whyItMatters: 'Significantly increases first-time buyer trust.',
            recommendedFix: 'No action needed.',
          },
        ],
      },
    },
    fixPlan: [
      { step: 1, title: 'Improve visibility and contrast of size chart link', category: 'Product Clarity', impact: 'Low' },
    ],
  },
  {
    id: 'rep-4',
    name: 'startup-idea.vercel.app',
    url: 'https://startup-idea.vercel.app',
    productType: 'SaaS · Productivity',
    date: '5 Sep 2026 · 11:47 AM',
    score: 52,
    status: 'Needs Fix',
    blockersCount: 3,
    importantCount: 5,
    passedCount: 16,
    totalChecks: 24,
    verdict:
      'Incomplete landing page with non-functional waitlist signup form, broken mobile navigation menu, and missing favicon.',
    categories: {
      userJourney: {
        score: 45,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-13',
            title: 'Waitlist email submit button triggers 404 endpoint error',
            severity: 'blocker',
            evidence: 'POST to /api/waitlist returns HTTP 404 Route Not Found.',
            whyItMatters:
              'No visitor can join the product waitlist or register their interest.',
            recommendedFix:
              'Deploy the API route handler or connect to an Airtable/Formspree webhook.',
          },
        ],
      },
      mobileCheck: {
        score: 50,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-14',
            title: 'Mobile navigation hamburger button is unresponsive',
            severity: 'blocker',
            evidence:
              'onClick handler on #mobile-nav-toggle is null; menu never expands.',
            whyItMatters:
              'Mobile visitors cannot view Pricing, FAQ, or About links.',
            recommendedFix:
              'Attach state toggle to open the responsive drawer.',
          },
        ],
      },
      productClarity: {
        score: 55,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-15',
            title: 'No demo screenshot or video showing the actual product',
            severity: 'blocker',
            evidence:
              'Hero image uses generic abstract purple placeholder illustration.',
            whyItMatters:
              'Prospective users leave because they cannot visualize the software.',
            recommendedFix:
              'Replace placeholder with an annotated screenshot or 15-second product GIF.',
          },
        ],
      },
      trustConversion: {
        score: 58,
        status: 'Needs Fix',
        findings: [
          {
            id: 'f-16',
            title: 'Missing Privacy Policy and Contact details',
            severity: 'important',
            evidence:
              'Footer contains dead placeholder links href="#" for Terms and Privacy.',
            whyItMatters:
              'Spam filters and wary visitors distrust early landing pages without company identity.',
            recommendedFix:
              'Link to a simple standard Privacy Policy and founder email or Twitter/X.',
          },
        ],
      },
    },
    fixPlan: [
      { step: 1, title: 'Connect working waitlist submission API endpoint', category: 'User Journey', impact: 'Blocker' },
      { step: 2, title: 'Wire up mobile hamburger menu interaction', category: 'Mobile Check', impact: 'Blocker' },
      { step: 3, title: 'Add real product screenshot or demo clip', category: 'Product Clarity', impact: 'Blocker' },
      { step: 4, title: 'Add real Privacy Policy and contact email', category: 'Trust & Conversion', impact: 'Medium' },
    ],
  },
];

interface ReportsScreenProps {
  onNewCheck: () => void;
  onNavigate?: (screen: string) => void;
  reports?: ReportItem[];
}

export function ReportsScreen({ onNewCheck, reports }: ReportsScreenProps) {
  // Master list of reports (mock reports for prototype, or user reports if supplied)
  const [reportsList, setReportsList] = useState<ReportItem[]>(reports ?? MOCK_REPORTS);

  // Synchronize reports list when the parent supplies real Firestore reports
  useEffect(() => {
    if (reports) {
      setReportsList(reports);
    }
  }, [reports]);

  // Selected report for full drilldown view
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // State for share modal
  const [shareModalReport, setShareModalReport] = useState<ReportItem | null>(null);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Three-dot action menu tracking
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  // Toast feedback for copy action
  const [copyToast, setCopyToast] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    function handleGlobalClick() {
      setActiveCardMenuId(null);
    }
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Filtered reports calculation based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reportsList;
    const q = searchQuery.toLowerCase().trim();
    return reportsList.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        r.productType.toLowerCase().includes(q)
    );
  }, [reportsList, searchQuery]);

  // Handle deleting a report
  const handleDeleteReport = (id: string) => {
    setReportsList((prev) => prev.filter((r) => r.id !== id));
  };

  // Handle copying report link
  const handleCopyLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    }
  };

  // If a report is selected, show the detailed Result/Report screen
  if (selectedReport) {
    return (
      <DetailedReportView
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        onShare={(rep) => setShareModalReport(rep)}
        onRecheck={() => {
          if (onNewCheck) onNewCheck();
        }}
      />
    );
  }

  const hasReports = reportsList.length > 0;

  return (
    <div className="w-full px-5 pt-3 pb-20 flex flex-col select-none">
      {/* 1. SIMPLE HEADER (No All Time filter, No Demo State) */}
      <div className="mt-1 mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Reports
        </h1>
        <p className="text-slate-500 text-sm font-normal mt-1 leading-relaxed">
          Detailed insights from your product checks.
        </p>
      </div>

      {/* 2. ZERO REPORTS STATE (New User) */}
      {!hasReports ? (
        <div
          id="card-reports-zero-state"
          className="w-full bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center mt-2 transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#ebf4ff] text-[#0066ff] flex items-center justify-center mb-4 shadow-2xs">
            <FileText className="w-7 h-7 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight mb-1.5">
            No reports yet
          </h2>
          <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed mb-5 font-normal">
            Complete your first product check to generate your first report.
          </p>
          <button
            id="btn-empty-reports-new-check"
            onClick={onNewCheck}
            className="w-full sm:w-auto sm:min-w-[200px] py-3 px-6 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,102,255,0.2)] transition-all cursor-pointer text-sm sm:text-[15px]"
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
            <span>New Check</span>
          </button>
        </div>
      ) : (
        /* 3. POPULATED REPORTS STATE */
        <>
          {/* COMPACT SUMMARY (Replacing 4 large statistic cards) */}
          <div
            id="reports-compact-summary"
            className="flex items-baseline justify-between mb-3.5 px-1"
          >
            <div className="text-sm sm:text-[15px] font-bold text-slate-950 tracking-tight">
              12 reports
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">5 Ready</span>
              <span className="text-slate-300">·</span>
              <span className="text-amber-700 font-semibold">4 Needs Fix</span>
            </div>
          </div>

          {/* COMPACT SEARCH BAR */}
          <div className="mb-4">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="input-search-reports"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product or URL"
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-xs font-medium text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* SEARCH NO MATCHES */}
          {filteredReports.length === 0 ? (
            <div
              id="card-reports-no-search-results"
              className="w-full bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center text-center my-2"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <Search className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                No reports found
              </h3>
              <p className="text-xs text-slate-500 max-w-[240px] mb-3 font-normal">
                Try searching by a different product name or URL.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-[#0066ff] hover:underline cursor-pointer"
              >
                Reset search
              </button>
            </div>
          ) : (
            /* COMPACT REPORT CARDS (~15-20% more compact) */
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const isReady = report.status === 'Ready';
                const isMenuOpen = activeCardMenuId === report.id;

                return (
                  <div
                    key={report.id}
                    id={`report-card-${report.id}`}
                    className="w-full bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.025)] hover:border-slate-200 transition-all flex flex-col relative"
                  >
                    {/* Top Row: Domain / Category / Date & Score / Status */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Reduced Icon + Domain & Metadata */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="w-4 h-4 text-slate-500 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-[15px] font-bold text-slate-950 tracking-tight truncate leading-snug">
                            {report.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                            {report.productType}
                          </p>
                          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                            {report.date}
                          </p>
                        </div>
                      </div>

                      {/* Right: Score and Status */}
                      <div className="flex flex-col items-end shrink-0 pl-1">
                        <div className="text-base sm:text-[17px] font-black text-slate-950 tracking-tight leading-none">
                          {report.score}
                          <span className="text-xs text-slate-400 font-normal">/100</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                            isReady
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isReady ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5] text-emerald-600" />
                              <span>Ready</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 stroke-[2.5] text-rose-600" />
                              <span>Needs Fix</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Area: Primary "View Report →" + Secondary Three-Dot Menu */}
                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100/90">
                      <button
                        id={`btn-view-report-${report.id}`}
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 py-2 px-3 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-[13px] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>

                      {/* Three-Dot Menu Button & Dropdown */}
                      <div className="relative">
                        <button
                          id={`btn-card-menu-${report.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardMenuId(isMenuOpen ? null : report.id);
                          }}
                          aria-label="More options"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 w-36 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 origin-bottom-right sm:origin-top-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveCardMenuId(null);
                                setShareModalReport(report);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Share</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveCardMenuId(null);
                                handleCopyLink(report.url);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Link</span>
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveCardMenuId(null);
                                handleDeleteReport(report.id);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Copy Link Toast Feedback */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          Link copied to clipboard
        </div>
      )}

      {/* Share Report Sheet/Modal */}
      <ShareReportModal
        isOpen={!!shareModalReport}
        onClose={() => setShareModalReport(null)}
        report={
          shareModalReport
            ? {
                productName: shareModalReport.name,
                url: shareModalReport.url,
                slug: 'demo-123',
              }
            : null
        }
      />
    </div>
  );
}
