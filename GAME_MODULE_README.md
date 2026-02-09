# Game Module - Setup & Usage Guide

## Overview
The Game Creation module is a complete, production-ready feature for managing online and offline games in the PlaySync backend. It supports game creation, participant management, automatic game lifecycle handling, and image uploads to Cloudinary.

---

## Installation

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `node-cron` - For automatic game cleanup
- `@types/node-cron` - TypeScript types for node-cron

### 2. Environment Variables
Add these to your `.env` file:

```env
# Cloudinary (already configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Game Module Configuration (optional)
GAME_CLEANUP_CRON=*/5 * * * *  # Run cleanup every 5 minutes (default)
```

### 3. Database
The module uses your existing MongoDB connection. No additional setup needed - models will be created automatically on first use.

---

## Features Implemented

### ✅ Game Management
- Create games with title, description, category (ONLINE/OFFLINE), max players, end time
- Upload game images to Cloudinary (max 5MB, jpg/png/webp)
- Update games (creator only, cannot update ended games)
- Delete games (creator only, auto-deletes Cloudinary images)
- Auto-set start time on creation

### ✅ Player Management
- Join games (cannot join if full or ended)
- Leave games
- Auto-update game status (OPEN → FULL → ENDED)
- Track all participants with join/leave timestamps

### ✅ Game Lifecycle
- **OPEN**: Accepting players (currentPlayers < maxPlayers)
- **FULL**: Not accepting players (currentPlayers === maxPlayers)
- **ENDED**: Game finished (auto-ended when current time >= endTime)

### ✅ Automatic Cleanup
- Cron job runs every 5 minutes (configurable)
- Automatically ends games past their endTime
- Logs all cleanup operations

### ✅ Security & Validation
- JWT authentication required for create/update/delete/join/leave
- Creator-only permissions for updates and deletes
- Comprehensive input validation with Zod schemas
- Rate limiting ready (can be added at route level)

---

## API Endpoints

### Base URL: `/api/v1/games`

### 1. Create Game
```http
POST /api/v1/games
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body (form-data):
{
  "title": "Friday Night Battle",
  "description": "Weekly competitive match",
  "category": "ONLINE",
  "maxPlayers": 50,
  "endTime": "2026-02-10T22:00:00Z",
  "image": <file>  // Optional
}

Response 201:
{
  "success": true,
  "message": "Game created successfully",
  "data": {
    "game": {
      "_id": "...",
      "title": "Friday Night Battle",
      "category": "ONLINE",
      "maxPlayers": 50,
      "currentPlayers": 0,
      "status": "OPEN",
      "imageUrl": "https://res.cloudinary.com/...",
      "startTime": "2026-02-09T18:00:00Z",
      "endTime": "2026-02-10T22:00:00Z",
      "creatorId": "...",
      "createdAt": "2026-02-09T18:00:00Z"
    }
  }
}
```

### 2. Get All Games
```http
GET /api/v1/games?category=ONLINE&status=OPEN&page=1&limit=20

Response 200:
{
  "success": true,
  "message": "Games retrieved successfully",
  "data": {
    "games": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

Query Parameters:
- `category` (optional): ONLINE | OFFLINE
- `status` (optional): OPEN | FULL | ENDED
- `creatorId` (optional): Filter by creator
- `search` (optional): Text search in title/description
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

### 3. Get Game by ID
```http
GET /api/v1/games/:id?details=true

Response 200:
{
  "success": true,
  "message": "Game retrieved successfully",
  "data": {
    "game": {
      "_id": "...",
      "title": "...",
      "creator": {
        "_id": "...",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "participants": [...]  // If details=true
    }
  }
}
```

### 4. Get My Created Games
```http
GET /api/v1/games/my/created?status=OPEN&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>
```

### 5. Get My Joined Games
```http
GET /api/v1/games/my/joined?status=OPEN&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>
```

### 6. Join Game
```http
POST /api/v1/games/:id/join
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "success": true,
  "message": "Successfully joined the game",
  "data": {
    "gameId": "...",
    "currentPlayers": 23,
    "status": "OPEN"
  }
}

Errors:
- 400: Game full, already joined, or ended
- 404: Game not found
```

### 7. Leave Game
```http
POST /api/v1/games/:id/leave
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "success": true,
  "message": "Successfully left the game",
  "data": {
    "gameId": "...",
    "currentPlayers": 22,
    "status": "OPEN"
  }
}
```

### 8. Update Game
```http
PATCH /api/v1/games/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body (all optional):
{
  "title": "Updated Title",
  "description": "Updated description",
  "maxPlayers": 60,
  "endTime": "2026-02-11T22:00:00Z",
  "image": <file>
}

Response 200:
{
  "success": true,
  "message": "Game updated successfully",
  "data": { "game": {...} }
}

Errors:
- 403: Not the creator
- 409: Cannot update ended game
- 400: Cannot reduce maxPlayers below currentPlayers
```

### 9. Delete Game
```http
DELETE /api/v1/games/:id
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "success": true,
  "message": "Game deleted successfully"
}

Errors:
- 403: Not the creator
- 404: Game not found
```

---

## Testing the Module

### 1. Start the Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected
✅ Game cleanup job started (cron: */5 * * * *)
Server running at http://localhost:5000/swagger
```

### 2. Test with Postman/cURL

#### Create a Game
```bash
curl -X POST http://localhost:5000/api/v1/games \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test Game" \
  -F "category=ONLINE" \
  -F "maxPlayers=10" \
  -F "endTime=2026-02-10T22:00:00Z"
```

#### Join a Game
```bash
curl -X POST http://localhost:5000/api/v1/games/GAME_ID/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get All Games
```bash
curl http://localhost:5000/api/v1/games?category=ONLINE&status=OPEN
```

---

## Code Structure

```
src/modules/game/
├── game.types.ts           # TypeScript types & enums
├── game.dto.ts             # Zod validation schemas
├── game.model.ts           # Mongoose models
├── game.repository.ts      # Database operations
├── game.uploader.ts        # Cloudinary upload logic
├── game.service.ts         # Business logic
├── game.middleware.ts      # Authorization & validation
├── game.controller.ts      # HTTP request handlers
└── game.routes.ts          # Route definitions

src/jobs/
└── game.cleanup.job.ts     # Cron job for auto-ending games
```

---

## Validation Rules

### Game Creation
- **Title**: 3-255 characters
- **Description**: Max 2000 characters (optional)
- **Category**: ONLINE or OFFLINE (exact match)
- **Max Players**: 1-1000
- **End Time**: 
  - Must be at least 5 minutes in the future
  - Cannot be more than 365 days from now
  - Must be valid ISO8601 format
- **Image**: 
  - Max 5MB
  - Allowed: jpg, jpeg, png, webp

### Game Updates
- **Max Players**: Cannot be less than currentPlayers
- **End Time**: Can only extend, not shorten
- **Creator Only**: Only creator can update
- **No Ended Games**: Cannot update games with status ENDED

---

## Cron Job Details

### Schedule
- Default: `*/5 * * * *` (every 5 minutes)
- Configurable via `GAME_CLEANUP_CRON` environment variable

### What It Does
1. Finds all games where `endTime <= current time` and `status != ENDED`
2. Updates status to `ENDED` and sets `endedAt` timestamp
3. Logs number of games ended

### Logs
```
🧹 Starting game cleanup job...
✅ Game cleanup completed: 3 game(s) ended in 245ms
```

### Manual Trigger (for testing)
```typescript
import gameCleanupJob from './jobs/game.cleanup.job';

// In your code or console
const count = await gameCleanupJob.runManual();
console.log(`Ended ${count} games`);
```

---

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE"
}
```

### Common Errors
| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid input | Validation failed |
| 401 | Unauthorized | JWT missing/invalid |
| 403 | Forbidden | Not the creator |
| 404 | Game not found | Invalid game ID |
| 409 | Cannot modify ended game | Game status is ENDED |
| 413 | Image too large | File > 5MB |
| 415 | Unsupported format | Not jpg/png/webp |

---

## Database Indexes

The following indexes are created automatically for optimal performance:

- `status` - Filter by game status
- `creatorId` - Filter by creator
- `category` - Filter by category
- `endTime + status` - Cleanup job queries
- `participants.userId` - Find user's games
- `title + description` (text index) - Search functionality

---

## Next Steps (Future Enhancements)

### Potential Features
- [ ] WebSocket integration for real-time updates (emit events on join/leave/end)
- [ ] Game chat/messaging
- [ ] Spectator mode
- [ ] Game replays/history
- [ ] Tournament brackets
- [ ] Leaderboards
- [ ] Private games (invite-only)
- [ ] Game templates
- [ ] Advanced search filters

### Scalability
- [ ] Redis caching for active games list
- [ ] Bull queue for distributed job processing
- [ ] Microservices architecture
- [ ] CDN for game images
- [ ] Database sharding

---

## Troubleshooting

### Cleanup job not running
1. Check logs for "Game cleanup job started" message
2. Verify cron expression is valid
3. Check for errors in logs

### Images not uploading
1. Verify Cloudinary credentials in `.env`
2. Check file size (max 5MB)
3. Verify file format (jpg/png/webp only)

### Cannot join game
1. Check game status (must be OPEN)
2. Verify user is not already a participant
3. Check if game has available slots

### Validation errors
1. Check request body matches Zod schemas
2. Verify all required fields are present
3. Check data types (numbers, dates, enums)

---

## Support

For issues or questions:
1. Check the design document: `GAME_MODULE_DESIGN.md`
2. Review error logs in console
3. Test endpoints with Swagger UI: `http://localhost:5000/swagger`

---

**Module Version**: 1.0.0  
**Last Updated**: February 9, 2026  
**Status**: Production Ready ✅
