import { CheckRecord, ReasoningResult } from '@/lib/checks/check-store';
import { getGroqClient, GROQ_MODEL } from './groq';
import { REASONING_SYSTEM_PROMPT } from './reasoning-prompt';
import { validateReasoningResponse } from './reasoning-validator';

export async function executeReasoning(check: CheckRecord): Promise<ReasoningResult> {
  const groq = getGroqClient();

  // 1. Build evidence package
  const evidenceIds = new Set<string>();
  const addEvidence = (id: string, value: any) => {
    evidenceIds.add(id);
    return value;
  };

  const evidencePackage = {
    product: {
      url: check.url,
      description: check.description || 'Not provided',
      productType: check.productType || 'SaaS / Web App',
    },
    discovery: addEvidence('discovery-001', {
      summary: check.discovery?.summary,
      page: {
        finalUrl: check.discovery?.page?.finalUrl || check.finalUrl,
        title: check.discovery?.page?.title || check.evidence?.desktop?.title,
        metaDescription: check.discovery?.page?.metaDescription || check.evidence?.desktop?.metaDescription,
        mainHeadings: check.discovery?.page?.mainHeadings || check.evidence?.desktop?.headings,
        language: check.discovery?.page?.language,
        httpStatus: check.discovery?.page?.httpStatus ?? check.evidence?.desktop?.httpStatus,
      },
      navigation: {
        status: check.discovery?.navigation?.status,
        internalLinkCount: check.discovery?.navigation?.internalLinkCount,
        externalLinkCount: check.discovery?.navigation?.externalLinkCount,
      },
      actions: {
        buttonsCount: check.discovery?.actions?.buttons?.length || check.evidence?.desktop?.buttons?.length || 0,
        primaryCtaCandidates: check.discovery?.actions?.primaryCtaCandidates?.slice(0, 3),
        formsCount: check.discovery?.actions?.forms?.length || check.evidence?.desktop?.forms?.length || 0,
        inputsCount: check.discovery?.actions?.inputs?.length || check.evidence?.desktop?.inputFields?.length || 0,
      },
      capabilities: check.discovery?.capabilities,
      trustSignals: check.discovery?.trustSignals,
    }),
    testPlan: addEvidence('test-plan-001', {
      applicableTestCount: check.testPlan?.applicableTestCount,
      notApplicableTestCount: check.testPlan?.notApplicableTestCount,
      summary: check.testPlan?.summary,
      applicableTests: check.testPlan?.tests.filter((t) => t.isApplicable).map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        reason: t.reason,
      })),
      skippedTests: check.testPlan?.tests.filter((t) => !t.isApplicable).map((t) => ({
        id: t.id,
        name: t.name,
        reason: t.reason,
      })),
    }),
    desktop: addEvidence('desktop-001', {
      loaded: Boolean(check.evidence?.desktop),
      httpStatus: check.evidence?.desktop?.httpStatus,
      title: check.evidence?.desktop?.title,
      metaDescription: check.evidence?.desktop?.metaDescription,
      headings: check.evidence?.desktop?.headings?.slice(0, 10),
      visibleTextExcerpt: check.evidence?.desktop?.visibleTextExcerpt?.slice(0, 1000),
      buttons: check.evidence?.desktop?.buttons?.slice(0, 10),
      links: check.evidence?.desktop?.links?.slice(0, 10),
      forms: check.evidence?.desktop?.forms,
      inputFields: check.evidence?.desktop?.inputFields?.slice(0, 5),
    }),
    mobile: addEvidence('mobile-001', {
      loaded: Boolean(check.evidence?.mobile),
      viewport: {
        width: check.evidence?.mobile?.viewportWidth || 390,
        height: 844,
      },
      horizontalOverflow: check.evidence?.mobile?.horizontalOverflow || false,
      scrollWidth: check.evidence?.mobile?.scrollWidth || 390,
      headings: check.evidence?.mobile?.headings?.slice(0, 5),
    }),
    technical: addEvidence('technical-001', {
      consoleErrors: addEvidence('console-errors-001', check.evidence?.desktop?.consoleErrors?.slice(0, 10) || []),
      pageErrors: addEvidence('page-errors-001', check.evidence?.desktop?.pageErrors?.slice(0, 10) || []),
      failedRequests: addEvidence('network-failures-001', check.evidence?.desktop?.failedRequests?.slice(0, 10) || []),
      mobileOverflow: addEvidence('mobile-overflow-001', check.evidence?.mobile?.horizontalOverflow || false),
    }),
    deterministicChecks: addEvidence('deterministic-checks-001', check.checks?.map((c) => ({
      id: c.id,
      category: c.category,
      status: c.status,
      evidence: c.evidence,
    })) || []),
  };

  // Ensure universal evidence refs exist in the set for validator
  evidenceIds.add('discovery-001');
  evidenceIds.add('test-plan-001');
  evidenceIds.add('desktop-001');
  evidenceIds.add('mobile-001');
  evidenceIds.add('technical-001');
  evidenceIds.add('console-errors-001');
  evidenceIds.add('page-errors-001');
  evidenceIds.add('network-failures-001');
  evidenceIds.add('mobile-overflow-001');
  evidenceIds.add('deterministic-checks-001');
  evidenceIds.add('trust-signals-001');

  const promptContent = JSON.stringify(evidencePackage, null, 2);

  let rawResponse = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: REASONING_SYSTEM_PROMPT },
        { role: 'user', content: promptContent },
      ],
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    rawResponse = chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[executeReasoning] Groq API Error:', error);
    return {
      status: 'failed',
      findings: [],
      model: GROQ_MODEL,
    };
  }

  // 2. Validate response format and evidence references
  const validation = validateReasoningResponse(rawResponse, evidenceIds);

  if (!validation.isValid) {
    console.warn('[executeReasoning] Validation warning/failed:', validation.error);
    // Even if validation had non-fatal issues, if we parsed findings, use them or fallback
    if (validation.parsed?.findings) {
      return {
        status: 'complete',
        findings: validation.parsed.findings,
        summary: validation.parsed.summary,
        model: GROQ_MODEL,
      };
    }
    return {
      status: 'failed',
      findings: [],
      model: GROQ_MODEL,
    };
  }

  return {
    status: 'complete',
    findings: validation.parsed!.findings,
    summary: validation.parsed!.summary,
    model: GROQ_MODEL,
  };
}
