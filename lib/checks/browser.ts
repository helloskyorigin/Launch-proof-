import { chromium, Browser } from 'playwright';
import { execSync } from 'child_process';

let isInstallingChromium = false;

function ensureChromiumInstalled(): void {
  if (isInstallingChromium) return;
  isInstallingChromium = true;
  try {
    console.log('[Browser] Attempting to auto-install Playwright Chromium with dependencies...');
    execSync('npx playwright install chromium', { stdio: 'inherit', timeout: 45000 });
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
    timeout: 15000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
    ],
  };

  const launchWithTimeout = async (): Promise<Browser> => {
    return await chromium.launch(launchOptions);
  };

  try {
    return await Promise.race([
      launchWithTimeout(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Browser launch timed out after 15s')), 15000)
      ),
    ]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Browser] Initial launch failed:', msg);

    if (
      msg.includes("Executable doesn't exist") ||
      msg.includes('playwright install') ||
      msg.includes('browserType.launch') ||
      msg.includes('timed out')
    ) {
      ensureChromiumInstalled();
      try {
        return await Promise.race([
          launchWithTimeout(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Browser launch retry timed out')), 20000)
          ),
        ]);
      } catch (retryErr: unknown) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        console.error('[Browser] Retry launch after install failed:', retryMsg);
        throw new Error(`Browser launch failed: ${retryMsg}`);
      }
    }

    throw new Error(`Browser launch failed: ${msg}`);
  }
}


