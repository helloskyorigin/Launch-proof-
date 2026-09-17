import { getCheck, updateCheckStatus, DesktopEvidence, MobileEvidence } from './check-store';
import { launchBrowser } from './browser';
import { runDesktopCheck } from './desktop-check';
import { runMobileCheck } from './mobile-check';
import { validatePlaywrightTargetUrl } from './security';
import { runDeterministicChecks } from './deterministic-engine';

export async function executeCheckRun(checkId: string): Promise<void> {
  const startTime = Date.now();
  const check = getCheck(checkId);

  if (!check) {
    console.error(`[check-runner] Check ID not found: ${checkId}`);
    return;
  }

  const targetUrl = check.finalUrl || check.url;

  // Re-verify SSRF / URL safety
  const secCheck = validatePlaywrightTargetUrl(targetUrl);
  if (!secCheck.isValid) {
    console.error(`[${checkId}] Security check failed for target: ${targetUrl}`);
    updateCheckStatus(checkId, 'failed', {
      error: secCheck.error || "We couldn't complete the website check.",
    });
    return;
  }

  console.log(`[${checkId}] opening ${targetUrl}`);
  updateCheckStatus(checkId, 'opening');

  let browser;
  try {
    browser = await launchBrowser();
  } catch (err) {
    console.error(`[${checkId}] Browser launch failed:`, err);
    updateCheckStatus(checkId, 'failed', {
      error: "We couldn't complete the website check.",
    });
    return;
  }

  let desktopResult: DesktopEvidence | undefined;
  let mobileResult: MobileEvidence | undefined;
  let desktopError: string | undefined;
  let mobileError: string | undefined;

  // 1. Desktop Check
  try {
    console.log(`[${checkId}] checking_desktop`);
    updateCheckStatus(checkId, 'checking_desktop');
    const t0 = Date.now();
    desktopResult = await runDesktopCheck(browser, targetUrl);
    console.log(`[${checkId}] desktop_complete ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${checkId}] desktop_check_error:`, msg);
    desktopError = msg;
  }

  // 2. Mobile Check
  try {
    console.log(`[${checkId}] checking_mobile`);
    updateCheckStatus(checkId, 'checking_mobile');
    const t1 = Date.now();
    mobileResult = await runMobileCheck(browser, targetUrl);
    console.log(`[${checkId}] mobile_complete ${((Date.now() - t1) / 1000).toFixed(1)}s`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${checkId}] mobile_check_error:`, msg);
    mobileError = msg;
  }

  // Always close browser cleanly
  try {
    await browser.close();
  } catch {
    // Ignore close errors
  }

  // Evaluate results
  if (!desktopResult && !mobileResult) {
    console.error(`[${checkId}] both desktop and mobile checks failed`);
    updateCheckStatus(checkId, 'failed', {
      error: "We couldn't complete the website check.",
    });
    return;
  }

  console.log(`[${checkId}] collecting_evidence`);
  updateCheckStatus(checkId, 'collecting_evidence');

  if (mobileError && !mobileResult && desktopResult) {
    mobileResult = {
      title: desktopResult.title,
      headings: [],
      buttons: [],
      links: [],
      forms: [],
      consoleErrors: [],
      failedRequests: [],
      pageErrors: [],
      horizontalOverflow: false,
      error: mobileError || 'Mobile check failed to complete.',
    };
  }

  const evidence = {
    desktop: desktopResult,
    mobile: mobileResult,
  };

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[${checkId}] evidence_complete ${totalTime}s`);

  // Run Phase 3 deterministic engine
  console.log(`[${checkId}] running_deterministic_checks`);
  const rawChecks = runDeterministicChecks({
    url: check.url,
    finalUrl: check.finalUrl,
    httpStatus: check.httpStatus || desktopResult?.httpStatus,
    responseTimeMs: Date.now() - startTime,
    evidence,
  });
  console.log(`[${checkId}] checks_ready: generated ${rawChecks.length} raw check results`);

  updateCheckStatus(checkId, 'checks_ready', {
    evidence,
    checks: rawChecks,
    responseTimeMs: Date.now() - startTime,
  });

  // Phases 4 and 5 are no longer executed synchronously in this runner
}
