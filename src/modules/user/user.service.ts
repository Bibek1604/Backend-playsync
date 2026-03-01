import { User } from '../auth/auth.model';
import AppError from '../../Share/utils/AppError';

const JOIN_XP = 25;       // XP awarded for joining a game
const WIN_XP = 150;      // XP awarded for winning (completing as creator)
const PLAY_XP = 100;      // XP awarded for participating to completion

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

