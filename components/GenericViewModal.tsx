'use client';

import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  Send,
} from 'lucide-react';

interface GenericViewModalProps {
  screenId: string;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function GenericViewModal({ screenId, onBack, onNavigate }: GenericViewModalProps) {
  return (
    <div className="w-full px-5 pt-2 pb-12 flex flex-col">
      {/* Back button */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 -ml-2 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider capitalize">
          {screenId.replace('-', ' ')}
        </span>
      </div>

      {screenId === 'reports' && (
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
            Reports
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Detailed insights and audit breakdowns across all your checks.
          </p>

          <div className="w-full bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#ebf4ff] flex items-center justify-center mb-4 text-[#0066ff]">
              <BarChart3 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No reports yet
            </h2>
            <p className="text-slate-500 text-sm max-w-[260px] mb-6">
              Reports are generated automatically once you run your first product check.
            </p>
            <button
              onClick={() => onNavigate('new-check')}
              className="py-3.5 px-6 bg-[#0066ff] hover:bg-[#0055d4] text-white font-semibold rounded-2xl text-sm transition-all shadow-[0_6px_20px_rgba(0,102,255,0.22)] cursor-pointer"
            >
              Start a Check →
            </button>
          </div>
        </div>
      )}

      {screenId === 'feedback' && (
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
            Send Feedback
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Tell us how we can make LaunchProof better for your launches.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4">
            <textarea
              rows={4}
              placeholder="What feature would make LaunchProof a 10/10 for your product?"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 placeholder:text-slate-400"
            />
            <button
              onClick={onBack}
              className="w-full py-3.5 bg-[#0066ff] hover:bg-[#0055d4] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Feedback</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
