export type CheckStatus =
  | 'created'
  | 'validating'
  | 'ready_for_analysis'
  | 'opening'
  | 'checking_desktop'
  | 'checking_mobile'
  | 'collecting_evidence'
  | 'evidence_ready'
  | 'checks_ready'
  | 'reasoning'
  | 'reasoning_failed'
  | 'reasoning_complete'
  | 'findings_ready'
  | 'completed'
  | 'failed';

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

export type CheckCategory =
  | 'product_clarity'
  | 'user_journey'
  | 'mobile'
  | 'trust'
  | 'technical';

export type CheckResultStatus = 'pass' | 'fail' | 'warning' | 'unknown';

export interface DeterministicCheckResult {
  id: string;
  category: CheckCategory;
  status: CheckResultStatus;
  evidence: string[];
  value: unknown;
}

export type FindingCategory =
  | 'Product Clarity'
  | 'User Journey'
  | 'Mobile'
  | 'Trust'
  | 'Technical';

export type FindingSeverity = 'blocker' | 'important' | 'minor';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  whyItMatters: string;
  fix: string;
  confidence?: number;
  evidenceRefs?: string[];
}

export interface ReasoningSummary {
  observation: string;
  highestRiskArea: string;
}

export interface ReasoningResult {
  status: 'complete' | 'failed';
  findings: Finding[];
  summary?: ReasoningSummary;
  model: string;
}

export interface ConsoleMessageEvidence {
  type: string;
  text: string;
  location?: string;
}

export interface FailedRequestEvidence {
  url: string;
  method: string;
  status?: number;
  resourceType?: string;
}

export interface LinkEvidence {
  text: string;
  href: string;
}

export interface ButtonEvidence {
  text: string;
}

export interface FormEvidence {
  action?: string;
  method?: string;
}

export interface InputFieldEvidence {
  type?: string;
  placeholder?: string;
  name?: string;
}

export interface DesktopEvidence {
  title: string;
  metaDescription?: string;
  visibleTextExcerpt?: string;
  headings: string[];
  links: LinkEvidence[];
  buttons: ButtonEvidence[];
  forms: FormEvidence[];
  inputFields?: InputFieldEvidence[];
  consoleErrors: ConsoleMessageEvidence[];
  failedRequests: FailedRequestEvidence[];
  pageErrors: Array<{ message: string }>;
  screenshot?: string;
  httpStatus?: number;
}

export interface MobileEvidence {
  title: string;
  headings: string[];
  buttons: ButtonEvidence[];
  links: LinkEvidence[];
  forms: FormEvidence[];
  visibleTextExcerpt?: string;
  consoleErrors: ConsoleMessageEvidence[];
  failedRequests: FailedRequestEvidence[];
  pageErrors: Array<{ message: string }>;
  horizontalOverflow: boolean;
  scrollWidth?: number;
  viewportWidth?: number;
  screenshot?: string;
  error?: string;
}

export interface CheckEvidence {
  desktop?: DesktopEvidence;
  mobile?: MobileEvidence;
}

export interface FixPlanItem {
  rank: number;
  findingId: string;
  category: string;
  severity: string;
  title: string;
  exactFix: string;
  evidenceRefs: string[];
}

export interface FinalScoringResult {
  status: 'complete' | 'failed';
  overallScore: number;
  verdict: 'READY' | 'NEEDS_ATTENTION' | 'NOT_READY';
  categoryScores: {
    'Product Clarity': number;
    'User Journey': number;
    'Mobile': number;
    'Trust': number;
    'Technical': number;
  };
  counts: {
    blockers: number;
    important: number;
    minor: number;
    passed: number;
  };
  summary: string;
  fixPlan: FixPlanItem[];
}

export interface CheckRecord {
  id: string;
  url: string;
  finalUrl: string;
  status: CheckStatus;
  productType?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  responseTimeMs?: number;
  httpStatus?: number;
  evidence?: CheckEvidence;
  checks?: DeterministicCheckResult[];
  findings?: Finding[];
  reasoning?: ReasoningResult;
  scoring?: FinalScoringResult;
  score?: number;
  verdict?: ReadinessVerdict;
  breakdown?: ScoreBreakdown;
  blockerCount?: number;
  importantCount?: number;
  minorCount?: number;
  readinessScore?: ReadinessScoreResult;
  aiError?: string;
  error?: string;
}

// In-memory check storage (persistent across requests in Node process)
const globalForChecks = globalThis as unknown as {
  _checksStore?: Map<string, CheckRecord>;
};

const checksStore = globalForChecks._checksStore ?? new Map<string, CheckRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalForChecks._checksStore = checksStore;
}

export function saveCheck(check: CheckRecord): CheckRecord {
  const checkWithTimestamp = {
    ...check,
    updatedAt: new Date().toISOString(),
  };
  checksStore.set(check.id, checkWithTimestamp);
  
  import('@/lib/db/checks-repository').then(({ saveCheck: dbSave }) => {
    dbSave(checkWithTimestamp).catch(e => console.error('Background save failed:', e));
  }).catch(() => {});
  
  return checkWithTimestamp;
}

export function updateCheckStatus(
  id: string,
  status: CheckStatus,
  partial?: Partial<CheckRecord>
): CheckRecord | undefined {
  const existing = checksStore.get(id);
  if (!existing) {
     import('@/lib/db/checks-repository').then(({ updateCheckStatus: dbUpdate }) => {
       dbUpdate(id, status, partial).catch(e => console.error('Background update failed:', e));
     }).catch(() => {});
     return undefined;
  }
  const updated: CheckRecord = {
    ...existing,
    ...partial,
    status,
    updatedAt: new Date().toISOString(),
  };
  checksStore.set(id, updated);
  
  import('@/lib/db/checks-repository').then(({ updateCheckStatus: dbUpdate }) => {
    dbUpdate(id, status, partial).catch(e => console.error('Background update failed:', e));
  }).catch(() => {});
  
  return updated;
}

export function getCheck(id: string): CheckRecord | undefined {
  import('@/lib/db/checks-repository').then(({ getCheck: dbGet }) => {
    dbGet(id).then(dbCheck => {
      if (dbCheck) checksStore.set(id, dbCheck);
    }).catch(e => console.error('Background fetch failed:', e));
  }).catch(() => {});
  
  return checksStore.get(id);
}

export function getAllChecks(): CheckRecord[] {
  // Try to sync with DB if possible
  import('@/lib/db/checks-repository').then(({ getAllChecks: dbGetAll }) => {
    dbGetAll().then(dbChecks => {
      dbChecks.forEach(c => checksStore.set(c.id, c));
    }).catch(e => console.error('Background fetch all failed:', e));
  }).catch(() => {});
  
  return Array.from(checksStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function deleteCheck(id: string): boolean {
  import('@/lib/db/checks-repository').then(({ deleteCheck: dbDelete }) => {
    dbDelete(id).catch(e => console.error('Background delete failed:', e));
  }).catch(() => {});
  
  return checksStore.delete(id);
}
