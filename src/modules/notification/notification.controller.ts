/**
 * Notification Module - Controller Layer
 * HTTP request handlers for notification operations
 */

import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { apiResponse } from '../../Share/utils/apiResponse';
import { GetNotificationsQuery } from './notification.dto';
import { INotificationFilters } from './notification.types';

export class NotificationController {
  private service: NotificationService;

  constructor() {
    this.service = new NotificationService();
  }

  /**
   * @swagger
   * /api/v1/notifications:
   *   get:
   *     tags:
   *       - Notifications
   *     summary: Get user notifications
   *     description: Retrieve paginated list of notifications for the authenticated user with optional filters
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of notifications per page
   *       - in: query
   *         name: read
   *         schema:
   *           type: boolean
   *         description: Filter by read status (true/false)
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [game_join, game_full, chat_message, leaderboard, game_cancel, system]
   *         description: Filter by notification type
   *     responses:
   *       200:
   *         description: Notifications retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Notifications retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     notifications:
   *                       type: array
   *                       items:
   *                         type: object
   *                     unreadCount:
   *                       type: integer
   *                       example: 5
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   *       401:
   *         description: Unauthorized - JWT token required
   */
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const query = req.query as unknown as GetNotificationsQuery;

      const filters: INotificationFilters = {
        read: query.read,
        type: query.type
      };

      const pagination = {
        page: query.page,
        limit: query.limit
      };

      const result = await this.service.getNotifications(userId, filters, pagination);

      res.status(200).json(
        apiResponse(true, 'Notifications retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/{id}/read:
   *   patch:
   *     tags:
   *       - Notifications
   *     summary: Mark notification as read
   *     description: Mark a specific notification as read
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification marked as read
   *       404:
   *         description: Notification not found
   *       401:
   *         description: Unauthorized - JWT token required
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      const notification = await this.service.markAsRead(id, userId);

      res.status(200).json(
        apiResponse(true, 'Notification marked as read', { notification })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/read-all:
   *   patch:
   *     tags:
   *       - Notifications
   *     summary: Mark all notifications as read
   *     description: Mark all unread notifications as read for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: All notifications marked as read
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: All notifications marked as read
   *                 data:
   *                   type: object
   *                   properties:
   *                     modifiedCount:
   *                       type: integer
   *                       example: 12
   *       401:
   *         description: Unauthorized - JWT token required
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const result = await this.service.markAllAsRead(userId);

      res.status(200).json(
        apiResponse(true, 'All notifications marked as read', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/unread-count:
   *   get:
   *     tags:
   *       - Notifications
   *     summary: Get unread notification count
   *     description: Get the count of unread notifications for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Unread count retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Unread count retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     unreadCount:
   *                       type: integer
   *                       example: 5
   *       401:
   *         description: Unauthorized - JWT token required
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const unreadCount = await this.service.getUnreadCount(userId);

      res.status(200).json(
        apiResponse(true, 'Unread count retrieved successfully', { unreadCount })
      );
    } catch (error) {
      next(error);
    }
  }
}
