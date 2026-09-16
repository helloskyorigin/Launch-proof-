'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, MoreVertical, Sparkles, Settings, HelpCircle, RotateCcw } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenAccount?: () => void;
  showThreeDots?: boolean;
  onNavigate?: (screen: string) => void;
  onResetChecks?: () => void;
  currentScreen?: string;
}

export function Header({
  onOpenDrawer,
  onOpenAccount,
  showThreeDots = true,
  onNavigate,
  onResetChecks,
  currentScreen = 'home',
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close contextual menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="relative w-full flex items-center justify-between px-5 pt-4 pb-3 z-30 select-none">
      {/* Left: Hamburger menu */}
      <button
        id="btn-hamburger"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-slate-800 hover:bg-slate-100/80 active:scale-95 transition-all cursor-pointer"
      >
        <Menu className="w-6 h-6 stroke-[2.2]" />
      </button>

      {/* Center: Brand Logo */}
      <div className="flex-1 flex items-center pl-2">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="cursor-pointer text-left"
          aria-label="LaunchProof Home"
        >
          <Logo size="md" />
        </button>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-1">
        {/* Three-dot contextual action button (Home screen feature) */}
        {showThreeDots && (
          <div className="relative" ref={menuRef}>
            <button
              id="btn-context-menu"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              aria-label="More actions"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95 transition-all cursor-pointer"
            >
              <MoreVertical className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Contextual Action Menu Dropdown */}
            {menuOpen && (
              <div
                id="context-dropdown-menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right"
              >
                <div className="px-3.5 py-2 border-b border-slate-100/80">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Actions
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate && onNavigate('new-check');
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0066ff] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#0066ff]" />
                  <span>Start New Check</span>
                </button>

                {currentScreen === 'reports' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigate && onNavigate('check-history');
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    <span>View Check History</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate && onNavigate('settings');
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate && onNavigate('help');
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help & Documentation</span>
                </button>

                {onResetChecks && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onResetChecks();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to New User State</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* User avatar circle */}
        <button
          id="btn-user-avatar"
          onClick={() => {
            if (onOpenAccount) {
              onOpenAccount();
            } else if (onNavigate) {
              onNavigate('settings');
            }
          }}
          aria-label="User profile & account"
          className="w-9 h-9 rounded-full bg-[#ebf4ff] text-[#0066ff] font-bold text-sm flex items-center justify-center border border-blue-100/50 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs ml-0.5"
        >
          S
        </button>
      </div>
    </header>
  );
}
