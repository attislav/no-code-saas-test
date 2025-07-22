import { SubscriptionTier, Subscription } from '@/lib/types';

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

// Billing Types
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Usage and Limits
export interface UsageMetrics {
  userId: string;
  tier: SubscriptionTier;
  metrics: {
    [key: string]: {
      used: number;
      limit: number;
      resetDate: string;
    };
  };
  updatedAt: string;
}

export interface UsageLimit {
  metric: string;
  tier: SubscriptionTier;
  limit: number;
  resetInterval: 'monthly' | 'yearly';
  overageAllowed: boolean;
  overagePrice?: number;
}

// Subscription Management
export interface SubscriptionChange {
  id: string;
  userId: string;
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  reason: 'upgrade' | 'downgrade' | 'cancellation' | 'reactivation';
  effectiveDate: string;
  prorationAmount?: number;
  createdAt: string;
}

export interface SubscriptionSchedule {
  id: string;
  userId: string;
  currentTier: SubscriptionTier;
  scheduledTier: SubscriptionTier;
  effectiveDate: string;
  reason: string;
  createdAt: string;
}

// Promotional Codes
export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  currency?: string;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicableTiers: SubscriptionTier[];
  isActive: boolean;
}

// Webhook Events
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: unknown;
  createdAt: string;
}

export enum WebhookEventType {
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  SUBSCRIPTION_RENEWED = 'subscription.renewed',
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
  INVOICE_CREATED = 'invoice.created',
  INVOICE_PAID = 'invoice.paid',
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated'
}

// Subscription Analytics
export interface SubscriptionAnalytics {
  totalSubscribers: number;
  activeSubscriptions: number;
  churnRate: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  tierDistribution: {
    [key in SubscriptionTier]: number;
  };
  growthRate: number;
  period: 'month' | 'quarter' | 'year';
  dateRange: {
    start: string;
    end: string;
  };
}

// Customer Portal
export interface CustomerPortalSession {
  id: string;
  userId: string;
  url: string;
  expiresAt: string;
  createdAt: string;
}

// Subscription Context
export interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  upgrade: (tier: SubscriptionTier) => Promise<void>;
  downgrade: (tier: SubscriptionTier) => Promise<void>;
  cancel: (reason?: string) => Promise<void>;
  reactivate: () => Promise<void>;
  getUsage: () => Promise<UsageMetrics>;
  clearError: () => void;
} 