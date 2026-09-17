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

interface NewCheckScreenProps {
  onBack: () => void;
  onCheckCompleted?: (checkData: any) => void;
  initialUrl?: string;
}

type ScreenStage =
  | 'input'
  | 'review'
  | 'checking'
  | 'result'
  | 'finding_detail'
  | 'fix_plan'
  | 'recheck_confirm';

export function NewCheckScreen({ onBack, onCheckCompleted, initialUrl = '' }: NewCheckScreenProps) {
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
        await fetch(`/api/checks/${checkRecord.id}/run`, { method: 'POST' });
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
