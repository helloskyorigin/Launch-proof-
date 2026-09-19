import { CheckRecord, CheckStatus, checksStore } from '@/lib/checks/check-store';
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
  // Sync to in-memory store immediately
  checksStore.set(check.id, check);

  const db = getFirebaseAdminFirestore();

  if (db) {
    try {
      const docData = mapCheckRecordToStoredDoc(check, userId, parentCheckId);
      // 1. Save to top-level checks collection for instant O(1) index-free lookups
      await db.collection('checks').doc(check.id).set(docData, { merge: true });
      // 2. Also save to user subcollection if user is identified
      if (userId && userId !== 'anonymous') {
        await db.collection('users').doc(userId).collection('checks').doc(check.id).set(docData, { merge: true });
      }
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

  checksStore.set(id, updated);
  await saveCheck(updated, userId);
  return updated;
}

export async function getCheck(id: string, userId?: string): Promise<CheckRecord | undefined> {
  const inMemory = checksStore.get(id);

  const db = getFirebaseAdminFirestore();

  if (db) {
    try {
      // 1. Direct O(1) document lookup on top-level checks collection (requires NO index)
      const topSnap = await db.collection('checks').doc(id).get();
      if (topSnap.exists) {
        const record = mapStoredDocToCheckRecord(topSnap.data() as StoredCheckDocument);
        checksStore.set(id, record);
        return record;
      }

      // 2. If userId provided, check user's subcollection
      if (userId && userId !== 'anonymous') {
        const userDocSnap = await db.collection('users').doc(userId).collection('checks').doc(id).get();
        if (userDocSnap.exists) {
          const record = mapStoredDocToCheckRecord(userDocSnap.data() as StoredCheckDocument);
          checksStore.set(id, record);
          return record;
        }
      }
    } catch (err) {
      console.error(`[checks-repository] Admin getCheck failed for ${id}:`, err);
    }
  }

  if (isFirebaseConfigured() && userId && userId !== 'anonymous') {
    try {
      const record = await getUserCheckFromFirestore(userId, id);
      if (record) {
        checksStore.set(id, record);
        return record;
      }
    } catch (err) {
      console.error(`[checks-repository] Client firestore getCheck failed for ${id}:`, err);
    }
  }

  return inMemory;
}

export async function getAllChecks(userId: string = 'anonymous'): Promise<CheckRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (db) {
    try {
      if (userId && userId !== 'anonymous') {
        const snap = await db
          .collection('users')
          .doc(userId)
          .collection('checks')
          .orderBy('createdAt', 'desc')
          .get();

        if (!snap.empty) {
          return snap.docs.map((d: any) => mapStoredDocToCheckRecord(d.data() as StoredCheckDocument));
        }
      }

      // Fallback to top-level checks collection
      const topSnap = await db
        .collection('checks')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      if (!topSnap.empty) {
        const all = topSnap.docs.map((d: any) => mapStoredDocToCheckRecord(d.data() as StoredCheckDocument));
        if (userId && userId !== 'anonymous') {
          return all.filter((c: any) => c.userId === userId || !c.userId || c.userId === 'anonymous');
        }
        return all;
      }
    } catch (err) {
      console.error(`[checks-repository] Admin getAllChecks failed for user ${userId}:`, err);
    }
  }

  if (isFirebaseConfigured() && userId && userId !== 'anonymous') {
    try {
      return await getUserChecksFromFirestore(userId);
    } catch (err) {
      console.error(`[checks-repository] Client firestore getAllChecks failed for user ${userId}:`, err);
    }
  }

  return [];
}

export async function deleteCheck(id: string, userId: string = 'anonymous'): Promise<boolean> {
  const db = getFirebaseAdminFirestore();
  if (db) {
    try {
      await db.collection('checks').doc(id).delete().catch(() => {});
      if (userId && userId !== 'anonymous') {
        await db.collection('users').doc(userId).collection('checks').doc(id).delete().catch(() => {});
      }
      return true;
    } catch (err) {
      console.error(`[checks-repository] Admin deleteCheck failed for ${id}:`, err);
      return false;
    }
  }

  if (isFirebaseConfigured() && userId && userId !== 'anonymous') {
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
