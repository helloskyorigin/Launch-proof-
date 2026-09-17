'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckingProgress } from '@/components/check/CheckingProgress';
import { CheckResultView } from '@/components/check/CheckResultView';
import { FindingDetailView } from '@/components/check/FindingDetailView';
import { FixPlanView, FixPlanItem } from '@/components/check/FixPlanView';
import { RecheckConfirmView } from '@/components/check/RecheckConfirmView';
import { Header } from '@/components/Header';
import { SlideDrawer } from '@/components/SlideDrawer';
import { AccountModal } from '@/components/AccountModal';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { CheckRecord, Finding } from '@/lib/checks/check-store';

type PageStage = 'checking' | 'result' | 'finding_detail' | 'fix_plan' | 'recheck_confirm';

export default function CheckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [check, setCheck] = useState<CheckRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<PageStage>('checking');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [fixPlanTasks, setFixPlanTasks] = useState<FixPlanItem[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Derive fix plan items from real findings
  const syncFixPlan = (findings: Finding[]) => {
    const tasks: FixPlanItem[] = (findings || []).map((f, index) => ({
      id: `fix_${f.id}`,
      number: index + 1 < 10 ? `0${index + 1}` : `${index + 1}`,
      priority: (f.severity === 'blocker' ? 'Critical' : 'Important') as 'Critical' | 'Important',
      category: f.category,
      title: f.title,
      description: f.fix,
      completed: false,
    }));
    setFixPlanTasks(tasks);
  };

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function fetchCheck() {
      try {
        setLoading(true);
        const res = await fetch(`/api/checks/${id}`);
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.success && data.check) {
          const record: CheckRecord = data.check;
          setCheck(record);
          syncFixPlan(record.findings || []);

          if (record.status === 'completed' || record.status === 'reasoning_complete') {
            setStage('result');
          } else {
            setStage('checking');
          }
        } else {
          setError(data?.error?.message || 'Check not found.');
        }
      } catch {
        if (isMounted) {
          setError('Failed to load check details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCheck();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCheckingComplete = (completedCheck: CheckRecord) => {
    setCheck(completedCheck);
    syncFixPlan(completedCheck.findings || []);
    if (completedCheck.findings && completedCheck.findings.length > 0) {
      setSelectedFinding(completedCheck.findings[0]);
    }
    setStage('result');
  };

  const handleToggleTaskCompleted = (taskId: string) => {
    setFixPlanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

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

  const handleRunRecheck = async () => {
    if (check?.id) {
      try {
        await fetch(`/api/checks/${check.id}/run`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to trigger re-check:', err);
      }
    }
    setStage('checking');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 flex flex-col items-center">
      <div className="w-full max-w-md sm:max-w-lg min-h-screen flex flex-col relative">
        <Header
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenAccount={() => setAccountModalOpen(true)}
          onNavigate={(screenId) => {
            router.push(`/?screen=${screenId}`);
          }}
          currentScreen="new-check"
        />

        <main className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-[#0066ff] animate-spin mb-3 stroke-[2.4]" />
              <p className="text-xs font-semibold text-slate-500">Loading check...</p>
            </div>
          ) : error || !check ? (
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center my-auto">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5 stroke-[2.3]" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Check Not Found</h2>
              <p className="text-xs text-slate-500 mb-4">{error || 'This check does not exist or has expired.'}</p>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to LaunchProof</span>
              </button>
            </div>
          ) : stage === 'checking' ? (
            <CheckingProgress
              checkId={check.id}
              url={check.url}
              finalUrl={check.finalUrl}
              productName={check.url.replace(/^https?:\/\//, '').split('/')[0]}
              onComplete={handleCheckingComplete}
              onBackToNewCheck={() => router.push('/')}
            />
          ) : stage === 'finding_detail' && selectedFinding ? (
            <FindingDetailView
              finding={selectedFinding}
              targetUrl={check.finalUrl || check.url}
              onBack={() => setStage('result')}
              onAddToFixPlan={handleToggleFindingInFixPlan}
              onViewFixPlan={() => setStage('fix_plan')}
              isInFixPlan={fixPlanTasks.some((t) => t.id === `fix_${selectedFinding.id}`)}
            />
          ) : stage === 'fix_plan' ? (
            <FixPlanView
              tasks={fixPlanTasks}
              onToggleTask={handleToggleTaskCompleted}
              onBack={() => setStage('result')}
              onStartRecheck={() => setStage('recheck_confirm')}
            />
          ) : stage === 'recheck_confirm' ? (
            <RecheckConfirmView
              previousScore={check.score ?? 0}
              productName={check.finalUrl || check.url}
              onBack={() => setStage('result')}
              onRunRecheck={handleRunRecheck}
            />
          ) : (
            <CheckResultView
              check={check}
              onBack={() => router.push('/')}
              onSelectFinding={(finding) => {
                setSelectedFinding(finding);
                setStage('finding_detail');
              }}
              onViewFixPlan={() => setStage('fix_plan')}
              onStartRecheck={() => setStage('recheck_confirm')}
              onNewCheck={() => router.push('/')}
            />
          )}
        </main>

        <SlideDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeScreen="new-check"
          onNavigate={(screenId) => {
            setDrawerOpen(false);
            router.push(`/?screen=${screenId}`);
          }}
          onOpenAccount={() => {
            setDrawerOpen(false);
            setAccountModalOpen(true);
          }}
          reportCount={0}
        />

        <AccountModal
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          onNavigate={(screenId) => {
            setAccountModalOpen(false);
            router.push(`/?screen=${screenId}`);
          }}
        />
      </div>
    </div>
  );
}
