# Notification Module

Real-time in-app notification system for PlaySync to increase user retention and engagement.

## Overview

The notification module provides:
- **Database persistence** for notifications
- **Real-time delivery** via Socket.IO to user-specific rooms
- **REST API** for fetching and managing notifications
- **Automatic triggers** for key game events

## Architecture

```
notification/
├── notification.model.ts       # Mongoose schema with indexes
├── notification.types.ts       # TypeScript types & enums
├── notification.dto.ts         # Zod validation schemas
├── notification.repository.ts  # Database operations
├── notification.service.ts     # Business logic + triggers
├── notification.controller.ts  # HTTP handlers
├── notification.routes.ts      # Express routes
└── notification.socket.ts      # Socket.IO helpers
```

## Database Schema

### Notification Model

```typescript
{
  user: ObjectId,              // Ref: User (indexed)
  type: NotificationType,      // enum (indexed)
  title: string,               // Max 200 chars
  message: string,             // Max 500 chars
  data: {                      // Flexible metadata
    gameId?: ObjectId,
    userId?: ObjectId,
    username?: string,
    gameTitle?: string,
    ...
  },
  read: boolean,               // Default false (indexed)
  createdAt: Date,             // Auto timestamp
  updatedAt: Date              // Auto timestamp
}
```

### Notification Types

- `game_join` - Player joined a game
- `game_full` - Game reached max capacity
- `chat_message` - New chat message (future: @mentions)
- `leaderboard` - Rank change (future feature)
- `game_cancel` - Game was cancelled
- `system` - System announcements

### Indexes

1. **Compound**: `{ user: 1, read: 1, createdAt: -1 }` - Fast user queries
2. **Compound**: `{ user: 1, type: 1, createdAt: -1 }` - Type filtering
3. **TTL**: Auto-delete read notifications after 30 days

## REST API Endpoints

### Get Notifications
```http
GET /api/v1/notifications?page=1&limit=20&read=false&type=game_join
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Get Unread Count
```http
GET /api/v1/notifications/unread-count
Authorization: Bearer <token>
```

### Mark as Read
```http
PATCH /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PATCH /api/v1/notifications/read-all
Authorization: Bearer <token>
```

## Real-Time (Socket.IO)

### Client Setup

```javascript
// Join user room for notifications
socket.emit('join:user', userId);

// Listen for new notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // Update UI, show toast, increment badge, etc.
});

// Listen for unread count updates
socket.on('notification:unread-count', (data) => {
  console.log('Unread count:', data.count);
  // Update badge counter
});

// Listen for read events
socket.on('notification:read', (data) => {
  console.log('Notification marked read:', data.notificationId);
});

socket.on('notification:all-read', () => {
  console.log('All notifications marked read');
});
```

### Server Events

The server automatically emits to `user:${userId}` rooms:
- `notification` - New notification created
- `notification:unread-count` - Count updated
- `notification:read` - Single notification read
- `notification:all-read` - All notifications read

## Notification Triggers

### 1. Game Join (✅ Implemented)

**When:** A player joins a game  
**Who:** Game creator  
**Condition:** Joiner ≠ Creator

```typescript
await notificationService.notifyGameJoin(
  creatorId,
  joinerUsername,
  gameId,
  gameTitle
);
```

**Example:**  
_"John Doe joined your game 'Friday Night Battle'"_

---

### 2. Game Full (✅ Implemented)

**When:** Game reaches max capacity  
**Who:** Game creator

```typescript
await notificationService.notifyGameFull(
  creatorId,
  gameId,
  gameTitle
);
```

**Example:**  
_"Your game 'Friday Night Battle' has reached maximum capacity"_

---

### 3. Chat Message (⏳ Future)

**When:** New message in game chat  
**Who:** All participants (or just @mentioned users)  
**Condition:** Recipient ≠ Sender

```typescript
await notificationService.notifyChatMessage(
  recipientId,
  senderUsername,
  gameId,
  gameTitle,
  messagePreview
);
```

---

### 4. Game Cancelled (⏳ Future)

**When:** Creator cancels a game  
**Who:** All participants

```typescript
await notificationService.notifyGameCancelled(
  participantId,
  gameId,
  gameTitle,
  reason?
);
```

---

### 5. Leaderboard (⏳ Future)

**When:** User's rank changes significantly  
**Who:** Affected user  
**Trigger:** Cron job or scorecard update

---

## Usage Examples

### Service Layer (Triggers)

```typescript
import { NotificationService } from '../notification/notification.service';

const notificationService = new NotificationService();

// After game join
await notificationService.notifyGameJoin(
  creatorId,
  joinerUsername,
  gameId,
  gameTitle
);

// When game is full
await notificationService.notifyGameFull(
  creatorId,
  gameId,
  gameTitle
);

// System notification
await notificationService.notifySystem(
  userId,
  'Maintenance Notice',
  'Server will be down for maintenance at 3 AM UTC',
  { scheduledTime: '2026-02-15T03:00:00Z' }
);
```

### Direct Creation

```typescript
const notification = await notificationService.createNotification(
  userId,
  NotificationType.GAME_JOIN,
  'New Player',
  'Alice joined your game',
  { gameId, username: 'Alice' }
);
```

## Performance Considerations

1. **Indexes** - Queries use compound indexes for fast lookups
2. **Lean queries** - Uses `.lean()` for read-only operations
3. **TTL** - Auto-cleanup of old read notifications
4. **Pagination** - Limits data transfer (max 100 per page)
5. **Async notifications** - Non-blocking (errors logged, not thrown)

## Error Handling

Notifications are **fire-and-forget** for triggers:
- Errors are logged but don't break the main flow
- Database failures don't crash game operations
- Socket.IO errors are caught and logged

## Future Enhancements

- [ ] @Mention notifications in chat
- [ ] Push notifications (FCM/APNS)
- [ ] Email digest for unread notifications
- [ ] Notification preferences per user
- [ ] Leaderboard rank change notifications
- [ ] Game starting soon reminders
- [ ] Achievement unlocked notifications

## Testing

```bash
# Test notification creation
curl -X POST http://localhost:5000/api/v1/games/:gameId/join \
  -H "Authorization: Bearer <token>"

# Check notifications
curl -X GET http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer <token>"

# Get unread count
curl -X GET http://localhost:5000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer <token>"

# Mark as read
curl -X PATCH http://localhost:5000/api/v1/notifications/:id/read \
  -H "Authorization: Bearer <token>"
```

## Migration Notes

No migration required - MongoDB creates collection on first insert.  
Indexes are created automatically when the server starts.

---

**Author:** PlaySync Team  
**Version:** 1.0.0  
**Date:** February 2026
