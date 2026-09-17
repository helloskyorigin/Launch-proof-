import { NextRequest, NextResponse } from 'next/server';
import { getCheck } from '@/lib/db/checks-repository';
import { executeCheckRun } from '@/lib/checks/check-runner';
import { getAuthenticatedUser } from '@/lib/firebase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: 'Check ID is required.' } },
        { status: 400 }
      );
    }

    const authUser = await getAuthenticatedUser(req);
    const userId = authUser?.uid;

    const check = await getCheck(id, userId);
    if (!check) {
      return NextResponse.json(
        { success: false, error: { code: 'CHECK_NOT_FOUND', message: 'Check not found.' } },
        { status: 404 }
      );
    }

    // Trigger Playwright evidence collection run asynchronously
    executeCheckRun(id).catch((err) => {
      console.error(`[api/checks/${id}/run] Uncaught runner error:`, err);
    });

    return NextResponse.json({
      success: true,
      check: {
        id: check.id,
        url: check.url,
        finalUrl: check.finalUrl,
        status: 'opening',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: msg } },
      { status: 500 }
    );
  }
}
