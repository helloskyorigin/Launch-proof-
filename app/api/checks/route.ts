import { NextRequest, NextResponse } from 'next/server';
import { getAllChecks } from '@/lib/db/checks-repository';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const userId = authUser?.uid || 'anonymous';

    const checks = await getAllChecks(userId);

    return NextResponse.json(
      {
        success: true,
        checks,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in GET /api/checks:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while retrieving user checks.',
        },
      },
      { status: 500 }
    );
  }
}
