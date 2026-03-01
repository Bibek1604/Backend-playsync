# Admin Module

## Overview
Complete admin panel backend for managing users, games, and viewing platform statistics.

## Endpoints

### User Management
- `GET /api/v1/admin/users` - List all users with pagination, search, and sort
- `GET /api/v1/admin/users/:userId` - Get detailed user info with game counts

### Game Management
- `GET /api/v1/admin/games` - List all games with filters
- `GET /api/v1/admin/games/online` - List ONLINE games only
- `GET /api/v1/admin/games/offline` - List OFFLINE games only
- `GET /api/v1/admin/games/:gameId` - Get detailed game info with participants

### Statistics
- `GET /api/v1/admin/stats` - Get dashboard statistics

## Authentication
All endpoints require:
- Valid JWT token (via `auth` middleware)
- Admin role (via `authorize('admin')` middleware)

## Query Parameters

### Users List
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page
- `search` - Search by fullName or email (case-insensitive partial match)
- `sortBy` - One of: `createdAt`, `lastLogin`, `fullName` (default: `createdAt`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

### Games List
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `status` - Filter by: `OPEN`, `FULL`, `ENDED`, `CANCELLED`
- `category` - Filter by: `ONLINE`, `OFFLINE`
- `creatorId` - Filter by creator user ID
- `sortBy` - One of: `createdAt`, `popularity` (currentPlayers), `endTime` (default: `createdAt`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

## Response Format
All endpoints return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

For paginated endpoints:
```json
{
  "success": true,
  "message": "...",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Recommended Database Indexes

### User Model (auth.model.ts)
```javascript
// Add these indexes for better query performance
userSchema.index({ fullName: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Compound index for search + sort
userSchema.index({ fullName: 'text', email: 'text' });
```

### Game Model (game.model.ts)
```javascript
// Add these indexes
gameSchema.index({ status: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ creatorId: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ currentPlayers: -1 });
gameSchema.index({ endTime: -1 });

// Compound indexes
gameSchema.index({ category: 1, status: 1 });
gameSchema.index({ creatorId: 1, status: 1 });

// For participant lookups
gameSchema.index({ 'participants.userId': 1 });
```

## Edge Cases Handled

1. **Invalid ObjectId**: Returns empty results or 404
2. **No users found**: Returns empty array with pagination
3. **No games found**: Returns empty array with pagination
4. **Non-admin access**: Returns 403 Forbidden
5. **Invalid query parameters**: Zod validation returns 400 with error details
6. **Page beyond total pages**: Returns empty array with correct pagination info
7. **Invalid sort fields**: Defaults to `createdAt`
8. **Missing creator in game**: Handles null creator gracefully

## Performance Optimizations

- Uses `.lean()` for read-only queries (faster)
- Selective field projection (only needed fields)
- Aggregation pipeline for stats (efficient counting)
- Proper indexing recommendations
- Parallel Promise.all for multiple queries
- Pagination to limit response size

## Error Handling

All errors are handled by:
- `asyncHandler` wrapper (catches async errors)
- `AppError` for custom errors with status codes
- Zod validation errors (automatic 400 responses)
- Global error handler in app

## Testing Recommendations

1. Test with admin JWT token
2. Test with non-admin token (should get 403)
3. Test pagination edge cases (page 0, negative, beyond total)
4. Test search with special characters
5. Test sorting by all sortBy options
6. Test with empty database
7. Test with invalid ObjectIds
8. Load test with large datasets (1000+ users/games)
