/** Type-safe game domain event definitions */

export const GAME_EVENTS = {
  CREATED: 'game:created',
  UPDATED: 'game:updated',
  PLAYER_JOINED: 'game:player_joined',
  PLAYER_LEFT: 'game:player_left',
  PLAYER_KICKED: 'game:player_kicked',
  STARTED: 'game:started',
  COMPLETED: 'game:completed',
  CANCELLED: 'game:cancelled',
  INVITATION_SENT: 'game:invitation_sent',
  INVITATION_ACCEPTED: 'game:invitation_accepted',
  INVITATION_DECLINED: 'game:invitation_declined',
  CAPACITY_FULL: 'game:capacity_full',
  SCORE_SUBMITTED: 'game:score_submitted',
} as const;

export type GameEventName = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS];

export interface GameEventPayload<T = unknown> {
  event: GameEventName;
  gameId: string;
  triggeredBy?: string;
  data?: T;
  timestamp: Date;
}

export function createGameEvent<T>(
  event: GameEventName,
  gameId: string,
  data?: T,
  triggeredBy?: string
): GameEventPayload<T> {
  return { event, gameId, triggeredBy, data, timestamp: new Date() };
}
