import { Browser } from 'playwright';
import {
  MobileEvidence,
  ConsoleMessageEvidence,
  FailedRequestEvidence,
} from './check-store';
import { sanitizeText, capArray } from './evidence';

export async function runMobileCheck(
  browser: Browser,
  targetUrl: string
): Promise<MobileEvidence> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  const consoleErrors: ConsoleMessageEvidence[] = [];
  const failedRequests: FailedRequestEvidence[] = [];
  const pageErrors: Array<{ message: string }> = [];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warning') {
      consoleErrors.push({
        type,
        text: sanitizeText(text, 300),
        location: msg.location()?.url ? sanitizeText(msg.location().url, 200) : undefined,
      });
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push({ message: sanitizeText(err.message, 300) });
  });

  page.on('requestfailed', (req) => {
    failedRequests.push({
      url: sanitizeText(req.url(), 250),
      method: req.method(),
      status: undefined,
      resourceType: req.resourceType(),
    });
  });

  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) {
      failedRequests.push({
        url: sanitizeText(res.url(), 250),
        method: res.request().method(),
        status,
        resourceType: res.request().resourceType(),
      });
    }
  });

  try {
    // 1. Navigate with safe 20s timeout and domcontentloaded
    let navError: string | null = null;
    try {
      await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
    } catch (err: unknown) {
      navError = err instanceof Error ? err.message : String(err);
      console.warn('[mobile-check] Navigation error:', navError);
    }

    // If navigation genuinely failed, return evidence with the preserved actual error
    if (navError) {
      return {
        title: '',
        headings: [],
        buttons: [],
        links: [],
        forms: [],
        consoleErrors: capArray(consoleErrors, 20),
        failedRequests: capArray(failedRequests, 20),
        pageErrors: capArray(pageErrors, 10),
        horizontalOverflow: false,
        error: `Mobile page failed to load: ${navError}`,
      };
    }

    // 2. Wait for DOM/content to render and network/settled state with safe timeouts
    await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

    // Wait for content to render into the DOM (especially for client-rendered SPAs)
    await page
      .waitForFunction(
        () => {
          const bodyText = document.body ? document.body.innerText.trim() : '';
          const hasElements = Boolean(
            document.querySelector('h1, h2, h3, p, a, button, img, form, [role="main"]')
          );
          return bodyText.length > 10 || hasElements;
        },
        { timeout: 4000 }
      )
      .catch(() => {});

    // Short stabilization pause
    await page.waitForTimeout(600);

    // 3. Overflow check & Mobile DOM extraction
    const extractedData = await page.evaluate(() => {
      const scrollWidth = Math.max(
        document.documentElement.scrollWidth || 0,
        document.body ? document.body.scrollWidth : 0,
        390
      );
      const viewportWidth = window.innerWidth || 390;
      // Allow 10px tolerance for scrollbar / subpixel layout rounding; only flag genuine overflow
      const horizontalOverflow = scrollWidth > viewportWidth + 10;

      const title = document.title || '';
      const bodyText = document.body ? document.body.innerText || '' : '';

      const headingEls = Array.from(document.querySelectorAll('h1, h2, h3'));
      const headings = headingEls
        .map((el) => (el.textContent || '').trim())
        .filter((t) => t.length > 0);

      const buttonEls = Array.from(
        document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]')
      );
      const buttons = buttonEls
        .map((el) => {
          if (el instanceof HTMLInputElement) return el.value || el.placeholder || '';
          return (el.textContent || '').trim();
        })
        .filter((t) => t.length > 0)
        .map((text) => ({ text }));

      const linkEls = Array.from(document.querySelectorAll('a[href]'));
      const links = linkEls
        .map((el) => ({
          text: (el.textContent || '').trim(),
          href: el.getAttribute('href') || '',
        }))
        .filter((l) => l.href.length > 0);

      const formEls = Array.from(document.querySelectorAll('form'));
      const forms = formEls.map((el) => ({
        action: el.getAttribute('action') || '',
        method: el.getAttribute('method') || 'GET',
      }));

      return {
        horizontalOverflow,
        scrollWidth,
        viewportWidth,
        title,
        bodyText,
        headings,
        buttons,
        links,
        forms,
      };
    });

    // 4. Capture Mobile Screenshot safely without failing mobile check if screenshot alone fails
    let screenshotBase64: string | undefined;
    try {
      const buffer = await page.screenshot({ type: 'png', fullPage: false, timeout: 5000 });
      screenshotBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (ssErr) {
      console.warn('[mobile-check] Screenshot capture skipped or failed:', ssErr);
      // Screenshot failed alone - DOM evidence is safely preserved, do NOT mark mobile failed!
    }

    return {
      title: sanitizeText(extractedData.title, 150) || 'Untitled Page',
      visibleTextExcerpt: sanitizeText(extractedData.bodyText, 1500),
      headings: capArray(extractedData.headings.map((h) => sanitizeText(h, 120)), 20),
      buttons: capArray(
        extractedData.buttons.map((b) => ({
          text: sanitizeText(b.text, 80),
        })),
        20
      ),
      links: capArray(
        extractedData.links.map((l) => ({
          text: sanitizeText(l.text, 80) || l.href,
          href: sanitizeText(l.href, 200),
        })),
        20
      ),
      forms: capArray(
        extractedData.forms.map((f) => ({
          action: sanitizeText(f.action, 150),
          method: f.method ? f.method.toUpperCase() : 'GET',
        })),
        10
      ),
      consoleErrors: capArray(consoleErrors, 20),
      failedRequests: capArray(failedRequests, 20),
      pageErrors: capArray(pageErrors, 10),
      horizontalOverflow: extractedData.horizontalOverflow,
      scrollWidth: extractedData.scrollWidth,
      viewportWidth: extractedData.viewportWidth,
      screenshot: screenshotBase64,
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}
