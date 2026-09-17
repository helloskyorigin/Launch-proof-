import { NextRequest, NextResponse } from 'next/server';
import { getCheck, updateCheckStatus } from '@/lib/db/checks-repository';
import { calculateScore } from '@/lib/scoring/engine';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(req);
    const userId = authUser?.uid;

    const check = await getCheck(id, userId);

    if (!check) {
      return NextResponse.json(
        { success: false, error: 'Check not found' },
        { status: 404 }
      );
    }

    if (check.status !== 'reasoning_complete' && check.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Reasoning must be complete before scoring' },
        { status: 400 }
      );
    }

    const scoringResult = calculateScore(check);

    // Save back to check store and Firestore
    const updated = await updateCheckStatus(id, 'completed', {
      scoring: scoringResult,
      score: scoringResult.overallScore,
      verdict: scoringResult.verdict === 'READY' ? 'Ready' : (scoringResult.verdict === 'NEEDS_ATTENTION' ? 'Needs Attention' : 'Not Ready'),
      blockerCount: scoringResult.counts.blockers,
      importantCount: scoringResult.counts.important,
      minorCount: scoringResult.counts.minor,
    }, userId);

    return NextResponse.json({
      success: true,
      check: updated,
    });

  } catch (err: any) {
    console.error('Scoring error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to score findings' },
      { status: 500 }
    );
  }
}
