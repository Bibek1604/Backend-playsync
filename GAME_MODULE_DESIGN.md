# Game Creation Module - Architecture Design

## Executive Summary
This document outlines the production-ready design for a Game Creation module to be integrated into the PlaySync backend. The module is designed as an independent, backward-compatible addition that leverages existing JWT authentication without modifying any existing modules.

---

## 1. Database Schema

### 1.1 Games Table
```sql
CREATE TABLE games (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  category          ENUM('ONLINE', 'OFFLINE') NOT NULL,
  image_url         VARCHAR(500),
  image_public_id   VARCHAR(255), -- Cloudinary public_id for deletion
  max_players       INTEGER NOT NULL CHECK (max_players > 0 AND max_players <= 1000),
  current_players   INTEGER DEFAULT 0 CHECK (current_players >= 0),
  status            ENUM('OPEN', 'FULL', 'ENDED') DEFAULT 'OPEN',
  creator_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time          TIMESTAMP NOT NULL,
  ended_at          TIMESTAMP NULL,
  metadata          JSONB DEFAULT '{}', -- For future extensibility
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_end_time CHECK (end_time > start_time),
  CONSTRAINT valid_ended_at CHECK (ended_at IS NULL OR ended_at >= start_time)
);

CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_creator ON games(creator_id);
CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_games_end_time ON games(end_time) WHERE status != 'ENDED';
CREATE INDEX idx_games_active ON games(status, end_time) WHERE status IN ('OPEN', 'FULL');
```

### 1.2 Game Participants Table
```sql
CREATE TABLE game_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at         TIMESTAMP NULL,
  status          ENUM('ACTIVE', 'LEFT') DEFAULT 'ACTIVE',
  
  UNIQUE(game_id, user_id),
  CONSTRAINT valid_left_at CHECK (left_at IS NULL OR left_at >= joined_at)
);

CREATE INDEX idx_participants_game ON game_participants(game_id);
CREATE INDEX idx_participants_user ON game_participants(user_id);
CREATE INDEX idx_participants_active ON game_participants(game_id, status) WHERE status = 'ACTIVE';
```

### 1.3 MongoDB Alternative (if using MongoDB)
```javascript
// games collection
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String, // 'ONLINE' | 'OFFLINE'
  imageUrl: String,
  imagePublicId: String,
  maxPlayers: Number,
  currentPlayers: Number,
  status: String, // 'OPEN' | 'FULL' | 'ENDED'
  creatorId: ObjectId,
  participants: [
    {
      userId: ObjectId,
      joinedAt: Date,
      leftAt: Date,
      status: String // 'ACTIVE' | 'LEFT'
    }
  ],
  startTime: Date,
  endTime: Date,
  endedAt: Date,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.games.createIndex({ status: 1 })
db.games.createIndex({ creatorId: 1 })
db.games.createIndex({ category: 1 })
db.games.createIndex({ endTime: 1, status: 1 })
db.games.createIndex({ "participants.userId": 1 })
```

---

## 2. API Endpoints

### 2.1 Create Game
```
POST /api/games
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Request Body:
{
  title: string (required, 3-255 chars),
  description: string (optional, max 2000 chars),
  category: 'ONLINE' | 'OFFLINE' (required),
  maxPlayers: number (required, 1-1000),
  endTime: ISO8601 datetime (required, must be future),
  image: file (optional, max 5MB, jpg/png/webp)
}

Response 201:
{
  success: true,
  data: {
    id: uuid,
    title: string,
    description: string,
    category: string,
    imageUrl: string,
    maxPlayers: number,
    currentPlayers: 0,
    status: 'OPEN',
    creatorId: uuid,
    startTime: ISO8601,
    endTime: ISO8601,
    createdAt: ISO8601
  }
}

Errors:
- 400: Invalid input, end time in past, max players out of range
- 401: Unauthorized
- 413: Image too large
- 415: Unsupported image format
```

### 2.2 Get All Games (with filters)
```
GET /api/games?category=ONLINE&status=OPEN&page=1&limit=20
Authorization: Bearer <JWT_TOKEN> (optional for public games)

Query Parameters:
- category: 'ONLINE' | 'OFFLINE' (optional)
- status: 'OPEN' | 'FULL' | 'ENDED' (optional)
- creatorId: uuid (optional)
- page: number (default: 1)
- limit: number (default: 20, max: 100)

Response 200:
{
  success: true,
  data: {
    games: [...],
    pagination: {
      page: 1,
      limit: 20,
      total: 150,
      totalPages: 8
    }
  }
}
```

### 2.3 Get Game by ID
```
GET /api/games/:id
Authorization: Bearer <JWT_TOKEN> (optional)

Response 200:
{
  success: true,
  data: {
    id: uuid,
    title: string,
    description: string,
    category: string,
    imageUrl: string,
    maxPlayers: number,
    currentPlayers: number,
    status: string,
    creator: {
      id: uuid,
      username: string,
      profileImage: string
    },
    participants: [...],
    startTime: ISO8601,
    endTime: ISO8601,
    createdAt: ISO8601
  }
}

Errors:
- 404: Game not found
```

### 2.4 Join Game
```
POST /api/games/:id/join
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  success: true,
  message: "Successfully joined the game",
  data: {
    gameId: uuid,
    currentPlayers: number,
    status: string
  }
}

Errors:
- 400: Game is full, game has ended, already joined
- 401: Unauthorized
- 404: Game not found
```

### 2.5 Leave Game
```
POST /api/games/:id/leave
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  success: true,
  message: "Successfully left the game",
  data: {
    gameId: uuid,
    currentPlayers: number,
    status: string
  }
}

Errors:
- 400: Not a participant, game has ended
- 401: Unauthorized
- 404: Game not found
```

### 2.6 Update Game (Creator Only)
```
PATCH /api/games/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Request Body (all optional):
{
  title: string,
  description: string,
  maxPlayers: number,
  endTime: ISO8601,
  image: file
}

Response 200:
{
  success: true,
  data: { ...updated game }
}

Errors:
- 400: Invalid input, can't reduce maxPlayers below currentPlayers
- 401: Unauthorized
- 403: Not the creator
- 404: Game not found
- 409: Cannot update ended game
```

### 2.7 Delete Game (Creator Only)
```
DELETE /api/games/:id
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  success: true,
  message: "Game deleted successfully"
}

Errors:
- 401: Unauthorized
- 403: Not the creator
- 404: Game not found
```

### 2.8 Get My Games
```
GET /api/games/my/created?status=OPEN&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>

GET /api/games/my/joined?status=OPEN&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>

Response: Same as "Get All Games"
```

---

## 3. Validation Rules

### 3.1 Game Creation
- **Title**: 3-255 characters, alphanumeric + spaces + special chars allowed
- **Description**: Max 2000 characters
- **Category**: Must be exactly 'ONLINE' or 'OFFLINE'
- **Max Players**: Integer between 1 and 1000
- **End Time**: 
  - Must be future timestamp (at least 5 minutes from now)
  - Max 365 days from creation
  - Must be valid ISO8601 format
- **Image**:
  - Max 5MB size
  - Accepted formats: jpg, jpeg, png, webp
  - Min dimensions: 200x200px
  - Max dimensions: 4000x4000px

### 3.2 Game Updates
- **Max Players Reduction**: Can only reduce if new value >= currentPlayers
- **End Time**: Can only extend, not shorten (prevent premature ending)
- **Status**: Cannot update ended games
- **Creator Check**: Only creator can update

### 3.3 Join/Leave Operations
- **Join**:
  - User must be authenticated
  - Game must not be ENDED
  - Game must not be FULL
  - User must not already be an active participant
  - Auto-update status to FULL when currentPlayers === maxPlayers
- **Leave**:
  - User must be active participant
  - Update status from FULL to OPEN if currentPlayers < maxPlayers after leaving
  - Creator can leave their own game

### 3.4 Edge Cases
1. **Concurrent Joins**: Use database transactions with row-level locking
2. **Race Conditions**: Optimistic locking with version field or atomic updates
3. **Orphaned Images**: Clean up Cloudinary images on game deletion or image replacement
4. **Time Zone Handling**: Store all timestamps in UTC, handle conversion in client
5. **Ended Game Cleanup**: Automatically mark games as ENDED when end time passes
6. **Participant Count Sync**: Use triggers/middleware to keep currentPlayers accurate

---

## 4. Game Lifecycle Management

### 4.1 State Transitions
```
OPEN → FULL (when currentPlayers === maxPlayers)
FULL → OPEN (when a player leaves and currentPlayers < maxPlayers)
OPEN/FULL → ENDED (when current time >= endTime via cron job)
```

### 4.2 State Machine Rules
- **OPEN**: Accepting new players, currentPlayers < maxPlayers
- **FULL**: Not accepting players, currentPlayers === maxPlayers
- **ENDED**: Game finished, no joins/leaves allowed, read-only

### 4.3 Automatic Status Updates
```javascript
// On player join
if (game.currentPlayers + 1 === game.maxPlayers) {
  game.status = 'FULL';
}

// On player leave
if (game.status === 'FULL' && game.currentPlayers - 1 < game.maxPlayers) {
  game.status = 'OPEN';
}

// On cron job execution
if (current_time >= game.endTime && game.status !== 'ENDED') {
  game.status = 'ENDED';
  game.endedAt = current_time;
}
```

---

## 5. Authentication Integration

### 5.1 Middleware Usage
```typescript
// Reuse existing auth middleware from auth module
import { authenticateJWT } from '../auth/auth.middleware';

// Game routes
router.post('/games', authenticateJWT, upload.single('image'), gameController.create);
router.get('/games', gameController.getAll); // Optional auth
router.get('/games/:id', gameController.getById); // Optional auth
router.post('/games/:id/join', authenticateJWT, gameController.join);
router.post('/games/:id/leave', authenticateJWT, gameController.leave);
router.patch('/games/:id', authenticateJWT, upload.single('image'), gameController.update);
router.delete('/games/:id', authenticateJWT, gameController.delete);
```

### 5.2 User Context Extraction
```typescript
// In controllers, extract user from JWT payload
const userId = req.user.id; // Set by authenticateJWT middleware
const userRole = req.user.role;

// Creator verification
const game = await gameRepository.findById(gameId);
if (game.creatorId !== userId) {
  throw new AppError('Forbidden: Only creator can modify this game', 403);
}
```

### 5.3 Optional Authentication
```typescript
// For public game listing
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = verifyJWT(token);
    } catch (err) {
      // Ignore invalid tokens, proceed as guest
    }
  }
  next();
};
```

---

## 6. Background Job Strategy

### 6.1 Technology Options

#### Option A: Node-Cron (Lightweight)
```typescript
// src/jobs/game.cleanup.job.ts
import cron from 'node-cron';
import { GameService } from '../modules/game/game.service';
import { logger } from '../Share/utils/logger';

class GameCleanupJob {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  start() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('Running game cleanup job...');
        await this.endExpiredGames();
        logger.info('Game cleanup job completed');
      } catch (error) {
        logger.error('Game cleanup job failed:', error);
      }
    });
  }

  private async endExpiredGames() {
    const now = new Date();
    const expiredGames = await this.gameService.findExpiredGames(now);
    
    for (const game of expiredGames) {
      await this.gameService.endGame(game.id);
      logger.info(`Game ${game.id} (${game.title}) ended automatically`);
    }
  }
}

export default new GameCleanupJob();
```

#### Option B: Bull Queue (Production-Scale)
```typescript
// src/queues/game.queue.ts
import Bull from 'bull';
import { GameService } from '../modules/game/game.service';
import { logger } from '../Share/utils/logger';

const gameQueue = new Bull('game-cleanup', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

// Process cleanup jobs
gameQueue.process('end-game', async (job) => {
  const { gameId } = job.data;
  const gameService = new GameService();
  
  await gameService.endGame(gameId);
  logger.info(`Game ${gameId} ended via queue`);
});

// Schedule game ending at creation
export const scheduleGameEnd = async (gameId: string, endTime: Date) => {
  const delay = endTime.getTime() - Date.now();
  
  await gameQueue.add('end-game', { gameId }, {
    delay,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
};

// Fallback cron for missed jobs
gameQueue.process('cleanup-expired', async () => {
  const gameService = new GameService();
  const now = new Date();
  const expiredGames = await gameService.findExpiredGames(now);
  
  for (const game of expiredGames) {
    await gameService.endGame(game.id);
  }
});

// Run cleanup every 10 minutes
export const startCleanupCron = () => {
  gameQueue.add('cleanup-expired', {}, {
    repeat: { cron: '*/10 * * * *' }
  });
};

export default gameQueue;
```

### 6.2 Recommended Approach
**Use Bull Queue for production** because:
- Persistent job storage (survives server restarts)
- Automatic retry mechanism
- Distributed job processing
- Better monitoring and debugging
- Scales horizontally

**Fallback to node-cron** if:
- No Redis infrastructure available
- Small-scale deployment
- Budget constraints

### 6.3 Integration in Server Startup
```typescript
// src/server.ts
import gameCleanupJob from './jobs/game.cleanup.job';
// OR
import { startCleanupCron } from './queues/game.queue';

// After database connection
gameCleanupJob.start();
// OR
startCleanupCron();
```

### 6.4 Cleanup Strategy
```typescript
// game.service.ts
async endGame(gameId: string): Promise<void> {
  const game = await this.gameRepository.findById(gameId);
  
  if (!game || game.status === 'ENDED') {
    return; // Already ended or doesn't exist
  }

  // Update game status
  await this.gameRepository.update(gameId, {
    status: 'ENDED',
    endedAt: new Date()
  });

  // Optional: Archive participants to separate table
  await this.archiveParticipants(gameId);

  // Emit WebSocket event to notify active users
  this.socketService.emitToGame(gameId, 'game:ended', {
    gameId,
    endedAt: new Date()
  });

  // Optional: Delete after retention period (e.g., 30 days)
  // Schedule secondary cleanup job
}

// Find games that should have ended
async findExpiredGames(currentTime: Date): Promise<Game[]> {
  return this.gameRepository.find({
    endTime: { $lte: currentTime },
    status: { $ne: 'ENDED' }
  });
}
```

---

## 7. Module File Structure

```
src/modules/game/
├── game.controller.ts       # HTTP request handlers
├── game.service.ts          # Business logic
├── game.repository.ts       # Database operations
├── game.model.ts            # Database model/schema
├── game.routes.ts           # Route definitions
├── game.dto.ts              # Data Transfer Objects & validation
├── game.middleware.ts       # Game-specific middleware (ownership check, etc.)
├── game.uploader.ts         # Image upload logic (Cloudinary)
└── game.types.ts            # TypeScript types/interfaces

src/jobs/
└── game.cleanup.job.ts      # Cron job for ending expired games

src/queues/ (if using Bull)
└── game.queue.ts            # Bull queue configuration
```

### 7.1 Example File Skeletons

#### game.dto.ts
```typescript
import { z } from 'zod';

export const createGameSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(2000).optional(),
  category: z.enum(['ONLINE', 'OFFLINE']),
  maxPlayers: z.number().int().min(1).max(1000),
  endTime: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const minEndTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins
    const maxEndTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    return date > minEndTime && date < maxEndTime;
  }, 'End time must be between 5 minutes and 365 days from now')
});

export const updateGameSchema = createGameSchema.partial();

export type CreateGameDTO = z.infer<typeof createGameSchema>;
export type UpdateGameDTO = z.infer<typeof updateGameSchema>;
```

#### game.middleware.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../Share/utils/AppError';
import { GameRepository } from './game.repository';

export const checkGameOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.id;
    
    const gameRepo = new GameRepository();
    const game = await gameRepo.findById(gameId);
    
    if (!game) {
      throw new AppError('Game not found', 404);
    }
    
    if (game.creatorId !== userId) {
      throw new AppError('Forbidden: Only creator can perform this action', 403);
    }
    
    req.game = game; // Attach to request for controller use
    next();
  } catch (error) {
    next(error);
  }
};

export const checkGameEditable = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const game = req.game; // Set by checkGameOwnership
    
    if (game.status === 'ENDED') {
      throw new AppError('Cannot modify ended game', 409);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

#### game.routes.ts
```typescript
import { Router } from 'express';
import { GameController } from './game.controller';
import { authenticateJWT } from '../auth/auth.middleware';
import { checkGameOwnership, checkGameEditable } from './game.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import { createGameSchema, updateGameSchema } from './game.dto';
import { upload } from './game.uploader';

const router = Router();
const controller = new GameController();

router.post(
  '/',
  authenticateJWT,
  upload.single('image'),
  validateDto(createGameSchema),
  controller.create
);

router.get('/', controller.getAll);
router.get('/my/created', authenticateJWT, controller.getMyCreatedGames);
router.get('/my/joined', authenticateJWT, controller.getMyJoinedGames);
router.get('/:id', controller.getById);

router.post('/:id/join', authenticateJWT, controller.join);
router.post('/:id/leave', authenticateJWT, controller.leave);

router.patch(
  '/:id',
  authenticateJWT,
  checkGameOwnership,
  checkGameEditable,
  upload.single('image'),
  validateDto(updateGameSchema),
  controller.update
);

router.delete(
  '/:id',
  authenticateJWT,
  checkGameOwnership,
  controller.delete
);

export default router;
```

#### game.uploader.ts
```typescript
import multer from 'multer';
import { CloudinaryUploader } from '../../Share/config/cloudinary';
import { AppError } from '../../Share/utils/AppError';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only jpg, png, and webp allowed', 415), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadGameImage = async (file: Express.Multer.File): Promise<{url: string, publicId: string}> => {
  const uploader = new CloudinaryUploader();
  return uploader.upload(file.buffer, 'games');
};

export const deleteGameImage = async (publicId: string): Promise<void> => {
  const uploader = new CloudinaryUploader();
  await uploader.delete(publicId);
};
```

---

## 8. WebSocket Integration

### 8.1 Real-time Events
```typescript
// Emit to all participants when game state changes
socket.on('game:created', { gameId, title, creator });
socket.on('game:updated', { gameId, changes });
socket.on('game:deleted', { gameId });
socket.on('game:player-joined', { gameId, userId, currentPlayers });
socket.on('game:player-left', { gameId, userId, currentPlayers });
socket.on('game:status-changed', { gameId, status });
socket.on('game:ended', { gameId, endedAt });
```

### 8.2 Socket Service Integration
```typescript
// game.service.ts
import { SocketService } from '../../websocket/socket.server';

export class GameService {
  private socketService: SocketService;

  constructor() {
    this.socketService = SocketService.getInstance();
  }

  async joinGame(gameId: string, userId: string): Promise<Game> {
    // ... join logic
    
    // Emit to all game participants
    this.socketService.emitToRoom(`game:${gameId}`, 'game:player-joined', {
      gameId,
      userId,
      currentPlayers: game.currentPlayers
    });
    
    return game;
  }
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Repository methods (CRUD operations)
- Service business logic (join, leave, end game)
- Validation schemas
- Middleware functions

### 9.2 Integration Tests
- API endpoints with authentication
- Database transactions
- File upload workflow
- Cron job execution

### 9.3 E2E Tests
- Complete game lifecycle
- Concurrent join operations
- Automatic game ending
- WebSocket events

### 9.4 Performance Tests
- Load testing with 1000+ concurrent games
- High-frequency join/leave operations
- Image upload stress testing
- Cron job performance with large dataset

---

## 10. Monitoring & Observability

### 10.1 Metrics to Track
- Active games count (by status, category)
- Average game duration
- Player participation rate
- Failed game creations (errors)
- Cron job execution time
- Image upload success/failure rate

### 10.2 Logging Strategy
```typescript
logger.info('Game created', { gameId, creatorId, category });
logger.info('Player joined', { gameId, userId, currentPlayers });
logger.warn('Game full', { gameId, attemptedUserId });
logger.error('Game creation failed', { error, userId });
logger.info('Cron: Games ended', { count, executionTime });
```

### 10.3 Alerts
- Cron job failures
- High error rate on game joins (race conditions)
- Games stuck in FULL status
- Image upload failures
- Database connection issues

---

## 11. Security Considerations

### 11.1 Input Validation
- Sanitize all user inputs (title, description)
- Validate file uploads (type, size, dimensions)
- Prevent SQL/NoSQL injection
- Rate limiting on game creation (max 10 per hour per user)

### 11.2 Authorization
- Only creator can update/delete games
- Only authenticated users can join games
- Prevent unauthorized access to ended games' sensitive data

### 11.3 Data Protection
- Hash sensitive game metadata if needed
- Secure Cloudinary credentials
- Rate limit API endpoints
- Implement CORS properly

---

## 12. Performance Optimizations

### 12.1 Database
- Use indexes on frequently queried fields
- Implement connection pooling
- Use database transactions for atomic operations
- Consider read replicas for heavy read operations

### 12.2 Caching Strategy
```typescript
// Cache active games list (Redis)
const CACHE_TTL = 60; // 1 minute

async getActiveGames() {
  const cached = await redis.get('games:active');
  if (cached) return JSON.parse(cached);
  
  const games = await this.gameRepository.findActive();
  await redis.setex('games:active', CACHE_TTL, JSON.stringify(games));
  
  return games;
}

// Invalidate cache on game updates
async updateGame(gameId: string, data: any) {
  await this.gameRepository.update(gameId, data);
  await redis.del('games:active', `game:${gameId}`);
}
```

### 12.3 Pagination
- Default page size: 20
- Max page size: 100
- Use cursor-based pagination for large datasets

---

## 13. Migration & Deployment Plan

### 13.1 Phase 1: Database Setup
1. Run migration scripts to create tables/collections
2. Create indexes
3. Test database constraints

### 13.2 Phase 2: Core Implementation
1. Implement repository layer
2. Implement service layer with business logic
3. Add controllers and routes
4. Integrate authentication middleware

### 13.3 Phase 3: Background Jobs
1. Implement cron job/queue system
2. Test automatic game ending
3. Add monitoring and logging

### 13.4 Phase 4: Testing & QA
1. Run unit tests
2. Run integration tests
3. Perform load testing
4. Security audit

### 13.5 Phase 5: Production Deployment
1. Deploy behind feature flag
2. Monitor error rates and performance
3. Gradual rollout (10% → 50% → 100%)
4. Post-deployment verification

---

## 14. Future Enhancements

### 14.1 Potential Features
- Game chat/messaging
- Spectator mode
- Game replays/history
- Tournament brackets
- Leaderboards
- Game categories/tags beyond ONLINE/OFFLINE
- Private games (invite-only)
- Game templates for quick creation
- Multi-game tournaments
- Live scoring during games

### 14.2 Scalability Considerations
- Microservices architecture (separate game service)
- Event-driven architecture (Kafka/RabbitMQ)
- CDN for game images
- Database sharding by game category/region
- Horizontal scaling with load balancer

---

## 15. API Integration Example

### 15.1 Client-Side Usage
```typescript
// Create a game
const createGame = async () => {
  const formData = new FormData();
  formData.append('title', 'Epic Battle Royale');
  formData.append('description', 'Join for an intense 100-player showdown');
  formData.append('category', 'ONLINE');
  formData.append('maxPlayers', '100');
  formData.append('endTime', new Date(Date.now() + 3600000).toISOString());
  formData.append('image', imageFile);

  const response = await fetch('/api/games', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  return data.data;
};

// Join a game
const joinGame = async (gameId: string) => {
  const response = await fetch(`/api/games/${gameId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Listen to WebSocket events
socket.on('game:player-joined', (data) => {
  console.log(`Player joined game ${data.gameId}, now ${data.currentPlayers} players`);
  // Update UI
});
```

---

## 16. Conclusion

This Game Creation module is designed to be:
- **Modular**: Completely independent, no changes to existing code
- **Scalable**: Handles concurrent operations, supports horizontal scaling
- **Production-Ready**: Comprehensive error handling, logging, monitoring
- **Secure**: Proper authentication, authorization, input validation
- **Maintainable**: Clean architecture, well-documented, testable

The module integrates seamlessly with existing JWT authentication, leverages the current cloudinary setup for images, and follows the established project structure and patterns.

**Estimated Development Time**: 2-3 weeks for full implementation with tests
**Team Size**: 2-3 backend developers

---

## Appendix

### A. Environment Variables
```env
# Game Module
GAME_IMAGE_MAX_SIZE=5242880 # 5MB in bytes
GAME_MAX_PLAYERS_LIMIT=1000
GAME_CREATION_RATE_LIMIT=10 # per hour per user
GAME_CLEANUP_CRON='*/5 * * * *' # Every 5 minutes

# Bull Queue (if using)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### B. Sample Data
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Friday Night Battle",
  "description": "Weekly competitive match",
  "category": "ONLINE",
  "imageUrl": "https://res.cloudinary.com/xyz/games/abc123.jpg",
  "imagePublicId": "games/abc123",
  "maxPlayers": 50,
  "currentPlayers": 23,
  "status": "OPEN",
  "creatorId": "660e8400-e29b-41d4-a716-446655440001",
  "startTime": "2026-02-09T18:00:00Z",
  "endTime": "2026-02-09T22:00:00Z",
  "createdAt": "2026-02-09T17:55:00Z",
  "updatedAt": "2026-02-09T18:15:00Z"
}
```

### C. Error Codes Reference
| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid input | Validation failed |
| 401 | Unauthorized | JWT missing/invalid |
| 403 | Forbidden | Not the creator |
| 404 | Game not found | Invalid game ID |
| 409 | Game ended | Cannot modify |
| 413 | Image too large | > 5MB |
| 415 | Unsupported format | Not jpg/png/webp |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Internal error | Server error |

---

**Document Version**: 1.0  
**Last Updated**: February 9, 2026  
**Author**: Senior Backend Architect  
**Status**: Ready for Implementation
