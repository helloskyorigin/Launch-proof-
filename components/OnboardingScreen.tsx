'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/firebase/context';

interface OnboardingScreenProps {
  userName?: string;
  userEmail?: string;
  onComplete: () => void;
}

export function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const { completeOnboarding } = useAuth();
  // Step state: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Stored selections for back/forward persistence (preserved across navigation)
  const [buildingType, setBuildingType] = useState<string | null>(null);
  const [productStage, setProductStage] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState<string | null>(null);

  // Timer ref to prevent overlapping auto-transitions
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen 1 Options (What are you building?)
  const buildingOptions = [
    'SaaS / Web App',
    'Mobile App',
    'AI Product',
    'E-commerce',
    'Other',
  ];

  // Screen 2 Options (Where is your product right now?)
  const stageOptions = [
    'Still building',
    'Almost ready',
    'Ready for first users',
    'Already launched',
  ];

  // Screen 3 Options (What should LaunchProof focus on?)
  const focusOptions = [
    'First-time user experience',
    'Product clarity',
    'Mobile experience',
    'Trust & conversion',
    'Everything',
  ];

  // Auto-next handlers for Screen 1 & Screen 2
  const handleSelectBuilding = (option: string) => {
    if (isNavigating) return;
    setBuildingType(option);
    setIsNavigating(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      setStep(2);
    }, 190);
  };

  const handleSelectStage = (option: string) => {
    if (isNavigating) return;
    setProductStage(option);
    setIsNavigating(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      setStep(3);
    }, 190);
  };

  // Screen 3: User selects an option, enabling the Continue button (no auto-navigate)
  const handleSelectFocus = (option: string) => {
    if (isNavigating || isSettingUp) return;
    setFocusArea(option);
  };

  // Screen 3 Continue click: transitions to workspace setup/loading state, then to Home
  const handleContinueScreen3 = async () => {
    if (!focusArea || isNavigating || isSettingUp) return;
    setIsNavigating(true);
    setIsSettingUp(true);

    try {
      await completeOnboarding({
        buildingType: buildingType || undefined,
        productStage: productStage || undefined,
        focusArea: focusArea || undefined,
        skipped: false,
      });
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      onComplete();
    }, 1250);
  };

  // Skip handler: immediately exits onboarding and navigates to Home
  const handleSkip = async () => {
    if (isSettingUp) return;
    try {
      await completeOnboarding({ skipped: true });
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onComplete();
  };

  // Back handler: navigate to previous step while preserving stored choices
  const handleBack = () => {
    if (isSettingUp) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsNavigating(false);
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP / LOADING SCREEN (1–1.5s minimal transition)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isSettingUp) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center px-4 py-8 antialiased selection:bg-[#0066ff] selection:text-white">
        <div className="w-full max-w-[390px] flex flex-col items-center text-center animate-in fade-in duration-300 motion-reduce:animate-none">
          {/* LaunchProof Logo */}
          <div className="w-12 h-12 rounded-xl bg-[#0066ff] text-white flex items-center justify-center font-black text-2xl shadow-2xs mb-5 select-none">
            L
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-2">
            Setting up your workspace…
          </h2>

          {/* Supporting text */}
          <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed max-w-[280px] mb-7">
            Getting things ready for your first check.
          </p>

          {/* Subtle lightweight loading indicator */}
          <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0066ff] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between items-center px-4 py-5 sm:py-8 antialiased selection:bg-[#0066ff] selection:text-white">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CONSISTENT HEADER (STEPS 1, 2, 3)
          Balanced 3-column layout ensures centered logo
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[390px] flex items-center justify-between h-10 mb-2">
        {/* Left Column: Back button on steps 2 & 3, invisible spacer on step 1 */}
        <div className="w-16 flex items-center">
          {step > 1 ? (
            <button
              id="btn-onboarding-back"
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-full h-8" aria-hidden="true" />
          )}
        </div>

        {/* Center Column: LaunchProof Brand Identity */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-5 h-5 rounded bg-[#0066ff] text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
            L
          </div>
          <span className="font-extrabold text-slate-950 text-sm tracking-tight">
            LaunchProof
          </span>
        </div>

        {/* Right Column: Skip Action */}
        <div className="w-16 flex items-center justify-end">
          <button
            id="btn-onboarding-skip"
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 py-1.5 px-2 -mr-2 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CENTERED ONBOARDING CARD
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[390px] my-auto flex flex-col">
        {/* 3-Segment Progress Indicator */}
        <div className="mb-4 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5 w-full mr-4">
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                step >= 1 ? 'bg-[#0066ff]' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                step >= 2 ? 'bg-[#0066ff]' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                step >= 3 ? 'bg-[#0066ff]' : 'bg-slate-200'
              }`}
            />
          </div>
          <span className="shrink-0 text-[11px] font-bold text-slate-400 tracking-wider">
            {step} / 3
          </span>
        </div>

        {/* Card Content Surface */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col justify-between transition-all">
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SCREEN 1: What are you building?
             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 1 && (
            <div
              key="step-1"
              className="animate-in fade-in slide-in-from-right-2 duration-200 motion-reduce:animate-none flex flex-col"
            >
              <div className="mb-4 text-left">
                <span className="text-[11px] font-bold text-[#0066ff] uppercase tracking-wider block mb-1">
                  LET&apos;S GET YOUR CHECKS RIGHT
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  What are you building?
                </h1>
              </div>

              <div className="space-y-2">
                {buildingOptions.map((option, idx) => {
                  const isSelected = buildingType === option;
                  return (
                    <button
                      key={option}
                      id={`option-building-${idx}`}
                      type="button"
                      onClick={() => handleSelectBuilding(option)}
                      className={`w-full text-left py-3 px-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer select-none active:scale-[0.99] ${
                        isSelected
                          ? 'bg-[#f0f6ff] border-[#0066ff] text-slate-950 font-semibold'
                          : 'bg-white border-slate-200/90 text-slate-800 font-medium hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="pr-2 truncate">{option}</span>
                      
                      {/* Filled Blue Radio Indicator */}
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-[#0066ff] border-[#0066ff]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SCREEN 2: Where is your product right now?
             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 2 && (
            <div
              key="step-2"
              className="animate-in fade-in slide-in-from-right-2 duration-200 motion-reduce:animate-none flex flex-col"
            >
              <div className="mb-4 text-left">
                <span className="text-[11px] font-bold text-[#0066ff] uppercase tracking-wider block mb-1">
                  CURRENT STAGE
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Where is your product right now?
                </h1>
              </div>

              <div className="space-y-2.5">
                {stageOptions.map((option, idx) => {
                  const isSelected = productStage === option;
                  return (
                    <button
                      key={option}
                      id={`option-stage-${idx}`}
                      type="button"
                      onClick={() => handleSelectStage(option)}
                      className={`w-full text-left py-3 px-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer select-none active:scale-[0.99] ${
                        isSelected
                          ? 'bg-[#f0f6ff] border-[#0066ff] text-slate-950 font-semibold'
                          : 'bg-white border-slate-200/90 text-slate-800 font-medium hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="pr-2 truncate">{option}</span>
                      
                      {/* Filled Blue Radio Indicator */}
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-[#0066ff] border-[#0066ff]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SCREEN 3: What should LaunchProof focus on?
             ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {step === 3 && (
            <div
              key="step-3"
              className="animate-in fade-in slide-in-from-right-2 duration-200 motion-reduce:animate-none flex flex-col"
            >
              <div className="mb-4 text-left">
                <span className="text-[11px] font-bold text-[#0066ff] uppercase tracking-wider block mb-1">
                  AUDIT FOCUS
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  What should LaunchProof focus on?
                </h1>
              </div>

              <div className="space-y-2">
                {focusOptions.map((option, idx) => {
                  const isSelected = focusArea === option;
                  return (
                    <button
                      key={option}
                      id={`option-focus-${idx}`}
                      type="button"
                      onClick={() => handleSelectFocus(option)}
                      className={`w-full text-left py-3 px-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer select-none active:scale-[0.99] ${
                        isSelected
                          ? 'bg-[#f0f6ff] border-[#0066ff] text-slate-950 font-semibold'
                          : 'bg-white border-slate-200/90 text-slate-800 font-medium hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="pr-2 truncate">{option}</span>
                      
                      {/* Filled Blue Radio Indicator */}
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-[#0066ff] border-[#0066ff]'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explicit Continue Button on Screen 3 */}
              <button
                id="btn-onboarding-continue"
                type="button"
                disabled={!focusArea || isNavigating || isSettingUp}
                onClick={handleContinueScreen3}
                className={`w-full mt-4 h-11 sm:h-12 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all select-none ${
                  focusArea && !isNavigating && !isSettingUp
                    ? 'bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white shadow-[0_2px_8px_rgba(0,102,255,0.2)] cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SUBTLE FOOTER TAGLINE
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[390px] text-center pt-3 pb-1 select-none">
        <p className="text-[11px] text-slate-400 font-medium">
          LaunchProof · Test. Fix. Launch with confidence.
        </p>
      </div>
    </div>
  );
}
