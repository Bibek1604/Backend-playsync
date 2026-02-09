/**
 * Game Module - Type Definitions
 * All TypeScript interfaces and types for the game module
 */

export enum GameCategory {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export enum GameStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  ENDED = 'ENDED'
}

export enum ParticipantStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT'
}

export interface IGameParticipant {
  id: string;
  gameId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  status: ParticipantStatus;
}

export interface IGame {
  id: string;
  title: string;
  description?: string;
  category: GameCategory;
  imageUrl?: string;
  imagePublicId?: string;
  maxPlayers: number;
  currentPlayers: number;
  status: GameStatus;
  creatorId: string;
  startTime: Date;
  endTime: Date;
  endedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameWithCreator extends IGame {
  creator: {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
}

export interface IGameWithParticipants extends IGame {
  participants: Array<{
    id: string;
    userId: string;
    username: string;
    profileImage?: string;
    joinedAt: Date;
    status: ParticipantStatus;
  }>;
}

export interface IGameFilters {
  category?: GameCategory;
  status?: GameStatus;
  creatorId?: string;
  search?: string;
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IImageUploadResult {
  url: string;
  publicId: string;
}
