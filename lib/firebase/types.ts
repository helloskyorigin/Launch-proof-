export type UserPlan = 'free' | 'pro' | 'pro_plus';

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: any;
  updatedAt: any;
  onboardingCompleted: boolean;
  onboardingSkipped?: boolean;
  onboardingStage?: string;
  onboardingProductType?: string;
  onboardingFocusArea?: string;
  plan: UserPlan;
  creditsRemaining?: number;
}

export interface FirestoreCheck {
  id: string;
  userId: string;
  url: string;
  normalizedUrl?: string;
  productType?: string;
  description?: string;
  status: string;
  overallScore?: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  results?: {
    findings?: any[];
    score?: number;
    verdict?: string;
    categoryScores?: Record<string, number>;
    summary?: string;
  };
  screenshotUrls?: string[];
}

export interface FirestoreFixPlan {
  id: string;
  checkId: string;
  userId: string;
  items: Array<{
    id: string;
    priority: 'Critical' | 'Important' | 'Minor';
    category: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreUserProfile {
  buildingType?: string;
  productStage?: string;
  focusArea?: string;
  workspacePreferences?: Record<string, any>;
}
