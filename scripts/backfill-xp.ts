// @ts-nocheck
/**
 * XP Backfill Migration Script
 * Run: npx ts-node scripts/backfill-xp.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

const UserModel = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const GameModel = mongoose.model('Game', new mongoose.Schema({}, { strict: false }), 'games');

const JOIN_XP = 25;   // joining a game as participant
const HOST_XP = 50;   // creating a game
const COMPLETE_XP = 100;  // completed game (participant)
const WIN_XP = 150;  // completed game (creator/host)

async function main() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    const users = await UserModel.find({}).lean();
    const games = await GameModel.find({}).lean();

    console.log(`📊 Found ${users.length} users and ${games.length} games\n`);

    let updated = 0;

    for (const user of users) {
        const userId = user._id.toString();

        // Games this user created
        const createdGames = games.filter(g => g.creatorId?.toString() === userId);

        // Games this user joined as a participant
        const participatedGames = games.filter(g =>
            Array.isArray(g.participants) &&
            g.participants.some(p => p.userId?.toString() === userId)
        );

        const completedAsCreator = createdGames.filter(g => g.status === 'ENDED' || g.completedAt);
        const completedAsParticipant = participatedGames.filter(g => g.status === 'ENDED' || g.completedAt);

        const totalGames = createdGames.length + participatedGames.length;
        const wins = completedAsCreator.length;
        const losses = completedAsParticipant.length;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        const xp =
            (participatedGames.length * JOIN_XP) +
            (createdGames.length * HOST_XP) +
            (completedAsParticipant.length * COMPLETE_XP) +
            (completedAsCreator.length * WIN_XP);

        const level = Math.floor(Math.sqrt(xp / 100)) + 1;

        if (xp === user.xp && totalGames === user.totalGames) {
            console.log(`⏭  ${user.fullName}: already up-to-date (xp=${xp})`);
            continue;
        }

        await UserModel.findByIdAndUpdate(userId, {
            $set: { xp, level, totalGames, wins, losses, winRate, lastActive: new Date() },
        });

        console.log(`✅ ${user.fullName}: xp=${xp} (was ${user.xp}), games=${totalGames}, wins=${wins}, level=${level}`);
        updated++;
    }

    console.log(`\n🎉 Done — updated ${updated} / ${users.length} users`);
    await mongoose.disconnect();
}

main().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
