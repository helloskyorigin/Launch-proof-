'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  RotateCcw,
  ArrowLeft,
  Compass,
} from 'lucide-react';
import { CheckRecord, CheckStatus } from '@/lib/checks/check-store';
import { useAuth } from '@/lib/firebase/context';

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
  const { getIdToken } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<CheckStatus>('validating');
  const [checkData, setCheckData] = useState<CheckRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const runStartedRef = useRef(false);

  const startCheckRun = useCallback(async (id: string) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (getIdToken) {
        const token = await getIdToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      await fetch(`/api/checks/${id}/run`, { method: 'POST', headers });
    } catch (err) {
      console.error('[CheckingProgress] Failed to trigger check run:', err);
    }
  }, [getIdToken]);

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
          const headers: Record<string, string> = {};
          if (getIdToken) {
            const token = await getIdToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          }

          const res = await fetch(`/api/checks/${checkId}`, { headers });
          const data = await res.json();

          if (data.success && data.check) {
            const check: CheckRecord = data.check;
            setCheckData(check);
            setCurrentStatus(check.status);

            if (check.status === 'failed' || check.status === 'reasoning_failed') {
              setErrorMsg(check.error || "We couldn't finish loading the target website.");
              return; // Stop polling on failure
            }

            if (check.status === 'discovery_ready' || check.status === 'completed') {
              if (onComplete) {
                onComplete(check);
              }
              return; // Stop polling on discovery_ready or completed
            }
          }
        } catch {
          // Ignore transient polling fetch errors
        }

        if (isMounted) {
          pollTimer = setTimeout(poll, 1000);
        }
      };

      poll();
    }

    startAndPoll();

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [checkId, onComplete, getIdToken, startCheckRun]);

  // Handle Retry
  const handleRetry = async () => {
    if (!checkId) return;
    setIsRetrying(true);
    setErrorMsg(null);
    setCurrentStatus('validating');

    try {
      await startCheckRun(checkId);
      let isMounted = true;
      const poll = async () => {
        if (!isMounted) return;
        try {
          const headers: Record<string, string> = {};
          if (getIdToken) {
            const token = await getIdToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          }

          const res = await fetch(`/api/checks/${checkId}`, { headers });
          const data = await res.json();
          if (data.success && data.check) {
            setCheckData(data.check);
            setCurrentStatus(data.check.status);

            if (data.check.status === 'failed') {
              setErrorMsg(data.check.error || "We couldn't finish loading the target website.");
              setIsRetrying(false);
              return;
            }

            if (data.check.status === 'discovery_ready' || data.check.status === 'completed') {
              setIsRetrying(false);
              if (onComplete) onComplete(data.check);
              return;
            }
          }
        } catch {
          // Ignore
        }
        if (isMounted) setTimeout(poll, 1000);
      };
      poll();
    } catch {
      setErrorMsg("We couldn't finish loading the target website.");
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

  // User-facing Status Descriptions
  const getStatusDetails = (status: CheckStatus) => {
    switch (status) {
      case 'created':
      case 'validating':
      case 'ready_for_analysis':
        return {
          title: 'Validating website address...',
          desc: 'Verifying network accessibility and security requirements.',
        };
      case 'opening':
        return {
          title: 'Opening website...',
          desc: 'Loading page and establishing secure connection.',
        };
      case 'discovering':
        return {
          title: 'Mapping your experience...',
          desc: 'Understanding structure, buttons, navigation, and key user actions.',
        };
      case 'discovery_ready':
        return {
          title: 'Website Understood!',
          desc: 'Mapped interactive features and selected relevant tests.',
        };
      case 'checking_desktop':
      case 'checking_mobile':
      case 'collecting_evidence':
        return {
          title: 'Testing your experience...',
          desc: 'Checking important actions and responsive layout across viewports.',
        };
      case 'checks_ready':
      case 'reasoning':
      case 'reasoning_complete':
        return {
          title: 'Preparing your report...',
          desc: 'Synthesizing evidence and computing launch readiness.',
        };
      case 'completed':
        return {
          title: 'Audit Complete!',
          desc: 'Your launch readiness evaluation and proof are ready.',
        };
      case 'failed':
      case 'reasoning_failed':
        return {
          title: "Couldn't complete testing",
          desc: errorMsg || "We couldn't finish loading the target website.",
        };
      default:
        return {
          title: 'Testing your product...',
          desc: 'Understanding website structure and interactive features.',
        };
    }
  };

  const { title: statusTitle, desc: statusDesc } = getStatusDetails(currentStatus);

  // User-facing progress tracker steps
  const steps = [
    {
      id: 'step_validation',
      label: 'Validating address',
      isDone: ['opening', 'discovering', 'discovery_ready', 'checking_desktop', 'checking_mobile', 'collecting_evidence', 'checks_ready', 'reasoning', 'reasoning_complete', 'completed'].includes(currentStatus),
      isActive: ['created', 'validating', 'ready_for_analysis'].includes(currentStatus),
    },
    {
      id: 'step_browser',
      label: 'Opening website',
      isDone: ['discovering', 'discovery_ready', 'checking_desktop', 'checking_mobile', 'collecting_evidence', 'checks_ready', 'reasoning', 'reasoning_complete', 'completed'].includes(currentStatus),
      isActive: currentStatus === 'opening',
    },
    {
      id: 'step_discovery',
      label: 'Mapping your experience',
      isDone: ['discovery_ready', 'checking_desktop', 'checking_mobile', 'collecting_evidence', 'checks_ready', 'reasoning', 'reasoning_complete', 'completed'].includes(currentStatus),
      isActive: currentStatus === 'discovering',
    },
    {
      id: 'step_adaptive_tests',
      label: 'Testing important actions',
      isDone: ['checks_ready', 'reasoning', 'reasoning_complete', 'completed'].includes(currentStatus),
      isActive: ['checking_desktop', 'checking_mobile', 'collecting_evidence'].includes(currentStatus),
    },
    {
      id: 'step_reasoning',
      label: 'Preparing your report',
      isDone: currentStatus === 'completed',
      isActive: ['checks_ready', 'reasoning', 'reasoning_complete'].includes(currentStatus),
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
              <Compass className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
            {isRecheck ? 'RE-CHECKING YOUR PRODUCT' : 'UNDERSTANDING YOUR PRODUCT'}
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
            {displayTarget}
          </h1>
        </div>

        {/* Failed State Card */}
        {currentStatus === 'failed' ? (
          <div className="my-2 p-5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-center space-y-3">
            <h2 className="text-sm font-bold text-rose-900">
              Couldn&apos;t open this website
            </h2>
            <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
              {errorMsg || "We couldn't finish loading the target website."}
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
                <span>Try again</span>
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
            {/* Active Status Display */}
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

            {/* Pipeline Progression Steps */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Website Discovery Pipeline
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
