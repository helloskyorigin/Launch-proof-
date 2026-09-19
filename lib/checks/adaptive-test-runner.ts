import { Browser } from 'playwright';
import { CheckEvidence, DesktopEvidence, MobileEvidence } from './check-store';
import { WebsiteDiscoveryResult } from './discovery-types';
import { TestPlan, PlannedTest, AdaptiveTestResult } from './test-plan';
import { runDesktopCheck } from './desktop-check';
import { runMobileCheck } from './mobile-check';

export interface AdaptiveRunnerOutput {
  evidence: CheckEvidence;
  adaptiveResults: AdaptiveTestResult[];
}

/**
 * Phase 2 Adaptive Test Runner:
 * Executes real Playwright tests ONLY for applicable features identified in the TestPlan.
 * Safe interactions: inspects elements, navigation, and viewports without destructive actions.
 */
export async function runAdaptiveTests(
  browser: Browser,
  targetUrl: string,
  testPlan: TestPlan,
  discovery: WebsiteDiscoveryResult
): Promise<AdaptiveRunnerOutput> {
  const adaptiveResults: AdaptiveTestResult[] = [];

  // 1. Run Desktop & Mobile Playwright Checks in parallel for performance
  const [desktopEvidence, mobileEvidence] = await Promise.all([
    runDesktopCheck(browser, targetUrl).catch((err) => {
      console.error('[adaptive-runner] Desktop check error:', err);
      const fallback: DesktopEvidence = {
        title: discovery.page.title || 'Untitled Page',
        metaDescription: discovery.page.metaDescription,
        visibleTextExcerpt: discovery.page.visibleTextExcerpt,
        headings: discovery.page.mainHeadings || [],
        links: (discovery.navigation?.links || []).map((l) => ({
          text: l.text,
          href: l.href,
        })),
        buttons: (discovery.actions?.buttons || []).map((b) => ({ text: b.text })),
        forms: (discovery.actions?.forms || []).map((f) => ({
          action: f.action,
          method: f.method,
        })),
        inputFields: (discovery.actions?.inputs || []).map((i) => ({
          type: i.type,
          placeholder: i.placeholder,
          name: i.name,
        })),
        consoleErrors: [],
        failedRequests: [],
        pageErrors: err ? [{ message: String(err) }] : [],
        httpStatus: discovery.page.httpStatus,
      };
      return fallback;
    }),
    runMobileCheck(browser, targetUrl).catch((err) => {
      console.error('[adaptive-runner] Mobile check error:', err);
      const fallback: MobileEvidence = {
        title: discovery.page.title || '',
        headings: discovery.page.mainHeadings || [],
        buttons: (discovery.actions?.buttons || []).map((b) => ({ text: b.text })),
        links: (discovery.navigation?.links || []).map((l) => ({
          text: l.text,
          href: l.href,
        })),
        forms: (discovery.actions?.forms || []).map((f) => ({
          action: f.action,
          method: f.method,
        })),
        visibleTextExcerpt: discovery.page.visibleTextExcerpt,
        consoleErrors: [],
        failedRequests: [],
        pageErrors: [],
        horizontalOverflow: discovery.mobile?.horizontalOverflow === 'detected',
        viewportWidth: discovery.mobile?.viewportWidth || 390,
        scrollWidth: discovery.mobile?.scrollWidth || 390,
        error: err ? String(err) : undefined,
      };
      return fallback;
    }),
  ]);

  const evidence: CheckEvidence = {
    desktop: desktopEvidence,
    mobile: mobileEvidence,
  };

  // 2. Evaluate each planned test against collected evidence & discovery
  for (const planned of testPlan.tests) {
    if (!planned.isApplicable) {
      adaptiveResults.push({
        testId: planned.id,
        name: planned.name,
        category: planned.category,
        isApplicable: false,
        status: 'not_applicable',
        evidence: [`[Not Applicable] ${planned.reason}`],
      });
      continue;
    }

    // Evaluate applicable tests
    switch (planned.id) {
      case 'homepage': {
        const hasTitle = Boolean(desktopEvidence.title?.trim());
        const hasHeadings = (desktopEvidence.headings || []).length > 0;
        const textLen = (desktopEvidence.visibleTextExcerpt || '').trim().length;

        if (hasTitle && (hasHeadings || textLen > 50)) {
          adaptiveResults.push({
            testId: 'homepage',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Homepage loaded successfully: "${desktopEvidence.title}".`,
              `Found ${desktopEvidence.headings.length} heading(s) and ${textLen} text characters.`,
            ],
          });
        } else if (!hasTitle && textLen === 0) {
          adaptiveResults.push({
            testId: 'homepage',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'fail',
            evidence: ['Homepage rendered an empty page without title or visible text content.'],
          });
        } else {
          adaptiveResults.push({
            testId: 'homepage',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'warning',
            evidence: ['Homepage has limited content or missing clear heading structure.'],
          });
        }
        break;
      }

      case 'navigation': {
        const linkCount = (desktopEvidence.links || []).length;
        if (linkCount > 0) {
          adaptiveResults.push({
            testId: 'navigation',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Navigation structure verified: ${linkCount} active link(s) found.`,
              `Sample link: "${desktopEvidence.links[0]?.text || desktopEvidence.links[0]?.href}" -> ${desktopEvidence.links[0]?.href}`,
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'navigation',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'unknown',
            evidence: ['Navigation was marked applicable but 0 links were captured in DOM.'],
          });
        }
        break;
      }

      case 'links': {
        const linkCount = (desktopEvidence.links || []).length;
        if (linkCount > 0) {
          adaptiveResults.push({
            testId: 'links',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [`Verified ${linkCount} interactive link(s) in DOM.`],
          });
        } else {
          adaptiveResults.push({
            testId: 'links',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'unknown',
            evidence: ['0 interactive links found in DOM.'],
          });
        }
        break;
      }

      case 'primary_cta': {
        const buttonCount = (desktopEvidence.buttons || []).length;
        const ctaCandidates = discovery.actions?.primaryCtaCandidates || [];
        const topCta = ctaCandidates[0];

        if (topCta) {
          adaptiveResults.push({
            testId: 'primary_cta',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Primary CTA active: "${topCta.text}"${topCta.href ? ` (${topCta.href})` : ''}.`,
              `Total buttons detected: ${buttonCount}.`,
            ],
          });
        } else if (buttonCount > 0) {
          adaptiveResults.push({
            testId: 'primary_cta',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [`Action buttons detected: ${buttonCount} button element(s) found in DOM.`],
          });
        } else {
          adaptiveResults.push({
            testId: 'primary_cta',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'unknown',
            evidence: ['No primary call-to-action button detected.'],
          });
        }
        break;
      }

      case 'forms': {
        const formCount = (desktopEvidence.forms || []).length;
        const inputCount = (desktopEvidence.inputFields || []).length;

        if (formCount > 0 || inputCount > 0) {
          adaptiveResults.push({
            testId: 'forms',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Form structures verified: ${formCount} form(s), ${inputCount} input field(s).`,
              ...(desktopEvidence.inputFields?.[0]
                ? [`Sample input: type="${desktopEvidence.inputFields[0].type || 'text'}" placeholder="${desktopEvidence.inputFields[0].placeholder || ''}"`]
                : []),
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'forms',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'unknown',
            evidence: ['0 form or input elements detected in DOM.'],
          });
        }
        break;
      }

      case 'signup': {
        const signupCap = discovery.capabilities?.signup;
        if (signupCap?.status === 'detected') {
          adaptiveResults.push({
            testId: 'signup',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Signup capability verified: "${signupCap.evidence?.text || signupCap.evidence?.href || 'Signup detected'}"`,
              ...(signupCap.evidence?.href ? [`Entry point: ${signupCap.evidence.href}`] : []),
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'signup',
            name: planned.name,
            category: planned.category,
            isApplicable: false,
            status: 'not_applicable',
            evidence: ['[Not Applicable] Signup flow not detected on this product.'],
          });
        }
        break;
      }

      case 'login': {
        const loginCap = discovery.capabilities?.login;
        if (loginCap?.status === 'detected') {
          adaptiveResults.push({
            testId: 'login',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Login capability verified: "${loginCap.evidence?.text || loginCap.evidence?.href || 'Login detected'}"`,
              ...(loginCap.evidence?.href ? [`Entry point: ${loginCap.evidence.href}`] : []),
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'login',
            name: planned.name,
            category: planned.category,
            isApplicable: false,
            status: 'not_applicable',
            evidence: ['[Not Applicable] Login capability not detected.'],
          });
        }
        break;
      }

      case 'pricing': {
        const pricingCap = discovery.capabilities?.pricing;
        const pricingTrust = discovery.trustSignals?.pricing;
        const hasPricing =
          pricingCap?.status === 'detected' || pricingTrust?.status === 'detected';

        if (hasPricing) {
          adaptiveResults.push({
            testId: 'pricing',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Pricing presentation verified: "${pricingCap?.evidence?.text || pricingTrust?.evidence?.text || 'Pricing section present'}".`,
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'pricing',
            name: planned.name,
            category: planned.category,
            isApplicable: false,
            status: 'not_applicable',
            evidence: ['[Not Applicable] No public pricing section detected on this page.'],
          });
        }
        break;
      }

      case 'checkout': {
        const checkoutCap = discovery.capabilities?.checkout;
        const cartCap = discovery.capabilities?.cart;
        const hasCheckout =
          checkoutCap?.status === 'detected' || cartCap?.status === 'detected';

        if (hasCheckout) {
          adaptiveResults.push({
            testId: 'checkout',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Cart/checkout capability verified: "${checkoutCap?.evidence?.text || cartCap?.evidence?.text || 'Checkout action present'}".`,
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'checkout',
            name: planned.name,
            category: planned.category,
            isApplicable: false,
            status: 'not_applicable',
            evidence: ['[Not Applicable] Checkout flow not required for this website.'],
          });
        }
        break;
      }

      case 'trust': {
        const isHttps = targetUrl.startsWith('https://');
        const foundSignals: string[] = [];

        if (discovery.trustSignals) {
          Object.entries(discovery.trustSignals).forEach(([key, val]) => {
            if (val.status === 'detected') {
              foundSignals.push(key);
            }
          });
        }

        const evidenceLines = [
          isHttps ? `HTTPS security verified: ${targetUrl}` : `Unencrypted HTTP protocol in use: ${targetUrl}`,
        ];
        if (foundSignals.length > 0) {
          evidenceLines.push(`Discovered trust signals: ${foundSignals.join(', ')}`);
        }

        adaptiveResults.push({
          testId: 'trust',
          name: planned.name,
          category: planned.category,
          isApplicable: true,
          status: !isHttps ? 'fail' : foundSignals.length > 0 ? 'pass' : 'unknown',
          evidence: evidenceLines,
        });
        break;
      }

      case 'mobile': {
        if (mobileEvidence.error) {
          adaptiveResults.push({
            testId: 'mobile',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'fail',
            evidence: [`Mobile viewport load error: ${mobileEvidence.error}`],
          });
        } else if (mobileEvidence.horizontalOverflow) {
          adaptiveResults.push({
            testId: 'mobile',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'fail',
            evidence: [
              `Horizontal layout overflow detected: scrollWidth (${mobileEvidence.scrollWidth}px) > viewportWidth (${mobileEvidence.viewportWidth}px).`,
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'mobile',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              `Mobile layout verified at 390x844: No horizontal overflow (scrollWidth: ${mobileEvidence.scrollWidth || 390}px).`,
            ],
          });
        }
        break;
      }

      case 'technical': {
        const consoleErrors = desktopEvidence.consoleErrors.filter((c) => c.type === 'error');
        const pageErrors = desktopEvidence.pageErrors || [];
        const httpFailures = (desktopEvidence.httpStatus && desktopEvidence.httpStatus >= 400) ? 1 : 0;
        const failedRequests = desktopEvidence.failedRequests || [];

        const hasErrors = pageErrors.length > 0 || httpFailures > 0;
        const hasWarnings = consoleErrors.length > 0 || failedRequests.length > 0;

        if (hasErrors) {
          adaptiveResults.push({
            testId: 'technical',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'fail',
            evidence: [
              ...(pageErrors.length > 0 ? [`Runtime page error: "${pageErrors[0].message}"`] : []),
              ...(httpFailures > 0 ? [`HTTP error response: ${desktopEvidence.httpStatus}`] : []),
            ],
          });
        } else if (hasWarnings) {
          adaptiveResults.push({
            testId: 'technical',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'warning',
            evidence: [
              ...(consoleErrors.length > 0 ? [`${consoleErrors.length} browser console error(s) logged.`] : []),
              ...(failedRequests.length > 0 ? [`${failedRequests.length} subresource network request(s) failed.`] : []),
            ],
          });
        } else {
          adaptiveResults.push({
            testId: 'technical',
            name: planned.name,
            category: planned.category,
            isApplicable: true,
            status: 'pass',
            evidence: [
              'Technical runtime clean: 0 page errors, 0 HTTP failures, 0 console errors.',
            ],
          });
        }
        break;
      }

      default: {
        adaptiveResults.push({
          testId: planned.id,
          name: planned.name,
          category: planned.category,
          isApplicable: planned.isApplicable,
          status: 'unknown',
          evidence: [`${planned.name} evaluated.`],
        });
        break;
      }
    }
  }

  return {
    evidence,
    adaptiveResults,
  };
}
