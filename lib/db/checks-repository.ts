import { CheckRecord, CheckStatus } from '@/lib/checks/check-store';
import {
  saveUserCheckToFirestore,
  getUserCheckFromFirestore,
  getUserChecksFromFirestore,
  deleteUserCheckFromFirestore,
  mapCheckRecordToStoredDoc,
  mapStoredDocToCheckRecord,
  StoredCheckDocument,
} from '@/lib/firebase/firestore';
import { getFirebaseAdminFirestore } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/client';

export async function saveCheck(
  check: CheckRecord,
  userId: string = 'anonymous',
  parentCheckId?: string
): Promise<CheckRecord> {
  const db = getFirebaseAdminFirestore();

  if (db) {
    try {
      const docData = mapCheckRecordToStoredDoc(check, userId, parentCheckId);
      await db.collection('users').doc(userId).collection('checks').doc(check.id).set(docData, { merge: true });
      return check;
    } catch (err) {
      console.error(`[checks-repository] Admin save failed for check ${check.id}:`, err);
    }
  }

  if (isFirebaseConfigured() && userId !== 'anonymous') {
    try {
      await saveUserCheckToFirestore(userId, check, parentCheckId);
      return check;
    } catch (err) {
      console.error(`[checks-repository] Client firestore save failed for check ${check.id}:`, err);
    }
  }

  return check;
}

export async function updateCheckStatus(
  id: string,
  status: CheckStatus,
  partial?: Partial<CheckRecord>,
  userId: string = 'anonymous'
): Promise<CheckRecord | undefined> {
  const existing = await getCheck(id, userId);
  const updated: CheckRecord = {
    ...(existing || {
      id,
      url: '',
      finalUrl: '',
      status: 'created',
      createdAt: new Date().toISOString(),
    }),
    ...partial,
    status,
    updatedAt: new Date().toISOString(),
  };

  await saveCheck(updated, userId);
  return updated;
}

export async function getCheck(id: string, userId?: string): Promise<CheckRecord | undefined> {
  const db = getFirebaseAdminFirestore();

  if (db) {
    try {
      if (userId && userId !== 'anonymous') {
        const snap = await db.collection('users').doc(userId).collection('checks').doc(id).get();
        if (snap.exists) {
          return mapStoredDocToCheckRecord(snap.data() as StoredCheckDocument);
        }
      } else {
        // Search group collection across all users if userId not specified
        const groupSnap = await db.collectionGroup('checks').where('checkId', '==', id).limit(1).get();
        if (!groupSnap.empty) {
          return mapStoredDocToCheckRecord(groupSnap.docs[0].data() as StoredCheckDocument);
        }
      }
    } catch (err) {
      console.error(`[checks-repository] Admin getCheck failed for ${id}:`, err);
    }
  }

  if (isFirebaseConfigured() && userId && userId !== 'anonymous') {
    try {
      const record = await getUserCheckFromFirestore(userId, id);
      if (record) return record;
    } catch (err) {
      console.error(`[checks-repository] Client firestore getCheck failed for ${id}:`, err);
    }
  }

  return undefined;
}

export async function getAllChecks(userId: string = 'anonymous'): Promise<CheckRecord[]> {
  if (!userId || userId === 'anonymous') return [];

  const db = getFirebaseAdminFirestore();
  if (db) {
    try {
      const snap = await db
        .collection('users')
        .doc(userId)
        .collection('checks')
        .orderBy('createdAt', 'desc')
        .get();

      return snap.docs.map((d: any) => mapStoredDocToCheckRecord(d.data() as StoredCheckDocument));
    } catch (err) {
      console.error(`[checks-repository] Admin getAllChecks failed for user ${userId}:`, err);
    }
  }

  if (isFirebaseConfigured()) {
    try {
      return await getUserChecksFromFirestore(userId);
    } catch (err) {
      console.error(`[checks-repository] Client firestore getAllChecks failed for user ${userId}:`, err);
    }
  }

  return [];
}

export async function deleteCheck(id: string, userId: string = 'anonymous'): Promise<boolean> {
  if (!userId || userId === 'anonymous') return false;

  const db = getFirebaseAdminFirestore();
  if (db) {
    try {
      await db.collection('users').doc(userId).collection('checks').doc(id).delete();
      return true;
    } catch (err) {
      console.error(`[checks-repository] Admin deleteCheck failed for ${id}:`, err);
      return false;
    }
  }

  if (isFirebaseConfigured()) {
    try {
      await deleteUserCheckFromFirestore(userId, id);
      return true;
    } catch (err) {
      console.error(`[checks-repository] Client deleteCheck failed for ${id}:`, err);
      return false;
    }
  }

  return false;
}
