/** Typed Socket.IO event name constants for the entire application */

export const SOCKET_EVENTS = {
  // Connection lifecycle
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',

  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PRESENCE_UPDATE: 'user:presence_update',

  // Game room
  GAME_JOIN_ROOM: 'game:join_room',
  GAME_LEAVE_ROOM: 'game:leave_room',
  GAME_PLAYER_JOINED: 'game:player_joined',
  GAME_PLAYER_LEFT: 'game:player_left',
  GAME_STARTED: 'game:started',
  GAME_COMPLETED: 'game:completed',
  GAME_CANCELLED: 'game:cancelled',
  GAME_STATE_UPDATE: 'game:state_update',
  GAME_SCORE_UPDATE: 'game:score_update',

  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING_START: 'chat:typing_start',
  CHAT_TYPING_STOP: 'chat:typing_stop',
  CHAT_MESSAGE_READ: 'chat:message_read',
  CHAT_MESSAGE_DELETED: 'chat:message_deleted',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Server → Client acknowledgments
  ACK_JOIN: 'ack:join',
  ACK_LEAVE: 'ack:leave',
  ACK_MESSAGE: 'ack:message',

  // Errors emitted to client
  SOCKET_ERROR: 'socket:error',
  RATE_LIMITED: 'socket:rate_limited',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
