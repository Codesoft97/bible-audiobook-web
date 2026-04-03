import type { PlanType } from "@/lib/auth/types";

export type BillingCycle = "monthly" | "annual";
export type SubscriptionCheckoutPlatform = "web";
export type SubscriptionBillingSource = "stripe" | "google_play" | "apple_app_store" | "none";
export type SubscriptionBillingType = "recurring" | "one_time" | "none";
export type SubscriptionManagementChannel = "none" | "stripe" | "google_play" | "apple_app_store";
export type SubscriptionInAppPlatform = "android" | "ios";

export interface SubscriptionCheckoutPayload {
  billingCycle: BillingCycle;
  platform: SubscriptionCheckoutPlatform;
}

export interface SubscriptionPixCheckoutPayload {
  taxId: string;
}

export interface SubscriptionCheckoutResponse {
  url: string;
}

export interface SubscriptionPixCheckoutResponse {
  paymentId: string;
  provider: string;
  amount: number;
  amountCents: number;
  referenceId: string;
  providerOrderId: string;
  providerChargeId: string;
  qrCodeText: string;
  qrCodeImageUrl: string | null;
  qrCodeBase64: string | null;
  expiresAt: string;
}

export interface SubscriptionPortalResponse {
  url: string;
}

export interface SubscriptionPlansResponse {
  monthlyPrice: number;
  annualPrice: number;
}

export interface SubscriptionStatusResponse {
  plan: PlanType;
  hasActiveSubscription: boolean;
  hasActiveStripeSubscription: boolean;
  paidUntil: string | null;
  lastPaymentAt: string | null;
  lastPaymentProvider: string | null;
  billingSource: SubscriptionBillingSource | null;
  billingType: SubscriptionBillingType | null;
  managementChannel: SubscriptionManagementChannel;
  managementMessage: string | null;
  canManage: boolean;
  canCancel: boolean;
  canPurchaseOnWeb: boolean;
  canPurchaseOnMobile: boolean;
  purchaseBlocked: boolean;
  purchaseBlockedReason: string | null;
  activeInAppPlatform: SubscriptionInAppPlatform | null;
  activeInAppProductId: string | null;
  hasMultipleActiveRecurringSubscriptions: boolean;
}
