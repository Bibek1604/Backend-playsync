/**
 * User Game History - TypeScript Types
 * Type definitions for game history feature
 */

export interface ParticipationDetails {
  joinedAt: Date;
  leftAt: Date | null;
  participationStatus: 'ACTIVE' | 'LEFT';
  durationMinutes: number | null;
}

export interface GameBasicInfo {
  creatorName: string;
  maxPlayers: number;
  currentPlayers: number;
  endTime: Date | null;
  imageUrl: string | null;
}

export interface GameHistoryEntry {
  gameId: string;
  title: string;
  category: 'ONLINE' | 'OFFLINE';
  status: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
  myParticipation: ParticipationDetails;
  gameInfo: GameBasicInfo;
}

export interface GameHistoryResponse {
  history: GameHistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface GameHistoryFilters {
  userId: string;
  status?: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED' | 'ACTIVE' | 'LEFT';
  category?: 'ONLINE' | 'OFFLINE';
  page: number;
  limit: number;
  sort: 'recent' | 'oldest' | 'mostActive';
}
