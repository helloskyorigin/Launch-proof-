'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Globe, Link2 } from 'lucide-react';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    productName: string;
    url: string;
    slug?: string;
  } | null;
}

export function ShareReportModal({ isOpen, onClose, report }: ShareReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const shareUrl = `launchproof.app/report/${report.slug || report.productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="share-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ebf4ff] flex items-center justify-center text-[#0066ff]">
              <Link2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Share Report
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {report.productName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Anyone with this link can view the complete LaunchProof findings, evidence screenshots, and fix roadmap for this check.
          </p>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Public report link
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <Globe className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-800 focus:outline-none select-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="btn-copy-share-link"
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0066ff] hover:bg-[#0055d4] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              id="btn-close-share-dialog"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
