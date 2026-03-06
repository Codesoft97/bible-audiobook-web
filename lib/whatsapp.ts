export interface WhatsAppBibleBook {
  name: string;
  abbrev: string;
  totalChapters: number;
}

export interface WhatsAppPromiseSubscription {
  id: string;
  profileId: string;
  whatsappNumber: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppAudiobookSubscription {
  id: string;
  profileId: string;
  book: string;
  abbrev: string;
  whatsappNumber: string;
  totalChapters: number;
  currentChapter: number;
  nextChapter: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppPromiseSubscribePayload {
  whatsappNumber: string;
  endDate: string;
}

export interface WhatsAppAudiobookSubscribePayload {
  book: string;
  abbrev: string;
  whatsappNumber: string;
  totalChapters: number;
  currentChapter: number;
  nextChapter: number;
}

export interface WhatsAppCancelResponse {
  message: string;
}
