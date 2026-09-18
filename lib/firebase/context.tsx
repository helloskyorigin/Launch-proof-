'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  getMissingFirebaseEnvVars,
} from './client';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  logOut as authLogOut,
  getFriendlyAuthErrorMessage,
} from './auth';
import {
  UserProfile,
  getUserProfile,
  createOrUpdateUserProfile,
  saveUserOnboardingProfile,
} from './firestore';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Temporary bypass flag to allow instant frictionless access without blocking on real Firebase credentials
export const AUTH_BYPASS_MODE = true;

const BYPASS_STORAGE_KEY = 'shipscan_auth_user_session';

function createBypassUser(email: string = 'satyambihar422@gmail.com', name: string = 'Satyam'): User {
  return {
    uid: 'user_satyam_founder',
    email,
    displayName: name,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: 'bypass-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'bypass_token_satyam',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: 'google.com',
  } as unknown as User;
}

function createBypassProfile(email: string = 'satyambihar422@gmail.com', name: string = 'Satyam'): UserProfile {
  return {
    uid: 'user_satyam_founder',
    email,
    name,
    photoURL: null,
    onboardingCompleted: true,
    plan: 'pro',
    checksCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  isConfigured: boolean;
  missingConfig: string[];
  idToken: string | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (data: {
    buildingType?: string;
    productStage?: string;
    focusArea?: string;
    skipped?: boolean;
  }) => Promise<void>;
  clearError: () => void;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = useMemo(() => isFirebaseConfigured(), []);
  const missingVars = useMemo(() => getMissingFirebaseEnvVars(), []);

  // Fetch or sync user profile
  const syncProfile = useCallback(async (firebaseUser: User) => {
    try {
      let p = await getUserProfile(firebaseUser.uid);
      if (!p) {
        p = await createOrUpdateUserProfile(firebaseUser.uid, {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      }
      setProfile(p);
    } catch (err) {
      console.error('Failed to sync profile from Firestore:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      if (p) setProfile(p);
    }
  }, [user]);

  // Auth state listener
  useEffect(() => {
    // 1. Check for stored bypass session first
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(BYPASS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const bUser = createBypassUser(parsed.email || 'satyambihar422@gmail.com', parsed.name || 'Satyam');
          const bProfile = createBypassProfile(parsed.email || 'satyambihar422@gmail.com', parsed.name || 'Satyam');
          setUser(bUser);
          setProfile(bProfile);
          setIdToken('bypass_token_satyam');
          setStatus('authenticated');
          return;
        }
      } catch (e) {
        console.error('Error loading stored bypass session:', e);
      }
    }

    if (!configured) {
      setStatus('unauthenticated');
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            const token = await currentUser.getIdToken();
            setIdToken(token);
          } catch {
            setIdToken(null);
          }
          await syncProfile(currentUser);
          setStatus('authenticated');
        } else {
          setUser(null);
          setProfile(null);
          setIdToken(null);
          setStatus('unauthenticated');
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Firebase Auth listener error:', err);
      setStatus('unauthenticated');
    }
  }, [configured, syncProfile]);

  const clearError = useCallback(() => setError(null), []);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (AUTH_BYPASS_MODE) return 'bypass_token_satyam';
    if (!user) return null;
    try {
      const token = await user.getIdToken(forceRefresh);
      setIdToken(token);
      return token;
    } catch {
      return null;
    }
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (AUTH_BYPASS_MODE) {
      const bUser = createBypassUser('satyambihar422@gmail.com', 'Satyam');
      const bProfile = createBypassProfile('satyambihar422@gmail.com', 'Satyam');
      setUser(bUser);
      setProfile(bProfile);
      setIdToken('bypass_token_satyam');
      setStatus('authenticated');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            BYPASS_STORAGE_KEY,
            JSON.stringify({ email: 'satyambihar422@gmail.com', name: 'Satyam' })
          );
        } catch {}
      }
      return;
    }

    try {
      const cred = await authSignInWithGoogle();
      if (cred.user) {
        await syncProfile(cred.user);
      }
    } catch (err: any) {
      const message = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setError(message);
      throw err;
    }
  }, [syncProfile]);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    setError(null);
    if (AUTH_BYPASS_MODE) {
      const userEmail = email.trim() || 'satyambihar422@gmail.com';
      const userName = userEmail.split('@')[0] || 'Satyam';
      const bUser = createBypassUser(userEmail, userName);
      const bProfile = createBypassProfile(userEmail, userName);
      setUser(bUser);
      setProfile(bProfile);
      setIdToken('bypass_token_satyam');
      setStatus('authenticated');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            BYPASS_STORAGE_KEY,
            JSON.stringify({ email: userEmail, name: userName })
          );
        } catch {}
      }
      return;
    }

    try {
      const cred = await authSignInWithEmail(email, pass);
      if (cred.user) {
        await syncProfile(cred.user);
      }
    } catch (err: any) {
      const message = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setError(message);
      throw err;
    }
  }, [syncProfile]);

  const signUpWithEmail = useCallback(async (email: string, pass: string) => {
    setError(null);
    if (AUTH_BYPASS_MODE) {
      const userEmail = email.trim() || 'satyambihar422@gmail.com';
      const userName = userEmail.split('@')[0] || 'Satyam';
      const bUser = createBypassUser(userEmail, userName);
      const bProfile = createBypassProfile(userEmail, userName);
      setUser(bUser);
      setProfile(bProfile);
      setIdToken('bypass_token_satyam');
      setStatus('authenticated');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            BYPASS_STORAGE_KEY,
            JSON.stringify({ email: userEmail, name: userName })
          );
        } catch {}
      }
      return;
    }

    try {
      const cred = await authSignUpWithEmail(email, pass);
      if (cred.user) {
        await syncProfile(cred.user);
      }
    } catch (err: any) {
      const message = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setError(message);
      throw err;
    }
  }, [syncProfile]);

  const signOut = useCallback(async () => {
    setError(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(BYPASS_STORAGE_KEY);
      } catch {}
    }
    setUser(null);
    setProfile(null);
    setIdToken(null);
    setStatus('unauthenticated');
    if (configured) {
      try {
        await authLogOut();
      } catch (err: any) {
        setError(err?.message || 'Failed to sign out');
      }
    }
  }, [configured]);

  const completeOnboarding = useCallback(
    async (data: {
      buildingType?: string;
      productStage?: string;
      focusArea?: string;
      skipped?: boolean;
    }) => {
      if (AUTH_BYPASS_MODE) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                productType: data.buildingType || prev.productType,
                currentStage: data.productStage || prev.currentStage,
                auditFocus: data.focusArea || prev.auditFocus,
                onboardingCompleted: true,
                onboardingSkipped: Boolean(data.skipped),
              }
            : createBypassProfile()
        );
        return;
      }
      if (!user) return;
      try {
        await saveUserOnboardingProfile(user.uid, data);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                productType: data.buildingType || prev.productType,
                currentStage: data.productStage || prev.currentStage,
                auditFocus: data.focusArea || prev.auditFocus,
                onboardingCompleted: true,
                onboardingSkipped: Boolean(data.skipped),
              }
            : null
        );
      } catch (err) {
        console.error('Failed to save onboarding to Firestore:', err);
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      status,
      isConfigured: configured || AUTH_BYPASS_MODE,
      missingConfig: missingVars,
      idToken,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      completeOnboarding,
      clearError,
      getIdToken,
    }),
    [
      user,
      profile,
      status,
      configured,
      missingVars,
      idToken,
      error,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      completeOnboarding,
      clearError,
      getIdToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
