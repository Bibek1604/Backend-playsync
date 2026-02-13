/**
 * Migration Script: Convert Game Category to Tags
 * 
 * This script migrates existing games from the old single 'category' field
 * to the new 'tags' array field.
 * 
 * Usage:
 *   ts-node src/migrations/migrate-category-to-tags.ts
 * 
 * Or add to package.json scripts:
 *   "migrate:category-to-tags": "ts-node src/migrations/migrate-category-to-tags.ts"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define old game interface (with category)
interface OldGame {
  _id: mongoose.Types.ObjectId;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

async function migrateCategoryToTags() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/playsync';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the Game collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const gamesCollection = db.collection('games');

    // Find all games with category field that don't have tags
    const gamesToMigrate = await gamesCollection.find({
      category: { $exists: true },
      tags: { $exists: false }
    }).toArray() as unknown as OldGame[];

    console.log(`📊 Found ${gamesToMigrate.length} games to migrate`);

    if (gamesToMigrate.length === 0) {
      console.log('✅ No games to migrate. All games already have tags.');
      await mongoose.connection.close();
      return;
    }

    // Migrate each game
    let successCount = 0;
    let errorCount = 0;

    for (const game of gamesToMigrate) {
      try {
        const tags = game.category ? [game.category.toLowerCase()] : ['general'];
        
        await gamesCollection.updateOne(
          { _id: game._id },
          {
            $set: { tags },
            $unset: { category: '' }
          }
        );
        
        successCount++;
        console.log(`✓ Migrated game ${game._id}: category="${game.category}" → tags=${JSON.stringify(tags)}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to migrate game ${game._id}:`, error);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total games: ${gamesToMigrate.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateCategoryToTags()
  .then(() => {
    console.log('✅ Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
