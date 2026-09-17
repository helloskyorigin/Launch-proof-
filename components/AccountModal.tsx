'use client';

import React, { useEffect, useRef } from 'react';
import { X, User, Settings, Shield, LogOut, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/lib/firebase/context';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export function AccountModal({ isOpen, onClose, onNavigate }: AccountModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.displayName || profile?.name || user?.email?.split('@')[0] || 'Founder';
  const displayEmail = user?.email || profile?.email || 'founder@launchproof.com';
  const initial = displayName.charAt(0).toUpperCase() || 'F';
  const planName = profile?.plan === 'pro' ? 'Pro Plan' : profile?.plan === 'pro_plus' ? 'Pro Plus Plan' : 'Free Starter Plan';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    onClose();
    onNavigate('landing');
  };

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#0066ff]" />
            <h3 className="text-base font-bold text-slate-900">Account & Profile</h3>
          </div>
          <button
            id="btn-close-account-modal"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#ebf4ff] text-[#0066ff] font-bold text-lg flex items-center justify-center border border-blue-100 shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">{displayName}</h4>
            <p className="text-xs text-slate-500 font-mono truncate">{displayEmail}</p>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
              <Check className="w-3 h-3" />
              <span>{planName}</span>
            </div>
          </div>
        </div>

        {/* Quick Account Navigation Items */}
        <div className="mt-4 space-y-1.5">
          <button
            onClick={() => {
              onClose();
              onNavigate('settings');
            }}
            className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Workspace Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('pricing');
            }}
            className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 text-sm font-medium">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Upgrade to Pro Plan</span>
            </div>
            <span className="text-xs font-semibold text-[#0066ff]">View Plans</span>
          </button>
        </div>

        <div className="border-t border-slate-100 my-4" />

        {/* Sign Out Action */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
