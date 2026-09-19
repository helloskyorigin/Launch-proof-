import { getCheckAsync, updateCheckStatus, CheckRecord } from './check-store';
import { validateProductUrl } from './url-validation';
import { runIntelligentDiscovery } from './website-discovery';

// Concurrency tracker to prevent duplicate runs for the same check
const activeRuns = new Set<string>();

export function isCheckRunning(checkId: string): boolean {
  return activeRuns.has(checkId);
}

/**
 * ShipScan Pipeline Execution:
 *
 * Validating / Created
 * -> Target Validation
 * -> Opening (Browser Navigation)
 * -> Discovering (Website Discovery Pass)
 * -> Discovery Ready (Saved Discovery Evidence)
 *
 * (Stops at discovery_ready for Phase 1 as specified in requirements)
 */
export async function executeCheckRun(checkId: string): Promise<void> {
  if (activeRuns.has(checkId)) {
    console.log(`[ShipScan] Check ${checkId} is already running in an active job.`);
    return;
  }

  activeRuns.add(checkId);
  const startTime = Date.now();

  try {
    const initialCheck = await getCheckAsync(checkId);

    if (!initialCheck) {
      console.error(`[ShipScan] Check ID not found: ${checkId}`);
      return;
    }

    const targetUrl = initialCheck.finalUrl || initialCheck.url;

    // 1. Re-verify URL and SSRF safety
    console.log(`[ShipScan] VALIDATION_STARTED for ${checkId} (${targetUrl})`);
    const secCheck = validateProductUrl(targetUrl);
    if (!secCheck.isValid) {
      console.error(`[ShipScan] Security check failed for target: ${targetUrl}`);
      console.log('[ShipScan] current status: failed');
      await updateCheckStatus(checkId, 'failed', {
        error: "Couldn't open this website. The URL is invalid or restricted.",
      });
      return;
    }
    console.log(`[ShipScan] VALIDATION_COMPLETE for ${checkId}`);

    // 2. Set Opening Status (Browser Navigation Stage)
    console.log(`[ShipScan] OPENING_STARTED for ${checkId}`);
    console.log('[ShipScan] current status: opening');
    await updateCheckStatus(checkId, 'opening');

    // 3. Set Discovering Status & Run Discovery
    console.log(`[ShipScan] DISCOVERY_STARTED for ${checkId}`);
    console.log('[ShipScan] current status: discovering');
    await updateCheckStatus(checkId, 'discovering');

    const discoveryResult = await runIntelligentDiscovery(targetUrl);
    console.log(`[ShipScan] DISCOVERY_COMPLETE for ${checkId}: ${discoveryResult.summary.items.join(', ')}`);

    // 4. Save Discovery Result and Set Discovery Ready
    console.log('[ShipScan] current status: discovery_ready');
    await updateCheckStatus(checkId, 'discovery_ready', {
      finalUrl: discoveryResult.page.finalUrl,
      httpStatus: discoveryResult.page.httpStatus,
      responseTimeMs: discoveryResult.page.responseTimeMs || Date.now() - startTime,
      discovery: discoveryResult,
    });

    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[ShipScan] Check ${checkId} reached discovery_ready in ${elapsedTotal}s.`);
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    console.error(`[ShipScan] Check ${checkId} execution failed:`, rawMsg);
    console.log('[ShipScan] current status: failed');

    let userSafeError = "We couldn't open or inspect this website. Check the URL and try again.";
    if (rawMsg.includes("Couldn't open") || rawMsg.includes("finish loading") || rawMsg.includes("Navigation failed")) {
      userSafeError = "We couldn't open this website. Check the URL and try again.";
    } else if (rawMsg.includes("timeout") || rawMsg.includes("timed out")) {
      userSafeError = "Website connection timed out while loading.";
    } else if (rawMsg.includes("restricted") || rawMsg.includes("blocked")) {
      userSafeError = "Access to this address was blocked for safety.";
    }

    await updateCheckStatus(checkId, 'failed', {
      error: userSafeError,
    });
  } finally {
    activeRuns.delete(checkId);
  }
}
