import mongoose, { Schema, Document, Types } from 'mongoose';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'password_reset'
  | 'profile_update'
  | 'account_delete'
  | 'token_refresh'
  | 'login_failed'
  | 'account_locked';

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: AuditAction;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    action: {
      type: String,
      required: true,
      enum: [
        'login', 'logout', 'register', 'password_change', 'password_reset',
        'profile_update', 'account_delete', 'token_refresh', 'login_failed', 'account_locked',
      ],
    },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: 'unknown' },
    success: { type: Boolean, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL: auto-delete logs older than 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
