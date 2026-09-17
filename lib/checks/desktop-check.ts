import { Browser } from 'playwright';
import {
  DesktopEvidence,
  ConsoleMessageEvidence,
  FailedRequestEvidence,
  LinkEvidence,
  ButtonEvidence,
  FormEvidence,
  InputFieldEvidence,
} from './check-store';
import { sanitizeText, capArray } from './evidence';

export async function runDesktopCheck(
  browser: Browser,
  targetUrl: string
): Promise<DesktopEvidence> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const consoleErrors: ConsoleMessageEvidence[] = [];
  const failedRequests: FailedRequestEvidence[] = [];
  const pageErrors: Array<{ message: string }> = [];
  let httpStatus: number | undefined;

  // Event Listeners
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
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    if (response) {
      httpStatus = response.status();
    }

    // Allow brief time for scripts and DOM rendering
    await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(600);

    // DOM Extraction inside browser context
    const extractedData = await page.evaluate(() => {
      const title = document.title || '';

      const metaDescEl = document.querySelector('meta[name="description"], meta[property="og:description"]');
      const metaDescription = metaDescEl ? metaDescEl.getAttribute('content') || '' : '';

      // Body text excerpt
      const bodyText = document.body ? document.body.innerText || '' : '';

      // Headings
      const headingEls = Array.from(document.querySelectorAll('h1, h2, h3'));
      const headings = headingEls
        .map((el) => (el.textContent || '').trim())
        .filter((t) => t.length > 0);

      // Links
      const linkEls = Array.from(document.querySelectorAll('a[href]'));
      const links = linkEls
        .map((el) => ({
          text: (el.textContent || '').trim(),
          href: el.getAttribute('href') || '',
        }))
        .filter((l) => l.href.length > 0);

      // Buttons
      const buttonEls = Array.from(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]'));
      const buttons = buttonEls
        .map((el) => {
          if (el instanceof HTMLInputElement) return el.value || el.placeholder || '';
          return (el.textContent || '').trim();
        })
        .filter((t) => t.length > 0)
        .map((text) => ({ text }));

      // Forms
      const formEls = Array.from(document.querySelectorAll('form'));
      const forms = formEls.map((el) => ({
        action: el.getAttribute('action') || '',
        method: el.getAttribute('method') || 'GET',
      }));

      // Input Fields
      const inputEls = Array.from(document.querySelectorAll('input, select, textarea'));
      const inputFields = inputEls.map((el) => {
        const type = el.getAttribute('type') || el.tagName.toLowerCase();
        const placeholder = el.getAttribute('placeholder') || '';
        const name = el.getAttribute('name') || el.getAttribute('id') || '';
        return { type, placeholder, name };
      });

      return {
        title,
        metaDescription,
        bodyText,
        headings,
        links,
        buttons,
        forms,
        inputFields,
      };
    });

    // Screenshot
    let screenshotBase64: string | undefined;
    try {
      const buffer = await page.screenshot({ type: 'png', fullPage: false, timeout: 5000 });
      screenshotBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    } catch {
      // Screenshot failed silently - DOM evidence preserved
    }

    return {
      title: sanitizeText(extractedData.title, 150) || 'Untitled Page',
      metaDescription: sanitizeText(extractedData.metaDescription, 300),
      visibleTextExcerpt: sanitizeText(extractedData.bodyText, 2000),
      headings: capArray(extractedData.headings.map((h) => sanitizeText(h, 120)), 30),
      links: capArray(
        extractedData.links.map((l) => ({
          text: sanitizeText(l.text, 80) || l.href,
          href: sanitizeText(l.href, 200),
        })),
        30
      ),
      buttons: capArray(
        extractedData.buttons.map((b) => ({
          text: sanitizeText(b.text, 80),
        })),
        30
      ),
      forms: capArray(
        extractedData.forms.map((f) => ({
          action: sanitizeText(f.action, 150),
          method: f.method ? f.method.toUpperCase() : 'GET',
        })),
        10
      ),
      inputFields: capArray(
        extractedData.inputFields.map((i) => ({
          type: sanitizeText(i.type, 30),
          placeholder: sanitizeText(i.placeholder, 80),
          name: sanitizeText(i.name, 50),
        })),
        20
      ),
      consoleErrors: capArray(consoleErrors, 20),
      failedRequests: capArray(failedRequests, 20),
      pageErrors: capArray(pageErrors, 10),
      screenshot: screenshotBase64,
      httpStatus,
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}
