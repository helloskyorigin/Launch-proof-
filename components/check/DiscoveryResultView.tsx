'use client';

import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  MinusCircle,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Layers,
  ShieldCheck,
  Compass,
  ArrowLeft,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
  FileText,
} from 'lucide-react';
import { WebsiteDiscoveryResult, DiscoverySignalStatus } from '@/lib/checks/discovery-types';
import { CheckRecord } from '@/lib/checks/check-store';
import Image from 'next/image';

interface DiscoveryResultViewProps {
  check: CheckRecord;
  discovery?: WebsiteDiscoveryResult;
  onBack?: () => void;
  onRecheck?: () => void;
  onContinueTesting?: () => void;
}

export function DiscoveryResultView({
  check,
  discovery: propDiscovery,
  onBack,
  onRecheck,
  onContinueTesting,
}: DiscoveryResultViewProps) {
  const discovery = propDiscovery || check.discovery;
  const [showDetails, setShowDetails] = useState(false);
  const [showAllCapabilities, setShowAllCapabilities] = useState(false);

  if (!discovery) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 text-center my-8">
        <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Discovery Information Not Available</h2>
        <p className="text-xs text-slate-500 mt-1">
          Website discovery data could not be loaded for this check.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const { page, navigation, actions, capabilities, trustSignals, mobile, summary } = discovery;

  // Render neutral status badge (NO red for not_detected)
  const renderStatusBadge = (status?: DiscoverySignalStatus) => {
    switch (status) {
      case 'detected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Detected</span>
          </span>
        );
      case 'not_detected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-medium">
            <MinusCircle className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Not Detected</span>
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200/60 text-[11px] font-medium">
            <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Unknown</span>
          </span>
        );
    }
  };

  const safeCapabilities = capabilities || ({} as Partial<WebsiteDiscoveryResult['capabilities']>);
  const safeTrustSignals = trustSignals || ({} as Partial<WebsiteDiscoveryResult['trustSignals']>);
  const safeActions = actions || { buttons: [], primaryCtaCandidates: [], forms: [], inputs: [] };
  const safeNavigation = navigation || { links: [], internalLinks: [], externalLinks: [], internalLinkCount: 0, externalLinkCount: 0, status: 'unknown' as const };
  const safeSummary = summary || { title: 'Website discovered', items: [], detectedCount: 0, notDetectedCount: 0 };
  const safeMobile = mobile || {
    load: 'not_detected' as const,
    visibleContent: 'unknown' as const,
    horizontalOverflow: 'unknown' as const,
    importantNavigationPresent: 'unknown' as const,
    viewportWidth: 390,
    scrollWidth: 390,
  };

  const defaultCap = { status: 'unknown' as const };

  const capabilityList = [
    { key: 'signup', label: 'Sign Up / Registration', data: safeCapabilities.signup || defaultCap },
    { key: 'login', label: 'Login / Authentication', data: safeCapabilities.login || defaultCap },
    { key: 'logout', label: 'Log Out / Sign Out', data: safeCapabilities.logout || defaultCap },
    { key: 'pricing', label: 'Pricing & Plans', data: safeCapabilities.pricing || defaultCap },
    { key: 'checkout', label: 'Checkout & Payment', data: safeCapabilities.checkout || defaultCap },
    { key: 'cart', label: 'Shopping Cart / Bag', data: safeCapabilities.cart || defaultCap },
    { key: 'onboarding', label: 'Onboarding & Setup Guide', data: safeCapabilities.onboarding || defaultCap },
    { key: 'dashboard', label: 'App / Dashboard Area', data: safeCapabilities.dashboard || defaultCap },
    { key: 'appWorkspace', label: 'Workspace / Studio', data: safeCapabilities.appWorkspace || defaultCap },
    { key: 'projectCreation', label: 'Project / Item Creation', data: safeCapabilities.projectCreation || defaultCap },
    { key: 'search', label: 'Search Interface', data: safeCapabilities.search || defaultCap },
    { key: 'upload', label: 'File Upload & Drag-Drop', data: safeCapabilities.upload || defaultCap },
    { key: 'contact', label: 'Contact & Sales Inquiries', data: safeCapabilities.contact || defaultCap },
    { key: 'support', label: 'Support & Help Center', data: safeCapabilities.support || defaultCap },
    { key: 'documentation', label: 'Documentation & API Docs', data: safeCapabilities.documentation || defaultCap },
    { key: 'accountProfile', label: 'User Account & Profile Settings', data: safeCapabilities.accountProfile || defaultCap },
    { key: 'passwordReset', label: 'Password Reset & Recovery', data: safeCapabilities.passwordReset || defaultCap },
  ];

  const trustSignalList = [
    { key: 'privacy', label: 'Privacy Policy', data: safeTrustSignals.privacy || defaultCap },
    { key: 'terms', label: 'Terms of Service', data: safeTrustSignals.terms || defaultCap },
    { key: 'refund', label: 'Refund & Cancellation Policy', data: safeTrustSignals.refund || defaultCap },
    { key: 'security', label: 'Security & Compliance (SOC2 / GDPR)', data: safeTrustSignals.security || defaultCap },
    { key: 'about', label: 'About Us / Company Story', data: safeTrustSignals.about || defaultCap },
    { key: 'contact', label: 'Contact Information', data: safeTrustSignals.contact || defaultCap },
    { key: 'pricing', label: 'Transparent Pricing Details', data: safeTrustSignals.pricing || defaultCap },
    { key: 'support', label: 'Customer Support Channels', data: safeTrustSignals.support || defaultCap },
  ];

  const displayedCapabilities = showAllCapabilities ? capabilityList : capabilityList.slice(0, 8);
  const internalLinksList = safeNavigation.internalLinks || [];
  const allLinksList = safeNavigation.links || [];
  const primaryCtas = safeActions.primaryCtaCandidates || [];
  const buttonsList = safeActions.buttons || [];
  const formsList = safeActions.forms || [];

  // Factual concise discovered signals (only what actually exists)
  const positiveSignals: string[] = [];
  positiveSignals.push('1 page inspected');

  if (safeMobile.load === 'detected') {
    positiveSignals.push('Mobile experience detected');
  }
  if (allLinksList.length > 0 || internalLinksList.length > 0) {
    positiveSignals.push('Navigation mapped');
  }
  if (primaryCtas.length > 0 || buttonsList.length > 0) {
    positiveSignals.push('Interactive actions mapped');
  }
  if (formsList.length > 0) {
    positiveSignals.push(`${formsList.length} form${formsList.length === 1 ? '' : 's'} detected`);
  }
  if (safeMobile.horizontalOverflow === 'not_detected') {
    positiveSignals.push('No horizontal overflow detected');
  }

  const targetHost = page.finalUrl
    ? page.finalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : check.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066ff] border border-blue-100 text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Phase 1 Discovery Ready</span>
          </div>
        </div>

        {onRecheck && (
          <button
            onClick={onRecheck}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run</span>
          </button>
        )}
      </div>

      {/* Main Website Understood Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-7 mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            WEBSITE UNDERSTOOD
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug mb-1">
          {targetHost}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
          ShipScan mapped the parts of your website that matter for testing.
        </p>

        {/* Factual Signals List */}
        <div className="space-y-2 py-3 border-y border-slate-100">
          {positiveSignals.map((signal, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{signal}</span>
            </div>
          ))}
        </div>

        {/* Collapsible Details Toggle Button */}
        <div className="mt-4 pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066ff] hover:text-[#0055d4] cursor-pointer"
          >
            <span>{showDetails ? 'Hide discovery details' : 'View discovery details'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {page.responseTimeMs && (
            <span className="text-[11px] text-slate-400 font-mono">
              Response: {page.responseTimeMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Collapsible Detailed Discovery Inventory (Informational only) */}
      {showDetails && (
        <div className="space-y-5 mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Discovered Capabilities Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0066ff]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Product Capabilities Inventory
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {safeSummary.detectedCount} Detected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Discovered features and interactive pathways. Items marked &quot;Not Detected&quot; are informational and carry zero score penalty.
            </p>

            <div className="divide-y divide-slate-100 text-xs">
              {displayedCapabilities.map((item) => (
                <div key={item.key} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    {item.data.evidence?.text && (
                      <span className="text-[11px] text-slate-400 font-mono ml-2 truncate inline-block max-w-[200px]">
                        &quot;{item.data.evidence.text}&quot;
                      </span>
                    )}
                  </div>
                  <div className="shrink-0">{renderStatusBadge(item.data.status)}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAllCapabilities(!showAllCapabilities)}
                className="text-xs font-semibold text-[#0066ff] hover:text-[#0055d4] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllCapabilities ? 'Show Less' : `View All ${capabilityList.length} Capabilities`}</span>
                {showAllCapabilities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Trust Signals Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Trust & Transparency Signals
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Buyer assurance, policies, terms, and contact channels.
            </p>

            <div className="divide-y divide-slate-100 text-xs">
              {trustSignalList.map((item) => (
                <div key={item.key} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <div className="shrink-0">{renderStatusBadge(item.data.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation & Actions Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Discovered Interactive Structure
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Links</span>
                <span className="text-base font-black text-slate-900">{allLinksList.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Buttons</span>
                <span className="text-base font-black text-slate-900">{buttonsList.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Primary CTAs</span>
                <span className="text-base font-black text-slate-900">{primaryCtas.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Forms</span>
                <span className="text-base font-black text-slate-900">{formsList.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What ShipScan Found Section */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 mb-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
          WHAT SHIPSCAN FOUND
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Discovery is complete. ShipScan mapped your website structure and is ready to test the relevant parts of your experience.
        </p>
      </div>

      {/* Next Actions Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onContinueTesting ? (
          <button
            type="button"
            onClick={onContinueTesting}
            className="w-full sm:flex-1 h-12 px-6 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer"
          >
            <span>Continue Testing</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        ) : onRecheck ? (
          <button
            type="button"
            onClick={onRecheck}
            className="w-full sm:flex-1 h-12 px-6 rounded-xl bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,102,255,0.2)] transition-all cursor-pointer"
          >
            <span>Run ShipScan Again</span>
            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          </button>
        ) : null}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto h-12 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Test Another URL</span>
          </button>
        )}
      </div>
    </div>
  );
}
