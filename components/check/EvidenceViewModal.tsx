'use client';

import React, { useState } from 'react';
import {
  X,
  Monitor,
  Smartphone,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Check,
  Copy,
  Layers,
  Activity,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { CheckEvidence } from '@/lib/checks/check-store';

export interface EvidenceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  evidence?: CheckEvidence;
}

export function EvidenceViewModal({
  isOpen,
  onClose,
  targetUrl,
  evidence,
}: EvidenceViewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'desktop' | 'mobile' | 'raw'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const desktop = evidence?.desktop;
  const mobile = evidence?.mobile;

  const handleCopyRaw = () => {
    if (!evidence) return;
    navigator.clipboard?.writeText(JSON.stringify(evidence, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanUrl = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const httpStatus = desktop?.httpStatus || 200;
  const consoleErrorCount = desktop?.consoleErrors?.length || 0;
  const failedReqCount = desktop?.failedRequests?.length || 0;
  const isMobileOverflow = mobile?.horizontalOverflow ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl max-h-[85vh] bg-white rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100 shrink-0">
              <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-950">
                Observed Check Evidence
              </h2>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {cleanUrl}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence viewer"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2.5 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border-b-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-[#0066ff] text-[#0066ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Observed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`pb-2 px-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border-b-2 shrink-0 ${
              activeTab === 'desktop'
                ? 'border-[#0066ff] text-[#0066ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`pb-2 px-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border-b-2 shrink-0 ${
              activeTab === 'mobile'
                ? 'border-[#0066ff] text-[#0066ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`pb-2 px-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border-b-2 shrink-0 ${
              activeTab === 'raw'
                ? 'border-[#0066ff] text-[#0066ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs text-slate-700">
          {!evidence ? (
            <div className="py-12 text-center text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No Playwright evidence recorded for this check.</p>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Observed Page Environment
                </span>

                <div className="space-y-2 font-medium text-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Page rendered successfully (HTTP {httpStatus})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Desktop viewport: 1280 × 800 px</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Mobile viewport: 390 × 844 px</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMobileOverflow ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="text-rose-700 font-bold">
                          Horizontal scroll overflow detected on mobile
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>No horizontal overflow</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {failedReqCount > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-amber-800">
                          {failedReqCount} failed network request(s)
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>0 failed network requests</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {consoleErrorCount > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="text-rose-700 font-bold">
                          {consoleErrorCount} console error(s) logged
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>0 fatal console errors</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Need technical details?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Explore DOM elements, viewport snapshots, or raw JSON.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('desktop')}
                  className="text-xs font-bold text-[#0066ff] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <span>View technical evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : activeTab === 'desktop' ? (
            <div className="space-y-3">
              {/* HTTP Status & Network */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Server Response
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      HTTP Status: {desktop?.httpStatus || 200}
                    </span>
                  </div>
                  <div className="text-slate-400">·</div>
                  <div className="text-slate-600">
                    Viewport: 1280 × 800 px
                  </div>
                </div>
              </div>

              {/* Title & Meta */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Page Metadata
                </span>
                <div>
                  <span className="font-semibold text-slate-500 block text-[11px]">Page Title:</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {desktop?.title ? `"${desktop.title}"` : '(Empty or missing title tag)'}
                  </p>
                </div>
                {desktop?.metaDescription && (
                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Meta Description:</span>
                    <p className="text-slate-700 mt-0.5 text-xs italic">
                      &ldquo;{desktop.metaDescription}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Headings */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Headings ({desktop?.headings?.length || 0})
                </span>
                {desktop?.headings && desktop.headings.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {desktop.headings.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px] mt-0.5">H</span>
                        <span className="font-medium text-slate-800">{h}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No H1/H2 headings found on the page.</p>
                )}
              </div>

              {/* Interactive Elements */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Interactive Elements
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block">
                      {desktop?.buttons?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Buttons</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block">
                      {desktop?.links?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Links</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block">
                      {desktop?.forms?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Forms</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'mobile' ? (
            <div className="space-y-3">
              {/* Mobile Viewport & Overflow */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mobile Viewport & Overflow
                </span>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#0066ff]" />
                  <span className="font-semibold text-slate-800">
                    Tested on iPhone 13 (390 × 844 px)
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  {mobile?.horizontalOverflow ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold text-rose-700 block">
                          Horizontal scroll overflow detected!
                        </span>
                        <span className="text-[11px] text-rose-600">
                          Content width ({mobile.scrollWidth}px) exceeds viewport ({mobile.viewportWidth || 390}px).
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-medium">
                        No horizontal overflow detected. Content fits neatly within 390px.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Interactive */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mobile Interactive Tap Targets
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-sm font-bold text-slate-900 block">
                      {mobile?.buttons?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Mobile Buttons</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-sm font-bold text-slate-900 block">
                      {mobile?.links?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Mobile Links</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 font-mono">
                  JSON Check Evidence ({JSON.stringify(evidence).length} bytes)
                </span>
                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[45vh]">
                {JSON.stringify(evidence, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

