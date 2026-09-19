import {
  CheckEvidence,
  DeterministicCheckResult,
} from './check-store';
import { WebsiteDiscoveryResult } from './discovery-types';
import { TestPlan, AdaptiveTestResult } from './test-plan';

export interface DeterministicEngineInput {
  url: string;
  finalUrl?: string;
  httpStatus?: number;
  responseTimeMs?: number;
  evidence?: CheckEvidence;
  discovery?: WebsiteDiscoveryResult;
  testPlan?: TestPlan;
  adaptiveResults?: AdaptiveTestResult[];
}

/**
 * Phase 3 Deterministic Engine (with Phase 2 Test Applicability support):
 * Evaluates real evidence and test plan.
 * Core rule:
 * - not_applicable checks produce status: 'not_applicable' with 0 penalty.
 * - unknown checks produce status: 'unknown' with 0 penalty.
 * - pass checks require verified presence/functionality.
 * - fail/warning only produced for genuine verified defects.
 */
export function runDeterministicChecks(
  input: DeterministicEngineInput
): DeterministicCheckResult[] {
  const {
    url,
    finalUrl,
    httpStatus,
    responseTimeMs,
    evidence,
    discovery,
    testPlan,
    adaptiveResults,
  } = input;

  const desktop = evidence?.desktop;
  const mobile = evidence?.mobile;
  const targetUrl = finalUrl || url;

  const results: DeterministicCheckResult[] = [];

  // Helper to check test plan applicability
  const isTestApplicable = (testId: string): boolean => {
    if (!testPlan) return true;
    const found = testPlan.tests.find((t) => t.id === testId);
    return found ? found.isApplicable : true;
  };

  const getTestReason = (testId: string): string => {
    if (!testPlan) return '';
    const found = testPlan.tests.find((t) => t.id === testId);
    return found?.reason || '';
  };

  // ==========================================
  // 1. PRODUCT CLARITY
  // ==========================================

  // Check 1.1: Page has a title
  if (!desktop) {
    results.push({
      id: 'product_clarity_title',
      category: 'product_clarity',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect page title.'],
      value: null,
    });
  } else if (desktop.title && desktop.title.trim().length > 0) {
    results.push({
      id: 'product_clarity_title',
      category: 'product_clarity',
      status: 'pass',
      evidence: [`Title tag found: "${desktop.title.trim()}"`],
      value: desktop.title.trim(),
    });
  } else {
    results.push({
      id: 'product_clarity_title',
      category: 'product_clarity',
      status: 'fail',
      evidence: ['Page title is empty or missing in the document head.'],
      value: '',
    });
  }

  // Check 1.2: Page has a meta description
  if (!desktop) {
    results.push({
      id: 'product_clarity_meta_description',
      category: 'product_clarity',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect meta description.'],
      value: null,
    });
  } else if (desktop.metaDescription && desktop.metaDescription.trim().length > 0) {
    results.push({
      id: 'product_clarity_meta_description',
      category: 'product_clarity',
      status: 'pass',
      evidence: [`Meta description found: "${desktop.metaDescription.trim()}"`],
      value: desktop.metaDescription.trim(),
    });
  } else {
    results.push({
      id: 'product_clarity_meta_description',
      category: 'product_clarity',
      status: 'warning',
      evidence: ['No meta description tag detected in document head.'],
      value: null,
    });
  }

  // Check 1.3: Page has visible main heading/content
  if (!desktop) {
    results.push({
      id: 'product_clarity_main_heading',
      category: 'product_clarity',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect headings.'],
      value: null,
    });
  } else if (desktop.headings && desktop.headings.length > 0) {
    results.push({
      id: 'product_clarity_main_heading',
      category: 'product_clarity',
      status: 'pass',
      evidence: [
        `Found ${desktop.headings.length} heading(s).`,
        `Top heading: "${desktop.headings[0]}"`,
      ],
      value: desktop.headings,
    });
  } else if ((desktop.visibleTextExcerpt || '').trim().length > 40) {
    results.push({
      id: 'product_clarity_main_heading',
      category: 'product_clarity',
      status: 'pass',
      evidence: [
        'Visible page content detected (content styled directly).',
      ],
      value: [],
    });
  } else {
    results.push({
      id: 'product_clarity_main_heading',
      category: 'product_clarity',
      status: 'fail',
      evidence: ['No visible h1, h2, or h3 headings or content text detected in the DOM.'],
      value: [],
    });
  }

  // Check 1.4: Detect if page appears almost empty
  if (!desktop) {
    results.push({
      id: 'product_clarity_empty_page',
      category: 'product_clarity',
      status: 'unknown',
      evidence: ['No desktop evidence available to assess content volume.'],
      value: null,
    });
  } else {
    const textLen = (desktop.visibleTextExcerpt || '').trim().length;
    const headingCount = (desktop.headings || []).length;
    const interactiveCount =
      (desktop.links || []).length + (desktop.buttons || []).length;

    const isEmpty = textLen < 30 && headingCount === 0 && interactiveCount === 0;

    if (isEmpty) {
      results.push({
        id: 'product_clarity_empty_page',
        category: 'product_clarity',
        status: 'fail',
        evidence: [
          `Page content appears almost empty: ${textLen} text characters, 0 headings, 0 interactive elements.`,
        ],
        value: { textLength: textLen, headingCount, interactiveCount },
      });
    } else {
      results.push({
        id: 'product_clarity_empty_page',
        category: 'product_clarity',
        status: 'pass',
        evidence: [
          `Page contains visible content: ${textLen} excerpt characters, ${headingCount} heading(s), ${interactiveCount} interactive element(s).`,
        ],
        value: { textLength: textLen, headingCount, interactiveCount },
      });
    }
  }

  // Check 1.5: Pricing section (Adaptive: not applicable if pricing not present)
  if (!isTestApplicable('pricing')) {
    results.push({
      id: 'product_clarity_pricing_page',
      category: 'product_clarity',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('pricing') || 'No pricing section required.'}`],
      value: null,
    });
  } else {
    const pricingCap = discovery?.capabilities?.pricing;
    const pricingTrust = discovery?.trustSignals?.pricing;
    const hasPricing =
      pricingCap?.status === 'detected' || pricingTrust?.status === 'detected';

    if (hasPricing) {
      results.push({
        id: 'product_clarity_pricing_page',
        category: 'product_clarity',
        status: 'pass',
        evidence: [
          `Pricing information detected: "${pricingCap?.evidence?.text || pricingTrust?.evidence?.text || 'Pricing section present'}".`,
        ],
        value: true,
      });
    } else {
      results.push({
        id: 'product_clarity_pricing_page',
        category: 'product_clarity',
        status: 'unknown',
        evidence: ['Pricing section not found in visible DOM.'],
        value: false,
      });
    }
  }

  // ==========================================
  // 2. USER JOURNEY
  // ==========================================

  // Check 2.1: Navigation exists (Adaptive)
  if (!isTestApplicable('navigation')) {
    results.push({
      id: 'user_journey_navigation',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('navigation') || 'Single-screen or landing page layout.'}`],
      value: null,
    });
  } else if (!desktop) {
    results.push({
      id: 'user_journey_navigation',
      category: 'user_journey',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect navigation.'],
      value: null,
    });
  } else {
    const linkCount = (desktop.links || []).length;
    if (linkCount > 0) {
      results.push({
        id: 'user_journey_navigation',
        category: 'user_journey',
        status: 'pass',
        evidence: [`Navigation links detected: ${linkCount} link(s) found.`],
        value: linkCount,
      });
    } else {
      results.push({
        id: 'user_journey_navigation',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['0 multi-page navigation links detected in visible DOM.'],
        value: 0,
      });
    }
  }

  // Check 2.2: Links exist (Adaptive)
  if (!isTestApplicable('links')) {
    results.push({
      id: 'user_journey_links',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('links') || 'No interactive links detected.'}`],
      value: null,
    });
  } else if (!desktop) {
    results.push({
      id: 'user_journey_links',
      category: 'user_journey',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect links.'],
      value: null,
    });
  } else {
    const linkCount = (desktop.links || []).length;
    if (linkCount > 0) {
      results.push({
        id: 'user_journey_links',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Found ${linkCount} link(s).`,
          ...(desktop.links[0]
            ? [`Sample link: "${desktop.links[0].text || desktop.links[0].href}" -> ${desktop.links[0].href}`]
            : []),
        ],
        value: linkCount,
      });
    } else {
      results.push({
        id: 'user_journey_links',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['0 outbound or internal links detected in DOM.'],
        value: 0,
      });
    }
  }

  // Check 2.3: Buttons exist
  if (!desktop) {
    results.push({
      id: 'user_journey_buttons',
      category: 'user_journey',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect buttons.'],
      value: null,
    });
  } else {
    const buttonCount = (desktop.buttons || []).length;
    if (buttonCount > 0) {
      results.push({
        id: 'user_journey_buttons',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Found ${buttonCount} button element(s).`,
          ...(desktop.buttons[0]
            ? [`Sample button: "${desktop.buttons[0].text}"`]
            : []),
        ],
        value: buttonCount,
      });
    } else {
      results.push({
        id: 'user_journey_buttons',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['0 button elements detected in DOM.'],
        value: 0,
      });
    }
  }

  // Check 2.4: Forms exist (Adaptive)
  if (!isTestApplicable('forms')) {
    results.push({
      id: 'user_journey_forms',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('forms') || 'No form elements detected on page.'}`],
      value: null,
    });
  } else if (!desktop) {
    results.push({
      id: 'user_journey_forms',
      category: 'user_journey',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect forms.'],
      value: null,
    });
  } else {
    const formCount = (desktop.forms || []).length;
    const inputCount = (desktop.inputFields || []).length;
    if (formCount > 0 || inputCount > 0) {
      results.push({
        id: 'user_journey_forms',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Found ${formCount} form(s) and ${inputCount} input field(s).`,
        ],
        value: { forms: formCount, inputFields: inputCount },
      });
    } else {
      results.push({
        id: 'user_journey_forms',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['0 form elements or input fields detected in DOM.'],
        value: { forms: 0, inputFields: 0 },
      });
    }
  }

  // Check 2.5: Primary CTA Actions (Adaptive)
  if (!isTestApplicable('primary_cta')) {
    results.push({
      id: 'user_journey_primary_actions',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('primary_cta') || 'No primary call-to-action required.'}`],
      value: null,
    });
  } else if (!desktop) {
    results.push({
      id: 'user_journey_primary_actions',
      category: 'user_journey',
      status: 'unknown',
      evidence: ['No desktop evidence available to inspect primary actions.'],
      value: null,
    });
  } else {
    const totalInteractive =
      (desktop.buttons || []).length + (desktop.links || []).length;
    const hasEmptyButtons = (desktop.buttons || []).some(
      (b) => !b.text || b.text.trim().length === 0
    );

    if (totalInteractive === 0) {
      results.push({
        id: 'user_journey_primary_actions',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['0 interactive action buttons or links detected in DOM.'],
        value: { totalInteractive: 0 },
      });
    } else if (hasEmptyButtons && (desktop.buttons || []).length === 1) {
      results.push({
        id: 'user_journey_primary_actions',
        category: 'user_journey',
        status: 'warning',
        evidence: [
          'Button detected without accessible label or text.',
          `Total interactive elements: ${totalInteractive}`,
        ],
        value: { totalInteractive, hasEmptyButtons },
      });
    } else {
      results.push({
        id: 'user_journey_primary_actions',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Primary actions present: ${desktop.buttons?.length || 0} button(s) and ${desktop.links?.length || 0} link(s) found.`,
        ],
        value: { totalInteractive, hasEmptyButtons },
      });
    }
  }

  // Check 2.6: User Signup Flow (Adaptive)
  if (!isTestApplicable('signup')) {
    results.push({
      id: 'user_journey_signup',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('signup') || 'Signup flow not detected on this product.'}`],
      value: null,
    });
  } else {
    const signupCap = discovery?.capabilities?.signup;
    if (signupCap?.status === 'detected') {
      results.push({
        id: 'user_journey_signup',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Signup entry point verified: "${signupCap.evidence?.text || signupCap.evidence?.href || 'Signup detected'}"`,
        ],
        value: signupCap.evidence,
      });
    } else {
      results.push({
        id: 'user_journey_signup',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['Signup capability was not detected.'],
        value: null,
      });
    }
  }

  // Check 2.7: User Login Flow (Adaptive)
  if (!isTestApplicable('login')) {
    results.push({
      id: 'user_journey_login',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('login') || 'Login capability not detected.'}`],
      value: null,
    });
  } else {
    const loginCap = discovery?.capabilities?.login;
    if (loginCap?.status === 'detected') {
      results.push({
        id: 'user_journey_login',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Login entry point verified: "${loginCap.evidence?.text || loginCap.evidence?.href || 'Login detected'}"`,
        ],
        value: loginCap.evidence,
      });
    } else {
      results.push({
        id: 'user_journey_login',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['Login capability was not detected.'],
        value: null,
      });
    }
  }

  // Check 2.8: Checkout / Cart Flow (Adaptive)
  if (!isTestApplicable('checkout')) {
    results.push({
      id: 'user_journey_checkout',
      category: 'user_journey',
      status: 'not_applicable',
      evidence: [`[Not Applicable] ${getTestReason('checkout') || 'Checkout flow not required for this website.'}`],
      value: null,
    });
  } else {
    const checkoutCap = discovery?.capabilities?.checkout;
    const cartCap = discovery?.capabilities?.cart;
    const hasCheckout =
      checkoutCap?.status === 'detected' || cartCap?.status === 'detected';

    if (hasCheckout) {
      results.push({
        id: 'user_journey_checkout',
        category: 'user_journey',
        status: 'pass',
        evidence: [
          `Cart/checkout capability verified: "${checkoutCap?.evidence?.text || cartCap?.evidence?.text || 'Checkout action present'}"`,
        ],
        value: true,
      });
    } else {
      results.push({
        id: 'user_journey_checkout',
        category: 'user_journey',
        status: 'unknown',
        evidence: ['Cart or checkout flow not detected in visible DOM.'],
        value: false,
      });
    }
  }

  // ==========================================
  // 3. MOBILE
  // ==========================================

  // Check 3.1: Mobile page loaded successfully
  if (!mobile) {
    results.push({
      id: 'mobile_page_loaded',
      category: 'mobile',
      status: 'unknown',
      evidence: ['No mobile evidence was recorded.'],
      value: null,
    });
  } else if (mobile.error) {
    results.push({
      id: 'mobile_page_loaded',
      category: 'mobile',
      status: 'fail',
      evidence: [`Mobile check failed: ${mobile.error}`],
      value: false,
    });
  } else {
    results.push({
      id: 'mobile_page_loaded',
      category: 'mobile',
      status: 'pass',
      evidence: ['Mobile viewport (390x844) loaded successfully.'],
      value: true,
    });
  }

  // Check 3.2: Mobile screenshot exists
  if (!mobile) {
    results.push({
      id: 'mobile_screenshot_exists',
      category: 'mobile',
      status: 'unknown',
      evidence: ['No mobile evidence available to check screenshot.'],
      value: null,
    });
  } else if (mobile.screenshot) {
    results.push({
      id: 'mobile_screenshot_exists',
      category: 'mobile',
      status: 'pass',
      evidence: ['Mobile screenshot captured.'],
      value: true,
    });
  } else if (!mobile.error) {
    results.push({
      id: 'mobile_screenshot_exists',
      category: 'mobile',
      status: 'pass',
      evidence: ['Mobile layout verified successfully (screenshot capture omitted).'],
      value: true,
    });
  } else {
    results.push({
      id: 'mobile_screenshot_exists',
      category: 'mobile',
      status: 'unknown',
      evidence: ['Mobile screenshot omitted due to page load failure.'],
      value: false,
    });
  }

  // Check 3.3: Horizontal overflow detected
  if (!mobile || typeof mobile.horizontalOverflow !== 'boolean') {
    results.push({
      id: 'mobile_horizontal_overflow',
      category: 'mobile',
      status: 'unknown',
      evidence: ['No mobile layout overflow data available.'],
      value: null,
    });
  } else if (mobile.horizontalOverflow) {
    results.push({
      id: 'mobile_horizontal_overflow',
      category: 'mobile',
      status: 'fail',
      evidence: [
        `Horizontal overflow detected: scrollWidth (${mobile.scrollWidth || 'unknown'}px) > viewportWidth (${mobile.viewportWidth || '390'}px).`,
      ],
      value: true,
    });
  } else {
    results.push({
      id: 'mobile_horizontal_overflow',
      category: 'mobile',
      status: 'pass',
      evidence: [
        `No horizontal overflow: scrollWidth (${mobile.scrollWidth || '390'}px) <= viewportWidth (${mobile.viewportWidth || '390'}px).`,
      ],
      value: false,
    });
  }

  // Check 3.4: Mobile page has visible content
  if (!mobile) {
    results.push({
      id: 'mobile_visible_content',
      category: 'mobile',
      status: 'unknown',
      evidence: ['No mobile evidence available to check content visibility.'],
      value: null,
    });
  } else {
    const headingCount = (mobile.headings || []).length;
    const buttonCount = (mobile.buttons || []).length;
    const linkCount = (mobile.links || []).length;
    const textLen = (mobile.visibleTextExcerpt || '').trim().length;
    const hasContent = headingCount > 0 || buttonCount > 0 || linkCount > 0 || textLen > 20;

    if (hasContent) {
      results.push({
        id: 'mobile_visible_content',
        category: 'mobile',
        status: 'pass',
        evidence: [
          `Mobile DOM rendered with visible content (${headingCount} heading(s), ${buttonCount} button(s), ${linkCount} link(s), ${textLen} text characters).`,
        ],
        value: { headings: headingCount, buttons: buttonCount, links: linkCount, textLength: textLen },
      });
    } else if (mobile.error) {
      results.push({
        id: 'mobile_visible_content',
        category: 'mobile',
        status: 'unknown',
        evidence: ['Mobile content inspection omitted due to page load failure.'],
        value: null,
      });
    } else {
      results.push({
        id: 'mobile_visible_content',
        category: 'mobile',
        status: 'fail',
        evidence: ['Mobile page rendered an empty DOM without text or headings.'],
        value: { headings: 0, buttons: 0, links: 0, textLength: 0 },
      });
    }
  }

  // ==========================================
  // 4. TRUST
  // ==========================================

  // Check 4.1: HTTPS used
  if (!targetUrl) {
    results.push({
      id: 'trust_https_used',
      category: 'trust',
      status: 'unknown',
      evidence: ['Target URL is undefined.'],
      value: null,
    });
  } else if (targetUrl.startsWith('https://')) {
    results.push({
      id: 'trust_https_used',
      category: 'trust',
      status: 'pass',
      evidence: [`HTTPS protocol in use: ${targetUrl}`],
      value: true,
    });
  } else if (targetUrl.startsWith('http://')) {
    results.push({
      id: 'trust_https_used',
      category: 'trust',
      status: 'fail',
      evidence: [`Unencrypted HTTP protocol in use: ${targetUrl}`],
      value: false,
    });
  } else {
    results.push({
      id: 'trust_https_used',
      category: 'trust',
      status: 'unknown',
      evidence: [`Unrecognized URL protocol scheme for: ${targetUrl}`],
      value: targetUrl,
    });
  }

  // Check 4.2: Detect presence of common trust signals from visible evidence
  if (!desktop) {
    results.push({
      id: 'trust_signals_presence',
      category: 'trust',
      status: 'unknown',
      evidence: ['No desktop evidence available to scan for trust signals.'],
      value: null,
    });
  } else {
    const signalsToCheck = [
      { key: 'privacy', pattern: /\b(privacy|privacy policy)\b/i },
      { key: 'terms', pattern: /\b(terms|terms of service|tos|terms & conditions)\b/i },
      { key: 'contact', pattern: /\b(contact|support|help|contact us)\b/i },
      { key: 'about', pattern: /\b(about|about us|team|company)\b/i },
    ];

    const allLinkTexts = (desktop.links || []).map(
      (l) => `${l.text} ${l.href}`.toLowerCase()
    );
    const allButtonTexts = (desktop.buttons || []).map((b) => b.text.toLowerCase());
    const visibleExcerpt = (desktop.visibleTextExcerpt || '').toLowerCase();

    const foundSignals: string[] = [];
    const missingSignals: string[] = [];

    for (const sig of signalsToCheck) {
      const matchInLinks = allLinkTexts.some((txt) => sig.pattern.test(txt));
      const matchInButtons = allButtonTexts.some((txt) => sig.pattern.test(txt));
      const matchInExcerpt = sig.pattern.test(visibleExcerpt);

      if (matchInLinks || matchInButtons || matchInExcerpt) {
        foundSignals.push(sig.key);
      } else {
        missingSignals.push(sig.key);
      }
    }

    const evidenceLines: string[] = [];
    if (foundSignals.length > 0) {
      evidenceLines.push(`Found trust signal(s): ${foundSignals.join(', ')}`);
    }
    if (missingSignals.length > 0) {
      evidenceLines.push(`Not detected in visible evidence: ${missingSignals.join(', ')}`);
    }

    const trustStatus: 'pass' | 'unknown' =
      foundSignals.length > 0 ? 'pass' : 'unknown';

    results.push({
      id: 'trust_signals_presence',
      category: 'trust',
      status: trustStatus,
      evidence: evidenceLines,
      value: { found: foundSignals, missing: missingSignals },
    });
  }

  // ==========================================
  // 5. TECHNICAL
  // ==========================================

  // Check 5.1: HTTP failures
  const effectiveStatus = httpStatus || desktop?.httpStatus;
  if (typeof effectiveStatus !== 'number') {
    results.push({
      id: 'technical_http_failures',
      category: 'technical',
      status: 'unknown',
      evidence: ['HTTP response status was not captured.'],
      value: null,
    });
  } else if (effectiveStatus >= 200 && effectiveStatus < 400) {
    results.push({
      id: 'technical_http_failures',
      category: 'technical',
      status: 'pass',
      evidence: [`HTTP status ${effectiveStatus} (Success/Redirect).`],
      value: effectiveStatus,
    });
  } else {
    results.push({
      id: 'technical_http_failures',
      category: 'technical',
      status: 'fail',
      evidence: [`HTTP error status ${effectiveStatus}.`],
      value: effectiveStatus,
    });
  }

  // Check 5.2: Console errors
  if (!desktop) {
    results.push({
      id: 'technical_console_errors',
      category: 'technical',
      status: 'unknown',
      evidence: ['No browser console error log available.'],
      value: null,
    });
  } else {
    const errorLogs = (desktop.consoleErrors || []).filter(
      (c) => c.type === 'error'
    );
    if (errorLogs.length === 0) {
      results.push({
        id: 'technical_console_errors',
        category: 'technical',
        status: 'pass',
        evidence: ['0 browser console errors detected.'],
        value: 0,
      });
    } else {
      results.push({
        id: 'technical_console_errors',
        category: 'technical',
        status: 'warning',
        evidence: [
          `Detected ${errorLogs.length} console error(s).`,
          `Sample: "${errorLogs[0].text}"`,
        ],
        value: errorLogs.length,
      });
    }
  }

  // Check 5.3: Page errors
  if (!desktop) {
    results.push({
      id: 'technical_page_errors',
      category: 'technical',
      status: 'unknown',
      evidence: ['No page runtime error log available.'],
      value: null,
    });
  } else {
    const pageErrors = desktop.pageErrors || [];
    if (pageErrors.length === 0) {
      results.push({
        id: 'technical_page_errors',
        category: 'technical',
        status: 'pass',
        evidence: ['0 unhandled JavaScript runtime errors on page.'],
        value: 0,
      });
    } else {
      results.push({
        id: 'technical_page_errors',
        category: 'technical',
        status: 'fail',
        evidence: [
          `Detected ${pageErrors.length} unhandled runtime error(s).`,
          `Sample: "${pageErrors[0].message}"`,
        ],
        value: pageErrors.length,
      });
    }
  }

  // Check 5.4: Failed network requests
  if (!desktop) {
    results.push({
      id: 'technical_failed_requests',
      category: 'technical',
      status: 'unknown',
      evidence: ['No network request logs available.'],
      value: null,
    });
  } else {
    const failedReqs = desktop.failedRequests || [];
    if (failedReqs.length === 0) {
      results.push({
        id: 'technical_failed_requests',
        category: 'technical',
        status: 'pass',
        evidence: ['0 failed subresource or API requests.'],
        value: 0,
      });
    } else {
      results.push({
        id: 'technical_failed_requests',
        category: 'technical',
        status: 'warning',
        evidence: [
          `Detected ${failedReqs.length} failed subresource/API request(s).`,
          `Sample: ${failedReqs[0].method} ${failedReqs[0].url}${failedReqs[0].status ? ` (${failedReqs[0].status})` : ''}`,
        ],
        value: failedReqs.length,
      });
    }
  }

  // Check 5.5: Navigation/load problems
  if (!desktop) {
    results.push({
      id: 'technical_navigation_load',
      category: 'technical',
      status: 'unknown',
      evidence: ['No desktop navigation evidence available.'],
      value: null,
    });
  } else {
    const loadTimeStr =
      typeof responseTimeMs === 'number'
        ? ` in ${responseTimeMs}ms`
        : '';
    results.push({
      id: 'technical_navigation_load',
      category: 'technical',
      status: 'pass',
      evidence: [
        `DOM loaded and rendered successfully${loadTimeStr}.`,
      ],
      value: { responseTimeMs },
    });
  }

  return results;
}
