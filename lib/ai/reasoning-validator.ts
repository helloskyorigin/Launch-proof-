import { Finding, FindingCategory, FindingSeverity, ReasoningSummary } from '@/lib/checks/check-store';

const ALLOWED_CATEGORIES: FindingCategory[] = ['Product Clarity', 'User Journey', 'Mobile', 'Trust', 'Technical'];
const ALLOWED_SEVERITIES: FindingSeverity[] = ['blocker', 'important', 'minor'];

export interface ValidationResult {
  isValid: boolean;
  parsed?: { findings: Finding[]; summary: ReasoningSummary };
  error?: string;
}

export function validateReasoningResponse(rawJson: string, validEvidenceRefs: Set<string>): ValidationResult {
  let parsed: any;
  try {
    let cleanJson = rawJson.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '');
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '');
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.replace(/```$/, '');
    }
    parsed = JSON.parse(cleanJson.trim());
  } catch (e) {
    return { isValid: false, error: 'Invalid JSON format' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, error: 'Response must be a JSON object' };
  }

  if (!Array.isArray(parsed.findings)) {
    return { isValid: false, error: '"findings" must be an array' };
  }

  const findings: Finding[] = [];

  for (const f of parsed.findings) {
    if (!f.id || typeof f.id !== 'string') return { isValid: false, error: 'Finding missing id' };
    if (!f.title || typeof f.title !== 'string') return { isValid: false, error: 'Finding missing title' };
    if (!f.whyItMatters || typeof f.whyItMatters !== 'string') return { isValid: false, error: 'Finding missing whyItMatters' };
    if (!f.exactFix || typeof f.exactFix !== 'string') return { isValid: false, error: 'Finding missing exactFix' };
    
    if (!ALLOWED_CATEGORIES.includes(f.category as FindingCategory)) {
      return { isValid: false, error: `Invalid category: ${f.category}` };
    }
    
    if (!ALLOWED_SEVERITIES.includes(f.severity as FindingSeverity)) {
      return { isValid: false, error: `Invalid severity: ${f.severity}` };
    }

    if (typeof f.confidence !== 'number' || f.confidence < 0 || f.confidence > 1) {
      return { isValid: false, error: 'Confidence must be a number between 0 and 1' };
    }

    if (!Array.isArray(f.evidenceRefs)) {
      return { isValid: false, error: 'evidenceRefs must be an array' };
    }

    for (const ref of f.evidenceRefs) {
      if (!validEvidenceRefs.has(ref)) {
        return { isValid: false, error: `Invalid evidenceRef: ${ref}` };
      }
    }

    findings.push({
      id: f.id,
      category: f.category as FindingCategory,
      severity: f.severity as FindingSeverity,
      title: f.title,
      whyItMatters: f.whyItMatters,
      fix: f.exactFix,
      evidence: `Evidence: ${f.evidenceRefs.join(', ')}`,
      confidence: f.confidence,
      evidenceRefs: f.evidenceRefs
    });
  }

  let summary: ReasoningSummary = { observation: '', highestRiskArea: '' };
  if (parsed.summary && typeof parsed.summary === 'object') {
    summary = {
      observation: typeof parsed.summary.observation === 'string' ? parsed.summary.observation : '',
      highestRiskArea: typeof parsed.summary.highestRiskArea === 'string' ? parsed.summary.highestRiskArea : '',
    };
  }

  return {
    isValid: true,
    parsed: { findings, summary },
  };
}
