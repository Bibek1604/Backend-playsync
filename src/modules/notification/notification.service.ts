/**
 * Notification Module - Service Layer
 * Business logic for notification operations
 */

import { NotificationRepository } from './notification.repository';
import { INotification } from './notification.model';
import { NotificationType, INotificationData, IPaginationParams, INotificationFilters } from './notification.types';
import AppError from '../../Share/utils/AppError';
import { getSocketServer } from '../../websocket/socket.server';
import { emitNotificationToUser, emitUnreadCountToUser, emitNotificationRead, emitAllNotificationsRead } from './notification.socket';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  /**
   * Create and emit a notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: INotificationData = {}
  ): Promise<INotification> {
    // Create notification in database
    const notification = await this.repository.create(userId, type, title, message, data);

    // Emit real-time notification to user
    try {
      const io = getSocketServer();
      emitNotificationToUser(io, userId, {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt
      });

      // Also emit updated unread count
      const unreadCount = await this.repository.getUnreadCount(userId);
      emitUnreadCountToUser(io, userId, unreadCount);
    } catch (error) {
      console.error('Failed to emit notification via Socket.IO:', error);
      // Don't throw - notification is still saved in DB
    }

    return notification;
  }

  /**
   * Get paginated notifications with unread count
   */
  async getNotifications(
    userId: string,
    filters: INotificationFilters,
    pagination: IPaginationParams
  ): Promise<{
    notifications: INotification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { notifications, total } = await this.repository.findByUser(userId, filters, pagination);
    const unreadCount = await this.repository.getUnreadCount(userId);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await this.repository.markAsRead(notificationId, userId);

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Emit real-time update
    try {
      const io = getSocketServer();
      emitNotificationRead(io, userId, notificationId);

      // Emit updated unread count
      const unreadCount = await this.repository.getUnreadCount(userId);
      emitUnreadCountToUser(io, userId, unreadCount);
    } catch (error) {
      console.error('Failed to emit notification read event:', error);
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.repository.markAllAsRead(userId);

    // Emit real-time update
    try {
      const io = getSocketServer();
      emitAllNotificationsRead(io, userId);

      // Emit updated unread count (should be 0)
      emitUnreadCountToUser(io, userId, 0);
    } catch (error) {
      console.error('Failed to emit all notifications read event:', error);
    }

    return { modifiedCount };
  }

  /**
   * Get unread count only
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.getUnreadCount(userId);
  }

  // ============================================================
  // NOTIFICATION TRIGGER HELPERS
  // ============================================================

  /**
   * Notify game creator when someone joins their game
   */
  async notifyGameJoin(
    creatorId: string,
    joinerUsername: string,
    gameId: string,
    gameTitle: string
  ): Promise<void> {
    await this.createNotification(
      creatorId,
      NotificationType.GAME_JOIN,
      'New Player Joined',
      `${joinerUsername} joined your game "${gameTitle}"`,
      {
        gameId,
        username: joinerUsername,
        gameTitle
      }
    );
  }

  /**
   * Notify game creator when their game is full
   */
  async notifyGameFull(
    creatorId: string,
    gameId: string,
    gameTitle: string
  ): Promise<void> {
    await this.createNotification(
      creatorId,
      NotificationType.GAME_FULL,
      'Game is Full',
      `Your game "${gameTitle}" has reached maximum capacity`,
      {
        gameId,
        gameTitle
      }
    );
  }

  /**
   * Notify all game participants of a new chat message (optional - can be @mentions only)
   */
  async notifyChatMessage(
    recipientId: string,
    senderUsername: string,
    gameId: string,
    gameTitle: string,
    messagePreview: string
  ): Promise<void> {
    await this.createNotification(
      recipientId,
      NotificationType.CHAT_MESSAGE,
      'New Message',
      `${senderUsername} sent a message in "${gameTitle}": ${messagePreview.substring(0, 50)}...`,
      {
        gameId,
        username: senderUsername,
        gameTitle
      }
    );
  }

  /**
   * Notify participants when a game is cancelled
   */
  async notifyGameCancelled(
    participantId: string,
    gameId: string,
    gameTitle: string,
    reason?: string
  ): Promise<void> {
    const message = reason
      ? `Game "${gameTitle}" was cancelled: ${reason}`
      : `Game "${gameTitle}" was cancelled`;

    await this.createNotification(
      participantId,
      NotificationType.GAME_CANCEL,
      'Game Cancelled',
      message,
      {
        gameId,
        gameTitle,
        reason
      }
    );
  }

  /**
   * System notification
   */
  async notifySystem(
    userId: string,
    title: string,
    message: string,
    data: INotificationData = {}
  ): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.SYSTEM,
      title,
      message,
      data
    );
  }
}
