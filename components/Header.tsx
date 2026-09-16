'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenAccount?: () => void;
  onNavigate?: (screen: string) => void;
  currentScreen?: string;
}

export function Header({
  onOpenDrawer,
  onOpenAccount,
  onNavigate,
}: HeaderProps) {
  return (
    <header className="relative w-full flex items-center justify-between px-5 pt-3.5 pb-2.5 z-30 select-none">
      {/* Left: Hamburger menu */}
      <div className="w-10 flex items-center justify-start">
        <button
          id="btn-hamburger"
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-slate-800 hover:bg-slate-100/80 active:scale-95 transition-all cursor-pointer"
        >
          <Menu className="w-5.5 h-5.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Center: Brand Logo centered in available header space */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="cursor-pointer focus:outline-none flex items-center justify-center"
          aria-label="LaunchProof Home"
        >
          <Logo size="md" />
        </button>
      </div>

      {/* Right: User Avatar */}
      <div className="w-10 flex items-center justify-end">
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
          className="w-9 h-9 rounded-full bg-[#ebf4ff] text-[#0066ff] font-bold text-xs sm:text-sm flex items-center justify-center border border-blue-100/60 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
        >
          S
        </button>
      </div>
    </header>
  );
}
