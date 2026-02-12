/**
 * Notification Module - Mongoose Model
 */

import mongoose, { Document, Schema, Model } from 'mongoose';
import { NotificationType, INotificationData } from './notification.types';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data: INotificationData;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message must not exceed 500 characters']
    },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries (user + read status + created date)
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Compound index for type-based queries
notificationSchema.index({ user: 1, type: 1, createdAt: -1 });

// TTL index - auto-delete read notifications after 30 days
notificationSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { read: true }
  }
);

const NotificationModel: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);

export default NotificationModel;
