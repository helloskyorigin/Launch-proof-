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
    try {
      await authLogOut();
      setUser(null);
      setProfile(null);
      setIdToken(null);
      setStatus('unauthenticated');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out');
    }
  }, []);

  const completeOnboarding = useCallback(
    async (data: {
      buildingType?: string;
      productStage?: string;
      focusArea?: string;
      skipped?: boolean;
    }) => {
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
      isConfigured: configured,
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
