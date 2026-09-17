'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { CheckRecord, CheckStatus } from '@/lib/checks/check-store';

export interface CheckingProgressProps {
  checkId?: string;
  url?: string;
  finalUrl?: string;
  productName?: string;
  isRecheck?: boolean;
  onBackToNewCheck?: () => void;
  onComplete?: (check: CheckRecord) => void;
}

export function CheckingProgress({
  checkId,
  url,
  finalUrl,
  productName,
  isRecheck = false,
  onBackToNewCheck,
  onComplete,
}: CheckingProgressProps) {
  const [currentStatus, setCurrentStatus] = useState<CheckStatus>('opening');
  const [checkData, setCheckData] = useState<CheckRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const runStartedRef = useRef(false);

  const startCheckRun = async (id: string) => {
    try {
      await fetch(`/api/checks/${id}/run`, { method: 'POST' });
    } catch (err) {
      console.error('[CheckingProgress] Failed to trigger check run:', err);
    }
  };

  // Poll check status
  useEffect(() => {
    if (!checkId) return;

    let isMounted = true;
    let pollTimer: NodeJS.Timeout | null = null;

    async function startAndPoll() {
      if (!runStartedRef.current) {
        runStartedRef.current = true;
        await startCheckRun(checkId!);
      }

      const poll = async () => {
        if (!isMounted) return;

        try {
          const res = await fetch(`/api/checks/${checkId}`);
          const data = await res.json();

          if (data.success && data.check) {
            const check: CheckRecord = data.check;
            setCheckData(check);
            setCurrentStatus(check.status);

            if (check.status === 'failed' || check.status === 'reasoning_failed') {
              setErrorMsg(check.error || check.aiError || "We couldn't complete the website check. Please try again.");
              return; // Stop polling on failure
            }

            if (check.status === 'checks_ready') {
              // Trigger reasoning Phase 4 automatically from UI
              if (!isMounted) return;
              fetch(`/api/checks/${checkId}/reason`, { method: 'POST' }).catch(() => {});
            }

            if (check.status === 'reasoning_complete') {
              // Trigger scoring Phase 5 automatically from UI
              if (!isMounted) return;
              fetch(`/api/checks/${checkId}/score`, { method: 'POST' }).catch(() => {});
            }

            if (check.status === 'completed') {
              if (onComplete) {
                onComplete(check);
              }
              return; // Stop polling on completed
            }
          }
        } catch {
          // Ignore transient polling fetch errors
        }

        if (isMounted) {
          pollTimer = setTimeout(poll, 1200);
        }
      };

      poll();
    }

    startAndPoll();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [checkId, onComplete]);

  // Handle Retry
  const handleRetry = async () => {
    if (!checkId) return;
    setIsRetrying(true);
    setErrorMsg(null);
    setCurrentStatus('opening');

    try {
      await startCheckRun(checkId);
      // Restart polling
      let isMounted = true;
      const poll = async () => {
        if (!isMounted) return;
        try {
          const res = await fetch(`/api/checks/${checkId}`);
          const data = await res.json();
          if (data.success && data.check) {
            setCheckData(data.check);
            setCurrentStatus(data.check.status);

            if (data.check.status === 'failed' || data.check.status === 'reasoning_failed') {
              setErrorMsg(data.check.error || data.check.aiError || "We couldn't complete the website check.");
              setIsRetrying(false);
              return;
            }

            if (data.check.status === 'checks_ready') {
              if (!isMounted) return;
              fetch(`/api/checks/${checkId}/reason`, { method: 'POST' }).catch(() => {});
            }

            if (data.check.status === 'reasoning_complete') {
              if (!isMounted) return;
              fetch(`/api/checks/${checkId}/score`, { method: 'POST' }).catch(() => {});
            }

            if (data.check.status === 'completed') {
              setIsRetrying(false);
              if (onComplete) onComplete(data.check);
              return;
            }
          }
        } catch {
          // Ignore
        }
        if (isMounted) setTimeout(poll, 1200);
      };
      poll();
    } catch {
      setErrorMsg('Failed to restart check.');
      setIsRetrying(false);
    }
  };

  const displayTarget =
    productName ||
    checkData?.finalUrl ||
    checkData?.url ||
    finalUrl ||
    url ||
    'Target Website';

  // Real Status Descriptions (No fake percentages)
  const getStatusDetails = (status: CheckStatus) => {
    switch (status) {
      case 'created':
        return {
          title: 'Preparing check...',
          desc: 'Initializing check session and security parameters.',
        };
      case 'validating':
        return {
          title: 'Validating website address...',
          desc: 'Verifying DNS resolution and network accessibility.',
        };
      case 'opening':
        return {
          title: 'Launching headless browser...',
          desc: 'Opening Playwright browser instance and navigating to target.',
        };
      case 'checking_desktop':
        return {
          title: 'Inspecting desktop page layout...',
          desc: 'Evaluating navigation, DOM structure, headers, and console signals.',
        };
      case 'checking_mobile':
        return {
          title: 'Testing mobile responsiveness...',
          desc: 'Checking iPhone viewport scaling, tap targets, and horizontal overflow.',
        };
      case 'collecting_evidence':
        return {
          title: 'Collecting DOM & layout evidence...',
          desc: 'Cataloging headlines, forms, interactive buttons, and assets.',
        };
      case 'evidence_ready':
        return {
          title: 'Evidence collection complete...',
          desc: 'Preparing raw evidence for deterministic evaluation.',
        };
      case 'checks_ready':
        return {
          title: 'Running deterministic check rules...',
          desc: 'Evaluating 25+ automated UX, product clarity, and technical rules.',
        };
      case 'reasoning':
      case 'findings_ready':
        return {
          title: 'Synthesizing first-user findings with AI...',
          desc: 'Analyzing user journey friction, clarity, and generating exact fixes.',
        };
      case 'completed':
        return {
          title: 'Check completed!',
          desc: 'Readiness score and recommendations calculated.',
        };
      case 'failed':
        return {
          title: 'Check failed',
          desc: errorMsg || 'Encountered an issue verifying the website.',
        };
      default:
        return {
          title: 'Checking website...',
          desc: 'Inspecting page content and technical signals.',
        };
    }
  };

  const { title: statusTitle, desc: statusDesc } = getStatusDetails(currentStatus);

  // Pipeline step tracker
  const steps = [
    {
      id: 'step_validation',
      label: 'Target Validation',
      isDone: ['opening', 'checking_desktop', 'checking_mobile', 'collecting_evidence', 'evidence_ready', 'checks_ready', 'reasoning', 'findings_ready', 'completed', 'reasoning_complete'].includes(currentStatus),
      isActive: ['created', 'validating'].includes(currentStatus),
    },
    {
      id: 'step_browser',
      label: 'Browser Navigation',
      isDone: ['checking_desktop', 'checking_mobile', 'collecting_evidence', 'evidence_ready', 'checks_ready', 'reasoning', 'findings_ready', 'completed', 'reasoning_complete'].includes(currentStatus),
      isActive: currentStatus === 'opening',
    },
    {
      id: 'step_evidence',
      label: 'Desktop & Mobile Capture',
      isDone: ['evidence_ready', 'checks_ready', 'reasoning', 'findings_ready', 'completed', 'reasoning_complete'].includes(currentStatus),
      isActive: ['checking_desktop', 'checking_mobile', 'collecting_evidence'].includes(currentStatus),
    },
    {
      id: 'step_checks',
      label: 'Deterministic Rules',
      isDone: ['reasoning', 'findings_ready', 'completed', 'reasoning_complete'].includes(currentStatus),
      isActive: currentStatus === 'checks_ready',
    },
    {
      id: 'step_ai',
      label: 'AI Reasoning & Scoring',
      isDone: ['completed', 'reasoning_complete'].includes(currentStatus),
      isActive: ['reasoning', 'findings_ready'].includes(currentStatus),
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-16 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-200">
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col">
        {/* Top Header Icon */}
        <div className="flex items-center justify-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100 shadow-2xs">
            {currentStatus === 'failed' ? (
              <AlertTriangle className="w-6 h-6 text-rose-600 stroke-[2.2]" />
            ) : (
              <Globe className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
            {isRecheck ? 'RE-CHECKING YOUR PRODUCT' : 'CHECKING YOUR PRODUCT'}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
            {displayTarget}
          </h1>
        </div>

        {/* Failed State Card */}
        {currentStatus === 'failed' ? (
          <div className="my-2 p-5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-center space-y-3">
            <h2 className="text-sm font-bold text-rose-900">
              Unable to Complete Check
            </h2>
            <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
              {errorMsg || "We couldn't connect to this website or verify its pages. The server may be unreachable or rejecting connections."}
            </p>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isRetrying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Retry Check</span>
              </button>

              {onBackToNewCheck && (
                <button
                  type="button"
                  onClick={onBackToNewCheck}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Try Another URL</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Active Status Display (No fake progress %) */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/80 mb-6 flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                <Loader2 className="w-5 h-5 text-[#0066ff] animate-spin stroke-[2.4]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {statusTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">
                  {statusDesc}
                </p>
              </div>
            </div>

            {/* Real Pipeline Progression Steps */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Execution Pipeline
              </span>

              {steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2.5">
                    {step.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : step.isActive ? (
                      <Loader2 className="w-4 h-4 text-[#0066ff] animate-spin shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`font-medium ${
                        step.isDone
                          ? 'text-slate-900 font-semibold'
                          : step.isActive
                          ? 'text-[#0066ff] font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      step.isDone
                        ? 'text-emerald-700'
                        : step.isActive
                        ? 'text-[#0066ff]'
                        : 'text-slate-300'
                    }`}
                  >
                    {step.isDone ? 'Completed' : step.isActive ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Back Link */}
        {onBackToNewCheck && currentStatus !== 'failed' && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onBackToNewCheck}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel & return to URL input</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
