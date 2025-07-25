import { NavigationItem, PricingPlan, Feature, FeatureCategory } from './types';
import { SubscriptionTier } from './types';

// App Constants
export const APP_NAME = 'StoryMagic';
export const APP_DESCRIPTION = 'Magische Kindergeschichten mit KI';
export const APP_URL = 'https://saasify.com';
export const APP_VERSION = '1.0.0';

// Company Info
export const COMPANY_NAME = 'StoryMagic';
export const COMPANY_EMAIL = 'hallo@storymagic.de';
export const COMPANY_PHONE = '+49 221 12345678';
export const COMPANY_ADDRESS = {
  street: 'Musterstraße 123',
  city: 'Köln',
  postalCode: '50667',
  country: 'Deutschland'
};

// Social Media
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/saasify',
  linkedin: 'https://linkedin.com/company/saasify',
  github: 'https://github.com/saasify',
  youtube: 'https://youtube.com/@saasify'
};

// Navigation Items
export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    title: 'Features',
    href: '/features',
    children: [
      { title: 'Authentication', href: '/features/auth' },
      { title: 'Payments', href: '/features/payments' },
      { title: 'Analytics', href: '/features/analytics' },
      { title: 'API', href: '/features/api' }
    ]
  },
  {
    title: 'Pricing',
    href: '/pricing'
  },
  {
    title: 'Documentation',
    href: '/docs',
    external: true
  },
  {
    title: 'Support',
    href: '/support'
  }
];

export const FOOTER_NAVIGATION = {
  product: [
    { title: 'Geschichte erstellen', href: '/story-generator' },
    { title: 'Alle Geschichten', href: '/stories' },
    { title: 'Kategorien', href: '/kategorien' },
    { title: 'Altersgruppen', href: '/alter' }
  ],
  company: [
    { title: 'Über uns', href: '/about' },
    { title: 'Blog', href: '/blog' },
    { title: 'Kontakt', href: '/contact' },
    { title: 'Jobs', href: '/jobs' }
  ],
  support: [
    { title: 'Hilfe', href: '/help' },
    { title: 'FAQ', href: '/faq' },
    { title: 'Feedback', href: '/feedback' },
    { title: 'Community', href: '/community' }
  ],
  legal: [
    { title: 'Datenschutz', href: '/privacy' },
    { title: 'Impressum', href: '/impressum' },
    { title: 'AGB', href: '/terms' },
    { title: 'Cookie-Richtlinie', href: '/cookies' }
  ]
};

// Features
export const FEATURES: Feature[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Sichere Benutzerauthentifizierung mit OAuth, 2FA und SSO',
    tier_required: SubscriptionTier.FREE,
    icon: 'Shield',
    category: FeatureCategory.AUTH,
    enabled: true
  },
  {
    id: 'payments',
    name: 'Payment Processing',
    description: 'Automatische Abrechnung und Zahlungsabwicklung',
    tier_required: SubscriptionTier.PRO,
    icon: 'CreditCard',
    category: FeatureCategory.PAYMENTS,
    enabled: true
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Detaillierte Einblicke in Ihre SaaS-Metriken',
    tier_required: SubscriptionTier.PRO,
    icon: 'BarChart3',
    category: FeatureCategory.ANALYTICS,
    enabled: true
  },
  {
    id: 'api',
    name: 'REST API',
    description: 'Vollständige API für Integrationen und Automatisierung',
    tier_required: SubscriptionTier.ENTERPRISE,
    icon: 'Code',
    category: FeatureCategory.API,
    enabled: true
  }
];

// Pricing Plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: SubscriptionTier.FREE,
    price: 0,
    currency: 'EUR',
    interval: 'monthly',
    description: 'Perfekt für den Start',
    features: FEATURES.filter(f => f.tier_required === SubscriptionTier.FREE),
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: SubscriptionTier.PRO,
    price: 29,
    currency: 'EUR',
    interval: 'monthly',
    description: 'Für wachsende Teams',
    features: FEATURES.filter(f => f.tier_required <= SubscriptionTier.PRO),
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: SubscriptionTier.ENTERPRISE,
    price: 99,
    currency: 'EUR',
    interval: 'monthly',
    description: 'Für große Unternehmen',
    features: FEATURES,
    popular: false
  }
];

// API Limits
export const API_LIMITS = {
  [SubscriptionTier.FREE]: {
    requestsPerMonth: 1000,
    concurrentRequests: 5,
    storageGB: 1,
    teamMembers: 1
  },
  [SubscriptionTier.PRO]: {
    requestsPerMonth: 10000,
    concurrentRequests: 20,
    storageGB: 10,
    teamMembers: 5
  },
  [SubscriptionTier.ENTERPRISE]: {
    requestsPerMonth: 100000,
    concurrentRequests: 100,
    storageGB: 100,
    teamMembers: -1 // Unlimited
  }
};

// Theme Colors
export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
  NETWORK: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
  UNAUTHORIZED: 'Sie sind nicht berechtigt, diese Aktion auszuführen.',
  NOT_FOUND: 'Die angeforderte Ressource wurde nicht gefunden.',
  VALIDATION: 'Bitte überprüfen Sie Ihre Eingaben.',
  RATE_LIMIT: 'Zu viele Anfragen. Bitte warten Sie einen Moment.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profil erfolgreich aktualisiert.',
  PASSWORD_CHANGED: 'Passwort erfolgreich geändert.',
  SUBSCRIPTION_UPDATED: 'Abonnement erfolgreich aktualisiert.',
  PAYMENT_SUCCESS: 'Zahlung erfolgreich verarbeitet.',
  EMAIL_SENT: 'E-Mail erfolgreich gesendet.'
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 254,
  NAME_MAX_LENGTH: 100,
  COMPANY_MAX_LENGTH: 200,
  PHONE_MAX_LENGTH: 20
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: 'yyyy-MM-dd HH:mm:ss'
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 5
}; 