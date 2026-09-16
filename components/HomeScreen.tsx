'use client';

import React, { useState, useRef } from 'react';
import {
  Link2,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  X,
} from 'lucide-react';

interface HomeScreenProps {
  onStartCheck: (urlOrData?: string) => void;
}

export function HomeScreen({ onStartCheck }: HomeScreenProps) {
  const [inputMode, setInputMode] = useState<'url' | 'screenshot'>('url');
  const [url, setUrl] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [screenshotSize, setScreenshotSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL validation: requires domain format or localhost
  const isUrlValid = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const domainPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
    const localhostPattern = /^(https?:\/\/)?localhost(:\d+)?(\/.*)?$/i;
    return domainPattern.test(trimmed) || localhostPattern.test(trimmed);
  };

  const isReadyToSubmit =
    inputMode === 'url' ? isUrlValid(url) : Boolean(screenshotPreview);

  const handleFileSelection = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setScreenshotName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setScreenshotSize(`${sizeInMb} MB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleClearScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScreenshotPreview(null);
    setScreenshotName('');
    setScreenshotSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadyToSubmit) return;

    if (inputMode === 'url') {
      const targetUrl = url.trim();
      onStartCheck(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    } else {
      onStartCheck(screenshotName || 'Product Screenshot');
    }
  };

  return (
    <div className="w-full px-5 pt-1.5 pb-12 flex flex-col animate-in fade-in duration-200 select-none">
      {/* 1. HERO SECTION */}
      <div className="mt-0.5 mb-3.5 sm:mb-4 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2] mb-1.5 max-w-[290px] sm:max-w-none">
          Know what your users
          <br className="hidden xs:inline sm:hidden" /> will find.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-[340px]">
          Catch product, UX, trust, and technical issues before your first real users do.
        </p>
      </div>

      {/* 2. THE NEW CHECK CARD */}
      <div
        id="card-new-check-home"
        className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col transition-all"
      >
        {/* Card Header & Description */}
        <div className="mb-3.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight mb-1">
            New Check
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Test your product before your first real users do.
          </p>
        </div>

        {/* Compact Two-Option Selector: [ URL ]  [ Screenshot ] */}
        <div
          id="selector-input-method"
          className="w-full p-1 bg-slate-100/90 rounded-xl grid grid-cols-2 gap-1 mb-3.5"
        >
          <button
            type="button"
            id="tab-url-mode"
            onClick={() => setInputMode('url')}
            className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputMode === 'url'
                ? 'bg-white text-[#0066ff] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>URL</span>
          </button>
          <button
            type="button"
            id="tab-screenshot-mode"
            onClick={() => setInputMode('screenshot')}
            className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputMode === 'screenshot'
                ? 'bg-white text-[#0066ff] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Screenshot</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleStartCheck} className="space-y-3.5">
          {/* A. URL MODE */}
          {inputMode === 'url' && (
            <div className="animate-in fade-in duration-150">
              <label
                htmlFor="input-product-url"
                className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5"
              >
                PRODUCT URL
              </label>
              <div className="relative w-full">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Link2 className="w-4 h-4 text-slate-400 stroke-[2.2]" />
                </div>
                <input
                  id="input-product-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourproduct.com"
                  autoComplete="url"
                  autoCapitalize="none"
                  spellCheck="false"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400/90 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* B. SCREENSHOT MODE */}
          {inputMode === 'screenshot' && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
                SCREENSHOT
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload-screenshot"
              />

              {/* Upload Drop Area */}
              {!screenshotPreview ? (
                <div
                  id="dropzone-screenshot"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full py-5 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    isDragging
                      ? 'border-[#0066ff] bg-blue-50/50'
                      : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Plus Icon container */}
                  <div className="w-9 h-9 rounded-xl bg-[#ebf4ff] text-[#0066ff] flex items-center justify-center mb-2 shadow-2xs">
                    <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mb-0.5">
                    Upload a screenshot
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              ) : (
                /* Uploaded Preview State inside the upload area */
                <div
                  id="preview-screenshot"
                  className="w-full p-3 bg-slate-50/80 border border-slate-200/90 rounded-xl flex items-center gap-3 relative"
                >
                  {/* Image Thumbnail */}
                  <div className="w-13 h-13 rounded-lg overflow-hidden bg-slate-200 border border-slate-100 flex-shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {screenshotName || 'Screenshot ready'}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {screenshotSize || 'Ready for inspection'}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={handleClearScreenshot}
                    aria-label="Remove screenshot"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Primary CTA: Start a Check → */}
          <button
            id="btn-start-check-home"
            type="submit"
            disabled={!isReadyToSubmit}
            className={`w-full py-3.5 px-6 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm select-none ${
              isReadyToSubmit
                ? 'bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white shadow-[0_2px_12px_rgba(0,102,255,0.22)] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
            }`}
          >
            <span>Start a Check</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4]" />
          </button>
        </form>
      </div>
    </div>
  );
}
