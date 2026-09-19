export type DiscoverySignalStatus = 'detected' | 'not_detected' | 'unknown';

export interface DiscoveryEvidence {
  text?: string;
  href?: string;
  selector?: string;
  location?: string;
  detail?: string;
}

export interface DiscoveredCapability {
  status: DiscoverySignalStatus;
  evidence?: DiscoveryEvidence;
}

export interface DiscoveredLink {
  text: string;
  href: string;
  isInternal?: boolean;
}

export interface DiscoveredButton {
  text: string;
  selector?: string;
  location?: string;
}

export interface DiscoveredPrimaryCta {
  text: string;
  href?: string;
  selector?: string;
  location?: string;
}

export interface DiscoveredForm {
  action?: string;
  method?: string;
  inputsCount?: number;
  purpose?: string;
}

export interface DiscoveredInput {
  type?: string;
  name?: string;
  placeholder?: string;
}

export interface WebsiteDiscoveryResult {
  page: {
    url: string;
    finalUrl: string;
    title: string;
    metaDescription?: string;
    mainHeadings: string[];
    visibleTextExcerpt?: string;
    language?: string;
    httpStatus?: number;
    responseTimeMs?: number;
    screenshot?: string;
  };

  navigation: {
    status: DiscoverySignalStatus;
    links: DiscoveredLink[];
    internalLinks: DiscoveredLink[];
    externalLinks: DiscoveredLink[];
    internalLinkCount: number;
    externalLinkCount: number;
  };

  actions: {
    buttons: DiscoveredButton[];
    primaryCtaCandidates: DiscoveredPrimaryCta[];
    forms: DiscoveredForm[];
    inputs: DiscoveredInput[];
  };

  capabilities: {
    signup: DiscoveredCapability;
    login: DiscoveredCapability;
    logout: DiscoveredCapability;
    onboarding: DiscoveredCapability;
    dashboard: DiscoveredCapability;
    appWorkspace: DiscoveredCapability;
    projectCreation: DiscoveredCapability;
    search: DiscoveredCapability;
    upload: DiscoveredCapability;
    checkout: DiscoveredCapability;
    cart: DiscoveredCapability;
    pricing: DiscoveredCapability;
    contact: DiscoveredCapability;
    support: DiscoveredCapability;
    documentation: DiscoveredCapability;
    accountProfile: DiscoveredCapability;
    passwordReset: DiscoveredCapability;
  };

  trustSignals: {
    privacy: DiscoveredCapability;
    terms: DiscoveredCapability;
    refund: DiscoveredCapability;
    security: DiscoveredCapability;
    about: DiscoveredCapability;
    contact: DiscoveredCapability;
    pricing: DiscoveredCapability;
    support: DiscoveredCapability;
  };

  mobile: {
    load: DiscoverySignalStatus;
    visibleContent: DiscoverySignalStatus;
    horizontalOverflow: DiscoverySignalStatus;
    importantNavigationPresent: DiscoverySignalStatus;
    viewportWidth: number;
    scrollWidth: number;
    screenshot?: string;
    error?: string;
  };

  summary: {
    title: string;
    items: string[];
    detectedCount: number;
    notDetectedCount: number;
  };
}
