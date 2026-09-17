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

export interface FixPlanItem {
  id: string;
  number: string;
  priority: 'Critical' | 'Important';
  category: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface FixPlanViewProps {
  tasks: FixPlanItem[];
  onToggleTask: (id: string) => void;
  onBack: () => void;
  onStartRecheck?: () => void;
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

        <div className="w-16 text-right">
          <span className="text-xs font-bold text-[#0066ff]">
            {totalCount} {totalCount === 1 ? 'fix' : 'fixes'}
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
          Focus on these actionable fixes to elevate your first-user readiness.
        </p>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900 mb-1">No pending fixes!</h2>
          <p className="text-xs text-slate-500">No critical or important fixes required.</p>
        </div>
      ) : (
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
                  {/* Checkbox */}
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
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {task.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <h2
                      className={`text-sm font-bold leading-snug transition-all ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-950'
                      }`}
                    >
                      {task.title}
                    </h2>

                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        task.completed ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button
          id="btn-return-results-fix-plan"
          type="button"
          onClick={onBack}
          className="w-full sm:flex-1 h-12 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.25)] transition-all cursor-pointer"
        >
          <span>Back to Results</span>
        </button>

        {onStartRecheck && (
          <button
            id="btn-recheck-fix-plan"
            type="button"
            onClick={onStartRecheck}
            className="w-full sm:w-auto h-12 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-check Now</span>
          </button>
        )}
      </div>
    </div>
  );
}
