'use client';

import React, { useState } from 'react';
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

export default function LaunchProofApp() {
  // Navigation screen state: 'landing' (default public marketing website) | 'auth' | 'onboarding' | 'home' | 'settings' | 'help' | 'reports' | 'check-history' | 'new-check' | 'pricing' | 'feedback'
  const [currentScreen, setCurrentScreen] = useState<string>('landing');
  const [authMode, setAuthMode] = useState<'check' | 'signin'>('check');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);

  // Checks state: initialized to EMPTY ARRAY (new user state with zero checks)
  const [checks, setChecks] = useState<any[]>([]);
  const [initialProductUrl, setInitialProductUrl] = useState<string>('');

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);
  const handleOpenAccount = () => setAccountModalOpen(true);
  const handleCloseAccount = () => setAccountModalOpen(false);

  const handleNavigate = (screenId: string) => {
    setCurrentScreen(screenId);
    setDrawerOpen(false);
  };

  const handleResetToNewUserState = () => {
    setChecks([]);
    setCurrentScreen('home');
  };

  // 1. PUBLIC MARKETING LANDING PAGE (no dashboard chrome)
  if (currentScreen === 'landing') {
    return (
      <LandingPage
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setCurrentScreen('auth');
        }}
        onNavigateToOnboarding={() => {
          setCurrentScreen('onboarding');
        }}
        onEnterApp={(url) => {
          if (url) setInitialProductUrl(url);
          setCurrentScreen(url ? 'new-check' : 'home');
        }}
      />
    );
  }

  // 2. DEDICATED AUTHENTICATION SCREEN (no dashboard chrome)
  if (currentScreen === 'auth') {
    return (
      <AuthScreen
        initialMode={authMode}
        onBackToLanding={() => setCurrentScreen('landing')}
        onSuccess={(userType, email, name) => {
          setCurrentUser({ email, name: name || 'Founder' });
          if (userType === 'new') {
            setCurrentScreen('onboarding');
          } else {
            setCurrentScreen('home');
          }
        }}
      />
    );
  }

  // 3. NEW USER ONBOARDING SCREEN (no dashboard chrome)
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen
        userName={currentUser?.name || 'Founder'}
        userEmail={currentUser?.email || ''}
        onComplete={() => {
          setCurrentScreen('home');
        }}
      />
    );
  }

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
              checks={checks}
              onNewCheck={() => setCurrentScreen('new-check')}
              onSelectCheck={() => setCurrentScreen('reports')}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsScreen
              onNewCheck={() => setCurrentScreen('new-check')}
              onNavigate={handleNavigate}
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
