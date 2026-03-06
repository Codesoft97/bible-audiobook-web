export interface CharacterJourney {
  id: string;
  titulo: string;
  categoria: string;
  perfilAlvo: string;
  duracaoEstimadaMinutos: number;
  isActive: boolean;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterJourneyStreamPayload {
  audioUrl: string;
}
