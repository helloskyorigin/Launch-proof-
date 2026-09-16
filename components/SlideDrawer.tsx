'use client';

import React, { useEffect } from 'react';
import {
  X,
  Home,
  Plus,
  Clock,
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
  userName?: string;
  userEmail?: string;
}

export function SlideDrawer({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  onOpenAccount,
  userName = 'Satyam',
  userEmail = 'satyam@example.com',
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

  const secondaryNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'check-history', label: 'Check History', icon: Clock },
    { id: 'pricing', label: 'Plans & Billing', icon: CreditCard },
  ];

  const supportNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: CircleHelp },
    { id: 'feedback', label: 'Feedback', icon: FileText },
  ];

  const isNewCheckActive = activeScreen === 'new-check';

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
        {/* 1. HEADER: LaunchProof Brand & Tagline with X Close Button */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 select-none">
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

        {/* 2. SCROLLABLE NAVIGATION AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 select-none">
          {/* PRIMARY ACTION: NEW CHECK (Strongest visual emphasis at top) */}
          <div className="mb-2">
            <button
              id="drawer-nav-new-check"
              onClick={() => handleItemClick('new-check')}
              className={`w-full min-h-[48px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer text-left ${
                isNewCheckActive
                  ? 'bg-[#0066ff] text-white shadow-[0_2px_12px_rgba(0,102,255,0.25)] ring-2 ring-[#0066ff]/20'
                  : 'bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white shadow-[0_2px_10px_rgba(0,102,255,0.2)]'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-white stroke-[2.8]" />
              </div>
              <span className="text-[15px] tracking-tight">New Check</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-2 mx-1" />

          {/* SECONDARY NAVIGATION: Home, Check History, Plans & Billing */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`drawer-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full min-h-[44px] flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#ebf4ff] text-[#0066ff] font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-[#0066ff] stroke-[2.3]' : 'text-slate-500 stroke-[1.9]'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-2.5 mx-1" />

          {/* SUPPORT SECTION */}
          <div className="space-y-1">
            <p className="px-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              SUPPORT
            </p>
            {supportNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`drawer-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full min-h-[44px] flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#ebf4ff] text-[#0066ff] font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-[#0066ff] stroke-[2.3]' : 'text-slate-500 stroke-[1.9]'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. BOTTOM ACCOUNT AREA */}
        <div className="p-4 border-t border-slate-100 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] select-none">
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
            className="w-full min-h-[46px] flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[#ebf4ff] text-[#0066ff] font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
              {userName ? userName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 truncate group-hover:text-[#0066ff] transition-colors">
                {userName}
              </div>
              <div className="text-xs text-slate-400 font-normal truncate">
                {userEmail}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
