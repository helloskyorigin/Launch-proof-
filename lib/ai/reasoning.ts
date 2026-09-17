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
      productType: check.productType || 'Other'
    },
    page: {
      finalUrl: check.finalUrl,
      title: check.evidence?.desktop?.title,
      metaDescription: check.evidence?.desktop?.metaDescription,
      headings: check.evidence?.desktop?.headings,
      visibleTextExcerpt: check.evidence?.desktop?.visibleTextExcerpt?.slice(0, 1500),
    },
    desktop: {
      loaded: !!check.evidence?.desktop,
      httpStatus: check.evidence?.desktop?.httpStatus,
      screenshotAvailable: !!check.evidence?.desktop?.screenshot,
      buttons: check.evidence?.desktop?.buttons?.slice(0, 15),
      links: check.evidence?.desktop?.links?.slice(0, 15),
      forms: check.evidence?.desktop?.forms,
      consoleErrors: addEvidence('console-errors-001', check.evidence?.desktop?.consoleErrors?.slice(0, 10) || []),
      pageErrors: addEvidence('page-errors-001', check.evidence?.desktop?.pageErrors?.slice(0, 10) || []),
      failedRequests: addEvidence('network-failures-001', check.evidence?.desktop?.failedRequests?.slice(0, 10) || []),
    },
    mobile: {
      loaded: !!check.evidence?.mobile,
      viewport: {
        width: check.evidence?.mobile?.viewportWidth || 390,
        height: 844 // default iPhone
      },
      screenshotAvailable: !!check.evidence?.mobile?.screenshot,
      buttons: check.evidence?.mobile?.buttons?.slice(0, 10),
      links: check.evidence?.mobile?.links?.slice(0, 10),
      horizontalOverflow: addEvidence('mobile-overflow-001', check.evidence?.mobile?.horizontalOverflow || false),
    },
    deterministicChecks: addEvidence('deterministic-checks-001', check.checks?.map(c => ({
      id: c.id,
      category: c.category,
      status: c.status
    })) || []),
  };

  // Ensure these generic refs are available even if arrays are empty
  evidenceIds.add('console-errors-001');
  evidenceIds.add('page-errors-001');
  evidenceIds.add('network-failures-001');
  evidenceIds.add('mobile-overflow-001');
  evidenceIds.add('deterministic-checks-001');
  
  // Specific checks mapping to refs
  if (check.checks) {
    const trustSignals = check.checks.find(c => c.id === 'trust-signals');
    if (trustSignals) evidenceIds.add('trust-signals-001');
  }

  const promptContent = JSON.stringify(evidencePackage, null, 2);

  let rawResponse = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: REASONING_SYSTEM_PROMPT },
        { role: 'user', content: promptContent }
      ],
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    rawResponse = chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    return {
      status: 'failed',
      findings: [],
      model: GROQ_MODEL
    };
  }

  // 2. Validate
  let validation = validateReasoningResponse(rawResponse, evidenceIds);
  
  if (!validation.isValid) {
    console.warn('First validation failed:', validation.error);
    return {
      status: 'failed',
      findings: [],
      model: GROQ_MODEL
    };
  }

  return {
    status: 'complete',
    findings: validation.parsed!.findings,
    summary: validation.parsed!.summary,
    model: GROQ_MODEL
  };
}
