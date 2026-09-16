'use client';

import React, { useEffect } from 'react';
import {
  X,
  Home,
  CirclePlus,
  Clock,
  BarChart3,
  CreditCard,
  Settings,
  CircleHelp,
  FileText,
} from 'lucide-react';
import { Logo } from './Logo';

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onOpenAccount?: () => void;
  reportCount?: number;
}

export function SlideDrawer({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  onOpenAccount,
  reportCount = 0,
}: SlideDrawerProps) {
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleItemClick = (screenId: string) => {
    onNavigate(screenId);
    onClose();
  };

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'new-check', label: 'New Check', icon: CirclePlus },
    { id: 'check-history', label: 'Check History', icon: Clock },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
  ];

  const supportItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: CircleHelp },
    { id: 'feedback', label: 'Feedback', icon: FileText },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Dark translucent backdrop */}
      <div
        id="drawer-backdrop"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-out Drawer Panel (80-85% mobile viewport width, max-w-[325px]) */}
      <div
        id="drawer-panel"
        className={`relative w-[82%] sm:w-[85%] max-w-[325px] h-full bg-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 1. TOP: LaunchProof Header & Tagline (Account profile block removed) */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <Logo size="md" />
              <p className="text-xs sm:text-[13px] text-slate-400 mt-1 font-normal tracking-tight">
                Test. Fix. Launch with confidence.
              </p>
            </div>
            <button
              id="btn-close-drawer"
              onClick={onClose}
              aria-label="Close navigation"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer -mt-1 -mr-2"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* 4. SCROLLABLE NAVIGATION AREA (Items moved up) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`drawer-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#ebf4ff] text-[#0066ff] font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#0066ff] stroke-[2.3]' : 'text-slate-500 stroke-[1.9]'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {/* 5. REMOVE FAKE REPORT COUNT: Only display count if real reports exist */}
                  {item.id === 'reports' && reportCount > 0 && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0066ff]">
                      {reportCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-3 mx-2" />

          {/* SUPPORT */}
          <div className="space-y-1">
            <p className="px-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Support
            </p>
            {supportItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`drawer-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#ebf4ff] text-[#0066ff] font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#0066ff] stroke-[2.3]' : 'text-slate-500 stroke-[1.9]'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. & 3. BOTTOM ACCOUNT AREA: Anchored at the bottom, old branding footer removed */}
        <div className="p-4 border-t border-slate-100 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            id="drawer-bottom-account"
            type="button"
            onClick={() => {
              if (onOpenAccount) {
                onOpenAccount();
                onClose();
              } else {
                handleItemClick('settings');
              }
            }}
            className="w-full flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[#ebf4ff] text-[#0066ff] font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
              S
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 truncate group-hover:text-[#0066ff] transition-colors">
                Satyam
              </div>
              <div className="text-xs text-slate-400 font-normal truncate">
                satyam@example.com
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
