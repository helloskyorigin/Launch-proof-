'use client';

import React, { useState } from 'react';
import { NewCheckInput } from './check/NewCheckInput';
import { ReviewCheckModal } from './check/ReviewCheckModal';
import { CheckingProgress } from './check/CheckingProgress';
import { CheckResultView } from './check/CheckResultView';
import { FindingDetailView } from './check/FindingDetailView';
import { FixPlanView } from './check/FixPlanView';
import { RecheckConfirmView } from './check/RecheckConfirmView';
import {
  CheckData,
  Finding,
  FixPlanItem,
  INITIAL_MOCK_CHECK,
  RECHECKED_MOCK_CHECK,
} from '@/lib/checkMockData';

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
  | 'recheck_confirm'
  | 'recheck_checking';

export function NewCheckScreen({ onBack, onCheckCompleted, initialUrl = '' }: NewCheckScreenProps) {
  const [stage, setStage] = useState<ScreenStage>('input');

  // Input states
  const [inputData, setInputData] = useState<{
    inputType: 'url' | 'screenshot';
    url: string;
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

  // Current Check Data
  const [checkData, setCheckData] = useState<CheckData>(() => {
    const formattedUrl = initialUrl || 'https://yourproduct.com';
    const domainName = formattedUrl.replace(/^https?:\/\//, '').split('/')[0] || 'yourproduct.com';
    return {
      ...INITIAL_MOCK_CHECK,
      url: formattedUrl,
      name: domainName,
    };
  });

  // Active Finding for Detail View
  const [selectedFinding, setSelectedFinding] = useState<Finding>(INITIAL_MOCK_CHECK.blockers[0]);

  // Fix Plan Tasks
  const [fixPlanTasks, setFixPlanTasks] = useState<FixPlanItem[]>(INITIAL_MOCK_CHECK.fixPlan);

  // 1. Submit from Input Screen -> Direct to Checking/Loading screen
  const handleInputSubmit = (submitted: {
    inputType: 'url' | 'screenshot';
    url: string;
    screenshotName?: string;
    screenshotPreview?: string;
    description: string;
    productType: 'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other';
  }) => {
    setInputData(submitted);
    setStage('checking');
  };

  // 2. Confirm from Review -> Go to Checking
  const handleReviewConfirm = () => {
    setStage('checking');
  };

  // 3. Checking Simulation Finishes -> Transition to Result
  const handleCheckingComplete = () => {
    const productName = inputData.inputType === 'url'
      ? (inputData.url.replace(/^https?:\/\//, '').split('/')[0] || 'yourproduct.com')
      : (inputData.screenshotName || 'Product Screenshot');

    const newCheck: CheckData = {
      ...INITIAL_MOCK_CHECK,
      id: `chk_${Date.now()}`,
      inputType: inputData.inputType,
      url: inputData.url,
      name: productName,
      screenshotName: inputData.screenshotName,
      screenshotPreview: inputData.screenshotPreview,
      description: inputData.description || 'Product clarity & first-user testing',
      productType: inputData.productType,
      date: 'Just now',
    };

    setCheckData(newCheck);
    setFixPlanTasks(newCheck.fixPlan);
    setStage('result');

    if (onCheckCompleted) {
      onCheckCompleted(newCheck);
    }
  };

  // 4. Handle Finding Selection -> Open Detail
  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setStage('finding_detail');
  };

  // 5. Toggle Fix Plan from Finding Detail
  const handleToggleFindingInFixPlan = (findingId: string) => {
    setFixPlanTasks((prev) => {
      const exists = prev.some((task) => task.id === `fix_${findingId}`);
      if (exists) {
        return prev.filter((task) => task.id !== `fix_${findingId}`);
      } else {
        const newTask: FixPlanItem = {
          id: `fix_${findingId}`,
          number: `0${prev.length + 1}`,
          priority: selectedFinding.severity as 'Critical' | 'Important',
          category: selectedFinding.category,
          title: selectedFinding.title,
          description: selectedFinding.whatToFix,
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

  // 8. Run Re-Check -> Go to Recheck Checking
  const handleRunRecheck = () => {
    setStage('recheck_checking');
  };

  // 9. Recheck Simulation Complete -> Show Updated Result with Comparison
  const handleRecheckComplete = () => {
    const productName = inputData.inputType === 'url'
      ? (inputData.url.replace(/^https?:\/\//, '').split('/')[0] || 'myawesomeproduct.com')
      : (inputData.screenshotName || 'Product Screenshot');

    const updatedCheck: CheckData = {
      ...RECHECKED_MOCK_CHECK,
      id: `chk_re_${Date.now()}`,
      inputType: inputData.inputType,
      url: inputData.url,
      name: productName,
      description: inputData.description,
      productType: inputData.productType,
      date: 'Just now',
    };

    setCheckData(updatedCheck);
    setFixPlanTasks(updatedCheck.fixPlan);
    setStage('result');

    if (onCheckCompleted) {
      onCheckCompleted(updatedCheck);
    }
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
          productName={
            inputData.inputType === 'url'
              ? inputData.url.replace(/^https?:\/\//, '')
              : (inputData.screenshotName || 'screenshot.png')
          }
          isRecheck={false}
          onComplete={handleCheckingComplete}
        />
      );

    case 'result':
      return (
        <CheckResultView
          checkData={checkData}
          onBack={() => setStage('input')}
          onSelectFinding={handleSelectFinding}
          onViewFixPlan={() => setStage('fix_plan')}
          onStartRecheck={handleStartRecheckConfirm}
          onNewCheck={() => setStage('input')}
        />
      );

    case 'finding_detail':
      return (
        <FindingDetailView
          finding={selectedFinding}
          targetUrl={checkData.url}
          onBack={() => setStage('result')}
          onAddToFixPlan={handleToggleFindingInFixPlan}
          onViewFixPlan={() => setStage('fix_plan')}
          isInFixPlan={fixPlanTasks.some((t) => t.title === selectedFinding.title || t.id === `fix_${selectedFinding.id}`)}
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
          previousScore={checkData.score}
          productName={checkData.name}
          onBack={() => setStage('fix_plan')}
          onRunRecheck={handleRunRecheck}
        />
      );

    case 'recheck_checking':
      return (
        <CheckingProgress
          productName={checkData.name}
          isRecheck={true}
          onComplete={handleRecheckComplete}
        />
      );

    default:
      return null;
  }
}
