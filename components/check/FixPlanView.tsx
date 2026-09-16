'use client';

import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import { FixPlanItem } from '@/lib/checkMockData';

export interface FixPlanViewProps {
  tasks: FixPlanItem[];
  onToggleTask: (id: string) => void;
  onBack: () => void;
  onStartRecheck: () => void;
}

export function FixPlanView({
  tasks,
  onToggleTask,
  onBack,
  onStartRecheck,
}: FixPlanViewProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-14 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between h-10 mb-4">
        <button
          id="btn-back-fix-plan"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Fix Plan
        </span>

        <div className="w-12 text-right">
          <span className="text-xs font-bold text-[#0066ff]">
            {totalCount} fixes
          </span>
        </div>
      </div>

      {/* Main Heading & Subtext */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Fix Plan
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-[#0066ff]">
            {completedCount}/{totalCount} completed
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
          Focus on the changes that can improve first-user readiness.
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3 mb-6">
        {tasks.map((task) => {
          const isCritical = task.priority === 'Critical';

          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                task.completed
                  ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
                  : 'bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Number & Checkbox */}
                <div className="flex flex-col items-center pt-0.5 shrink-0">
                  <button
                    type="button"
                    aria-label={`Toggle fix ${task.title}`}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-[#0066ff]" />
                    )}
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-400 mt-1">
                    {task.number}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {task.category}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold text-slate-900 leading-snug ${
                      task.completed ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            Ready to test improvements?
          </h4>
          <p className="text-[11px] text-slate-500">
            LaunchProof will re-verify blockers and calculate your new score.
          </p>
        </div>

        <button
          id="btn-recheck-after-fixes"
          type="button"
          onClick={onStartRecheck}
          className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.4]" />
          <span>Re-check after fixes</span>
        </button>
      </div>
    </div>
  );
}
