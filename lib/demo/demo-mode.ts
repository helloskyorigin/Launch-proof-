import { CheckRecord, Finding, FinalScoringResult } from '@/lib/checks/check-store';

/**
 * Demo Mode Feature Flag
 * Enabled when NEXT_PUBLIC_DEMO_MODE !== 'false'
 */
export function isDemoModeEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    return false;
  }
  return true;
}

const DEMO_STORAGE_KEY = 'shipscan_demo_mode_active';

export function isDemoSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isDemoModeEnabled()) return false;
  try {
    return localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function startDemoSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
  } catch {
    // ignore local storage error in restricted env
  }
}

export function endDemoSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const DEMO_USER_PROFILE = {
  name: 'Demo User',
  email: 'demo@shipscan.app',
  plan: 'pro' as const,
  onboardingCompleted: true,
};

export const DEMO_FINDINGS: Finding[] = [
  {
    id: 'demo-f1',
    category: 'User Journey',
    severity: 'blocker',
    title: 'Primary CTA button blocked by floating cookie consent banner on mobile',
    evidence:
      'On 375px viewport (iPhone SE/13), fixed overlay div.cookie-banner (z-index: 9999) covers the primary #start-trial-btn element by 48px, preventing click and tap events from initiating the registration flow.',
    whyItMatters:
      'First-time mobile visitors cannot begin their signup, resulting in immediate friction and an estimated 40%+ dropoff rate on mobile paid and organic traffic.',
    fix:
      'Add bottom padding (pb-20) to the hero CTA container on viewports < 640px, or configure the cookie consent notice to render as a non-blocking toast at the bottom of the viewport.',
    confidence: 0.98,
    evidenceRefs: ['viewport_375px', 'overlay_collision'],
  },
  {
    id: 'demo-f2',
    category: 'Mobile',
    severity: 'important',
    title: 'Horizontal viewport scroll triggered by wide pricing comparison table',
    evidence:
      'Computed document body width is 422px while device viewport is 390px (+32px horizontal overflow). The element table.pricing-matrix lacks max-width: 100% and forces horizontal scrolling on mobile browsers.',
    whyItMatters:
      'Horizontal viewport shifting breaks native touch gestures, creates an unpolished impression, and frustrates prospective customers evaluating plan pricing.',
    fix:
      'Wrap table.pricing-matrix in an overflow-x-auto container with -webkit-overflow-scrolling: touch, or stack the comparison features vertically on mobile viewports.',
    confidence: 0.95,
    evidenceRefs: ['table_overflow', 'viewport_390px'],
  },
  {
    id: 'demo-f3',
    category: 'Product Clarity',
    severity: 'important',
    title: 'Hero headline lacks specific target audience and value proposition',
    evidence:
      'Primary H1 headline reads "Next-Gen Intelligence for Modern Teams". The secondary lead paragraph contains abstract buzzwords without mentioning what problem the software solves.',
    whyItMatters:
      'Indie founders and engineering leads make stay-or-leave decisions within 5 seconds. Vague copy causes high bounce rates from qualified prospects who cannot identify if the tool is for them.',
    fix:
      'Replace hero copy with a concrete promise: "Automated Launch QA Audits for SaaS Builders. Find blockers, broken links, and UX bugs before your first paying users do."',
    confidence: 0.92,
    evidenceRefs: ['h1_headline_text', 'meta_description'],
  },
  {
    id: 'demo-f4',
    category: 'Trust',
    severity: 'minor',
    title: 'Footer copyright year is outdated (displays 2024)',
    evidence:
      'Footer text contains "© 2024 ShipScan Inc. All rights reserved." found in footer.site-footer > p.',
    whyItMatters:
      'Outdated copyright notices subtly signal that a project or SaaS tool may be unmaintained or abandoned, eroding trust during checkout.',
    fix:
      'Update the copyright notice to use dynamic current year: `© ${new Date().getFullYear()} ShipScan Inc.`',
    confidence: 0.99,
    evidenceRefs: ['footer_text'],
  },
  {
    id: 'demo-f5',
    category: 'Technical',
    severity: 'minor',
    title: 'Missing favicon.ico in root directory causes 404 console warning',
    evidence:
      'GET https://demo.shipscan.app/favicon.ico returned HTTP 404 Not Found in browser network trace on initial page load.',
    whyItMatters:
      'Triggers an unnecessary failed request on every user visit and leaves the browser tab without clear visual identification.',
    fix:
      'Upload a 32x32 standard favicon.ico file to the public/ directory or add a link rel="icon" tag in document head.',
    confidence: 0.99,
    evidenceRefs: ['failed_requests'],
  },
  {
    id: 'demo-f6',
    category: 'Product Clarity',
    severity: 'minor',
    title: 'Meta description tag is missing for social sharing and search engines',
    evidence:
      '<meta name="description"> was not detected in the HTML <head> element.',
    whyItMatters:
      'Search engines and platforms like Twitter/LinkedIn will display random scraped content or blank snippets instead of your crafted pitch.',
    fix:
      'Add a 150-character meta description summarizing the product benefit inside <head>.',
    confidence: 0.97,
    evidenceRefs: ['html_head'],
  },
];

export const DEMO_SCORING: FinalScoringResult = {
  status: 'complete',
  overallScore: 68,
  verdict: 'NEEDS_ATTENTION',
  categoryScores: {
    'Product Clarity': 75,
    'User Journey': 58,
    'Mobile': 62,
    'Trust': 80,
    'Technical': 92,
  },
  counts: {
    blockers: 1,
    important: 2,
    minor: 3,
    passed: 19,
  },
  summary:
    'Critical conversion blocker detected on mobile viewport: primary call-to-action is obscured by cookie consent banner, and pricing table causes horizontal overflow. Core technical infrastructure and HTTPS are healthy.',
  fixPlan: [
    {
      rank: 1,
      findingId: 'demo-f1',
      category: 'User Journey',
      severity: 'blocker',
      title: 'Primary CTA button blocked by floating cookie consent banner on mobile',
      exactFix:
        'Add bottom padding (pb-20) to the hero CTA container on viewports < 640px, or make the cookie notice a non-blocking toast.',
      evidenceRefs: ['viewport_375px', 'overlay_collision'],
    },
    {
      rank: 2,
      findingId: 'demo-f2',
      category: 'Mobile',
      severity: 'important',
      title: 'Horizontal viewport scroll triggered by wide pricing comparison table',
      exactFix:
        'Wrap table.pricing-matrix in an overflow-x-auto container with touch scrolling enabled.',
      evidenceRefs: ['table_overflow', 'viewport_390px'],
    },
    {
      rank: 3,
      findingId: 'demo-f3',
      category: 'Product Clarity',
      severity: 'important',
      title: 'Hero headline lacks specific target audience and value proposition',
      exactFix:
        'Replace abstract headline with concrete value proposition stating target user and core outcome.',
      evidenceRefs: ['h1_headline_text'],
    },
    {
      rank: 4,
      findingId: 'demo-f4',
      category: 'Trust',
      severity: 'minor',
      title: 'Footer copyright year is outdated (displays 2024)',
      exactFix:
        'Update footer copyright year to current calendar year dynamically.',
      evidenceRefs: ['footer_text'],
    },
  ],
};

export const SAMPLE_DEMO_CHECK: CheckRecord = {
  id: 'demo-check-001',
  url: 'https://demo.shipscan.app',
  finalUrl: 'https://demo.shipscan.app',
  status: 'completed',
  productType: 'SaaS / Web App',
  description: 'Pre-launch automated audit for SaaS marketing page, onboarding funnel, and mobile responsiveness.',
  createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 minutes ago
  updatedAt: new Date().toISOString(),
  responseTimeMs: 312,
  httpStatus: 200,
  score: 68,
  verdict: 'Needs Attention',
  blockerCount: 1,
  importantCount: 2,
  minorCount: 3,
  breakdown: {
    productClarity: 75,
    userJourney: 58,
    mobile: 62,
    trust: 80,
    technical: 92,
  },
  scoring: DEMO_SCORING,
  findings: DEMO_FINDINGS,
  checks: [
    { id: 'product_clarity_title', category: 'product_clarity', status: 'pass', evidence: ['Title: "ShipScan — Automated Launch QA Audits"'], value: true },
    { id: 'product_clarity_main_heading', category: 'product_clarity', status: 'pass', evidence: ['H1 found in hero section'], value: true },
    { id: 'product_clarity_lead_paragraph', category: 'product_clarity', status: 'pass', evidence: ['Lead paragraph detected (184 characters)'], value: true },
    { id: 'product_clarity_pricing_page', category: 'product_clarity', status: 'pass', evidence: ['Pricing section located at #pricing'], value: true },
    { id: 'product_clarity_tagline_length', category: 'product_clarity', status: 'pass', evidence: ['Tagline length: 48 chars (optimal: 30-80)'], value: true },
    
    { id: 'user_journey_action_buttons', category: 'user_journey', status: 'pass', evidence: ['4 clickable CTA buttons identified'], value: true },
    { id: 'user_journey_form_inputs', category: 'user_journey', status: 'pass', evidence: ['Email input field present for lead capture'], value: true },
    { id: 'user_journey_internal_links', category: 'user_journey', status: 'pass', evidence: ['8 valid internal anchor links checked'], value: true },
    { id: 'user_journey_broken_link_anchors', category: 'user_journey', status: 'pass', evidence: ['No empty href="#" placeholders found'], value: true },

    { id: 'mobile_viewport_tag', category: 'mobile', status: 'pass', evidence: ['<meta name="viewport" content="width=device-width, initial-scale=1"> present'], value: true },
    { id: 'mobile_text_scaling', category: 'mobile', status: 'pass', evidence: ['Body font-size >= 16px to prevent iOS auto-zoom'], value: true },
    { id: 'mobile_interactive_sizing', category: 'mobile', status: 'pass', evidence: ['Primary buttons have min-height of 44px'], value: true },

    { id: 'trust_https_used', category: 'trust', status: 'pass', evidence: ['Valid TLS/SSL certificate verified via HTTPS'], value: true },
    { id: 'trust_privacy_or_terms', category: 'trust', status: 'pass', evidence: ['Privacy Policy and Terms links found in footer'], value: true },
    { id: 'trust_social_proof', category: 'trust', status: 'pass', evidence: ['Customer testimonial quotes and founder avatars present'], value: true },
    { id: 'trust_contact_details', category: 'trust', status: 'pass', evidence: ['Support contact email found: support@shipscan.app'], value: true },

    { id: 'technical_http_status_ok', category: 'technical', status: 'pass', evidence: ['HTTP 200 OK received from edge server'], value: true },
    { id: 'technical_response_time', category: 'technical', status: 'pass', evidence: ['Server response time: 312ms (Target: < 800ms)'], value: true },
    { id: 'technical_page_crashes', category: 'technical', status: 'pass', evidence: ['Zero unhandled JavaScript runtime exceptions'], value: true },

    // Failing checks corresponding to the findings
    { id: 'mobile_horizontal_overflow', category: 'mobile', status: 'fail', evidence: ['Horizontal scroll detected: document width 422px on 390px viewport'], value: false },
    { id: 'product_clarity_meta_description', category: 'product_clarity', status: 'fail', evidence: ['Meta description tag missing in document head'], value: false },
    { id: 'technical_http_failures', category: 'technical', status: 'warning', evidence: ['GET /favicon.ico returned 404 Not Found'], value: false },
  ],
  evidence: {
    desktop: {
      title: 'ShipScan — Automated Launch QA Audits',
      metaDescription: '',
      visibleTextExcerpt:
        'Next-Gen Intelligence for Modern Teams. Ship with confidence and verify your landing page before launch. Pricing: Starter $19/mo, Pro $49/mo.',
      headings: [
        'Next-Gen Intelligence for Modern Teams',
        'How ShipScan Works',
        'Transparent Pricing for Growing Teams',
        'Frequently Asked Questions',
      ],
      links: [
        { text: 'Features', href: '#features' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Terms of Service', href: '/terms' },
      ],
      buttons: [
        { text: 'Start Free Trial' },
        { text: 'View Interactive Demo' },
        { text: 'Choose Pro Plan' },
      ],
      forms: [{ action: '/api/subscribe', method: 'POST' }],
      inputFields: [
        { type: 'email', placeholder: 'name@company.com', name: 'email' },
      ],
      consoleErrors: [],
      failedRequests: [
        {
          url: 'https://demo.shipscan.app/favicon.ico',
          method: 'GET',
          status: 404,
          resourceType: 'image',
        },
      ],
      pageErrors: [],
      httpStatus: 200,
    },
    mobile: {
      title: 'ShipScan — Automated Launch QA Audits',
      headings: [
        'Next-Gen Intelligence for Modern Teams',
        'How ShipScan Works',
      ],
      buttons: [
        { text: 'Start Free Trial' },
        { text: 'Menu' },
      ],
      links: [
        { text: 'Pricing', href: '#pricing' },
        { text: 'Terms', href: '/terms' },
      ],
      forms: [{ action: '/api/subscribe', method: 'POST' }],
      consoleErrors: [],
      failedRequests: [],
      pageErrors: [],
      horizontalOverflow: true,
      scrollWidth: 422,
      viewportWidth: 390,
    },
  },
};
