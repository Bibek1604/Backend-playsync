import { NotificationTemplate, interpolateTemplate } from './notification-template.model';

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  data?: Record<string, string>;
}

export class NotificationBuilder {
  static async build(
    templateKey: string,
    variables: Record<string, string> = {},
    overrides?: Partial<NotificationPayload>
  ): Promise<NotificationPayload | null> {
    const template = await NotificationTemplate.findOne({ key: templateKey, isActive: true }).lean();
    if (!template) return null;

    return {
      title: interpolateTemplate(template.title, variables),
      body: interpolateTemplate(template.body, variables),
      ...overrides,
    };
  }

  static buildDirect(title: string, body: string, extras?: Partial<NotificationPayload>): NotificationPayload {
    return { title, body, ...extras };
  }
}

/** Pre-defined template keys */
export const NOTIFICATION_KEYS = {
  GAME_INVITE: 'game.invite',
  GAME_STARTING: 'game.starting',
  GAME_FULL: 'game.full',
  GAME_CANCELLED: 'game.cancelled',
  PLAYER_JOINED: 'game.player_joined',
  PLAYER_LEFT: 'game.player_left',
  CHAT_MESSAGE: 'chat.new_message',
  BADGE_EARNED: 'profile.badge_earned',
  WELCOME: 'auth.welcome',
  PASSWORD_CHANGED: 'auth.password_changed',
} as const;
