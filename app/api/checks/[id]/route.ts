import { NextRequest, NextResponse } from 'next/server';
import { getCheck } from '@/lib/checks/store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const check = getCheck(id);

    if (!check) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CHECK_NOT_FOUND',
            message: 'Check not found.',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        check,
        evidence: check.evidence,
        checks: check.checks,
        findings: check.findings,
        score: check.score,
        verdict: check.verdict,
        breakdown: check.breakdown,
        blockerCount: check.blockerCount,
        importantCount: check.importantCount,
        minorCount: check.minorCount,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while retrieving check.',
        },
      },
      { status: 500 }
    );
  }
}
