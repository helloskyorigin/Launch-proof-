'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { SlideDrawer } from '@/components/SlideDrawer';
import { AccountModal } from '@/components/AccountModal';
import { HomeScreen } from '@/components/HomeScreen';
import { CheckHistoryScreen } from '@/components/CheckHistoryScreen';
import { ReportsScreen } from '@/components/ReportsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { HelpSupportScreen } from '@/components/HelpSupportScreen';
import { NewCheckScreen } from '@/components/NewCheckScreen';
import { PricingScreen } from '@/components/PricingScreen';
import { LandingPage } from '@/components/LandingPage';
import { AuthScreen } from '@/components/AuthScreen';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { GenericViewModal } from '@/components/GenericViewModal';
import { useAuth } from '@/lib/firebase/context';
import { getUserChecksFromFirestore, saveUserCheckToFirestore } from '@/lib/firebase/firestore';

function mapChecksToHistoryItems(checks: any[]): any[] {
  return checks.map((c) => {
    const name = c.finalUrl || c.url || 'Product Check';
    const cleanName = name.replace(/^https?:\/\//, '').split('/')[0];
    
    let displayStatus: 'Ready' | 'Needs Fix' | 'Draft' = 'Draft';
    if (c.status === 'completed') {
      displayStatus = (c.score ?? 80) >= 80 ? 'Ready' : 'Needs Fix';
    } else if (c.status === 'failed' || c.status === 'reasoning_failed') {
      displayStatus = 'Needs Fix';
    } else {
      displayStatus = 'Draft';
    }

    return {
      id: c.id,
      url: c.url,
      name: cleanName,
      date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      score: c.score ?? 0,
      status: displayStatus,
      blockersCount: c.blockerCount ?? 0,
      importantCount: c.importantCount ?? 0,
    };
  });
}

function mapChecksToReports(checks: any[]): any[] {
  return checks
    .filter((c) => c.status === 'completed')
    .map((c) => {
      const name = c.finalUrl || c.url || 'Product Check';
      const cleanName = name.replace(/^https?:\/\//, '').split('/')[0];
      
      const findings = c.findings || [];
      const userJourneyFindings = findings.filter((f: any) => f.category === 'User Journey' || f.category === 'user_journey');
      const mobileFindings = findings.filter((f: any) => f.category === 'Mobile' || f.category === 'mobile');
      const productClarityFindings = findings.filter((f: any) => f.category === 'Product Clarity' || f.category === 'product_clarity');
      const trustFindings = findings.filter((f: any) => f.category === 'Trust' || f.category === 'trust' || f.category === 'Trust & Conversion');
      
      const mapFinding = (f: any) => ({
        id: f.id,
        title: f.title,
        severity: f.severity === 'minor' ? 'passed' : f.severity,
        evidence: f.evidence,
        whyItMatters: f.whyItMatters,
        recommendedFix: f.fix || f.recommendedFix,
      });

      return {
        id: c.id,
        name: cleanName,
        url: c.url,
        productType: c.productType || 'SaaS / Web App',
        date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ' · ' + new Date(c.createdAt || Date.now()).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        score: c.score ?? 80,
        status: (c.score ?? 80) >= 80 ? 'Ready' : 'Needs Fix',
        blockersCount: c.blockerCount ?? 0,
        importantCount: c.importantCount ?? 0,
        passedCount: 24 - (c.blockerCount ?? 0) - (c.importantCount ?? 0),
        totalChecks: 24,
        verdict: c.scoring?.summary || 'Product evaluation completed successfully.',
        categories: {
          userJourney: {
            score: c.breakdown?.userJourney ?? 80,
            status: (c.breakdown?.userJourney ?? 80) >= 80 ? 'Ready' : 'Needs Fix',
            findings: userJourneyFindings.map(mapFinding),
          },
          mobileCheck: {
            score: c.breakdown?.mobile ?? 80,
            status: (c.breakdown?.mobile ?? 80) >= 80 ? 'Ready' : 'Needs Fix',
            findings: mobileFindings.map(mapFinding),
          },
          productClarity: {
            score: c.breakdown?.productClarity ?? 80,
            status: (c.breakdown?.productClarity ?? 80) >= 80 ? 'Ready' : 'Needs Fix',
            findings: productClarityFindings.map(mapFinding),
          },
          trustConversion: {
            score: c.breakdown?.trust ?? 80,
            status: (c.breakdown?.trust ?? 80) >= 80 ? 'Ready' : 'Needs Fix',
            findings: trustFindings.map(mapFinding),
          },
        },
        fixPlan: (c.scoring?.fixPlan || []).map((f: any, i: number) => ({
          step: i + 1,
          title: f.title,
          category: f.category,
          impact: f.severity === 'blocker' ? 'Blocker' : 'Medium',
        })),
      };
    });
}

export default function LaunchProofApp() {
  const router = useRouter();
  const { user, profile, status, isConfigured } = useAuth();

  // Navigation screen state:
  // Public: 'landing' | 'auth'
  // Onboarding: 'onboarding'
  // Protected: 'home' | 'settings' | 'help' | 'reports' | 'check-history' | 'new-check' | 'pricing' | 'feedback'
  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [authMode, setAuthMode] = useState<'check' | 'signin'>('check');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);

  // Checks state: initialized to empty array, populated from Firestore when authenticated
  const [checks, setChecks] = useState<any[]>([]);
  const [initialProductUrl, setInitialProductUrl] = useState<string>('');

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);
  const handleOpenAccount = () => setAccountModalOpen(true);
  const handleCloseAccount = () => setAccountModalOpen(false);

  // Load user checks from Firestore when authenticated
  useEffect(() => {
    if (status === 'authenticated' && user?.uid) {
      let isMounted = true;
      getUserChecksFromFirestore(user.uid)
        .then((items) => {
          if (isMounted && items.length > 0) {
            setChecks(items);
          }
        })
        .catch((err) => {
          console.error('[LaunchProofApp] Error fetching user checks from Firestore:', err);
        });

      return () => {
        isMounted = false;
      };
    } else if (status === 'unauthenticated') {
      setChecks([]);
    }
  }, [status, user?.uid]);

  // Route protection effect:
  // If unauthenticated and on a protected route, redirect to auth (or landing)
  useEffect(() => {
    if (status === 'loading') return;

    const publicScreens = ['landing', 'auth'];
    const isProtected = !publicScreens.includes(currentScreen) && currentScreen !== 'onboarding';

    if (status === 'unauthenticated' && isProtected) {
      setCurrentScreen('landing');
    }
  }, [status, currentScreen]);

  const handleNavigate = (screenId: string) => {
    const publicScreens = ['landing', 'auth'];
    if (status === 'unauthenticated' && !publicScreens.includes(screenId)) {
      setAuthMode('signin');
      setCurrentScreen('auth');
      setDrawerOpen(false);
      return;
    }
    setCurrentScreen(screenId);
    setDrawerOpen(false);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOADING STATE (Avoid auth flicker)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status === 'loading') {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-center items-center px-4 py-8 antialiased">
        <div className="w-full max-w-[390px] flex flex-col items-center text-center animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#0066ff] text-white flex items-center justify-center font-black text-2xl shadow-2xs mb-5 select-none">
            L
          </div>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight mb-2">
            LaunchProof
          </h2>
          <p className="text-xs text-slate-500 font-normal mb-6">
            Loading your workspace...
          </p>
          <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0066ff] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. PUBLIC MARKETING LANDING PAGE (no dashboard chrome)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (currentScreen === 'landing') {
    return (
      <LandingPage
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setCurrentScreen('auth');
        }}
        onNavigateToOnboarding={() => {
          if (status === 'authenticated') {
            setCurrentScreen('onboarding');
          } else {
            setAuthMode('check');
            setCurrentScreen('auth');
          }
        }}
        onEnterApp={(url) => {
          if (url) setInitialProductUrl(url);
          if (status === 'authenticated') {
            if (profile && !profile.onboardingCompleted) {
              setCurrentScreen('onboarding');
            } else {
              setCurrentScreen(url ? 'new-check' : 'home');
            }
          } else {
            setAuthMode('check');
            setCurrentScreen('auth');
          }
        }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. DEDICATED AUTHENTICATION SCREEN (no dashboard chrome)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (currentScreen === 'auth') {
    return (
      <AuthScreen
        initialMode={authMode}
        onBackToLanding={() => setCurrentScreen('landing')}
        onSuccess={(userType) => {
          if (userType === 'new' || (profile && !profile.onboardingCompleted)) {
            setCurrentScreen('onboarding');
          } else {
            setCurrentScreen(initialProductUrl ? 'new-check' : 'home');
          }
        }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. NEW USER ONBOARDING SCREEN (no dashboard chrome)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen
        userName={user?.displayName || profile?.name || 'Founder'}
        userEmail={user?.email || profile?.email || ''}
        onComplete={() => {
          setCurrentScreen(initialProductUrl ? 'new-check' : 'home');
        }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. PROTECTED APPLICATION WORKSPACE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 flex flex-col items-center">
      {/* Main App Content Viewport (fluid & naturally scrollable) */}
      <div className="w-full max-w-md sm:max-w-lg min-h-screen flex flex-col relative">
        {/* Top Header */}
        <Header
          onOpenDrawer={handleOpenDrawer}
          onOpenAccount={handleOpenAccount}
          onNavigate={handleNavigate}
          currentScreen={currentScreen}
        />

        {/* Naturally scrollable screen content container */}
        <main className="flex-1 w-full max-w-xl mx-auto flex flex-col">
          {currentScreen === 'home' && (
            <HomeScreen
              onStartCheck={(url) => {
                if (url) setInitialProductUrl(url);
                setCurrentScreen('new-check');
              }}
            />
          )}

          {currentScreen === 'check-history' && (
            <CheckHistoryScreen
              checks={mapChecksToHistoryItems(checks)}
              onNewCheck={() => setCurrentScreen('new-check')}
              onSelectCheck={(item) => {
                router.push(`/check/${item.id}`);
              }}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsScreen
              onNewCheck={() => setCurrentScreen('new-check')}
              onNavigate={handleNavigate}
              reports={mapChecksToReports(checks)}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'help' && (
            <HelpSupportScreen
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'new-check' && (
            <NewCheckScreen
              initialUrl={initialProductUrl}
              onBack={() => setCurrentScreen('home')}
              onCheckCompleted={(newCheck) => {
                setChecks((prev) => [newCheck, ...prev]);
                if (user?.uid) {
                  saveUserCheckToFirestore(user.uid, newCheck).catch((err) => {
                    console.error('[LaunchProofApp] Failed to save check to Firestore:', err);
                  });
                }
              }}
            />
          )}

          {currentScreen === 'pricing' && (
            <PricingScreen
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'feedback' && (
            <GenericViewModal
              screenId={currentScreen}
              onBack={() => setCurrentScreen('home')}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Slide-out Left Navigation Drawer (mobile-first) */}
        <SlideDrawer
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          activeScreen={currentScreen}
          onNavigate={handleNavigate}
          onOpenAccount={handleOpenAccount}
          reportCount={checks.length}
        />

        {/* Account / Profile Interaction Modal */}
        <AccountModal
          isOpen={accountModalOpen}
          onClose={handleCloseAccount}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
