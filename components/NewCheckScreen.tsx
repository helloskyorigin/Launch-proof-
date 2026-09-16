'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface NewCheckScreenProps {
  onBack: () => void;
  onCheckCompleted?: (checkData: any) => void;
  initialUrl?: string;
}

export function NewCheckScreen({ onBack, onCheckCompleted, initialUrl }: NewCheckScreenProps) {
  const [productUrl, setProductUrl] = useState(initialUrl || 'https://myawesomeproduct.com');
  const [selectedPreset, setSelectedPreset] = useState<'full' | 'ux' | 'mobile'>('full');
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<any | null>(null);

  const steps = [
    'Connecting to product endpoint...',
    'Analyzing mobile layout & responsive viewports...',
    'Testing form submissions and checkout workflows...',
    'Evaluating copy clarity & CTAs...',
    'Computing LaunchProof readiness score...',
  ];

  const handleStartCheck = () => {
    setIsRunning(true);
    setResult(null);
    setStepIndex(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStepIndex(currentStep);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        const checkResult = {
          id: `chk_${Date.now()}`,
          name: productUrl.replace(/^https?:\/\//, '').split('/')[0] || 'My Product',
          url: productUrl,
          score: 94,
          status: 'Ready',
          date: 'Just now',
          issuesCount: 1,
          passedChecks: 28,
        };
        setResult(checkResult);
        if (onCheckCompleted) {
          onCheckCompleted(checkResult);
        }
      }
    }, 600);
  };

  return (
    <div className="w-full px-5 pt-2 pb-12 flex flex-col">
      {/* Back button & Page title */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 -ml-2 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          New Check
        </span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Configure Check
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Inspect your product before real users or customers see it.
        </p>
      </div>

      {/* Main Form Card */}
      {!result ? (
        <div className="w-full bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col">
          {/* Target URL Input */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Product or Staging URL
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://yourapp.com"
                disabled={isRunning}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all"
              />
            </div>
          </div>

          {/* Audit Type Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Check Profile
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedPreset('full')}
                disabled={isRunning}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedPreset === 'full'
                    ? 'border-[#0066ff] bg-blue-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedPreset === 'full'
                      ? 'bg-[#0066ff] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Full Launch Audit</div>
                  <div className="text-xs text-slate-400 truncate">
                    Covers UX, broken flows, speed, mobile & SEO
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('ux')}
                disabled={isRunning}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedPreset === 'ux'
                    ? 'border-[#0066ff] bg-blue-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedPreset === 'ux'
                      ? 'bg-[#0066ff] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Fast Smoke Test</div>
                  <div className="text-xs text-slate-400 truncate">
                    High-priority conversion blockers & forms
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('mobile')}
                disabled={isRunning}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  selectedPreset === 'mobile'
                    ? 'border-[#0066ff] bg-blue-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedPreset === 'mobile'
                      ? 'bg-[#0066ff] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Mobile Polish</div>
                  <div className="text-xs text-slate-400 truncate">
                    Viewport overflow, tap targets & font sizing
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Running progress view */}
          {isRunning ? (
            <div className="w-full bg-blue-50/60 border border-blue-100 rounded-2xl p-5 mb-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0066ff] flex items-center justify-center mx-auto mb-3 animate-spin">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Checking Product
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {steps[stepIndex]}
              </p>
              <div className="w-full bg-blue-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-[#0066ff] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Submit button */}
          <button
            id="btn-run-check"
            type="button"
            onClick={handleStartCheck}
            disabled={isRunning || !productUrl.trim()}
            className="w-full py-4 px-6 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_22px_rgba(0,102,255,0.22)] transition-all cursor-pointer text-[15px]"
          >
            <span>{isRunning ? 'Running Check...' : 'Start Check →'}</span>
          </button>
        </div>
      ) : (
        /* Result Card */
        <div className="w-full bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 stroke-[2]" />
          </div>

          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Ready to Launch
          </span>

          <h2 className="text-3xl font-black text-slate-950 tracking-tight">
            94<span className="text-lg text-slate-400 font-normal">/100</span>
          </h2>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {result.name}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Tested on {new Date().toLocaleDateString()}
          </p>

          <div className="w-full grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-medium text-slate-400">Passed Checks</p>
              <p className="text-lg font-bold text-slate-900">28 / 29</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-medium text-slate-400">Minor Issues</p>
              <p className="text-lg font-bold text-amber-600">1 fix needed</p>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <button
              onClick={onBack}
              className="w-full py-3.5 px-6 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,102,255,0.22)] transition-all cursor-pointer text-sm"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setResult(null);
                setIsRunning(false);
              }}
              className="w-full py-3 px-6 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Run Another Check</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
