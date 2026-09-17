import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured, getMissingFirebaseEnvVars } from './client';

export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled (the popup window was closed).';
    case 'auth/popup-blocked':
      return 'Sign in popup was blocked by your browser. Please allow popups or try again.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
    default:
      if (errorCode.startsWith('Missing Firebase configuration')) {
        return errorCode;
      }
      return 'Authentication failed. Please try again.';
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (!isFirebaseConfigured()) {
    const missing = getMissingFirebaseEnvVars();
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked') {
      // Fallback to redirect if popup is blocked
      await signInWithRedirect(auth, provider);
      throw error;
    }
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  if (!isFirebaseConfigured()) {
    const missing = getMissingFirebaseEnvVars();
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }

  const auth = getFirebaseAuth();
  return await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  if (!isFirebaseConfigured()) {
    const missing = getMissingFirebaseEnvVars();
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }

  const auth = getFirebaseAuth();
  return await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function logOut(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

export async function getCurrentUserIdToken(user?: User | null, forceRefresh: boolean = false): Promise<string | null> {
  if (!user) {
    if (!isFirebaseConfigured()) return null;
    const auth = getFirebaseAuth();
    user = auth.currentUser;
  }
  if (!user) return null;
  return await user.getIdToken(forceRefresh);
}
