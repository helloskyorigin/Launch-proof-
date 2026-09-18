'use client';

import React, { useState } from 'react';
import { NewCheckInput } from './check/NewCheckInput';
import { ReviewCheckModal } from './check/ReviewCheckModal';
import { CheckingProgress } from './check/CheckingProgress';
import { CheckResultView } from './check/CheckResultView';
import { FindingDetailView } from './check/FindingDetailView';
import { FixPlanView, FixPlanItem } from './check/FixPlanView';
import { RecheckConfirmView } from './check/RecheckConfirmView';
import { CheckRecord, Finding } from '@/lib/checks/check-store';
import { useAuth } from '@/lib/firebase/context';
import { Compass, ArrowRight } from 'lucide-react';

interface NewCheckScreenProps {
  onBack: () => void;
  onCheckCompleted?: (checkData: any) => void;
  initialUrl?: string;
  isDemoMode?: boolean;
  onExitDemoToAuth?: () => void;
  onContinueDemo?: () => void;
}

type ScreenStage =
  | 'input'
  | 'review'
  | 'checking'
  | 'result'
  | 'finding_detail'
  | 'fix_plan'
  | 'recheck_confirm';

export function NewCheckScreen({
  onBack,
  onCheckCompleted,
  initialUrl = '',
  isDemoMode = false,
  onExitDemoToAuth,
  onContinueDemo,
}: NewCheckScreenProps) {
  const { getIdToken } = useAuth();
  const [stage, setStage] = useState<ScreenStage>('input');

  // Input states
  const [inputData, setInputData] = useState<{
    inputType: 'url' | 'screenshot';
    url: string;
    finalUrl?: string;
    checkId?: string;
    screenshotName?: string;
    screenshotPreview?: string;
    description: string;
    productType: 'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other';
  }>({
    inputType: 'url',
    url: initialUrl || '',
    description: '',
    productType: 'SaaS / Web App',
  });

  // Real Check Record from API
  const [checkRecord, setCheckRecord] = useState<CheckRecord | null>(null);

  // Active Finding for Detail View
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Fix Plan Tasks derived from real findings
  const [fixPlanTasks, setFixPlanTasks] = useState<FixPlanItem[]>([]);

  // If in Demo Mode, do NOT run real backend pipeline. Display Demo prompt:
  if (isDemoMode) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl sm:border sm:border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          Demo Mode
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Sign in to run real checks and save results.
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          You are currently in Demo Mode. Real audits require a signed-in account to allocate analysis workers and save reports.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            id="btn-demo-newcheck-signin"
            type="button"
            onClick={() => {
              if (onExitDemoToAuth) {
                onExitDemoToAuth();
              } else {
                onBack();
              }
            }}
            className="w-full h-11 px-4 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            id="btn-demo-newcheck-continue"
            type="button"
            onClick={() => {
              if (onContinueDemo) {
                onContinueDemo();
              } else {
                onBack();
              }
            }}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Continue Demo</span>
          </button>
        </div>
      </div>
    );
  }

  // 1. Submit from Input Screen -> Direct to Checking/Loading screen
  const handleInputSubmit = (submitted: {
    inputType: 'url' | 'screenshot';
    url: string;
    finalUrl?: string;
    checkId?: string;
    screenshotName?: string;
    screenshotPreview?: string;
    description: string;
    productType: 'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other';
  }) => {
    setInputData(submitted);
    if (submitted.checkId && typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', `/check/${submitted.checkId}`);
      } catch {
        // Safe fallback
      }
    }
    setStage('checking');
  };

  // 2. Confirm from Review -> Go to Checking
  const handleReviewConfirm = () => {
    setStage('checking');
  };

  // 3. Real Check Finishes -> Transition to Real Result View
  const handleCheckingComplete = (realCheck: CheckRecord) => {
    setCheckRecord(realCheck);

    // Derive real fix plan items from actual findings
    const tasks: FixPlanItem[] = (realCheck.findings || []).map((f, index) => ({
      id: `fix_${f.id}`,
      number: index + 1 < 10 ? `0${index + 1}` : `${index + 1}`,
      priority: (f.severity === 'blocker' ? 'Critical' : 'Important') as 'Critical' | 'Important',
      category: f.category,
      title: f.title,
      description: f.fix,
      completed: false,
    }));

    setFixPlanTasks(tasks);
    if (realCheck.findings && realCheck.findings.length > 0) {
      setSelectedFinding(realCheck.findings[0]);
    }

    setStage('result');

    if (onCheckCompleted) {
      onCheckCompleted(realCheck);
    }
  };

  // 4. Handle Finding Selection -> Open Detail
  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setStage('finding_detail');
  };

  // 5. Toggle Fix Plan from Finding Detail
  const handleToggleFindingInFixPlan = (findingId: string) => {
    if (!selectedFinding) return;

    setFixPlanTasks((prev) => {
      const exists = prev.some((task) => task.id === `fix_${findingId}`);
      if (exists) {
        return prev.filter((task) => task.id !== `fix_${findingId}`);
      } else {
        const newTask: FixPlanItem = {
          id: `fix_${findingId}`,
          number: `0${prev.length + 1}`,
          priority: selectedFinding.severity === 'blocker' ? 'Critical' : 'Important',
          category: selectedFinding.category,
          title: selectedFinding.title,
          description: selectedFinding.fix,
          completed: false,
        };
        return [...prev, newTask];
      }
    });
  };

  // 6. Toggle Task completion inside Fix Plan
  const handleToggleTaskCompleted = (taskId: string) => {
    setFixPlanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // 7. Start Re-Check Confirmation
  const handleStartRecheckConfirm = () => {
    setStage('recheck_confirm');
  };

  // 8. Run Re-Check -> Trigger API run and switch to checking progress
  const handleRunRecheck = async () => {
    if (checkRecord?.id) {
      try {
        const headers: Record<string, string> = {};
        if (getIdToken) {
          const token = await getIdToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
        await fetch(`/api/checks/${checkRecord.id}/run`, { method: 'POST', headers });
      } catch (err) {
        console.error('Failed to trigger re-check:', err);
      }
    }
    setStage('checking');
  };

  // Render view depending on stage
  switch (stage) {
    case 'input':
      return (
        <NewCheckInput
          initialUrl={inputData.url}
          onBack={onBack}
          onSubmit={handleInputSubmit}
        />
      );

    case 'review':
      return (
        <ReviewCheckModal
          data={inputData}
          onEdit={() => setStage('input')}
          onConfirm={handleReviewConfirm}
        />
      );

    case 'checking':
      return (
        <CheckingProgress
          checkId={inputData.checkId || checkRecord?.id}
          url={inputData.url}
          finalUrl={inputData.finalUrl || checkRecord?.finalUrl}
          productName={
            inputData.inputType === 'url'
              ? (inputData.finalUrl || inputData.url).replace(/^https?:\/\//, '').split('/')[0]
              : (inputData.screenshotName || 'Target Website')
          }
          isRecheck={Boolean(checkRecord)}
          onComplete={handleCheckingComplete}
          onBackToNewCheck={() => {
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/check/')) {
              try {
                window.history.pushState(null, '', '/');
              } catch {
                // Ignore
              }
            }
            setStage('input');
          }}
        />
      );

    case 'result':
      if (!checkRecord) {
        return (
          <CheckingProgress
            checkId={inputData.checkId}
            onComplete={handleCheckingComplete}
            onBackToNewCheck={() => setStage('input')}
          />
        );
      }
      return (
        <CheckResultView
          check={checkRecord}
          onBack={() => setStage('input')}
          onSelectFinding={handleSelectFinding}
          onViewFixPlan={() => setStage('fix_plan')}
          onStartRecheck={handleStartRecheckConfirm}
          onNewCheck={() => setStage('input')}
        />
      );

    case 'finding_detail':
      if (!selectedFinding) {
        return (
          <CheckResultView
            check={checkRecord!}
            onBack={() => setStage('input')}
            onSelectFinding={handleSelectFinding}
            onViewFixPlan={() => setStage('fix_plan')}
            onStartRecheck={handleStartRecheckConfirm}
            onNewCheck={() => setStage('input')}
          />
        );
      }
      return (
        <FindingDetailView
          finding={selectedFinding}
          targetUrl={checkRecord?.finalUrl || checkRecord?.url || inputData.url}
          onBack={() => setStage('result')}
          onAddToFixPlan={handleToggleFindingInFixPlan}
          onViewFixPlan={() => setStage('fix_plan')}
          isInFixPlan={fixPlanTasks.some((t) => t.id === `fix_${selectedFinding.id}`)}
        />
      );

    case 'fix_plan':
      return (
        <FixPlanView
          tasks={fixPlanTasks}
          onToggleTask={handleToggleTaskCompleted}
          onBack={() => setStage('result')}
          onStartRecheck={handleStartRecheckConfirm}
        />
      );

    case 'recheck_confirm':
      return (
        <RecheckConfirmView
          previousScore={checkRecord?.score ?? 0}
          productName={checkRecord?.finalUrl || checkRecord?.url || 'Target Website'}
          onBack={() => setStage('fix_plan')}
          onRunRecheck={handleRunRecheck}
        />
      );

    default:
      return null;
  }
}
