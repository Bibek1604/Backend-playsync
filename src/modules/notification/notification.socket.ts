/**
 * Notification Module - Socket.IO Helper
 * Real-time notification emission to user rooms
 */

import { Server as SocketServer } from 'socket.io';
import { NotificationType, INotificationData } from './notification.types';

export interface INotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: INotificationData;
  read: boolean;
  createdAt: Date;
}

/**
 * Emit notification to a specific user via their personal room
 */
export const emitNotificationToUser = (
  io: SocketServer,
  userId: string,
  notification: INotificationPayload
): void => {
  const userRoom = `user:${userId}`;
  
  io.to(userRoom).emit('notification', {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    read: notification.read,
    createdAt: notification.createdAt,
    timestamp: new Date()
  });

  console.log(`📬 Notification sent to user room: ${userRoom}`);
};

/**
 * Emit unread count update to a specific user
 */
export const emitUnreadCountToUser = (
  io: SocketServer,
  userId: string,
  unreadCount: number
): void => {
  const userRoom = `user:${userId}`;
  
  io.to(userRoom).emit('notification:unread-count', {
    count: unreadCount,
    timestamp: new Date()
  });

  console.log(`📊 Unread count (${unreadCount}) sent to user room: ${userRoom}`);
};

/**
 * Emit notification marked as read event
 */
export const emitNotificationRead = (
  io: SocketServer,
  userId: string,
  notificationId: string
): void => {
  const userRoom = `user:${userId}`;
  
  io.to(userRoom).emit('notification:read', {
    notificationId,
    timestamp: new Date()
  });
};

/**
 * Emit all notifications marked as read event
 */
export const emitAllNotificationsRead = (
  io: SocketServer,
  userId: string
): void => {
  const userRoom = `user:${userId}`;
  
  io.to(userRoom).emit('notification:all-read', {
    timestamp: new Date()
  });
};
