'use client';

import React from 'react';
import { ArrowLeft, Globe, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ReviewCheckProps {
  data: {
    inputType: 'url' | 'screenshot';
    url: string;
    screenshotName?: string;
    screenshotPreview?: string;
    description: string;
    productType: string;
  };
  onEdit: () => void;
  onConfirm: () => void;
}

export function ReviewCheckModal({ data, onEdit, onConfirm }: ReviewCheckProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-2 pb-12 flex flex-col animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between h-10 mb-4">
        <button
          id="btn-back-review"
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit inputs</span>
        </button>

        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          Review
        </span>

        <div className="w-8" />
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Ready to check?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
          Verify details before starting the simulated first-user analysis.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-7 flex flex-col space-y-5">
        {/* Product Section */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Target Product
          </span>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0066ff] flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
              {data.inputType === 'url' ? (
                <Globe className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <ImageIcon className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-slate-950 truncate font-mono">
                {data.inputType === 'url' ? data.url : (data.screenshotName || 'Product Screenshot')}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                {data.description || 'General first-user readiness evaluation'}
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl border border-slate-100 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Product Type
            </span>
            <div className="text-xs font-bold text-slate-900">
              {data.productType}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-white">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Check Focus
            </span>
            <div className="text-xs font-bold text-[#0066ff]">
              First-user experience
            </div>
          </div>
        </div>

        {/* Small Scope Note */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
          <Sparkles className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
          <span>
            LaunchProof will review clarity, user journey, mobile experience, trust and technical issues.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-confirm-run-check"
            type="button"
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.25)] transition-all cursor-pointer"
          >
            <span>Run Check</span>
            <ArrowRight className="w-4 h-4 stroke-[2.3]" />
          </button>

          <button
            id="btn-edit-check-details"
            type="button"
            onClick={onEdit}
            className="h-12 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
