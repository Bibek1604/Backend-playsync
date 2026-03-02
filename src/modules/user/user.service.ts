import { User } from '../auth/auth.model';
import AppError from '../../Share/utils/AppError';

const JOIN_XP = 50;       // XP awarded for joining a game
const WIN_XP = 150;      // XP awarded for winning (completing as creator)
const PLAY_XP = 500;      // XP awarded for participating to completion
const CREATE_XP = 100;    // XP awarded for creating a game
const UP_TIME_XP = 2;     // XP per 2 minutes

export class UserService {
    /**
     * Award XP + increment totalGames when a user joins a game.
     * Uses atomic $inc so concurrent joins don't clobber each other.
     */
    async awardJoinXP(userId: string): Promise<void> {
        // Atomically increment xp and totalGames, then recalculate level
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { xp: JOIN_XP, totalGames: 1 },
                $set: { lastActive: new Date() },
            },
            { new: true }
        );

        if (!user) return;

        // Recalculate level after the increment
        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        if (newLevel > user.level) {
            await User.findByIdAndUpdate(userId, { $set: { level: newLevel } });
        }
    }

    /**
     * Award XP for creating a game
     */
    async awardCreateXP(userId: string): Promise<void> {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { xp: CREATE_XP },
                $set: { lastActive: new Date() },
            },
            { new: true }
        );

        if (!user) return;
        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        if (newLevel > user.level) {
            await User.findByIdAndUpdate(userId, { $set: { level: newLevel } });
        }
    }

    /**
     * Award playtime XP to a batch of active users
     */
    async awardPlayTimeXP(userIds: string[]): Promise<void> {
        if (!userIds || userIds.length === 0) return;

        // Perform a bulk update to increment XP
        await User.updateMany(
            { _id: { $in: userIds } },
            { $inc: { xp: UP_TIME_XP }, $set: { lastActive: new Date() } }
        );

        // Optionally, recalculate levels for everyone. 
        // A simple query to update levels for those who crossed thresholds could be done here,
        // but it's simpler to let normal interactions or a separate job resolve it, or do an aggregation.
    }


    /**
     * Update user stats after a game ends (creator wins / participant plays).
     * Uses atomic $inc to avoid race conditions.
     */
    async updateUserStats(userId: string, isWinner: boolean, xpEarned: number = PLAY_XP): Promise<void> {
        const incData: Record<string, number> = { xp: xpEarned };

        if (isWinner) {
            incData.wins = 1;
        } else {
            incData.losses = 1;
        }

        // Atomically apply increments
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $inc: incData,
                $set: { lastActive: new Date() },
            },
            { new: true }
        );

        if (!user) return;

        // Recalculate derived fields (winRate, level) after increment
        const total = user.wins + user.losses;
        const newWinRate = total > 0 ? (user.wins / total) * 100 : 0;
        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;

        const updates: Record<string, number> = { winRate: newWinRate };
        if (newLevel > user.level) updates.level = newLevel;

        await User.findByIdAndUpdate(userId, { $set: updates });
    }

    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: string) {
        const user = await User.findById(userId).select('-password -refreshTokens');
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updateData: any) {
        const allowedUpdates = ['fullName', 'avatar', 'bio', 'phone', 'favoriteGame', 'place'];
        const filteredData: any = {};

        Object.keys(updateData).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        const user = await User.findByIdAndUpdate(userId, filteredData, { new: true, runValidators: true }).select('-password -refreshTokens');
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(limit: number = 50) {
        return await User.find()
            .select('fullName avatar level xp wins totalGames winRate')
            .sort({ xp: -1, wins: -1 })
            .limit(limit);
    }
}

