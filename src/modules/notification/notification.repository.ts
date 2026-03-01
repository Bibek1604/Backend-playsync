/**
 * Notification Module - Repository Layer
 * Database operations for notifications
 */

import NotificationModel, { INotification } from './notification.model';
import { NotificationType, INotificationData, IPaginationParams, INotificationFilters } from './notification.types';
import mongoose from 'mongoose';

export class NotificationRepository {
  /**
   * Create a new notification
   */
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: INotificationData = {}
  ): Promise<INotification> {
    const notification = await NotificationModel.create({
      user: new mongoose.Types.ObjectId(userId),
      type,
      title,
      message,
      data,
      read: false
    });

    return notification;
  }

  /**
   * Get paginated notifications for a user with filters
   */
  async findByUser(
    userId: string,
    filters: INotificationFilters,
    pagination: IPaginationParams
  ): Promise<{ notifications: INotification[], total: number }> {
    const query: any = { user: new mongoose.Types.ObjectId(userId) };

    // Apply filters
    if (filters.read !== undefined) {
      query.read = filters.read;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [notifications, total] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      NotificationModel.countDocuments(query).exec()
    ]);

    return {
      notifications: notifications as INotification[],
      total
    };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      read: false
    }).exec();
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        user: new mongoose.Types.ObjectId(userId)
      },
      { read: true },
      { new: true }
    ).lean().exec();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      {
        user: new mongoose.Types.ObjectId(userId),
        read: false
      },
      { read: true }
    ).exec();

    return result.modifiedCount;
  }

  /**
   * Find notification by ID and user
   */
  async findById(notificationId: string, userId: string): Promise<INotification | null> {
    return NotificationModel.findOne({
      _id: new mongoose.Types.ObjectId(notificationId),
      user: new mongoose.Types.ObjectId(userId)
    }).lean().exec();
  }

  /**
   * Delete old read notifications (cleanup)
   */
  async deleteOldReadNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await NotificationModel.deleteMany({
      read: true,
      createdAt: { $lt: cutoffDate }
    }).exec();

    return result.deletedCount;
  }
}
