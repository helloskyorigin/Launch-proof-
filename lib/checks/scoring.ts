import {
  CheckEvidence,
  DeterministicCheckResult,
  Finding,
  FindingCategory,
} from './check-store';

export type ReadinessVerdict = 'Ready' | 'Needs Attention' | 'Not Ready';

export interface ScoreBreakdown {
  productClarity: number;
  userJourney: number;
  mobile: number;
  trust: number;
  technical: number;
}

export interface ReadinessScoreResult {
  score: number;
  verdict: ReadinessVerdict;
  breakdown: ScoreBreakdown;
  blockerCount: number;
  importantCount: number;
  minorCount: number;
}

export interface CalculateScoreInput {
  evidence?: CheckEvidence;
  checks?: DeterministicCheckResult[];
  findings?: Finding[];
  httpStatus?: number;
}

type InternalCategory =
  | 'productClarity'
  | 'userJourney'
  | 'mobile'
  | 'trust'
  | 'technical';

interface DeduplicatedIssue {
  id: string;
  category: InternalCategory;
  topic: string;
  severity: 'blocker' | 'important' | 'minor';
  source: 'check' | 'finding' | 'merged';
}

function normalizeCategory(cat: string): InternalCategory {
  const c = cat.toLowerCase().replace(/[\s_-]+/g, '');
  if (c.includes('product') || c.includes('clarity')) return 'productClarity';
  if (c.includes('user') || c.includes('journey') || c.includes('action')) return 'userJourney';
  if (c.includes('mobile') || c.includes('responsive')) return 'mobile';
  if (c.includes('trust') || c.includes('security')) return 'trust';
  if (c.includes('tech') || c.includes('console') || c.includes('http')) return 'technical';
  return 'productClarity';
}

function getCheckTopic(checkId: string): string {
  if (checkId.includes('title')) return 'title';
  if (checkId.includes('meta_description')) return 'meta_description';
  if (checkId.includes('heading')) return 'headings';
  if (checkId.includes('empty_page')) return 'empty_page';

  if (checkId.includes('primary_actions')) return 'primary_actions';
  if (checkId.includes('navigation')) return 'navigation';
  if (checkId.includes('links')) return 'links';
  if (checkId.includes('buttons')) return 'buttons';
  if (checkId.includes('forms')) return 'forms';

  if (checkId.includes('overflow')) return 'mobile_overflow';
  if (checkId.includes('mobile_page_loaded')) return 'mobile_load';
  if (checkId.includes('screenshot')) return 'mobile_screenshot';
  if (checkId.includes('mobile_visible_content')) return 'mobile_content';

  if (checkId.includes('https')) return 'https';
  if (checkId.includes('trust_signals')) return 'trust_signals';

  if (checkId.includes('http_failures')) return 'http_failures';
  if (checkId.includes('console_errors')) return 'console_errors';
  if (checkId.includes('page_errors')) return 'page_errors';
  if (checkId.includes('failed_requests')) return 'failed_requests';

  return checkId;
}

function matchFindingToTopic(category: InternalCategory, title: string, evidenceText: string): string {
  const combined = `${title} ${evidenceText}`.toLowerCase();

  if (category === 'productClarity') {
    if (combined.includes('meta description') || combined.includes('description tag')) return 'meta_description';
    if (combined.includes('title')) return 'title';
    if (combined.includes('heading') || combined.includes('headline') || combined.includes('h1')) return 'headings';
    if (combined.includes('empty') || combined.includes('blank')) return 'empty_page';
  } else if (category === 'userJourney') {
    if (combined.includes('call to action') || combined.includes('cta') || combined.includes('primary action')) return 'primary_actions';
    if (combined.includes('navigation') || combined.includes('menu') || combined.includes('nav')) return 'navigation';
    if (combined.includes('button')) return 'buttons';
    if (combined.includes('link')) return 'links';
    if (combined.includes('form') || combined.includes('input')) return 'forms';
  } else if (category === 'mobile') {
    if (combined.includes('overflow') || combined.includes('horizontal') || combined.includes('scrollwidth') || combined.includes('viewport')) return 'mobile_overflow';
    if (combined.includes('load') || combined.includes('render') || combined.includes('timeout')) return 'mobile_load';
    if (combined.includes('content') || combined.includes('element')) return 'mobile_content';
  } else if (category === 'trust') {
    if (combined.includes('https') || combined.includes('ssl') || combined.includes('security') || combined.includes('unencrypted')) return 'https';
    if (combined.includes('privacy') || combined.includes('terms') || combined.includes('contact') || combined.includes('about')) return 'trust_signals';
  } else if (category === 'technical') {
    if (combined.includes('console') || combined.includes('javascript error')) return 'console_errors';
    if (combined.includes('runtime') || combined.includes('crash') || combined.includes('unhandled') || combined.includes('page error')) return 'page_errors';
    if (combined.includes('http') || combined.includes('status') || combined.includes('500') || combined.includes('404')) return 'http_failures';
    if (combined.includes('network') || combined.includes('failed request') || combined.includes('asset')) return 'failed_requests';
  }

  // Fallback to a normalized title slug to keep distinct issues unique
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  return `finding_${slug}`;
}

const SEVERITY_RANK: Record<'blocker' | 'important' | 'minor', number> = {
  blocker: 3,
  important: 2,
  minor: 1,
};

function resolveSeverity(
  s1: 'blocker' | 'important' | 'minor',
  s2: 'blocker' | 'important' | 'minor'
): 'blocker' | 'important' | 'minor' {
  return SEVERITY_RANK[s1] >= SEVERITY_RANK[s2] ? s1 : s2;
}

/**
 * Phase 5: Calculates a deterministic First-User Readiness Score and Verdict
 * from real evidence, deterministic check results, and AI findings.
 */
export function calculateReadinessScore(input: CalculateScoreInput): ReadinessScoreResult {
  const { evidence, checks = [], findings = [] } = input;

  // 1. Safety check: Check if there is sufficient evidence
  const hasDesktop = Boolean(evidence?.desktop);
  const hasMobile = Boolean(evidence?.mobile);
  const hasEvidence = hasDesktop || hasMobile;

  // If no evidence was recorded at all and no checks exist, return safe unready state without fake data
  if (!hasEvidence && checks.length === 0) {
    return {
      score: 0,
      verdict: 'Not Ready',
      breakdown: {
        productClarity: 0,
        userJourney: 0,
        mobile: 0,
        trust: 0,
        technical: 0,
      },
      blockerCount: 1,
      importantCount: 0,
      minorCount: 0,
    };
  }

  // 2. Extract and Deduplicate issues across checks and findings
  // Rule: Same issue must not be counted multiple times.
  const issuesMap = new Map<string, DeduplicatedIssue>();

  // Process deterministic checks
  // Critical checks that count as blockers when failed:
  const BLOCKER_CHECK_IDS = new Set([
    'technical_http_failures',
    'technical_page_errors',
    'mobile_horizontal_overflow',
    'product_clarity_empty_page',
    'user_journey_primary_actions',
  ]);

  for (const check of checks) {
    // Unknown checks must NOT be treated as failures
    if (check.status === 'unknown' || check.status === 'pass') {
      continue;
    }

    const cat = normalizeCategory(check.category);
    const topic = getCheckTopic(check.id);
    const issueKey = `${cat}:${topic}`;

    let severity: 'blocker' | 'important' | 'minor';
    if (check.status === 'fail') {
      severity = BLOCKER_CHECK_IDS.has(check.id) ? 'blocker' : 'important';
    } else {
      // check.status === 'warning'
      severity = 'minor';
    }

    issuesMap.set(issueKey, {
      id: check.id,
      category: cat,
      topic,
      severity,
      source: 'check',
    });
  }

  // Process AI findings and merge with existing issues
  for (const finding of findings) {
    const cat = normalizeCategory(finding.category);
    const topic = matchFindingToTopic(cat, finding.title, finding.evidence);
    const issueKey = `${cat}:${topic}`;

    const existing = issuesMap.get(issueKey);
    if (existing) {
      // Merge by selecting the most severe rating (e.g. check was warning, finding is blocker)
      existing.severity = resolveSeverity(existing.severity, finding.severity);
      existing.source = 'merged';
    } else {
      issuesMap.set(issueKey, {
        id: finding.id || `f_${topic}`,
        category: cat,
        topic,
        severity: finding.severity,
        source: 'finding',
      });
    }
  }

  // Count total unique deduplicated issues
  let blockerCount = 0;
  let importantCount = 0;
  let minorCount = 0;

  for (const issue of issuesMap.values()) {
    if (issue.severity === 'blocker') blockerCount++;
    else if (issue.severity === 'important') importantCount++;
    else if (issue.severity === 'minor') minorCount++;
  }

  // 3. Calculate category breakdown scores (0 - 100)
  // Categories:
  // - Product Clarity
  // - User Journey
  // - Mobile
  // - Trust
  // - Technical
  const categories: InternalCategory[] = [
    'productClarity',
    'userJourney',
    'mobile',
    'trust',
    'technical',
  ];

  const breakdown: ScoreBreakdown = {
    productClarity: 100,
    userJourney: 100,
    mobile: 100,
    trust: 100,
    technical: 100,
  };

  for (const cat of categories) {
    // Known checks in this category
    const catChecks = checks.filter((c) => normalizeCategory(c.category) === cat);
    const knownChecks = catChecks.filter((c) => c.status !== 'unknown');
    const passedChecks = knownChecks.filter((c) => c.status === 'pass');

    // Issues in this category
    const catIssues = Array.from(issuesMap.values()).filter((i) => i.category === cat);
    const catBlockers = catIssues.filter((i) => i.severity === 'blocker').length;
    const catImportants = catIssues.filter((i) => i.severity === 'important').length;
    const catMinors = catIssues.filter((i) => i.severity === 'minor').length;

    // Rules:
    // - Blocker issues have the largest score impact (-45 per blocker).
    // - Important issues have a medium impact (-20 per important).
    // - Minor issues have a small impact (-5 per minor).
    // - Unknown/not-detected checks have NO positive or negative score impact.
    // - Missing evidence must never become a fake failure.
    const deductions = catBlockers * 45 + catImportants * 20 + catMinors * 5;

    const rawScore = 100 - deductions;
    breakdown[cat] = Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  // 4. Overall score (0 - 100)
  // Transparent average of the 5 verified category scores
  const rawAverage =
    (breakdown.productClarity +
      breakdown.userJourney +
      breakdown.mobile +
      breakdown.trust +
      breakdown.technical) /
    5;

  const score = Math.max(0, Math.min(100, Math.round(rawAverage)));

  // 5. Verdict determination
  // "Ready" | "Needs Attention" | "Not Ready"
  // - Ready: score >= 80, 0 blockers, at most 1 important issue
  // - Needs Attention: score >= 60, at most 1 blocker
  // - Not Ready: score < 60 or 2+ blockers
  let verdict: ReadinessVerdict;
  if (score >= 80 && blockerCount === 0 && importantCount <= 1) {
    verdict = 'Ready';
  } else if (score >= 60 && blockerCount <= 1) {
    verdict = 'Needs Attention';
  } else {
    verdict = 'Not Ready';
  }

  return {
    score,
    verdict,
    breakdown,
    blockerCount,
    importantCount,
    minorCount,
  };
}
