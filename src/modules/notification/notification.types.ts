/**
 * Notification Module - Type Definitions
 */

export enum NotificationType {
  GAME_JOIN = 'game_join',
  GAME_FULL = 'game_full',
  CHAT_MESSAGE = 'chat_message',
  LEADERBOARD = 'leaderboard',
  GAME_CANCEL = 'game_cancel',
  GAME_CANCELLED = 'game_cancelled',
  GAME_COMPLETED = 'game_completed',
  SYSTEM = 'system'
}

export interface INotificationData {
  gameId?: string;
  userId?: string;
  chatId?: string;
  rank?: number;
  username?: string;
  gameTitle?: string;
  [key: string]: any;
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface INotificationFilters {
  read?: boolean;
  type?: NotificationType;
}
