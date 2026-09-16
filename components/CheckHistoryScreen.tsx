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
    <div className="w-full px-5 pt-3 pb-24 flex flex-col animate-in fade-in duration-200 select-none">
      {/* 1. HEADER */}
      <div className="mt-1 mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Check History
        </h1>
        <p className="text-slate-500 text-sm font-normal mt-1 leading-relaxed">
          All your product checks in one place.
        </p>
      </div>

      {/* 2. FILTER BAR (ONLY VISIBLE WHEN USER HAS 1+ CHECKS) */}
      {hasChecks && (
        <div
          id="history-filters"
          className="w-full bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 mb-5 select-none"
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

      {/* 3. ZERO-DATA EMPTY STATE CARD (Compact, ~20-25% shorter, focused) */}
      {!hasChecks ? (
        <div
          id="card-check-history-empty"
          className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center transition-all"
        >
          {/* Refined Document Icon Container */}
          <div className="w-14 h-14 rounded-2xl bg-[#ebf4ff] flex items-center justify-center mb-4 text-[#0066ff] shadow-2xs">
            <FileText className="w-7 h-7 stroke-[2]" aria-hidden="true" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-950 tracking-tight mb-1.5">
            No checks yet
          </h2>

          {/* Description */}
          <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed mb-5 font-normal">
            Run your first product check to see your results here.
          </p>

          {/* Primary Action Button: + New Check */}
          <button
            id="btn-new-check-history"
            onClick={onNewCheck}
            className="w-full sm:w-auto sm:min-w-[200px] py-3 px-6 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,102,255,0.2)] transition-all cursor-pointer text-sm sm:text-[15px]"
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
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
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 hover:border-slate-200 transition-all cursor-pointer"
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

      {/* Intentional whitespace below - No tips, no filler */}
    </div>
  );
}
