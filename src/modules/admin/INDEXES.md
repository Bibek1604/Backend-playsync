# Admin Module - Database Indexes

## Add these indexes to your MongoDB models for optimal performance

### User Model (src/modules/auth/auth.model.ts)

Add these indexes after the schema definition:

```typescript
// Single field indexes
userSchema.index({ fullName: 1 });
userSchema.index({ email: 1 }); // May already exist as unique
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Text index for search
userSchema.index({ fullName: 'text', email: 'text' });
```

### Game Model (src/modules/game/game.model.ts)

Add these indexes after the schema definition:

```typescript
// Single field indexes
gameSchema.index({ status: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ creatorId: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ currentPlayers: -1 }); // For popularity sorting
gameSchema.index({ endTime: -1 });

// Compound indexes for filtered queries
gameSchema.index({ category: 1, status: 1 });
gameSchema.index({ creatorId: 1, status: 1 });

// For participant lookups
gameSchema.index({ 'participants.userId': 1 });
```

## Why These Indexes?

1. **Search Performance**: Text index on fullName and email enables fast search
2. **Filtering**: Indexes on status, category, role enable efficient filtering
3. **Sorting**: Indexes on createdAt, lastLogin, currentPlayers, endTime improve sort performance
4. **Compound Queries**: Combined indexes optimize queries with multiple filters
5. **Participant Lookups**: Speeds up counting games joined by users

## How to Add

You can add these indexes directly in your model files or create a migration script:

```typescript
// Migration script example
import mongoose from 'mongoose';
import { User } from './modules/auth/auth.model';
import Game from './modules/game/game.model';

async function createIndexes() {
  await User.createIndexes();
  await Game.createIndexes();
  console.log('Indexes created successfully');
}
```

Run once after adding the indexes to your schemas.
