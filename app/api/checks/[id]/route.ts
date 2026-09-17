import { NextRequest, NextResponse } from 'next/server';
import { getCheck } from '@/lib/db/checks-repository';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authUser = await getAuthenticatedUser(req);
    const userId = authUser?.uid;

    const check = await getCheck(id, userId);

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
  } catch (err) {
    console.error('Error in GET /api/checks/[id]:', err);
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
