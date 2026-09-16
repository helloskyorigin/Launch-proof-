export interface Finding {
  id: string;
  category: 'PRODUCT CLARITY' | 'USER JOURNEY' | 'MOBILE EXPERIENCE' | 'TRUST & CONVERSION' | 'TECHNICAL SIGNALS';
  severity: 'Critical' | 'Important' | 'Passed';
  title: string;
  explanation: string;
  evidenceLabel: string;
  whyItMatters: string;
  whatToFix: string;
  recommendedFix: string;
  screenshotUrl?: string;
  inFixPlan?: boolean;
}

export interface FixPlanItem {
  id: string;
  number: string;
  priority: 'Critical' | 'Important';
  category: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface CheckData {
  id: string;
  name: string;
  inputType: 'url' | 'screenshot';
  url: string;
  screenshotName?: string;
  screenshotPreview?: string;
  description: string;
  productType: 'SaaS / Web App' | 'E-commerce' | 'AI Product' | 'Other';
  date: string;
  status: 'Needs a few fixes' | 'Ready for launch' | 'Critical issues';
  score: number;
  previousScore?: number;
  verdict: string;
  summary: string;
  blockersCount: number;
  importantCount: number;
  passedCount: number;
  blockers: Finding[];
  important: Finding[];
  passed: string[];
  fixPlan: FixPlanItem[];
  recheckComparison?: {
    prevScore: number;
    newScore: number;
    improvement: number;
    prevBlockers: number;
    newBlockers: number;
    prevImportant: number;
    newImportant: number;
    prevPassed: number;
    newPassed: number;
    fixedItems: string[];
  };
}

export const INITIAL_MOCK_CHECK: CheckData = {
  id: 'chk_launch_01',
  name: 'myawesomeproduct.com',
  inputType: 'url',
  url: 'https://myawesomeproduct.com',
  description: 'AI product clarity & first-user testing tool',
  productType: 'SaaS / Web App',
  date: 'Today',
  status: 'Needs a few fixes',
  score: 74,
  verdict: 'Needs a few fixes',
  summary: 'Your product is understandable and usable, but a few issues could create friction for first-time users.',
  blockersCount: 3,
  importantCount: 5,
  passedCount: 18,
  blockers: [
    {
      id: 'blk_1',
      category: 'PRODUCT CLARITY',
      severity: 'Critical',
      title: 'Your main value proposition is unclear above the fold',
      explanation: 'A first-time visitor may not immediately understand what the product does or why they should continue.',
      evidenceLabel: 'Homepage screenshot · Above-the-fold hero container',
      whyItMatters: 'First-time visitors decide within 3–5 seconds whether a tool solves their specific problem. When the primary headline uses abstract buzzwords instead of customer outcomes, bounce rates escalate sharply.',
      whatToFix: 'Rewrite the hero section so the first headline clearly states what the product does and who it is for.',
      recommendedFix: "Replace 'Next-Gen Orchestration Layer' with 'Test your product like a first-time user before you launch.'",
      inFixPlan: true,
    },
    {
      id: 'blk_2',
      category: 'USER JOURNEY',
      severity: 'Critical',
      title: 'First CTA leads to an unexpected registration gate without preview',
      explanation: 'Users clicking the primary action button are immediately blocked by an extensive form before seeing any value.',
      evidenceLabel: 'Registration modal · Step 1 funnel',
      whyItMatters: 'Demanding an account before demonstrating any tangible product value creates extreme friction. Early visitors drop off before experiencing the core benefit.',
      whatToFix: 'Allow users to preview sample output or enter a test input before requiring account creation.',
      recommendedFix: 'Provide an interactive instant demo preview or sample report before asking for email credentials.',
      inFixPlan: true,
    },
    {
      id: 'blk_3',
      category: 'TRUST & CONVERSION',
      severity: 'Critical',
      title: 'Pricing tiers lack clear feature distinction',
      explanation: 'The difference between plans is ambiguous, causing decision paralysis during checkout.',
      evidenceLabel: 'Pricing matrix · Comparison section',
      whyItMatters: 'When prospective customers cannot clearly discern which plan fits their usage volume or stage, they delay or abandon their purchase decision.',
      whatToFix: 'Highlight the recommended plan with explicit check limits and dedicated use-case tags.',
      recommendedFix: "Label the single check tier as 'Launch Audit ($5 one-time)' and emphasize the monthly plan with exact check allowances.",
      inFixPlan: true,
    },
  ],
  important: [
    {
      id: 'imp_1',
      category: 'USER JOURNEY',
      severity: 'Important',
      title: 'First CTA is difficult to discover',
      explanation: 'The primary button color blends into the container background on small mobile viewports.',
      evidenceLabel: 'Hero viewport container (390px)',
      whyItMatters: 'Users cannot take action if the primary interactive element does not contrast strongly against background neutrals.',
      whatToFix: 'Increase contrast ratio of the primary button to at least 4.5:1 against the surrounding container.',
      recommendedFix: 'Apply high-contrast solid blue (#0066ff) styling with generous horizontal padding.',
      inFixPlan: false,
    },
    {
      id: 'imp_2',
      category: 'MOBILE EXPERIENCE',
      severity: 'Important',
      title: 'Mobile spacing creates friction',
      explanation: 'Container margins compress text awkwardly below 390px, causing accidental mis-taps.',
      evidenceLabel: 'Mobile responsive inspection (375px)',
      whyItMatters: 'Cramped mobile spacing leads to mis-clicks and frustrates mobile-first visitors testing on their phones.',
      whatToFix: 'Ensure minimum 16px outer gutters and at least 44px minimum touch target heights.',
      recommendedFix: 'Update container classes to px-4 sm:px-6 and ensure buttons are at least h-11.',
      inFixPlan: false,
    },
    {
      id: 'imp_3',
      category: 'TRUST & CONVERSION',
      severity: 'Important',
      title: 'Trust information appears too late',
      explanation: 'Refund policy and data security indicators are buried below the footer fold.',
      evidenceLabel: 'Footer legal links area',
      whyItMatters: 'Security-conscious founders hesitate to submit their product URL if privacy assurances are not immediately visible.',
      whatToFix: 'Add a compact 1-line trust badge directly beneath the main submission input.',
      recommendedFix: "Insert 'Read-only check · No tracking scripts installed' under the primary URL field.",
      inFixPlan: false,
    },
    {
      id: 'imp_4',
      category: 'USER JOURNEY',
      severity: 'Important',
      title: 'User journey has an unnecessary step',
      explanation: 'An unneeded confirmation screen appears between URL submission and analysis kickoff.',
      evidenceLabel: 'Input flow transition diagram',
      whyItMatters: 'Each redundant step in an onboarding or check flow causes an 8–15% drop in completion rate.',
      whatToFix: 'Streamline the review step so it auto-advances or displays concise configuration.',
      recommendedFix: 'Consolidate review into a single lightweight verification prompt.',
      inFixPlan: false,
    },
    {
      id: 'imp_5',
      category: 'TECHNICAL SIGNALS',
      severity: 'Important',
      title: 'Viewport meta tag triggers horizontal scrolling on small screens',
      explanation: 'Fixed width container elements force horizontal overflow on 375px viewports.',
      evidenceLabel: 'DOM layout bounding box analysis',
      whyItMatters: 'Horizontal scroll on mobile gives an immediate impression of an unpolished, fragile product.',
      whatToFix: 'Remove fixed pixel widths and ensure max-w-full with overflow-x-hidden on root containers.',
      recommendedFix: 'Audit raw width declarations and replace with flex-1 and max-w-full constraints.',
      inFixPlan: false,
    },
  ],
  passed: [
    'HTTPS enabled & valid TLS certificate',
    'Primary navigation works across all breakpoints',
    'Page title is present, unique, and descriptive',
    'Main input form is accessible with labelled controls',
    'No obvious navigation failures or dead links',
    'Fast first contentful paint (< 1.1 seconds)',
    'Readable font contrast ratios (WCAG AA compliant)',
    'Favicon and OpenGraph metadata present',
    'Clean URL routing without session ID exposure',
    'Touch targets meet minimum 44px threshold',
    'No intrusive full-page marketing popups on arrival',
    'Search engine indexing tags properly configured',
    'Semantic HTML structure (H1, H2 tags in logical sequence)',
    'Responsive image loading attributes present',
    'Consistent typography scale and font pairing',
    'Cookie consent banner is non-blocking and lightweight',
    'Clean error states on invalid inputs',
    'Secure external link references (rel="noopener")',
  ],
  fixPlan: [
    {
      id: 'fix_1',
      number: '01',
      priority: 'Critical',
      category: 'Product Clarity',
      title: 'Clarify homepage value proposition',
      description: 'Rewrite the hero headline to explicitly communicate what the product does within 3 seconds of arrival.',
      completed: false,
    },
    {
      id: 'fix_2',
      number: '02',
      priority: 'Critical',
      category: 'User Journey',
      title: 'Make primary CTA easier to discover',
      description: 'Increase button contrast ratio and position high on the viewport without required upfront sign-up.',
      completed: false,
    },
    {
      id: 'fix_3',
      number: '03',
      priority: 'Important',
      category: 'Mobile Experience',
      title: 'Improve mobile spacing and touch targets',
      description: 'Adjust container padding to prevent accidental mis-taps on 390px mobile screens.',
      completed: false,
    },
  ],
};

export const RECHECKED_MOCK_CHECK: CheckData = {
  ...INITIAL_MOCK_CHECK,
  id: 'chk_launch_02',
  date: 'Just now',
  score: 86,
  previousScore: 74,
  status: 'Ready for launch',
  verdict: 'Ready for launch',
  summary: 'Great progress! The critical blockers in your value proposition and CTA visibility have been successfully resolved.',
  blockersCount: 1,
  importantCount: 3,
  passedCount: 24,
  recheckComparison: {
    prevScore: 74,
    newScore: 86,
    improvement: 12,
    prevBlockers: 3,
    newBlockers: 1,
    prevImportant: 5,
    newImportant: 3,
    prevPassed: 18,
    newPassed: 24,
    fixedItems: [
      'Clarified homepage value proposition above the fold',
      'Primary CTA is now instantly discoverable and high-contrast',
      'Mobile responsive spacing verified across 375px–420px viewports',
    ],
  },
  blockers: [
    INITIAL_MOCK_CHECK.blockers[2], // Only 1 blocker remains
  ],
  important: [
    INITIAL_MOCK_CHECK.important[1],
    INITIAL_MOCK_CHECK.important[2],
    INITIAL_MOCK_CHECK.important[4],
  ],
  passed: [
    ...INITIAL_MOCK_CHECK.passed,
    'Homepage value proposition validated clear in < 3 seconds',
    'Primary CTA prominently positioned above mobile fold',
    'Frictionless interactive trial enabled before registration',
    'Mobile gutters and touch targets conform to 44px guidelines',
    'Pricing comparison clearly separates one-time vs recurring tiers',
    'Trust indicators visible on initial submission screen',
  ],
  fixPlan: [
    {
      id: 'fix_3',
      number: '01',
      priority: 'Critical',
      category: 'Trust & Conversion',
      title: 'Clarify pricing tiers distinctions',
      description: 'Highlight the recommended plan with explicit check limits and use-case tags.',
      completed: false,
    },
  ],
};
