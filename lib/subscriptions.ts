export type BillingCycle = "monthly" | "annual";
export type SubscriptionCheckoutPlatform = "web";

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
  freeTrialDays: number;
  monthlyPrice: number;
  annualPrice: number;
}
