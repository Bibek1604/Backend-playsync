# PlaySync API Endpoints Quick Reference

Complete API reference organized by feature modules.

---

## 📍 Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.playsync.com/api/v1
```

---

## 🔐 Authentication Module

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "favoriteGame": "Valorant"
}

Response 201:
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "profilePicture": "https://..."
    },1`    
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Get Current User Profile
```http
GET /auth/profile
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Update Profile
```http
PATCH /auth/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "+9876543210",
  "favoriteGame": "CS:GO",
  "place": "New York"
}
```

### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Password Reset Flow
```http
# Step 1: Request OTP
POST /auth/forgot-password
{
  "email": "john@example.com"
}

# Step 2: Verify OTP
POST /auth/verify-reset-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

# Step 3: Reset Password
POST /auth/reset-password
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

---

## 🎮 Game Module

### Browse Games (Public)
```http
GET /games?page=1&limit=20&category=ONLINE&status=OPEN&search=battle

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- category: ONLINE | OFFLINE
- status: OPEN | FULL | ENDED
- search: string (searches title)
- sortBy: createdAt | endTime | currentPlayers
- order: asc | desc

Response 200:
{
  "success": true,
  "data": {
    "games": [
      {
        "_id": "65f...",
        "title": "Friday Night Battle",
        "description": "Competitive match",
        "category": "ONLINE",
        "status": "OPEN",
        "maxPlayers": 50,
        "currentPlayers": 23,
        "endTime": "2026-02-15T22:00:00Z",
        "imageUrl": "https://cloudinary...",
        "creatorId": {
          "_id": "65f...",
          "fullName": "John Doe",
          "profilePicture": "https://..."
        },
        "createdAt": "2026-02-13T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Create Game
```http
POST /games
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- title: "Friday Night Battle" (required)
- description: "Competitive match" (optional)
- category: ONLINE (required)
- maxPlayers: 50 (required)
- endTime: 2026-02-15T22:00:00Z (required)
- image: [file] (optional, max 5MB)

Response 201:
{
  "success": true,
  "message": "Game created successfully",
  "data": {
    "game": { ... }
  }
}
```

### Get Game Details
```http
GET /games/:gameId
Authorization: Bearer {accessToken} (optional)

Response 200:
{
  "success": true,
  "data": {
    "game": {
      "_id": "65f...",
      "title": "Friday Night Battle",
      "participants": [
        {
          "userId": {
            "_id": "65f...",
            "fullName": "Alice",
            "profilePicture": "https://..."
          },
          "joinedAt": "2026-02-13T11:00:00Z",
          "status": "ACTIVE"
        }
      ],
      // ... other fields
    }
  }
}
```

### Join Game
```http
POST /games/:gameId/join
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Successfully joined the game",
  "data": {
    "game": { ... }
  }
}

Triggers:
- Real-time event to game room
- Notification to game creator
- System message in chat
```

### Leave Game
```http
POST /games/:gameId/leave
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Successfully left the game"
}
```

### Get My Created Games
```http
GET /games/my/created?page=1&limit=20&status=OPEN
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "games": [ ... ],
    "pagination": { ... }
  }
}
```

### Get My Joined Games
```http
GET /games/my/joined?page=1&limit=20&status=OPEN
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "games": [ ... ],
    "pagination": { ... }
  }
}
```

### Update Game (Creator Only)
```http
PATCH /games/:gameId
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Form Data:
- title: "Updated Title" (optional)
- description: "Updated description" (optional)
- maxPlayers: 75 (optional, must be >= currentPlayers)
- endTime: 2026-02-16T22:00:00Z (optional, can only extend)
- image: [file] (optional)

Response 200:
{
  "success": true,
  "message": "Game updated successfully",
  "data": {
    "game": { ... }
  }
}
```

### End Game (Creator Only)
```http
POST /games/:gameId/end
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Game ended successfully"
}
```

### Delete Game (Creator Only)
```http
DELETE /games/:gameId
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Game deleted successfully"
}
```

### Check Join Eligibility
```http
GET /games/:gameId/check-join
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "canJoin": true,
    "reasons": [],
    "gameStatus": "OPEN",
    "availableSlots": 27,
    "isParticipant": false
  }
}
```

---

## 💬 Chat Module

### Get Chat Messages
```http
GET /games/:gameId/chat/messages?page=1&limit=50
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "65f...",
        "gameId": "65f...",
        "user": {
          "_id": "65f...",
          "fullName": "John Doe",
          "profilePicture": "https://..."
        },
        "message": "Good luck everyone!",
        "messageType": "user",
        "createdAt": "2026-02-13T12:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 234,
      "totalPages": 5
    }
  }
}
```

### Send Message (via Socket.IO)
```javascript
// Not a REST endpoint - use Socket.IO
socket.emit('chat:message', {
  gameId: '65f...',
  message: 'Hello everyone!'
});

// Listen for messages
socket.on('chat:message', (data) => {
  console.log(data);
  // {
  //   _id: '65f...',
  //   user: { fullName: '...', profilePicture: '...' },
  //   message: 'Hello everyone!',
  //   messageType: 'user',
  //   createdAt: '...'
  // }
});

// System messages
socket.on('chat:system', (data) => {
  console.log(data.message); // "John Doe joined the game"
});
```

---

## 📊 Scorecard Module

### Create Scorecard
```http
POST /scorecard
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "gameId": "65f...",
  "userId": "65f...",
  "wins": 1,
  "losses": 0,
  "draws": 0,
  "kills": 15,
  "deaths": 8
}

Response 201:
{
  "success": true,
  "message": "Scorecard created successfully",
  "data": {
    "scorecard": {
      "_id": "65f...",
      "gameId": "65f...",
      "userId": "65f...",
      "wins": 1,
      "losses": 0,
      "draws": 0,
      "kills": 15,
      "deaths": 8,
      "kdRatio": 1.875,
      "createdAt": "2026-02-13T15:00:00Z"
    }
  }
}
```

### Get User Scorecards
```http
GET /scorecard/user/:userId?page=1&limit=20
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "scorecards": [ ... ],
    "pagination": { ... }
  }
}
```

### Get Game Scorecards
```http
GET /scorecard/game/:gameId?page=1&limit=20
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "scorecards": [
      {
        "_id": "65f...",
        "userId": {
          "_id": "65f...",
          "fullName": "John Doe",
          "profilePicture": "https://..."
        },
        "wins": 1,
        "kills": 15,
        "deaths": 8,
        "kdRatio": 1.875
      }
    ],
    "pagination": { ... }
  }
}
```

### Get Scorecard by ID
```http
GET /scorecard/:scorecardId
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "data": {
    "scorecard": { ... }
  }
}
```

### Update Scorecard
```http
PATCH /scorecard/:scorecardId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "wins": 2,
  "kills": 25,
  "deaths": 12
}

Response 200:
{
  "success": true,
  "message": "Scorecard updated successfully",
  "data": {
    "scorecard": { ... }
  }
}
```

### Delete Scorecard
```http
DELETE /scorecard/:scorecardId
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Scorecard deleted successfully"
}
```

---

## 🏆 Leaderboard Module

### Get Global Leaderboard
```http
GET /leaderboard?limit=100

Query Parameters:
- limit: number (default: 100, max: 100)

Response 200:
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "65f...",
        "username": "ProGamer123",
        "profilePicture": "https://...",
        "totalWins": 150,
        "totalLosses": 30,
        "totalDraws": 5,
        "totalKills": 2500,
        "totalDeaths": 800,
        "kdRatio": 3.125
      },
      {
        "rank": 2,
        // ...
      }
    ]
  }
}
```

---

## 🔔 Notification Module

### Get Notifications
```http
GET /notifications?page=1&limit=20&read=false&type=game_join
Authorization: Bearer {accessToken}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- read: boolean (filter by read status)
- type: game_join | game_full | chat_message | leaderboard | game_cancel | system

Response 200:
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "65f...",
        "type": "game_join",
        "title": "New Player Joined",
        "message": "Alice joined your game 'Friday Night Battle'",
        "data": {
          "gameId": "65f...",
          "username": "Alice",
          "gameTitle": "Friday Night Battle"
        },
        "read": false,
        "createdAt": "2026-02-13T14:30:00Z"
      }
    ],
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
GET /notifications/unread-count
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "unreadCount": 5
  }
}
```

### Mark Notification as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": { ... }
  }
}
```

### Mark All as Read
```http
PATCH /notifications/read-all
Authorization: Bearer {accessToken}

Response 200:
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 12
  }
}
```

### Real-time Notifications (Socket.IO)
```javascript
// Join user room for notifications
socket.emit('join:user', userId);

// Listen for new notifications
socket.on('notification', (data) => {
  // {
  //   id: '65f...',
  //   type: 'game_join',
  //   title: 'New Player Joined',
  //   message: 'Alice joined your game',
  //   data: { gameId, username, gameTitle },
  //   read: false,
  //   createdAt: '...',
  //   timestamp: '...'
  // }
});

// Listen for unread count updates
socket.on('notification:unread-count', ({ count }) => {
  console.log('Unread:', count);
});

// Listen for read events
socket.on('notification:read', ({ notificationId }) => {
  console.log('Marked as read:', notificationId);
});

// Listen for all read events
socket.on('notification:all-read', () => {
  console.log('All notifications marked as read');
});
```

---

## 📚 History Module

### Get Game History
```http
GET /history?gameId=65f...&userId=65f...&page=1&limit=20
Authorization: Bearer {accessToken}

Query Parameters:
- gameId: string (filter by game)
- userId: string (filter by user)
- page: number
- limit: number

Response 200:
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "65f...",
        "gameId": { ... },
        "userId": { ... },
        "action": "join",
        "timestamp": "2026-02-13T12:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 👑 Admin Module

### Get All Users (Admin Only)
```http
GET /admin/users?page=1&limit=20&role=user&search=john
Authorization: Bearer {adminToken}

Query Parameters:
- page: number
- limit: number
- role: user | admin
- search: string

Response 200:
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

### Get Platform Stats (Admin Only)
```http
GET /admin/stats
Authorization: Bearer {adminToken}

Response 200:
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalGames": 4500,
    "activeGames": 85,
    "totalChats": 125000
  }
}
```

### Get All Games (Admin Only)
```http
GET /admin/games?page=1&limit=20&status=OPEN
Authorization: Bearer {adminToken}

Response 200:
{
  "success": true,
  "data": {
    "games": [ ... ],
    "pagination": { ... }
  }
}
```

### Delete Game (Admin Only)
```http
DELETE /admin/games/:gameId
Authorization: Bearer {adminToken}

Response 200:
{
  "success": true,
  "message": "Game deleted successfully"
}
```

### Update User Role (Admin Only)
```http
PATCH /admin/users/:userId/role
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "role": "admin"
}

Response 200:
{
  "success": true,
  "message": "User role updated successfully"
}
```

---

## 🔌 Socket.IO Events Reference

### Connection Setup
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken
  },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Events to Emit (Client → Server)

```javascript
// Join user room (for notifications)
socket.emit('join:user', userId);

// Leave user room
socket.emit('leave:user', userId);

// Join discovery room (for game updates)
socket.emit('join:discovery');

// Join game room (for chat + game events)
socket.emit('join:game', gameId);

// Leave game room
socket.emit('leave:game', gameId);

// Send chat message
socket.emit('chat:message', {
  gameId: 'xxx',
  message: 'Hello!'
});

// Typing indicator (future)
socket.emit('chat:typing', { gameId, isTyping: true });
```

### Events to Listen (Server → Client)

```javascript
// Notification events
socket.on('notification', (data) => { });
socket.on('notification:unread-count', (data) => { });
socket.on('notification:read', (data) => { });
socket.on('notification:all-read', () => { });

// Game events
socket.on('game:created', (data) => { });
socket.on('game:updated', (data) => { });
socket.on('game:deleted', (data) => { });
socket.on('game:status:changed', (data) => { });
socket.on('game:player:joined', (data) => { });
socket.on('game:player:left', (data) => { });
socket.on('game:slots:updated', (data) => { });

// Chat events
socket.on('chat:message', (data) => { });
socket.on('chat:system', (data) => { });
socket.on('chat:typing', (data) => { }); // future
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... } // Optional (pagination, etc.)
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "meta": null,
  "error": {
    "code": "ERROR_CODE",
    "details": { ... } // Only in development
  }
}
```

---

## 🔑 Authentication

All protected endpoints require JWT token in header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token payload:
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "email": "john@example.com",
  "role": "user",
  "iat": 1710345600,
  "exp": 1710349200
}
```

---

## 📊 Swagger Documentation

Interactive API documentation available at:

```
http://localhost:5000/swagger
```

Test all endpoints directly in browser!

---

**Last Updated:** February 2026  
**Version:** 1.0.0
