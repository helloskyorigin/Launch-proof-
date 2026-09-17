import { chromium, Browser } from 'playwright';
import { execSync } from 'child_process';

let isInstallingChromium = false;

function ensureChromiumInstalled(): void {
  if (isInstallingChromium) return;
  isInstallingChromium = true;
  try {
    console.log('[Browser] Attempting to auto-install Playwright Chromium...');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    console.log('[Browser] Playwright Chromium installation finished.');
  } catch (installErr) {
    console.error('[Browser] Failed to auto-install Chromium:', installErr);
  } finally {
    isInstallingChromium = false;
  }
}

export async function launchBrowser(): Promise<Browser> {
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
    ],
  };

  try {
    return await chromium.launch(launchOptions);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Browser] Initial launch failed:', msg);

    if (
      msg.includes("Executable doesn't exist") ||
      msg.includes('playwright install') ||
      msg.includes('browserType.launch')
    ) {
      ensureChromiumInstalled();
      try {
        return await chromium.launch(launchOptions);
      } catch (retryErr: unknown) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        console.error('[Browser] Retry launch after install failed:', retryMsg);
        throw new Error(`Failed to launch browser: ${retryMsg}`);
      }
    }

    throw new Error(`Failed to launch browser: ${msg}`);
  }
}

