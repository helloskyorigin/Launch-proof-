import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center tracking-tight font-bold select-none ${sizeClasses[size]} ${className}`}>
      <span className="text-slate-950 font-extrabold">Launch</span>
      <span className="text-[#0066ff] font-extrabold">Proof</span>
    </div>
  );
}
