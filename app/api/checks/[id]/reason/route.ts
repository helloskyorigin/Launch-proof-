import { NextRequest, NextResponse } from 'next/server';
import { getCheck, updateCheckStatus } from '@/lib/checks/check-store';
import { executeReasoning } from '@/lib/ai/reasoning';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Check ID is required.' } },
        { status: 400 }
      );
    }

    const check = getCheck(id);
    if (!check) {
      return NextResponse.json(
        { success: false, error: { code: 'CHECK_NOT_FOUND', message: 'Check not found.' } },
        { status: 404 }
      );
    }

    if (!check.evidence) {
      return NextResponse.json(
        { success: false, error: { code: 'EVIDENCE_MISSING', message: 'Phase 2 evidence missing.' } },
        { status: 400 }
      );
    }

    if (!check.checks) {
      return NextResponse.json(
        { success: false, error: { code: 'CHECKS_MISSING', message: 'Phase 3 deterministic results missing.' } },
        { status: 400 }
      );
    }

    // Update status to reasoning
    updateCheckStatus(id, 'reasoning');
    console.log(`[${id}] reasoning started`);

    const reasoningStart = Date.now();
    const result = await executeReasoning(check);
    const latency = Date.now() - reasoningStart;

    console.log(`[${id}] reasoning finished in ${latency}ms with status: ${result.status}`);

    if (result.status === 'failed') {
      updateCheckStatus(id, 'reasoning_failed', {
        reasoning: result,
      });
      return NextResponse.json(
        { success: false, status: 'reasoning_failed', reasoning: result },
        { status: 500 }
      );
    }

    updateCheckStatus(id, 'reasoning_complete', {
      findings: result.findings,
      reasoning: result,
    });

    return NextResponse.json({
      success: true,
      status: 'reasoning_complete',
      reasoning: result,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[api/checks/reason] Uncaught error:`, msg);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: msg } },
      { status: 500 }
    );
  }
}
