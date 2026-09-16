'use client';

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Link2,
  Upload,
  Image as ImageIcon,
  X,
  ArrowRight,
} from 'lucide-react';

export interface NewCheckInputProps {
  initialUrl?: string;
  onBack: () => void;
  onSubmit: (data: {
    inputType: 'url' | 'screenshot';
    url: string;
    screenshotName?: string;
    screenshotPreview?: string;
    description: string;
    productType: 'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other';
  }) => void;
}

export function NewCheckInput({ initialUrl = '', onBack, onSubmit }: NewCheckInputProps) {
  const [inputType, setInputType] = useState<'url' | 'screenshot'>('url');
  const [url, setUrl] = useState<string>(initialUrl || '');
  const [description, setDescription] = useState<string>('');
  const [productType, setProductType] = useState<'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other'>('SaaS / Web App');

  // Screenshot states
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [screenshotSize, setScreenshotSize] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productTypes: Array<'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other'> = [
    'SaaS / Web App',
    'E-commerce',
    'AI Product',
    'Other',
  ];

  // URL validation: requires domain format or localhost
  const isUrlValid = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const domainPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
    const localhostPattern = /^(https?:\/\/)?localhost(:\d+)?(\/.*)?$/i;
    return domainPattern.test(trimmed) || localhostPattern.test(trimmed);
  };

  const isScreenshotValid = Boolean(screenshotPreview || screenshotName);
  const isReady = inputType === 'url' ? isUrlValid(url) : isScreenshotValid;

  const handleFileSelect = (file: File) => {
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

  const handleClearScreenshot = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScreenshotName('');
    setScreenshotSize('');
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;

    onSubmit({
      inputType,
      url: inputType === 'url' ? (url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`) : '',
      screenshotName: inputType === 'screenshot' ? (screenshotName || 'Product Screenshot') : undefined,
      screenshotPreview: inputType === 'screenshot' ? (screenshotPreview || undefined) : undefined,
      description: description.trim(),
      productType,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-1 pb-16 flex flex-col animate-in fade-in duration-200 select-none">
      {/* 1. SUB-HEADER: Back on left, NEW CHECK on right (no 3-dot) */}
      <div className="flex items-center justify-between h-9 mb-3">
        <button
          id="btn-back-newcheck"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100/80 active:scale-95 cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.3]" />
          <span>Back</span>
        </button>

        <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase">
          NEW CHECK
        </span>
      </div>

      {/* 2. HERO: Focused headline only (supporting sentence completely removed) */}
      <div className="mb-5 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-[1.2]">
          Test your product before real users do.
        </h1>
      </div>

      {/* 3. INPUT CARD */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col space-y-4.5 transition-all"
      >
        {/* Segmented Selector: [ URL ] [ Screenshot ] */}
        <div
          id="selector-input-type"
          className="w-full p-1 bg-slate-100/90 rounded-xl grid grid-cols-2 gap-1"
        >
          <button
            id="tab-select-url"
            type="button"
            onClick={() => setInputType('url')}
            className={`min-h-[40px] py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputType === 'url'
                ? 'bg-white text-[#0066ff] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>URL</span>
          </button>
          <button
            id="tab-select-screenshot"
            type="button"
            onClick={() => setInputType('screenshot')}
            className={`min-h-[40px] py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputType === 'screenshot'
                ? 'bg-white text-[#0066ff] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Screenshot</span>
          </button>
        </div>

        {/* Dynamic Mode: URL vs Screenshot */}
        {inputType === 'url' ? (
          /* URL MODE */
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <label
              htmlFor="input-newcheck-url"
              className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5"
            >
              Product URL
            </label>
            <div className="relative w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Link2 className="w-4 h-4 text-slate-400 stroke-[2.2]" />
              </div>
              <input
                id="input-newcheck-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourproduct.com"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck="false"
                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400/90 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>
        ) : (
          /* SCREENSHOT MODE */
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5">
              Product screenshot
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file-upload-newcheck"
            />

            {/* Upload Area / Selected State */}
            {!screenshotPreview ? (
              <div
                id="dropzone-newcheck-screenshot"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`w-full py-5 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  isDragging
                    ? 'border-[#0066ff] bg-blue-50/50'
                    : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#ebf4ff] text-[#0066ff] flex items-center justify-center mb-2 shadow-2xs">
                  <Upload className="w-4.5 h-4.5 stroke-[2.4]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mb-0.5">
                  Upload screenshot
                </p>
                <p className="text-[11px] text-slate-400 font-normal">
                  PNG, JPG or WebP · 10MB max
                </p>
              </div>
            ) : (
              /* Selected State with Thumbnail, File info, Replace button, & Clear */
              <div
                id="preview-newcheck-screenshot"
                className="w-full p-3 bg-slate-50/80 border border-slate-200/90 rounded-xl flex items-center gap-3 relative"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-100 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshotPreview}
                    alt="Product screenshot preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {screenshotName || 'Screenshot selected'}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {screenshotSize || 'Ready for check'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#0066ff] hover:text-[#0055d4] hover:underline px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleClearScreenshot}
                    aria-label="Remove screenshot"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optional field: About your product */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-product-description"
            className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5"
          >
            About your product{' '}
            <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            id="input-product-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe it briefly"
            className="w-full px-4 py-3 min-h-[46px] bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400/90 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Product Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs sm:text-[13px] font-semibold text-slate-800 px-0.5">
            Product type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {productTypes.map((type) => {
              const isSelected = productType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProductType(type)}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#0066ff] text-slate-950 shadow-2xs ring-1 ring-[#0066ff]/25 font-bold'
                      : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA: Start Check → */}
        <div className="pt-2">
          <button
            id="btn-start-check-input"
            type="submit"
            disabled={!isReady}
            className={`w-full py-3.5 px-6 min-h-[48px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm select-none ${
              isReady
                ? 'bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white shadow-[0_2px_12px_rgba(0,102,255,0.22)] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60 shadow-none'
            }`}
          >
            <span>Start Check</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4]" />
          </button>
        </div>
      </form>
    </div>
  );
}
