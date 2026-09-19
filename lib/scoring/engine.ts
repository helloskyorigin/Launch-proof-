import { CheckRecord, Finding, FinalScoringResult, FixPlanItem } from '../checks/check-store';

const CATEGORY_WEIGHTS: Record<string, number> = {
  'Product Clarity': 0.20,
  'User Journey': 0.25,
  'Mobile': 0.20,
  'Trust': 0.15,
  'Technical': 0.20,
};

const SEVERITY_PENALTY: Record<string, number> = {
  'blocker': 30,
  'important': 15,
  'minor': 5,
};

export function calculateScore(record: CheckRecord): FinalScoringResult {
  if (!record.reasoning || !record.reasoning.findings) {
    throw new Error('Reasoning findings are required to score.');
  }

  const rawFindings = record.reasoning.findings;
  const deterministicCheckIds = new Set(record.checks?.map(c => c.id) || []);

  // 1. Filter, deduplicate, and validate findings
  const validFindings: Finding[] = [];
  const seenIds = new Set<string>();

  for (const finding of rawFindings) {
    // Basic structural validation
    if (!CATEGORY_WEIGHTS[finding.category]) continue; // Unknown category
    if (!SEVERITY_PENALTY[finding.severity]) continue; // Unknown severity

    // Deduplication by ID
    if (seenIds.has(finding.id)) continue;

    // Confidence safety check
    // If confidence < 0.50 AND it has weak/no valid evidence refs, we skip it.
    let validRefsCount = 0;
    if (finding.evidenceRefs && Array.isArray(finding.evidenceRefs)) {
      validRefsCount = finding.evidenceRefs.filter(ref => 
        deterministicCheckIds.has(ref) || 
        ref.startsWith('evidence_') ||
        ref.startsWith('discovery-') ||
        ref.startsWith('test-plan-') ||
        ref.startsWith('desktop-') ||
        ref.startsWith('mobile-') ||
        ref.startsWith('technical-') ||
        ref.startsWith('console-') ||
        ref.startsWith('page-') ||
        ref.startsWith('network-') ||
        ref.startsWith('trust-') ||
        ref.startsWith('deterministic-')
      ).length;
    }
    
    // Safety check - we expect some evidence reference for a finding
    if (finding.evidenceRefs && finding.evidenceRefs.length > 0 && validRefsCount === 0) {
      // All evidence references are invalid
      continue;
    }

    if (typeof finding.confidence === 'number' && finding.confidence < 0.50) {
       if (validRefsCount === 0) {
         continue; // Too low confidence and no solid evidence
       }
    }

    seenIds.add(finding.id);
    validFindings.push(finding);
  }

  // 2. Calculate category scores
  const categoryScores = {
    'Product Clarity': 100,
    'User Journey': 100,
    'Mobile': 100,
    'Trust': 100,
    'Technical': 100,
  };

  const counts = {
    blockers: 0,
    important: 0,
    minor: 0,
    passed: record.checks?.filter(c => c.status === 'pass').length || 0
  };

  for (const finding of validFindings) {
    const penalty = SEVERITY_PENALTY[finding.severity] || 0;
    
    // @ts-ignore
    categoryScores[finding.category] = Math.max(0, categoryScores[finding.category] - penalty);

    if (finding.severity === 'blocker') counts.blockers++;
    else if (finding.severity === 'important') counts.important++;
    else if (finding.severity === 'minor') counts.minor++;
  }

  // 3. Calculate Overall Score
  let overall = 0;
  overall += categoryScores['Product Clarity'] * CATEGORY_WEIGHTS['Product Clarity'];
  overall += categoryScores['User Journey'] * CATEGORY_WEIGHTS['User Journey'];
  overall += categoryScores['Mobile'] * CATEGORY_WEIGHTS['Mobile'];
  overall += categoryScores['Trust'] * CATEGORY_WEIGHTS['Trust'];
  overall += categoryScores['Technical'] * CATEGORY_WEIGHTS['Technical'];

  overall = Math.round(overall);

  // 4. Determine Verdict
  let verdict: 'READY' | 'NEEDS_ATTENTION' | 'NOT_READY' = 'NOT_READY';
  if (counts.blockers > 0) {
    verdict = 'NOT_READY';
  } else if (overall >= 85) {
    verdict = 'READY';
  } else if (overall >= 70) {
    verdict = 'NEEDS_ATTENTION';
  } else {
    verdict = 'NOT_READY';
  }

  // 5. Build Fix Plan
  const fixPlan: FixPlanItem[] = validFindings.map(finding => ({
    findingId: finding.id,
    category: finding.category,
    severity: finding.severity,
    title: finding.title,
    exactFix: finding.fix,
    evidenceRefs: finding.evidenceRefs || [],
    _confidence: finding.confidence || 1.0
  })).sort((a, b) => {
    // 1. Severity
    const sevScoreA = a.severity === 'blocker' ? 3 : (a.severity === 'important' ? 2 : 1);
    const sevScoreB = b.severity === 'blocker' ? 3 : (b.severity === 'important' ? 2 : 1);
    if (sevScoreA !== sevScoreB) return sevScoreB - sevScoreA;
    
    // 2. Confidence
    if (a._confidence !== b._confidence) {
      return b._confidence - a._confidence;
    }
    
    // 3. Category weight (impact)
    return (CATEGORY_WEIGHTS[b.category] || 0) - (CATEGORY_WEIGHTS[a.category] || 0);
  }).slice(0, 10).map((item, index) => ({
    rank: index + 1,
    findingId: item.findingId,
    category: item.category,
    severity: item.severity,
    title: item.title,
    exactFix: item.exactFix,
    evidenceRefs: item.evidenceRefs
  }));

  // 6. Generate Summary
  let summary = '';
  if (verdict === 'READY') {
    if (validFindings.length === 0) {
       summary = 'No critical first-user issues were detected in this check.';
    } else {
       summary = 'Strong foundations. A few minor optimizations were identified.';
    }
  } else if (verdict === 'NEEDS_ATTENTION') {
    const worstCat = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])[0][0];
    summary = `Some issues could affect the first-user experience, particularly in ${worstCat}. Review the recommended fixes before launch.`;
  } else {
    const worstCat = Object.entries(categoryScores).sort((a, b) => a[1] - b[1])[0][0];
    summary = `Critical first-user issues were detected. Fix the highest-priority issues (such as ${worstCat}) before inviting users.`;
  }

  return {
    status: 'complete',
    overallScore: overall,
    verdict,
    categoryScores,
    counts,
    summary,
    fixPlan
  };
}
