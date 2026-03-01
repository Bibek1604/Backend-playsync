# Chat Module

Real-time group chat system for game sessions.

## Quick Links

📚 **Full Documentation**: [../../CHAT_IMPLEMENTATION.md](../../CHAT_IMPLEMENTATION.md)

🚀 **Quick Start Guide**: [../../CHAT_QUICK_START.md](../../CHAT_QUICK_START.md)

📋 **Feature Summary**: [../../CHAT_FEATURE_SUMMARY.md](../../CHAT_FEATURE_SUMMARY.md)

## Files in this Module

- `chat.model.ts` - Mongoose schema for ChatMessage
- `chat.types.ts` - TypeScript interfaces and types
- `chat.dto.ts` - Zod validation schemas
- `chat.repository.ts` - Database operations layer
- `chat.service.ts` - Business logic + XSS sanitization
- `chat.controller.ts` - HTTP request handlers
- `chat.middleware.ts` - Custom authorization middleware
- `chat.routes.ts` - Express route definitions
- `chat.socket.ts` - Socket.IO event handlers

## Quick Usage

### REST API
```http
GET /api/v1/games/:gameId/chat?limit=50&before=2024-01-15T10:30:00Z
Authorization: Bearer <token>
```

### WebSocket
```javascript
// Send message
socket.emit('chat:send', { gameId, content }, (ack) => {
  console.log(ack);
});

// Receive messages
socket.on('chat:message', (message) => {
  console.log(message);
});
```

## Features

- ✅ Real-time Socket.IO messaging
- ✅ REST API for history
- ✅ Cursor-based pagination
- ✅ System notifications (join/leave)
- ✅ Rate limiting (8 msg/15s)
- ✅ XSS protection
- ✅ Participant-only authorization

---

For complete documentation, see the links above.
