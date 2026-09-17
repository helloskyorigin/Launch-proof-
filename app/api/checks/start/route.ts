import { NextRequest, NextResponse } from 'next/server';
import { validateProductUrl } from '@/lib/checks/url-validation';
import { checkUrlReachability } from '@/lib/checks/reachability';
import { createCheckId } from '@/lib/checks/check-id';
import { saveCheck } from '@/lib/checks/store';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Enter a valid website URL.',
          },
        },
        { status: 400 }
      );
    }

    const { url, description, productType } = body || {};

    // 1. URL Validation & SSRF Check
    const validation = validateProductUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // 2. Real Server-Side Website Reachability Check
    const reachability = await checkUrlReachability(validation.normalizedUrl);
    if (!reachability.isReachable) {
      const httpStatus = reachability.error.code === 'REQUEST_TIMEOUT' ? 504 : 400;
      return NextResponse.json(
        {
          success: false,
          error: reachability.error,
        },
        { status: httpStatus }
      );
    }

    // 3. Generate Check ID and store in-memory
    const checkId = createCheckId();
    const checkRecord = saveCheck({
      id: checkId,
      url: validation.normalizedUrl,
      finalUrl: reachability.finalUrl,
      status: 'ready_for_analysis',
      productType: productType || 'SaaS / Web App',
      description: typeof description === 'string' ? description.trim() : '',
      createdAt: new Date().toISOString(),
      responseTimeMs: reachability.responseTimeMs,
      httpStatus: reachability.statusCode,
    });

    // 4. Return success response
    return NextResponse.json(
      {
        success: true,
        check: {
          id: checkRecord.id,
          url: checkRecord.url,
          finalUrl: checkRecord.finalUrl,
          status: checkRecord.status,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WEBSITE_ERROR',
          message: "The website returned an error and couldn't be checked.",
        },
      },
      { status: 500 }
    );
  }
}
