export interface WhatsAppBibleBook {
  name: string;
  abbrev: string;
  totalChapters: number;
}

export type WhatsAppConsentStatus = "opted_in" | "opted_out";

export interface WhatsAppConsentMetadata {
  consentStatus: WhatsAppConsentStatus;
  consentAcceptedAt: string;
  consentSource: string;
  consentCategory: string;
  consentTextVersion: string;
  consentTextSnapshot: string;
  locale: string;
  ip: string;
  userAgent: string;
  acceptedBy: string;
  policyVersion: string;
  termsVersion: string;
  endDate: string;
}

export interface WhatsAppSubscriptionBase extends WhatsAppConsentMetadata {
  id: string;
  profileId: string;
  whatsappNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WhatsAppPromiseSubscription = WhatsAppSubscriptionBase;

export interface WhatsAppAudiobookSubscription extends WhatsAppSubscriptionBase {
  book: string;
  abbrev: string;
  totalChapters: number;
  currentChapter: number;
  nextChapter: number;
}

export interface WhatsAppPromiseSubscribeInput {
  whatsappNumber: string;
  endDate: string;
}

export interface WhatsAppPromiseSubscribePayload
  extends WhatsAppPromiseSubscribeInput,
    WhatsAppConsentMetadata {}

export interface WhatsAppAudiobookSubscribeInput {
  book: string;
  abbrev: string;
  whatsappNumber: string;
  totalChapters: number;
}

export interface WhatsAppAudiobookSubscribePayload
  extends WhatsAppAudiobookSubscribeInput,
    WhatsAppConsentMetadata {
  currentChapter: number;
  nextChapter: number;
}

export interface WhatsAppCancelPayload {
  optedOutAt: string;
  optedOutSource: string;
  optedOutReason: string;
}

export interface WhatsAppCancelResponse {
  message: string;
}
