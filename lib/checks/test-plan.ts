import {
  WebsiteDiscoveryResult,
  DiscoverySignalStatus,
} from './discovery-types';

export type TestCategory =
  | 'product_clarity'
  | 'user_journey'
  | 'mobile'
  | 'trust'
  | 'technical';

export type TestId =
  | 'homepage'
  | 'navigation'
  | 'links'
  | 'primary_cta'
  | 'forms'
  | 'signup'
  | 'login'
  | 'onboarding'
  | 'dashboard'
  | 'project_creation'
  | 'pricing'
  | 'checkout'
  | 'trust'
  | 'mobile'
  | 'technical';

export interface PlannedTest {
  id: TestId;
  name: string;
  category: TestCategory;
  isApplicable: boolean;
  reason: string;
  target?: {
    selector?: string;
    href?: string;
    text?: string;
    location?: string;
  };
}

export interface TestPlan {
  tests: PlannedTest[];
  applicableTestCount: number;
  notApplicableTestCount: number;
  summary: string;
}

export interface AdaptiveTestResult {
  testId: TestId;
  name: string;
  category: TestCategory;
  isApplicable: boolean;
  status: 'pass' | 'warning' | 'fail' | 'unknown' | 'not_applicable';
  evidence: string[];
  details?: Record<string, any>;
}

/**
 * Phase 2 Intelligent Test Selection:
 * Inspects discovery results to construct an explicit, dynamic test plan.
 * Core rule: Don't fail a product for something it doesn't have. Test what actually exists.
 */
export function generateTestPlan(
  discovery: WebsiteDiscoveryResult,
  productType?: string,
  description?: string
): TestPlan {
  const tests: PlannedTest[] = [];

  // 1. Homepage & Presentation (Always Applicable)
  tests.push({
    id: 'homepage',
    name: 'Homepage Presentation & Value Proposition',
    category: 'product_clarity',
    isApplicable: true,
    reason: 'Inspects primary landing page title, headings, and value proposition.',
  });

  // 2. Navigation Structure
  const internalLinkCount =
    discovery.navigation?.internalLinkCount ??
    discovery.navigation?.internalLinks?.length ??
    0;
  const hasNav =
    internalLinkCount > 0 ||
    discovery.navigation?.status === 'detected' ||
    (discovery.navigation?.links || []).length > 0;

  tests.push({
    id: 'navigation',
    name: 'Site Navigation & Information Architecture',
    category: 'user_journey',
    isApplicable: hasNav,
    reason: hasNav
      ? `Discovered ${internalLinkCount} internal navigation links in DOM.`
      : 'No multi-page navigation links detected (single-screen or landing page).',
  });

  // 3. Interactive Links
  const totalLinks =
    (discovery.navigation?.internalLinkCount || 0) +
    (discovery.navigation?.externalLinkCount || 0);
  const hasLinks = totalLinks > 0 || (discovery.navigation?.links || []).length > 0;

  tests.push({
    id: 'links',
    name: 'Interactive Links Verification',
    category: 'user_journey',
    isApplicable: hasLinks,
    reason: hasLinks
      ? `Discovered ${totalLinks} interactive links in DOM.`
      : 'No interactive links detected in DOM.',
  });

  // 4. Primary CTA & Action Buttons
  const ctaCandidates = discovery.actions?.primaryCtaCandidates || [];
  const buttonCount = discovery.actions?.buttons?.length || 0;
  const hasCta = ctaCandidates.length > 0 || buttonCount > 0;

  const topCta = ctaCandidates[0];
  tests.push({
    id: 'primary_cta',
    name: 'Primary Call-To-Action & Action Buttons',
    category: 'user_journey',
    isApplicable: hasCta,
    reason: topCta
      ? `Primary CTA candidate "${topCta.text}" detected${topCta.href ? ` -> ${topCta.href}` : ''}.`
      : buttonCount > 0
      ? `Discovered ${buttonCount} interactive action buttons.`
      : 'No primary CTA or action buttons detected in visible viewport.',
    target: topCta
      ? {
          text: topCta.text,
          href: topCta.href,
          selector: topCta.selector,
          location: topCta.location,
        }
      : undefined,
  });

  // 5. Forms & Inputs
  const formCount = discovery.actions?.forms?.length || 0;
  const inputCount = discovery.actions?.inputs?.length || 0;
  const hasForms = formCount > 0 || inputCount > 0;

  tests.push({
    id: 'forms',
    name: 'Form Inputs & Interactive Submission Controls',
    category: 'user_journey',
    isApplicable: hasForms,
    reason: hasForms
      ? `Discovered ${formCount} form element(s) and ${inputCount} input field(s).`
      : 'No form elements or input fields detected on page.',
  });

  // 6. User Signup Capability
  const signupCap = discovery.capabilities?.signup;
  const hasSignup = signupCap?.status === 'detected';

  tests.push({
    id: 'signup',
    name: 'User Registration & Signup Flow',
    category: 'user_journey',
    isApplicable: hasSignup,
    reason: hasSignup
      ? `Signup capability detected: "${signupCap?.evidence?.text || signupCap?.evidence?.href || 'Signup entry point'}"`
      : 'No user signup flow detected on this site (not applicable).',
    target: hasSignup && signupCap?.evidence
      ? {
          text: signupCap.evidence.text,
          href: signupCap.evidence.href,
          selector: signupCap.evidence.selector,
        }
      : undefined,
  });

  // 7. User Login Capability
  const loginCap = discovery.capabilities?.login;
  const hasLogin = loginCap?.status === 'detected';

  tests.push({
    id: 'login',
    name: 'User Authentication & Login Flow',
    category: 'user_journey',
    isApplicable: hasLogin,
    reason: hasLogin
      ? `Login capability detected: "${loginCap?.evidence?.text || loginCap?.evidence?.href || 'Login entry point'}"`
      : 'No user login capability detected on this site (not applicable).',
    target: hasLogin && loginCap?.evidence
      ? {
          text: loginCap.evidence.text,
          href: loginCap.evidence.href,
          selector: loginCap.evidence.selector,
        }
      : undefined,
  });

  // 8. Onboarding Capability
  const onboardingCap = discovery.capabilities?.onboarding;
  const hasOnboarding = onboardingCap?.status === 'detected';

  tests.push({
    id: 'onboarding',
    name: 'Product Onboarding & Guided Setup',
    category: 'user_journey',
    isApplicable: hasOnboarding,
    reason: hasOnboarding
      ? 'Guided onboarding flow detected.'
      : 'No onboarding flow detected on landing page (not applicable).',
  });

  // 9. Dashboard / App Workspace Capability
  const dashCap = discovery.capabilities?.dashboard;
  const appCap = discovery.capabilities?.appWorkspace;
  const hasDashboard = dashCap?.status === 'detected' || appCap?.status === 'detected';

  tests.push({
    id: 'dashboard',
    name: 'App Dashboard & Workspace Environment',
    category: 'user_journey',
    isApplicable: hasDashboard,
    reason: hasDashboard
      ? 'Discovered application dashboard/workspace capability.'
      : 'No app workspace or dashboard detected (not applicable).',
  });

  // 10. Project Creation Capability
  const projCap = discovery.capabilities?.projectCreation;
  const hasProjectCreation = projCap?.status === 'detected';

  tests.push({
    id: 'project_creation',
    name: 'Project Creation & Resource Generation',
    category: 'user_journey',
    isApplicable: hasProjectCreation,
    reason: hasProjectCreation
      ? 'Project/resource creation action detected.'
      : 'No project creation capability detected (not applicable).',
  });

  // 11. Pricing & Plans
  const pricingCap = discovery.capabilities?.pricing;
  const pricingTrust = discovery.trustSignals?.pricing;
  const hasPricing =
    pricingCap?.status === 'detected' || pricingTrust?.status === 'detected';

  tests.push({
    id: 'pricing',
    name: 'Pricing Plans & Tier Presentation',
    category: 'product_clarity',
    isApplicable: hasPricing,
    reason: hasPricing
      ? 'Pricing section or plan tiers detected.'
      : 'No pricing section or plan tiers detected on this site.',
  });

  // 12. Cart & Checkout Capability
  const checkoutCap = discovery.capabilities?.checkout;
  const cartCap = discovery.capabilities?.cart;
  const isEcommerce = productType === 'E-commerce';
  const hasCheckout =
    checkoutCap?.status === 'detected' || cartCap?.status === 'detected' || isEcommerce;

  tests.push({
    id: 'checkout',
    name: 'E-commerce Cart & Checkout Flow',
    category: 'user_journey',
    isApplicable: hasCheckout,
    reason: hasCheckout
      ? 'Cart/checkout capability detected.'
      : 'No e-commerce cart or checkout required for this site (not applicable).',
  });

  // 13. Trust & Policy Signals (Always Applicable)
  tests.push({
    id: 'trust',
    name: 'Trust Signals, Security & Legal Disclosures',
    category: 'trust',
    isApplicable: true,
    reason: 'Assessing HTTPS security and discovered trust signals (privacy, terms, contact, about).',
  });

  // 14. Mobile Responsive Layout (Always Applicable)
  tests.push({
    id: 'mobile',
    name: 'Mobile Viewport & Horizontal Overflow Validation',
    category: 'mobile',
    isApplicable: true,
    reason: 'Mobile viewport (390x844) responsive layout, content rendering, and overflow check.',
  });

  // 15. Technical Health (Always Applicable)
  tests.push({
    id: 'technical',
    name: 'Technical Runtime, HTTP Status & Console Error Logs',
    category: 'technical',
    isApplicable: true,
    reason: 'Technical runtime check for HTTP status, unhandled page errors, console logs, and network failures.',
  });

  const applicableCount = tests.filter((t) => t.isApplicable).length;
  const notApplicableCount = tests.filter((t) => !t.isApplicable).length;

  const applicableNames = tests
    .filter((t) => t.isApplicable)
    .map((t) => t.id)
    .join(', ');

  return {
    tests,
    applicableTestCount: applicableCount,
    notApplicableTestCount: notApplicableCount,
    summary: `Selected ${applicableCount} applicable tests (${applicableNames}). Skipped ${notApplicableCount} non-applicable features.`,
  };
}
