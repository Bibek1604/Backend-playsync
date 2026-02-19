import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationChannel = 'push' | 'in_app' | 'email';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface INotificationTemplate extends Document {
  key: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    channels: {
      type: [String],
      enum: ['push', 'in_app', 'email'],
      default: ['in_app', 'push'],
    },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const NotificationTemplate = mongoose.model<INotificationTemplate>(
  'NotificationTemplate',
  NotificationTemplateSchema
);

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
