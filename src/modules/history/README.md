# User Game History Feature

## Overview

The **Player Game History** feature allows users to view a comprehensive list of all games they have ever joined, including detailed participation information. This feature uses the existing `Game.participants` array - no new collections needed.

## Architecture

```
src/modules/user/history/
├── history.types.ts       # TypeScript interfaces
├── history.dto.ts         # Zod validation schemas
├── history.repository.ts  # Database queries (aggregation)
├── history.service.ts     # Business logic
├── history.controller.ts  # HTTP handlers
└── history.routes.ts      # Route definitions
```

## API Endpoints

### 1. Get Game History

**Endpoint:** `GET /api/v1/users/me/games/history`

**Authentication:** Required (JWT)

**Query Parameters:**
- `status` (optional): Filter by game status or participation status
  - Game statuses: `OPEN`, `FULL`, `ENDED`, `CANCELLED`
  - Participation statuses: `ACTIVE`, `LEFT`
- `category` (optional): Filter by game category
  - Values: `ONLINE`, `OFFLINE`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `sort` (optional): Sort order
  - `recent`: Newest games first (default)
  - `oldest`: Oldest games first
  - `mostActive`: Longest participation duration first

**Example Requests:**
```bash
# Get all game history
GET /api/v1/users/me/games/history

# Filter by ended games only
GET /api/v1/users/me/games/history?status=ENDED

# Filter by games I left early
GET /api/v1/users/me/games/history?status=LEFT

# Filter by online games, page 2
GET /api/v1/users/me/games/history?category=ONLINE&page=2&limit=20

# Get oldest games first
GET /api/v1/users/me/games/history?sort=oldest
```

**Response:**
```json
{
  "success": true,
  "message": "Game history retrieved successfully",
  "data": {
    "history": [
      {
        "gameId": "507f1f77bcf86cd799439011",
        "title": "Valorant Ranked Night",
        "category": "ONLINE",
        "status": "ENDED",
        "myParticipation": {
          "joinedAt": "2026-02-10T18:30:00.000Z",
          "leftAt": "2026-02-10T21:15:00.000Z",
          "participationStatus": "LEFT",
          "durationMinutes": 165
        },
        "gameInfo": {
          "creatorName": "Saugat Shrestha",
          "maxPlayers": 10,
          "currentPlayers": 8,
          "endTime": "2026-02-10T22:00:00.000Z",
          "imageUrl": "https://cloudinary.com/..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5,
      "hasNext": true
    }
  }
}
```

### 2. Get Participation Statistics

**Endpoint:** `GET /api/v1/users/me/games/stats`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "message": "Participation statistics retrieved successfully",
  "data": {
    "totalGames": 42,
    "activeGames": 5,
    "completedGames": 35,
    "leftEarly": 2
  }
}
```

### 3. Get Game Count

**Endpoint:** `GET /api/v1/users/me/games/count`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "message": "Game count retrieved successfully",
  "data": {
    "count": 42
  }
}
```

## Database Query Strategy

### Aggregation Pipeline

The feature uses MongoDB's aggregation framework for optimal performance:

```typescript
[
  // Stage 1: Match games where user is a participant
  { $match: { 'participants.userId': userId } },
  
  // Stage 2: Unwind participants array
  { $unwind: '$participants' },
  
  // Stage 3: Filter to current user's participation
  { $match: { 'participants.userId': userId } },
  
  // Stage 4: Lookup creator information
  { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'creator' } },
  
  // Stage 5: Project (transform) data
  { $project: { /* shape response */ } },
  
  // Stage 6: Sort
  { $sort: { 'myParticipation.joinedAt': -1 } },
  
  // Stage 7: Pagination with facet
  { $facet: { data: [...], metadata: [...] } }
]
```

### Performance Optimization

**Index Used:**
```typescript
gameSchema.index({ 'participants.userId': 1 });
```

This index already exists in the Game model (line 175 of game.model.ts).

**Benefits:**
- ✅ Fast lookups by userId in participants array
- ✅ Efficient filtering and sorting
- ✅ Minimizes full collection scans
- ✅ Single query for data + count (using $facet)

## Key Features

### 1. No New Collections
- Uses existing `Game.participants` array
- Leverages MongoDB aggregation for complex queries
- Minimal impact on existing codebase

### 2. Comprehensive Filtering
- Filter by game status (OPEN, FULL, ENDED, CANCELLED)
- Filter by participation status (ACTIVE, LEFT)
- Filter by category (ONLINE, OFFLINE)
- Multiple sorting options

### 3. Rich Data Response
- Game details (title, status, category)
- Participation details (joined, left, duration)
- Creator information (name, profile)
- Pagination metadata

### 4. Duration Calculation
Automatically calculates participation duration:
```typescript
durationMinutes = (leftAt - joinedAt) / 60000
```

### 5. Pagination Support
- Page-based pagination
- Configurable limit (1-50)
- Total count included
- `hasNext` flag for infinite scroll

## Business Logic

### Participation Status
- **ACTIVE**: User is still in the game
- **LEFT**: User left before game ended

### Status Filter Behavior

When `status` parameter is provided:

**Game Status (OPEN, FULL, ENDED, CANCELLED):**
- Filters games by `game.status` field
- Shows all user's participation in those games

**Participation Status (ACTIVE, LEFT):**
- Filters by user's individual participation status
- Useful for finding games user left early

### Sort Options

1. **recent** (default): Newest participation first
   - Sort by: `joinedAt DESC`
   - Use case: See latest games

2. **oldest**: Oldest participation first
   - Sort by: `joinedAt ASC`
   - Use case: View gaming journey from start

3. **mostActive**: Longest participation first
   - Sort by: `durationMinutes DESC`
   - Use case: Find most engaged games

## Error Handling

All endpoints properly handle:
- ❌ Missing authentication
- ❌ Invalid query parameters
- ❌ Out of range pagination
- ❌ Database errors
- ❌ Empty history

**Example Error Response:**
```json
{
  "success": false,
  "message": "Limit must be between 1 and 50",
  "errorCode": "VALIDATION_ERROR"
}
```

## Integration Example

### Frontend Usage

```typescript
// Fetch game history
const fetchGameHistory = async (filters = {}) => {
  const params = new URLSearchParams({
    page: '1',
    limit: '10',
    ...filters
  });
  
  const response = await fetch(
    `/api/v1/users/me/games/history?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data;
};

// Usage examples
const allGames = await fetchGameHistory();
const endedGames = await fetchGameHistory({ status: 'ENDED' });
const onlineGames = await fetchGameHistory({ category: 'ONLINE' });
const gamesILeft = await fetchGameHistory({ status: 'LEFT' });
```

## Testing

Use the provided test.http file:

```http
### Get all game history
GET http://localhost:5000/api/v1/users/me/games/history
Authorization: Bearer YOUR_TOKEN

### Get only ended games
GET http://localhost:5000/api/v1/users/me/games/history?status=ENDED
Authorization: Bearer YOUR_TOKEN

### Get participation stats
GET http://localhost:5000/api/v1/users/me/games/stats
Authorization: Bearer YOUR_TOKEN
```

## Future Enhancements

Potential additions:
- [ ] Export history as CSV/PDF
- [ ] Detailed analytics (avg duration, favorite categories)
- [ ] Game ratings/reviews integration
- [ ] Search by game title
- [ ] Date range filtering
- [ ] Cursor-based pagination for better performance

## Dependencies

No new dependencies required. Uses existing:
- ✅ Express
- ✅ Mongoose
- ✅ Zod
- ✅ JWT auth middleware

## Migration Notes

**No migration needed!**

This feature uses the existing Game model and participants array. Just:
1. Deploy the code
2. Restart the server
3. Test the endpoints

The required index (`participants.userId`) already exists.

---

**Created:** February 12, 2026  
**Module:** User Game History  
**Version:** 1.0.0
