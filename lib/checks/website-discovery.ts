import { Browser, BrowserContext, Page } from 'playwright';
import { launchBrowser } from './browser';
import { validateProductUrl } from './url-validation';
import {
  WebsiteDiscoveryResult,
  DiscoverySignalStatus,
  DiscoveredCapability,
  DiscoveredLink,
  DiscoveredButton,
  DiscoveredPrimaryCta,
  DiscoveredForm,
  DiscoveredInput,
} from './discovery-types';

interface DiscoveryNavigationInfo {
  finalUrl: string;
  httpStatus?: number;
  responseTimeMs?: number;
  title: string;
  metaDescription?: string;
  headings: string[];
  visibleText: string;
  language?: string;
  screenshot?: string;
}

/**
 * Validates a redirect URL against SSRF and private IP rules
 */
function isSafeRedirectUrl(url: string, originHost: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const validation = validateProductUrl(url);
    return validation.isValid;
  } catch {
    return false;
  }
}

/**
 * Extracts comprehensive DOM & action evidence from desktop page
 */
async function extractDesktopDiscoveryData(
  page: Page,
  baseUrl: string,
  finalUrl: string
): Promise<{
  pageInfo: {
    title: string;
    metaDescription?: string;
    headings: string[];
    visibleText: string;
    language?: string;
  };
  navigation: {
    links: DiscoveredLink[];
    internalLinks: DiscoveredLink[];
    externalLinks: DiscoveredLink[];
  };
  actions: {
    buttons: DiscoveredButton[];
    primaryCtaCandidates: DiscoveredPrimaryCta[];
    forms: DiscoveredForm[];
    inputs: DiscoveredInput[];
  };
  capabilities: WebsiteDiscoveryResult['capabilities'];
  trustSignals: WebsiteDiscoveryResult['trustSignals'];
}> {
  return await page.evaluate(
    ({ baseUrl, finalUrl }) => {
      // Helper: Check if element is visually rendered and visible
      const isVisible = (el: Element | null): boolean => {
        if (!el) return false;
        try {
          const style = window.getComputedStyle(el);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0'
          ) {
            return false;
          }
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 && rect.height <= 0) {
            return false;
          }
          return true;
        } catch {
          return false;
        }
      };

      // Helper: Check if interactive element is disabled
      const isDisabled = (el: Element | null): boolean => {
        if (!el) return false;
        return (
          el.hasAttribute('disabled') ||
          el.getAttribute('aria-disabled') === 'true' ||
          el.classList.contains('disabled')
        );
      };

      // Helper: Extract accessible text
      const getAccessibleText = (el: Element): string => {
        const text =
          (el as HTMLElement).innerText ||
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          (el as HTMLInputElement).value ||
          el.textContent ||
          '';
        return text.replace(/\s+/g, ' ').trim();
      };

      // 1. Page Info
      const title = document.title ? document.title.trim() : '';
      const metaDescEl =
        document.querySelector('meta[name="description"]') ||
        document.querySelector('meta[property="og:description"]');
      const metaDescription = metaDescEl
        ? (metaDescEl.getAttribute('content') || '').trim()
        : undefined;

      const language =
        document.documentElement.lang ||
        document.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') ||
        undefined;

      const headingEls = Array.from(document.querySelectorAll('h1, h2, h3'));
      const headings = headingEls
        .filter((h) => isVisible(h))
        .map((h) => (h.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((t) => t.length > 0)
        .slice(0, 30);

      const visibleText = (document.body?.innerText || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);

      // 2. Links & Navigation
      const originHost = new URL(finalUrl || baseUrl).hostname.toLowerCase();
      const rawLinks = Array.from(document.querySelectorAll('a[href]'));
      const linksMap = new Map<string, DiscoveredLink>();

      rawLinks.forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }

        let fullUrl = href;
        let isInternal = true;
        try {
          const parsed = new URL(href, finalUrl);
          fullUrl = parsed.href;
          isInternal = parsed.hostname.toLowerCase() === originHost;
        } catch {
          // ignore malformed URLs
        }

        const text = getAccessibleText(a);
        const key = `${fullUrl}|${text}`;

        if (!linksMap.has(key) && (text.length > 0 || href.length > 1)) {
          linksMap.set(key, {
            text: text.slice(0, 100),
            href: fullUrl,
            isInternal,
          });
        }
      });

      const allLinks = Array.from(linksMap.values()).slice(0, 80);
      const internalLinks = allLinks.filter((l) => l.isInternal);
      const externalLinks = allLinks.filter((l) => !l.isInternal);

      // 3. Buttons & Actions (rendered DOM inspection across buttons, role=button, inputs, and button-like anchors)
      const rawButtonCandidates = Array.from(
        document.querySelectorAll(
          'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], a[role="button"], a.btn, a.button, a[class*="btn" i], a[class*="button" i], a[class*="cta" i]'
        )
      );

      const seenButtons = new Set<string>();
      const buttons: DiscoveredButton[] = [];

      rawButtonCandidates.forEach((b) => {
        if (!isVisible(b)) return;
        const text = getAccessibleText(b);
        if (!text || text.length === 0) return;

        let location = 'body';
        if (b.closest('nav, header')) location = 'header';
        else if (b.closest('footer')) location = 'footer';
        else if (b.closest('main, [role="main"], section, .hero, [class*="hero" i]')) location = 'hero/main';

        const key = `${text.toLowerCase()}|${location}`;
        if (!seenButtons.has(key)) {
          seenButtons.add(key);
          buttons.push({
            text: text.slice(0, 80),
            location,
          });
        }
      });

      // 4. Primary CTA Candidates
      const ctaPatterns = [
        /get\s*started/i,
        /start\s*free/i,
        /try\s*free/i,
        /try\s*now/i,
        /sign\s*up/i,
        /join\s*free/i,
        /book\s*(a\s*)?demo/i,
        /start\s*(a\s*)?trial/i,
        /buy\s*now/i,
        /subscribe/i,
        /create\s*account/i,
        /learn\s*more/i,
        /contact\s*us/i,
        /get\s*in\s*touch/i,
        /test\s*now/i,
        /check\s*now/i,
        /explore/i,
        /launch/i,
      ];

      const primaryCtaCandidates: DiscoveredPrimaryCta[] = [];
      const seenCtas = new Set<string>();

      // Search buttons for CTA patterns
      buttons.forEach((b) => {
        if (ctaPatterns.some((p) => p.test(b.text))) {
          const key = b.text.toLowerCase();
          if (!seenCtas.has(key)) {
            seenCtas.add(key);
            primaryCtaCandidates.push({
              text: b.text,
              location: b.location,
            });
          }
        }
      });

      // Search links for CTA patterns
      allLinks.forEach((l) => {
        if (ctaPatterns.some((p) => p.test(l.text))) {
          const key = l.text.toLowerCase();
          if (!seenCtas.has(key)) {
            seenCtas.add(key);
            primaryCtaCandidates.push({
              text: l.text,
              href: l.href,
              location: 'link',
            });
          }
        }
      });

      // Fallback: If no explicit pattern match but active buttons exist in hero/header, pick prominent button
      if (primaryCtaCandidates.length === 0 && buttons.length > 0) {
        const prominent = buttons.find((b) => b.location === 'hero/main' || b.location === 'header') || buttons[0];
        if (prominent) {
          primaryCtaCandidates.push({
            text: prominent.text,
            location: prominent.location,
          });
        }
      }

      // 5. Forms & Inputs
      const rawForms = Array.from(document.querySelectorAll('form'));
      const forms: DiscoveredForm[] = rawForms
        .filter((f) => isVisible(f) || f.querySelectorAll('input, select, textarea').length > 0)
        .map((f) => {
          const action = f.getAttribute('action') || undefined;
          const method = (f.getAttribute('method') || 'GET').toUpperCase();
          const inputsCount = Array.from(f.querySelectorAll('input, select, textarea')).filter((i) =>
            isVisible(i) && (i as HTMLInputElement).type !== 'hidden'
          ).length;
          return { action, method, inputsCount };
        })
        .slice(0, 15);

      const rawInputs = Array.from(
        document.querySelectorAll(
          'input:not([type="hidden"]), textarea, select, [role="textbox"], [role="searchbox"], [role="combobox"]'
        )
      );

      const inputs: DiscoveredInput[] = rawInputs
        .filter((el) => isVisible(el))
        .map((el) => {
          const tagName = el.tagName.toLowerCase();
          const type =
            el.getAttribute('type') ||
            (tagName === 'textarea' ? 'textarea' : tagName === 'select' ? 'select' : el.getAttribute('role') || 'text');
          const name = el.getAttribute('name') || el.getAttribute('id') || undefined;
          const placeholder =
            el.getAttribute('placeholder') || el.getAttribute('aria-label') || undefined;
          return { type, name, placeholder };
        })
        .slice(0, 30);

      // Helper function to test capability
      const detectCapability = (
        textRegex: RegExp,
        hrefRegex?: RegExp,
        selectorQuery?: string
      ): DiscoveredCapability => {
        // Check selector presence
        if (selectorQuery) {
          try {
            const el = document.querySelector(selectorQuery);
            if (el && isVisible(el)) {
              const text = getAccessibleText(el) || selectorQuery;
              return {
                status: 'detected',
                evidence: {
                  text: text.slice(0, 80),
                  selector: selectorQuery,
                },
              };
            }
          } catch {}
        }

        // Check buttons
        const matchingBtn = buttons.find((b) => textRegex.test(b.text));
        if (matchingBtn) {
          return {
            status: 'detected',
            evidence: {
              text: matchingBtn.text,
              location: matchingBtn.location,
            },
          };
        }

        // Check links
        const matchingLink = allLinks.find((l) => {
          if (textRegex.test(l.text)) return true;
          if (hrefRegex && hrefRegex.test(l.href)) return true;
          return false;
        });

        if (matchingLink) {
          return {
            status: 'detected',
            evidence: {
              text: matchingLink.text,
              href: matchingLink.href,
            },
          };
        }

        // Check inputs
        if (selectorQuery === undefined && textRegex) {
          const matchingInput = inputs.find((inp) =>
            (inp.placeholder && textRegex.test(inp.placeholder)) ||
            (inp.name && textRegex.test(inp.name))
          );
          if (matchingInput) {
            return {
              status: 'detected',
              evidence: {
                text: matchingInput.placeholder || matchingInput.name,
                detail: `Input field (${matchingInput.type || 'text'})`,
              },
            };
          }
        }

        return { status: 'not_detected' };
      };

      // 6. Product & Feature Capabilities
      const capabilities: WebsiteDiscoveryResult['capabilities'] = {
        signup: detectCapability(
          /sign\s*up|get\s*started|start\s*free|try\s*free|register|join\s*free|create\s*account/i,
          /\/sign-?up|\/register|\/start/i
        ),
        login: detectCapability(
          /log\s*in|sign\s*in|login|signin|member\s*login/i,
          /\/login|\/signin|\/auth/i
        ),
        logout: detectCapability(
          /log\s*out|sign\s*out|logout|signout/i,
          /\/logout|\/signout/i
        ),
        onboarding: detectCapability(
          /onboarding|walkthrough|setup\s*guide|welcome\s*tour/i,
          /\/onboarding|\/welcome|\/setup/i
        ),
        dashboard: detectCapability(
          /dashboard|console|portal|open\s*app|go\s*to\s*app/i,
          /\/dashboard|\/app|\/console|\/portal/i
        ),
        appWorkspace: detectCapability(
          /workspace|studio|projects|team\s*space/i,
          /\/workspace|\/studio|\/projects/i
        ),
        projectCreation: detectCapability(
          /new\s*project|create\s*project|new\s*board|create\s*app|add\s*new/i,
          /\/new|\/create|\/projects\/new/i
        ),
        search: detectCapability(
          /search/i,
          /\/search/i,
          'input[type="search"], input[name*="search" i], input[placeholder*="search" i], button[aria-label*="search" i]'
        ),
        upload: detectCapability(
          /upload|choose\s*file|browse\s*file|drop\s*file/i,
          /\/upload/i,
          'input[type="file"]'
        ),
        checkout: detectCapability(
          /checkout|buy\s*now|proceed\s*to\s*checkout|pay\s*now/i,
          /\/checkout|\/pay/i
        ),
        cart: detectCapability(
          /cart|bag|basket|items\s*in\s*cart/i,
          /\/cart|\/bag|\/basket/i,
          '[data-testid*="cart" i], a[href*="cart" i], button[aria-label*="cart" i]'
        ),
        pricing: detectCapability(
          /pricing|plans|compare\s*plans|view\s*pricing|subscription/i,
          /\/pricing|\/plans|\/tiers/i
        ),
        contact: detectCapability(
          /contact|get\s*in\s*touch|contact\s*us|talk\s*to\s*sales|talk\s*to\s*us/i,
          /\/contact|mailto:/i
        ),
        support: detectCapability(
          /support|help\s*center|help|knowledge\s*base|faq|faqs/i,
          /\/help|\/support|\/faq/i
        ),
        documentation: detectCapability(
          /docs|documentation|api\s*reference|developer\s*docs|guides/i,
          /\/docs|\/documentation|\/api/i
        ),
        accountProfile: detectCapability(
          /my\s*account|profile|account\s*settings|user\s*settings/i,
          /\/account|\/profile|\/settings/i
        ),
        passwordReset: detectCapability(
          /forgot\s*password|reset\s*password|recover\s*account/i,
          /\/forgot-password|\/reset-password/i
        ),
      };

      // 7. Trust Signals
      const trustSignals: WebsiteDiscoveryResult['trustSignals'] = {
        privacy: detectCapability(
          /privacy\s*policy|privacy/i,
          /\/privacy/i
        ),
        terms: detectCapability(
          /terms\s*of\s*service|terms\s*&\s*conditions|terms|terms\s*of\s*use/i,
          /\/terms/i
        ),
        refund: detectCapability(
          /refund\s*policy|cancellation\s*policy|money-?back|refunds/i,
          /\/refund|\/cancellation/i
        ),
        security: detectCapability(
          /security|soc\s*2|soc2|gdpr|compliance|encryption/i,
          /\/security|\/compliance/i
        ),
        about: detectCapability(
          /about\s*us|about|our\s*story|company|team/i,
          /\/about|\/company/i
        ),
        contact: capabilities.contact,
        pricing: capabilities.pricing,
        support: capabilities.support,
      };

      return {
        pageInfo: {
          title,
          metaDescription,
          headings,
          visibleText,
          language,
        },
        navigation: {
          links: allLinks,
          internalLinks,
          externalLinks,
        },
        actions: {
          buttons,
          primaryCtaCandidates,
          forms,
          inputs,
        },
        capabilities,
        trustSignals,
      };
    },
    { baseUrl, finalUrl }
  );
}

/**
 * Runs the complete Phase 1 Website Discovery pass.
 */
export async function runIntelligentDiscovery(targetUrl: string): Promise<WebsiteDiscoveryResult> {
  const validation = validateProductUrl(targetUrl);
  if (!validation.isValid) {
    throw new Error(validation.error?.message || 'Invalid website URL.');
  }

  const normalizedUrl = validation.normalizedUrl;
  let browser: Browser | null = null;
  let desktopContext: BrowserContext | null = null;
  let mobileContext: BrowserContext | null = null;

  try {
    // 1. Launch Browser with timeout
    browser = await launchBrowser();

    // 2. Set up Desktop Context & Page
    desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ShipScan/2.0',
    });

    const desktopPage = await desktopContext.newPage();
    desktopPage.setDefaultTimeout(15000);
    desktopPage.setDefaultNavigationTimeout(15000);

    // Monitor for SSRF in redirects
    let redirectedToUnsafeUrl = false;
    let unsafeUrlTarget = '';

    desktopPage.on('framenavigated', (frame) => {
      if (frame === desktopPage.mainFrame()) {
        const frameUrl = frame.url();
        if (frameUrl && frameUrl !== 'about:blank') {
          if (!isSafeRedirectUrl(frameUrl, new URL(normalizedUrl).hostname)) {
            redirectedToUnsafeUrl = true;
            unsafeUrlTarget = frameUrl;
          }
        }
      }
    });

    // 3. Desktop Navigation
    const startTime = performance.now();
    let response;
    try {
      response = await desktopPage.goto(normalizedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
    } catch (navErr: any) {
      const msg = navErr?.message || String(navErr);
      console.error(`[Discovery] Navigation failed for ${normalizedUrl}:`, msg);
      throw new Error(`Couldn't open this website. We couldn't finish loading the target website.`);
    }

    if (redirectedToUnsafeUrl) {
      throw new Error(`Navigation blocked: Target redirected to restricted address.`);
    }

    const responseTimeMs = Math.round(performance.now() - startTime);
    const finalUrl = desktopPage.url() || normalizedUrl;
    const httpStatus = response?.status() || 200;

    // Soft settling: wait briefly for dynamic content to hydrate without blocking
    await desktopPage.waitForLoadState('load', { timeout: 4000 }).catch(() => {});
    await desktopPage.waitForTimeout(400);

    // Capture desktop screenshot (thumbnail quality)
    let desktopScreenshot: string | undefined;
    try {
      const buffer = await desktopPage.screenshot({
        type: 'jpeg',
        quality: 60,
        scale: 'css',
      });
      desktopScreenshot = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    } catch (ssErr) {
      console.warn('[Discovery] Screenshot capture failed:', ssErr);
    }

    // 4. Extract Desktop Structure & Signals
    const desktopData = await extractDesktopDiscoveryData(desktopPage, normalizedUrl, finalUrl);

    // 5. Mobile Discovery Pass
    let mobileResult: WebsiteDiscoveryResult['mobile'] = {
      load: 'unknown',
      visibleContent: 'unknown',
      horizontalOverflow: 'unknown',
      importantNavigationPresent: 'unknown',
      viewportWidth: 390,
      scrollWidth: 390,
    };

    try {
      if (browser.isConnected()) {
        mobileContext = await browser.newContext({
          viewport: { width: 390, height: 844 },
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 ShipScan/2.0',
          isMobile: true,
          hasTouch: true,
        });

        const mobilePage = await mobileContext.newPage();
        mobilePage.setDefaultTimeout(12000);
        mobilePage.setDefaultNavigationTimeout(12000);

        await mobilePage.goto(finalUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 12000,
        });

        await mobilePage.waitForLoadState('load', { timeout: 3000 }).catch(() => {});
        await mobilePage.waitForTimeout(300);

        const mobileMetrics = await mobilePage.evaluate(() => {
          const scrollW = document.documentElement.scrollWidth || document.body.scrollWidth || 0;
          const innerW = window.innerWidth || 390;
          const hasText = (document.body?.innerText || '').trim().length > 20;
          const hasNav = Boolean(document.querySelector('nav, header, [role="navigation"], button, a'));

          return {
            scrollWidth: scrollW,
            viewportWidth: innerW,
            hasOverflow: scrollW > innerW + 10,
            hasVisibleContent: hasText,
            hasNav,
          };
        });

        let mobileScreenshot: string | undefined;
        try {
          const mBuffer = await mobilePage.screenshot({
            type: 'jpeg',
            quality: 55,
            scale: 'css',
          });
          mobileScreenshot = `data:image/jpeg;base64,${mBuffer.toString('base64')}`;
        } catch {}

        mobileResult = {
          load: 'detected',
          visibleContent: mobileMetrics.hasVisibleContent ? 'detected' : 'not_detected',
          horizontalOverflow: mobileMetrics.hasOverflow ? 'detected' : 'not_detected',
          importantNavigationPresent: mobileMetrics.hasNav ? 'detected' : 'not_detected',
          viewportWidth: mobileMetrics.viewportWidth,
          scrollWidth: mobileMetrics.scrollWidth,
          screenshot: mobileScreenshot,
        };
      } else {
        console.warn('[Discovery] Browser is not connected for mobile pass.');
      }
    } catch (mobileErr: any) {
      console.warn('[Discovery] Mobile pass encountered error:', mobileErr?.message);
      mobileResult = {
        load: 'not_detected',
        visibleContent: 'unknown',
        horizontalOverflow: 'unknown',
        importantNavigationPresent: 'unknown',
        viewportWidth: 390,
        scrollWidth: 390,
        error: 'Mobile navigation timed out or encountered an error.',
      };
    }

    // 6. Formulate Discovery Summary
    const capabilities = desktopData.capabilities || {};
    const navigation = desktopData.navigation || { links: [], internalLinks: [], externalLinks: [] };
    const actions = desktopData.actions || { buttons: [], primaryCtaCandidates: [], forms: [], inputs: [] };
    const pageInfo = desktopData.pageInfo || {
      title: finalUrl,
      headings: [],
      visibleText: '',
      metaDescription: '',
      language: 'en',
    };

    const detectedCapabilitiesCount = Object.values(capabilities).filter(
      (c: any) => c?.status === 'detected'
    ).length;
    const notDetectedCapabilitiesCount = Object.values(capabilities).filter(
      (c: any) => c?.status === 'not_detected'
    ).length;

    const summaryItems: string[] = [];

    // Factual inspected pages & navigation
    const internalLinks = navigation.internalLinks || [];
    const allLinks = navigation.links || [];
    const externalLinks = navigation.externalLinks || [];
    const primaryCtas = actions.primaryCtaCandidates || [];
    const forms = actions.forms || [];
    const buttons = actions.buttons || [];

    summaryItems.push('1 page inspected');

    if (mobileResult.load === 'detected') {
      summaryItems.push('Mobile experience detected');
    }

    if (allLinks.length > 0 || internalLinks.length > 0) {
      summaryItems.push('Navigation mapped');
    }

    if (primaryCtas.length > 0 || buttons.length > 0) {
      summaryItems.push('Interactive actions mapped');
    }

    if (forms.length > 0) {
      summaryItems.push(`${forms.length} form${forms.length === 1 ? '' : 's'} detected`);
    }

    if (mobileResult.horizontalOverflow === 'not_detected') {
      summaryItems.push('No horizontal overflow detected');
    }

    const navStatus: DiscoverySignalStatus =
      allLinks.length > 0 ? 'detected' : 'not_detected';

    const discoveryResult: WebsiteDiscoveryResult = {
      page: {
        url: normalizedUrl,
        finalUrl,
        title: pageInfo.title,
        metaDescription: pageInfo.metaDescription,
        mainHeadings: pageInfo.headings,
        visibleTextExcerpt: pageInfo.visibleText,
        language: pageInfo.language,
        httpStatus,
        responseTimeMs,
        screenshot: desktopScreenshot,
      },
      navigation: {
        status: navStatus,
        links: allLinks,
        internalLinks: internalLinks,
        externalLinks: externalLinks,
        internalLinkCount: internalLinks.length,
        externalLinkCount: externalLinks.length,
      },
      actions: actions,
      capabilities: capabilities as WebsiteDiscoveryResult['capabilities'],
      trustSignals: (desktopData.trustSignals || {}) as WebsiteDiscoveryResult['trustSignals'],
      mobile: mobileResult,
      summary: {
        title: 'Website discovered',
        items: summaryItems,
        detectedCount: detectedCapabilitiesCount,
        notDetectedCount: notDetectedCapabilitiesCount,
      },
    };

    return discoveryResult;
  } finally {
    // 7. Guaranteed Cleanup
    if (desktopContext) {
      await desktopContext.close().catch(() => {});
    }
    if (mobileContext) {
      await mobileContext.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
