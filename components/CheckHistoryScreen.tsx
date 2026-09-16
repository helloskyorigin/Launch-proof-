'use client';

import React, { useState } from 'react';
import { Plus, FileText, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface CheckItem {
  id: string;
  url?: string;
  name?: string;
  date?: string;
  score?: number;
  status?: 'Ready' | 'Needs Fix' | 'Draft';
  blockersCount?: number;
  importantCount?: number;
}

interface CheckHistoryScreenProps {
  onNewCheck: () => void;
  checks?: CheckItem[];
  onSelectCheck?: (check: CheckItem) => void;
}

export function CheckHistoryScreen({
  onNewCheck,
  checks = [],
  onSelectCheck,
}: CheckHistoryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'needs-fix' | 'drafts'>('all');

  const hasChecks = checks.length > 0;

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'ready', label: 'Ready' },
    { id: 'needs-fix', label: 'Needs Fix' },
    { id: 'drafts', label: 'Drafts' },
  ] as const;

  const filteredChecks = checks.filter((check) => {
    if (activeFilter === 'ready') return check.status === 'Ready';
    if (activeFilter === 'needs-fix') return check.status === 'Needs Fix';
    if (activeFilter === 'drafts') return check.status === 'Draft';
    return true;
  });

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col animate-in fade-in duration-200 select-none">
      {/* 1. PAGE TITLE (Sits close to the header with clean spacing, no secondary paragraph) */}
      <div className="mb-3.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
          Check History
        </h1>
      </div>

      {/* 2. FILTER BAR (ONLY VISIBLE WHEN USER HAS 1+ CHECKS) */}
      {hasChecks && (
        <div
          id="history-filters"
          className="w-full bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 mb-3.5 select-none"
        >
          {filters.map((filter) => {
            const isSelected = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                id={`filter-tab-${filter.id}`}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-white text-[#0066ff] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. COMPACT EMPTY STATE CARD */}
      {!hasChecks ? (
        <div
          id="card-check-history-empty"
          className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-all"
        >
          {/* Subtle Document Icon */}
          <div className="w-11 h-11 rounded-xl bg-[#ebf4ff] flex items-center justify-center mb-3 text-[#0066ff] shadow-2xs">
            <FileText className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight mb-1">
            No checks yet
          </h2>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-4 max-w-[260px]">
            Your completed checks will appear here.
          </p>

          {/* Primary Action Button: + New Check */}
          <button
            id="btn-new-check-history"
            onClick={onNewCheck}
            className="w-full sm:w-auto min-h-[46px] py-2.5 px-5 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(0,102,255,0.22)] transition-all cursor-pointer text-xs sm:text-sm select-none"
          >
            <Plus className="w-4 h-4 stroke-[2.6]" />
            <span>New Check</span>
          </button>
        </div>
      ) : (
        /* 1+ CHECKS: REAL CHECK RECORDS LIST */
        <div className="space-y-3">
          {filteredChecks.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCheck && onSelectCheck(item)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-900 text-sm shrink-0">
                  {item.score ?? 80}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {item.name || item.url || 'Product Check'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.date || 'Recent'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    item.status === 'Ready'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {item.status === 'Ready' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                  )}
                  <span>{item.status || 'Ready'}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
