import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured, getFirebaseAuth } from './client';
import { CheckRecord, CheckStatus } from '@/lib/checks/check-store';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  productType?: string;
  currentStage?: string;
  auditFocus?: string;
  onboardingCompleted: boolean;
  onboardingSkipped?: boolean;
  plan: 'free' | 'pro' | 'pro_plus';
  checksCount?: number;
  createdAt: any;
  updatedAt: any;
}

export interface StoredCheckDocument {
  checkId: string;
  userId: string;
  url: string;
  normalizedUrl: string;
  description?: string;
  productType?: string;
  status: CheckStatus;
  evidence?: any;
  deterministicChecks?: any;
  findings?: any;
  score?: number | null;
  verdict?: string | null;
  categoryScores?: any | null;
  counts?: any | null;
  summary?: string | null;
  fixPlan?: any | null;
  parentCheckId?: string;
  responseTimeMs?: number;
  httpStatus?: number;
  error?: string | null;
  createdAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MANDATORY ERROR HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let auth;
  try {
    auth = getFirebaseAuth();
  } catch (e) {
    // Auth not yet initialized
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error context:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER PROFILE OPERATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function createOrUpdateUserProfile(
  uid: string,
  data: {
    email: string;
    name?: string | null;
    photoURL?: string | null;
  }
): Promise<UserProfile> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured.');
  }
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  let existing;
  try {
    existing = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }

  if (existing.exists()) {
    const existingData = existing.data() as UserProfile;
    // Update basic user info while preserving onboarding and plan state
    try {
      await updateDoc(userRef, {
        name: data.name || existingData.name || 'Founder',
        photoURL: data.photoURL ?? existingData.photoURL ?? null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    return {
      ...existingData,
      name: data.name || existingData.name || 'Founder',
      photoURL: data.photoURL ?? existingData.photoURL ?? null,
    };
  }

  const initialProfile: UserProfile = {
    uid,
    email: data.email,
    name: data.name || data.email.split('@')[0] || 'Founder',
    photoURL: data.photoURL || null,
    onboardingCompleted: false,
    plan: 'free',
    checksCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, initialProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  return initialProfile;
}

export async function saveUserOnboardingProfile(
  uid: string,
  onboarding: {
    buildingType?: string;
    productStage?: string;
    focusArea?: string;
    skipped?: boolean;
  }
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  try {
    await setDoc(
      userRef,
      {
        productType: onboarding.buildingType || null,
        currentStage: onboarding.productStage || null,
        auditFocus: onboarding.focusArea || null,
        onboardingCompleted: true,
        onboardingSkipped: Boolean(onboarding.skipped),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER CHECKS OPERATIONS (users/{uid}/checks/{checkId})
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function sanitizeEvidenceForFirestore(evidence: any) {
  if (!evidence) return null;
  const clean: any = {};
  if (evidence.desktop) {
    clean.desktop = {
      title: evidence.desktop.title,
      metaDescription: evidence.desktop.metaDescription,
      headings: evidence.desktop.headings?.slice(0, 30) || [],
      linksCount: evidence.desktop.links?.length || 0,
      buttonsCount: evidence.desktop.buttons?.length || 0,
      formsCount: evidence.desktop.forms?.length || 0,
      consoleErrors: evidence.desktop.consoleErrors?.slice(0, 15) || [],
      failedRequests: evidence.desktop.failedRequests?.slice(0, 15) || [],
      httpStatus: evidence.desktop.httpStatus,
    };
  }
  if (evidence.mobile) {
    clean.mobile = {
      title: evidence.mobile.title,
      headings: evidence.mobile.headings?.slice(0, 30) || [],
      horizontalOverflow: evidence.mobile.horizontalOverflow,
      scrollWidth: evidence.mobile.scrollWidth,
      viewportWidth: evidence.mobile.viewportWidth,
      consoleErrors: evidence.mobile.consoleErrors?.slice(0, 15) || [],
      failedRequests: evidence.mobile.failedRequests?.slice(0, 15) || [],
    };
  }
  return clean;
}

export function mapCheckRecordToStoredDoc(
  check: CheckRecord,
  userId: string,
  parentCheckId?: string
): StoredCheckDocument {
  const isCompleted = check.status === 'completed';
  const now = new Date().toISOString();

  return {
    checkId: check.id,
    userId,
    url: check.url,
    normalizedUrl: check.finalUrl || check.url,
    description: check.description || '',
    productType: check.productType || 'SaaS / Web App',
    status: check.status,
    evidence: sanitizeEvidenceForFirestore(check.evidence),
    deterministicChecks: check.checks || null,
    findings: check.findings || null,
    score: check.scoring?.overallScore ?? check.score ?? null,
    verdict: check.scoring?.verdict ?? check.verdict ?? null,
    categoryScores: check.scoring?.categoryScores ?? check.breakdown ?? null,
    counts: check.scoring?.counts ?? {
      blockers: check.blockerCount ?? 0,
      important: check.importantCount ?? 0,
      minor: check.minorCount ?? 0,
    },
    summary: check.scoring?.summary ?? '',
    fixPlan: check.scoring?.fixPlan || null,
    parentCheckId: parentCheckId || undefined,
    responseTimeMs: check.responseTimeMs,
    httpStatus: check.httpStatus,
    error: check.error || check.aiError,
    createdAt: check.createdAt || now,
    completedAt: isCompleted ? (check.updatedAt || now) : null,
    updatedAt: now,
  };
}

export function mapStoredDocToCheckRecord(doc: StoredCheckDocument): CheckRecord {
  return {
    id: doc.checkId,
    url: doc.url,
    finalUrl: doc.normalizedUrl || doc.url,
    status: doc.status,
    productType: doc.productType,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    responseTimeMs: doc.responseTimeMs,
    httpStatus: doc.httpStatus,
    evidence: doc.evidence,
    checks: doc.deterministicChecks,
    findings: doc.findings,
    score: doc.score ?? undefined,
    verdict: (doc.verdict === 'READY' ? 'Ready' : doc.verdict === 'NEEDS_ATTENTION' ? 'Needs Attention' : doc.verdict === 'NOT_READY' ? 'Not Ready' : doc.verdict || undefined) as any,
    breakdown: doc.categoryScores ? {
      productClarity: doc.categoryScores['Product Clarity'] ?? 0,
      userJourney: doc.categoryScores['User Journey'] ?? 0,
      mobile: doc.categoryScores['Mobile'] ?? 0,
      trust: doc.categoryScores['Trust'] ?? 0,
      technical: doc.categoryScores['Technical'] ?? 0,
    } : undefined,
    blockerCount: doc.counts?.blockers ?? 0,
    importantCount: doc.counts?.important ?? 0,
    minorCount: doc.counts?.minor ?? 0,
    scoring: doc.score != null ? {
      status: 'complete',
      overallScore: doc.score,
      verdict: doc.verdict as any,
      categoryScores: doc.categoryScores || {},
      counts: doc.counts || { blockers: 0, important: 0, minor: 0, passed: 0 },
      summary: doc.summary || '',
      fixPlan: doc.fixPlan || [],
    } : undefined,
    error: doc.error || undefined,
  };
}

export async function saveUserCheckToFirestore(
  userId: string,
  check: CheckRecord,
  parentCheckId?: string
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  const checkRef = doc(db, 'users', userId, 'checks', check.id);
  const path = `users/${userId}/checks/${check.id}`;
  const storedDoc = mapCheckRecordToStoredDoc(check, userId, parentCheckId);

  try {
    await setDoc(checkRef, storedDoc, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserCheckFromFirestore(
  userId: string,
  checkId: string
): Promise<CheckRecord | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getFirebaseDb();
  const checkRef = doc(db, 'users', userId, 'checks', checkId);
  const path = `users/${userId}/checks/${checkId}`;

  try {
    const snap = await getDoc(checkRef);
    if (!snap.exists()) {
      return null;
    }
    return mapStoredDocToCheckRecord(snap.data() as StoredCheckDocument);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function getUserChecksFromFirestore(userId: string): Promise<CheckRecord[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getFirebaseDb();
  const checksCol = collection(db, 'users', userId, 'checks');
  const path = `users/${userId}/checks`;
  const q = query(checksCol, orderBy('createdAt', 'desc'));

  try {
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) =>
      mapStoredDocToCheckRecord(docSnap.data() as StoredCheckDocument)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteUserCheckFromFirestore(
  userId: string,
  checkId: string
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  const checkRef = doc(db, 'users', userId, 'checks', checkId);
  const path = `users/${userId}/checks/${checkId}`;

  try {
    await deleteDoc(checkRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE REPOSITORY API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createUserProfile = createOrUpdateUserProfile;

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createCheck(
  userId: string,
  check: CheckRecord,
  parentCheckId?: string
): Promise<void> {
  await saveUserCheckToFirestore(userId, check, parentCheckId);
}

export async function getCheckById(
  userId: string,
  checkId: string
): Promise<CheckRecord | null> {
  return await getUserCheckFromFirestore(userId, checkId);
}

export const listUserChecks = getUserChecksFromFirestore;

export async function updateCheckStatus(
  userId: string,
  checkId: string,
  status: CheckStatus,
  results?: any
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  const checkRef = doc(db, 'users', userId, 'checks', checkId);
  const path = `users/${userId}/checks/${checkId}`;
  const updatePayload: any = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (results) {
    if (results.findings) updatePayload.findings = results.findings;
    if (results.score !== undefined) updatePayload.score = results.score;
    if (results.verdict) updatePayload.verdict = results.verdict;
    if (results.categoryScores) updatePayload.categoryScores = results.categoryScores;
    if (results.counts) updatePayload.counts = results.counts;
    if (results.summary) updatePayload.summary = results.summary;
    if (results.fixPlan) updatePayload.fixPlan = results.fixPlan;
  }

  try {
    await updateDoc(checkRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveFixPlan(
  userId: string,
  checkId: string,
  planData: any
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDb();
  const checkRef = doc(db, 'users', userId, 'checks', checkId);
  const path = `users/${userId}/checks/${checkId}`;

  try {
    await updateDoc(checkRef, {
      fixPlan: planData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getFixPlan(
  userId: string,
  checkId: string
): Promise<any | null> {
  const check = await getUserCheckFromFirestore(userId, checkId);
  return check?.scoring?.fixPlan || null;
}
