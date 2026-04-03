export interface CharacterJourney {
  id: string;
  titulo: string;
  categoria: string;
  referencia?: string;
  perfilAlvo: string;
  duracaoEstimadaMinutos: number;
  isFree: boolean;
  isActive: boolean;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJourneyStreamPayload {
  audioUrl: string;
}
