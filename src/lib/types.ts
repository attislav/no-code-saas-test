// Basis-API-Response-Typen
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User-bezogene Typen
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  email_verified?: boolean;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
}

export interface UserProfile extends User {
  company?: string;
  role?: string;
  phone?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

// Subscription-bezogene Typen
export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIAL = 'trial'
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: Feature[];
  popular?: boolean;
  description: string;
}

// Feature-bezogene Typen
export interface Feature {
  id: string;
  name: string;
  description: string;
  tier_required: SubscriptionTier;
  icon?: string;
  category: FeatureCategory;
  enabled: boolean;
}

export enum FeatureCategory {
  AUTH = 'auth',
  PAYMENTS = 'payments',
  ANALYTICS = 'analytics',
  API = 'api',
  INTEGRATIONS = 'integrations',
  SUPPORT = 'support'
}

// Navigation und UI Typen
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
  current?: boolean;
}

// Form und Validation Typen
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Error und Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retry?: () => void;
}

export interface ErrorState {
  code: string;
  message: string;
  details?: unknown;
}

// Theme und Styling
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  systemTheme?: 'light' | 'dark';
}

// Analytics und Tracking
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  userId?: string;
}

// API Endpoints
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    forgotPassword: string;
    resetPassword: string;
  };
  users: {
    profile: string;
    update: string;
    delete: string;
  };
  subscriptions: {
    create: string;
    update: string;
    cancel: string;
    plans: string;
  };
  features: {
    list: string;
    enable: string;
    disable: string;
  };
} 