# Chat System Quick Start Guide

## 🎯 What's Implemented

A complete real-time group chat system for game sessions with:
- ✅ Persistent message storage (MongoDB)
- ✅ WebSocket real-time messaging (Socket.IO)
- ✅ REST API for chat history
- ✅ Auto system messages (join/leave)
- ✅ Rate limiting (8 msg/15s)
- ✅ XSS protection
- ✅ Participant-only authorization

## 📂 File Structure

```
src/modules/chat/               ← All chat files as separate module
├── chat.model.ts               ✅ Mongoose schema
├── chat.types.ts               ✅ TypeScript interfaces
├── chat.dto.ts                 ✅ Zod validation
├── chat.repository.ts          ✅ Database layer
├── chat.service.ts             ✅ Business logic
├── chat.controller.ts          ✅ HTTP handler
├── chat.middleware.ts          ✅ Authorization
├── chat.routes.ts              ✅ Express routes
└── chat.socket.ts              ✅ Socket.IO handlers

Integration Points:
├── src/app.ts                  ✅ Routes mounted
├── src/websocket/socket.server.ts ✅ Socket handlers initialized
└── src/modules/game/game.service.ts ✅ System messages on join/leave
```

## 🚀 How to Use

### 1. Start the Server
```bash
npm run dev
```

### 2. Connect Client

```javascript
import io from 'socket.io-client';

// Connect with JWT auth
const socket = io('http://localhost:5000', {
  auth: { token: yourJwtToken }
});

// Join game room
socket.emit('join:game', gameId);

// Listen for messages
socket.on('chat:message', (message) => {
  console.log(message);
  // {
  //   _id: '...',
  //   user: { _id, username, fullName, profilePicture } | null,
  //   content: 'Hello!',
  //   type: 'text' | 'system',
  //   createdAt: '2024-01-15T10:30:00Z'
  // }
});

// Send message
socket.emit('chat:send', {
  gameId: 'your_game_id',
  content: 'Hello everyone!'
}, (ack) => {
  if (ack.success) {
    console.log('Sent:', ack.messageId);
  } else {
    console.error('Error:', ack.error);
  }
});
```

### 3. Load History

```javascript
const loadHistory = async (gameId, cursor = null) => {
  const url = `/api/v1/games/${gameId}/chat` + 
    (cursor ? `?before=${cursor}&limit=50` : '?limit=50');
    
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  // data = { messages[], hasMore, nextCursor }
  
  return data;
};

// Load more (pagination)
const loadMore = async (gameId, nextCursor) => {
  return await loadHistory(gameId, nextCursor);
};
```

## 🔌 API Reference

### REST Endpoint

**GET** `/api/v1/games/:gameId/chat`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Params:**
- `limit` - Messages per page (1-100, default: 50)
- `before` - ISO timestamp cursor for pagination

**Response:**
```json
{
  "success": true,
  "message": "Chat history retrieved",
  "data": {
    "messages": [ /* array of messages */ ],
    "hasMore": true,
    "nextCursor": "2024-01-15T10:29:00.000Z"
  }
}
```

### WebSocket Events

#### Send Message
```javascript
socket.emit('chat:send', payload, acknowledgment);
```
- **Payload:** `{ gameId: string, content: string }`
- **Acknowledgment:** `{ success: boolean, messageId?: string, error?: string }`

#### Receive Message
```javascript
socket.on('chat:message', (message) => {});
```
- **Type:** `ChatMessageDTO` (see chat.types.ts)

## 🎮 System Messages

System messages are **automatically sent** when:

1. **Player joins game**
   ```
   "A player joined the game"
   ```

2. **Player leaves game**
   ```
   "A player left the game"
   ```

System messages have `user: null` and `type: 'system'`

## 🔐 Security

### Authentication
All operations require valid JWT token:
- REST: `Authorization: Bearer <token>` header
- Socket: `auth: { token }` in connection options

### Authorization
Only **active participants** can:
- View chat history
- Send messages

Enforced by `checkUserIsActiveParticipant` middleware

### Rate Limiting
- **Limit:** 8 messages per 15 seconds per user
- **Error:** `"Rate limit exceeded. Max 8 messages per 15 seconds."`

### XSS Protection
All text content is HTML-encoded:
- Input: `<script>alert('xss')</script>`
- Stored: `&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;`

## 🧪 Testing

### Test with cURL (History)
```bash
curl -X GET "http://localhost:5000/api/v1/games/{gameId}/chat?limit=20" \
  -H "Authorization: Bearer {token}"
```

### Test with Socket.IO Client
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000', {
  auth: { token: 'your_token' }
});

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('join:game', 'game_id');
  socket.emit('chat:send', { 
    gameId: 'game_id', 
    content: 'Test' 
  }, console.log);
});

socket.on('chat:message', console.log);
```

## 🛠️ Architecture Flow

### Sending a Message
```
Client
  ↓ emit('chat:send', { gameId, content })
chat.socket.ts
  ↓ validate (Zod)
  ↓ rate limit check
  ↓ chatService.createTextMessage()
chat.service.ts
  ↓ verify participant
  ↓ sanitize (XSS)
  ↓ chatRepository.create()
chat.repository.ts
  ↓ save to MongoDB
  ↑ return message
chat.socket.ts
  ↓ broadcast to room
  ↓ io.to(`game:${gameId}`).emit('chat:message')
Clients in room receive message
```

### Loading History
```
Client
  ↓ GET /api/v1/games/:gameId/chat
chat.routes.ts
  ↓ auth middleware
  ↓ validateDto
  ↓ checkUserIsActiveParticipant
chat.controller.ts
  ↓ chatService.getChatHistory()
chat.service.ts
  ↓ verify game + participant
  ↓ chatRepository.findByGameId()
chat.repository.ts
  ↓ query MongoDB (cursor pagination)
  ↑ return messages
Client receives paginated history
```

## 📊 Database

### ChatMessage Collection
```javascript
{
  _id: ObjectId,
  game: ObjectId,           // ref: 'Game'
  user: ObjectId | null,    // ref: 'User' (null for system)
  type: 'text' | 'system',
  content: String,          // 1-1500 chars, sanitized
  createdAt: Date,
  updatedAt: Date
}

// Index: { game: 1, createdAt: -1 }
```

## 🐛 Common Issues

### "Unauthorized" Error
- Check JWT token in Authorization header or Socket auth
- Verify token hasn't expired

### "You must be an active participant" Error
- User must join the game first via `/api/v1/games/:gameId/join`
- Check participant status is 'ACTIVE'

### Messages not appearing
1. Connect socket: `socket.connected === true`
2. Join room: `socket.emit('join:game', gameId)`
3. Listen: `socket.on('chat:message', ...)`

### Rate limit exceeded
- Wait 15 seconds
- Don't send more than 8 messages in 15-second window

## 📚 Related Endpoints

### Game Management (triggers system messages)
- `POST /api/v1/games/:gameId/join` - Join game (→ system message)
- `POST /api/v1/games/:gameId/leave` - Leave game (→ system message)
- `DELETE /api/v1/games/:gameId` - Delete game (→ deletes all chat)

## 🗑️ Cleanup Old Files

Delete these obsolete files from earlier implementation:
```bash
rm -rf src/modules/chat/
rm src/websocket/chat.handler.ts
```

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Swagger docs show chat endpoint: http://localhost:5000/swagger
- [ ] Can connect via Socket.IO
- [ ] Can join game room
- [ ] Can send message via socket
- [ ] Can receive messages
- [ ] Can load history via REST
- [ ] System messages appear on join/leave
- [ ] Rate limiting works (9th message rejected)
- [ ] XSS protection works (HTML encoded)
- [ ] Non-participants get 403 error

## 🎉 You're All Set!

The chat system is fully integrated and ready to use. Check [CHAT_IMPLEMENTATION.md](./CHAT_IMPLEMENTATION.md) for detailed documentation.

**Questions?** Check the source files - they're well-commented!
