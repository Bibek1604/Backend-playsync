/**
 * Notification Module - Data Transfer Objects & Validation
 * Zod schemas for request validation
 */

import { z } from 'zod';
import { NotificationType } from './notification.types';

// Get notifications query params
export const getNotificationsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, 'Page must be greater than 0'),
    
    limit: z
      .string()
      .optional()
      .default('20')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    
    read: z
      .string()
      .optional()
      .transform((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }),
    
    type: z
      .string()
      .optional()
      .refine(
        (val) => !val || Object.values(NotificationType).includes(val as NotificationType),
        'Invalid notification type'
      )
      .transform((val) => val as NotificationType | undefined)
  })
});

// Mark notification as read params
export const markNotificationReadSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID format')
  })
});

// Infer TypeScript types from schemas
export type GetNotificationsQuery = z.infer<typeof getNotificationsSchema>['query'];
export type MarkNotificationReadParams = z.infer<typeof markNotificationReadSchema>['params'];
