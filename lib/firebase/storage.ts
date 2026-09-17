import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from './client';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function sanitizeFilename(name: string): string {
  // Remove path traversal and illegal characters
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export async function uploadCheckScreenshot(
  userId: string,
  checkId: string,
  file: File | Blob,
  filename: string
): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured for file storage.');
  }

  if (!userId || !checkId) {
    throw new Error('User ID and Check ID are required to upload screenshot.');
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, and WebP images are allowed.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 10MB limit.');
  }

  const safeName = sanitizeFilename(filename || 'screenshot.png');
  const storage = getFirebaseStorage();
  const filePath = `users/${userId}/checks/${checkId}/screenshots/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/png',
    customMetadata: {
      userId,
      checkId,
      originalFilename: safeName,
    },
  });

  return await getDownloadURL(snapshot.ref);
}
