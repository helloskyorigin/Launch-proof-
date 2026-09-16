'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Mail,
  FileText,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface HelpSupportScreenProps {
  onNavigate: (screen: string) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'scoring' | 'reports' | 'technical';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'check-definition',
    question: 'What is a LaunchProof check?',
    answer:
      'LaunchProof audits your live web app or product URL against real first-time visitor expectations. It inspects your mobile viewport, verifies registration and contact forms, tests critical user pathways, and flags product messaging that could confuse or bounce visitors before launch.',
    category: 'general',
  },
  {
    id: 'readiness-score',
    question: 'How does the readiness score work?',
    answer:
      'The score (0–100) measures first-user readiness. It is calculated by deducting points for critical blockers (-15 to -25 pts) and important usability issues (-5 to -10 pts), while awarding points for passing essential checks across user journey, mobile layout, clarity, and trust indicators.',
    category: 'scoring',
  },
  {
    id: 'needs-fix',
    question: 'What does “Needs Fix” mean?',
    answer:
      'A check receives "Needs Fix" when one or more critical blockers prevent first-time visitors from completing primary flows, such as signing up, subscribing, or understanding your value proposition. Fixing these blockers should be completed before your public launch.',
    category: 'scoring',
  },
  {
    id: 're-check',
    question: 'How do I run a re-check?',
    answer:
      'From any report card in Check History, Reports, or inside the Detailed Report screen, tap the "Re-check" button. LaunchProof will initiate a fresh audit of your product URL and update your readiness score so you can verify your improvements.',
    category: 'technical',
  },
  {
    id: 'reports-generation',
    question: 'How are reports generated?',
    answer:
      'Reports are compiled automatically once automated checks complete. Each report includes your readiness verdict, itemized blockers, direct evidence quotes, explanations of why each issue matters, and a prioritized fix plan.',
    category: 'reports',
  },
  {
    id: 'share-report',
    question: 'Can I share a report?',
    answer:
      'Yes! Tap the "Share" button on any report to generate a public share link (e.g., launchproof.app/report/demo-123). Teammates, designers, or investors can open and inspect the audit without creating an account.',
    category: 'reports',
  },
];

const GUIDES_LIST = [
  {
    id: 'guide-1',
    title: 'How to achieve a 90+ Readiness Score',
    readTime: '3 min read',
    summary:
      'Ensure clear pricing above the fold, zero mobile horizontal overflow, and an instant sign-up pathway without unnecessary email verification friction.',
  },
  {
    id: 'guide-2',
    title: 'Fixing Mobile Viewport & Clipping Issues',
    readTime: '4 min read',
    summary:
      'Avoid fixed 100vh containers that clip on iOS Safari. Use dynamic viewport units (dvh) and verify that inputs don’t zoom unexpectedly.',
  },
  {
    id: 'guide-3',
    title: 'First-Time User Clarity Checklist',
    readTime: '2 min read',
    summary:
      'Answer three questions within 5 seconds: What does it do? Who is it for? How much does it cost?',
  },
];

export function HelpSupportScreen({ onNavigate }: HelpSupportScreenProps) {
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion state (set of expanded FAQ IDs)
  const [expandedFaqIds, setExpandedFaqIds] = useState<Record<string, boolean>>({
    'check-definition': true, // Expand first by default for immediate helpfulness
  });

  // Modal states: 'contact' | 'feedback' | 'guides' | 'help-center' | null
  const [activeModal, setActiveModal] = useState<
    'contact' | 'feedback' | 'guides' | 'help-center' | null
  >(null);

  // Contact support form state
  const [contactEmail, setContactEmail] = useState('satyam@example.com');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState<'Great' | 'Good' | 'Could be better' | 'Poor'>('Great');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Filtered FAQs based on search
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQ_DATA;
    return FAQ_DATA.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      // Keep success message visible briefly before allowing manual close
    }, 500);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      // Keep success message visible briefly
    }, 500);
  };

  const resetContactModal = () => {
    setContactSubmitted(false);
    setContactMessage('');
    setActiveModal(null);
  };

  const resetFeedbackModal = () => {
    setFeedbackSubmitted(false);
    setFeedbackMessage('');
    setActiveModal(null);
  };

  return (
    <div className="w-full px-5 pt-2 pb-24 flex flex-col animate-in fade-in duration-200 select-none">
      {/* PAGE TITLE */}
      <div className="mb-4 mt-1">
        <h2 className="text-xs font-bold text-[#0066ff] uppercase tracking-wider">
          Help & Support
        </h2>
      </div>

      {/* 1. HERO SECTION */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          How can we help?
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 font-normal leading-relaxed">
          Find answers, learn how LaunchProof works, or contact our support team.
        </p>
      </div>

      {/* 2. SEARCH FIELD */}
      <div className="mb-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-help-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. QUICK SUPPORT OPTIONS (4 Cards in a 2x2 grid on mobile/tablet) */}
      <div className="mb-8">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2.5">
          Quick Support
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card 1: Help Center */}
          <button
            id="card-help-center"
            onClick={() => {
              // Smooth scroll to FAQ or open Help Center modal
              const faqSection = document.getElementById('popular-questions-section');
              if (faqSection) {
                faqSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveModal('help-center');
              }
            }}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 active:bg-slate-50/70 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-2.5">
                <BookOpen className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                Help Center
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Find answers to common LaunchProof questions.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0066ff] group-hover:translate-x-0.5 transition-transform">
              <span>View FAQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: Contact Support */}
          <button
            id="card-contact-support"
            onClick={() => setActiveModal('contact')}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 active:bg-slate-50/70 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-2.5">
                <Mail className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                Contact Support
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get help from the LaunchProof team.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0066ff] group-hover:translate-x-0.5 transition-transform">
              <span>Send message</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 3: Guides */}
          <button
            id="card-guides"
            onClick={() => setActiveModal('guides')}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 active:bg-slate-50/70 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-2.5">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                Guides
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn how to get the most from your product checks.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0066ff] group-hover:translate-x-0.5 transition-transform">
              <span>Read guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 4: Send Feedback */}
          <button
            id="card-send-feedback"
            onClick={() => setActiveModal('feedback')}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 active:bg-slate-50/70 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center mb-2.5">
                <MessageSquare className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                Send Feedback
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tell us what we can improve.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0066ff] group-hover:translate-x-0.5 transition-transform">
              <span>Give feedback</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* 4. POPULAR QUESTIONS (ACCORDION) */}
      <div id="popular-questions-section" className="mb-8">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <h2 className="text-sm font-bold text-slate-900">
            Popular questions
          </h2>
          {searchQuery && (
            <span className="text-xs text-slate-400">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {filteredFaqs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] divide-y divide-slate-100 overflow-hidden">
            {filteredFaqs.map((faq) => {
              const isExpanded = !!expandedFaqIds[faq.id];
              return (
                <div key={faq.id} className="transition-colors">
                  <button
                    id={`faq-toggle-${faq.id}`}
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full py-4 px-4 sm:px-5 flex items-center justify-between text-left hover:bg-slate-50/60 active:bg-slate-100/40 transition-colors cursor-pointer group"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-[13.5px] sm:text-sm font-semibold text-slate-900 group-hover:text-[#0066ff] transition-colors pr-3 leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
                        isExpanded ? 'rotate-180 text-[#0066ff]' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 pt-0 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal animate-in fade-in duration-150">
                      <p className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/80">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* NO RESULTS FOUND STATE */
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No results found
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try another search term or reach out to support.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* 5. STILL NEED HELP? (PREMIUM COMPACT CARD) */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0066ff]" />
            <h3 className="text-base font-bold text-slate-900">
              Still need help?
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 max-w-sm leading-relaxed font-normal">
            Our support team can help you with LaunchProof.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Primary Button: Contact Support → */}
            <button
              id="btn-still-need-help-contact"
              onClick={() => setActiveModal('contact')}
              className="py-3 px-5 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Secondary Option: Send Feedback */}
            <button
              id="btn-still-need-help-feedback"
              onClick={() => setActiveModal('feedback')}
              className="py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Send Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. CONTACT SUPPORT MODAL / BOTTOM SHEET
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeModal === 'contact' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={resetContactModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-base font-bold text-slate-900">
                  Contact Support
                </h3>
              </div>
              <button
                onClick={resetContactModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!contactSubmitted ? (
              <form onSubmit={handleContactSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    id="input-support-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="user@email.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    What can we help with?
                  </label>
                  <textarea
                    id="input-support-message"
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <button
                    id="btn-submit-support-message"
                    type="submit"
                    className="w-full py-3 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SUCCESS STATE */
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-bold text-slate-950">
                  Message sent
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-xs leading-relaxed">
                  Thanks! We&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={resetContactModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. FEEDBACK MODAL / BOTTOM SHEET
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeModal === 'feedback' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={resetFeedbackModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-base font-bold text-slate-900">
                  Send Feedback
                </h3>
              </div>
              <button
                onClick={resetFeedbackModal}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!feedbackSubmitted ? (
              <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    How is your experience?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Great', 'Good', 'Could be better', 'Poor'] as const).map(
                      (option) => {
                        const isSelected = feedbackRating === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFeedbackRating(option)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#0066ff] bg-blue-50/50 text-[#0066ff] font-bold shadow-2xs'
                                : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-[#0066ff] bg-[#0066ff]'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span className="text-xs font-semibold">{option}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Feedback
                  </label>
                  <textarea
                    id="input-feedback-message"
                    required
                    rows={4}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Tell us what you think..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <button
                    id="btn-submit-feedback"
                    type="submit"
                    className="w-full py-3 bg-[#0066ff] hover:bg-[#0055d4] active:scale-[0.99] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Feedback</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SUCCESS STATE */
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-bold text-slate-950">
                  Thanks for your feedback.
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-xs leading-relaxed">
                  We review every suggestion to make LaunchProof faster and more insightful.
                </p>
                <button
                  type="button"
                  onClick={resetFeedbackModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GUIDES MODAL (SUPPORT CARD 3)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeModal === 'guides' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-base font-bold text-slate-900">
                  LaunchProof Guides
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {GUIDES_LIST.map((guide) => (
                <div
                  key={guide.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {guide.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {guide.readTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Guides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
