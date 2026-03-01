import mongoose from 'mongoose';
import { User } from '../auth/auth.model';
import Game from '../game/game.model';
import { UserListQuery, GameListQuery, AdminStats } from './admin.types';

class AdminRepository {
  /**
   * Get paginated list of users with search and sort
   */
  async getUsersList(query: UserListQuery) {
    const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id fullName email role profilePicture createdAt lastLogin')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { users, total };
  }

  /**
   * Get detailed user info with game counts
   */
  async getUserById(userId: string) {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      return null;
    }

    // Count games created and joined
    const [gamesCreated, gamesJoined] = await Promise.all([
      Game.countDocuments({ creatorId: userId }),
      Game.countDocuments({ 'participants.userId': userId }),
    ]);

    return {
      ...user,
      gamesCreated,
      gamesJoined,
    };
  }

  /**
   * Get paginated list of games with filters
   */
  async getGamesList(query: GameListQuery) {
    const { page, limit, status, category, creatorId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (creatorId) {
      if (!mongoose.Types.ObjectId.isValid(creatorId)) {
        return { games: [], total: 0 };
      }
      filter.creatorId = creatorId;
    }

    // Build sort
    let sort: any = {};
    if (sortBy === 'popularity') {
      sort.currentPlayers = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'endTime') {
      sort.endTime = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const [games, total] = await Promise.all([
      Game.find(filter)
        .select('_id title category status creatorId currentPlayers maxPlayers endTime createdAt')
        .populate('creatorId', 'fullName email profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Game.countDocuments(filter),
    ]);

    return { games, total };
  }

  /**
   * Get detailed game info with participants
   */
  async getGameById(gameId: string) {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return null;
    }

    const game = await Game.findById(gameId)
      .populate('creatorId', 'fullName email profilePicture')
      .populate('participants.userId', 'fullName profilePicture')
      .lean();

    return game;
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    const [
      totalUsers,
      totalGames,
      totalOnlineGames,
      totalOfflineGames,
      activeGames,
      participantsAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Game.countDocuments(),
      Game.countDocuments({ category: 'ONLINE' }),
      Game.countDocuments({ category: 'OFFLINE' }),
      Game.countDocuments({ status: { $in: ['OPEN', 'FULL'] } }),
      Game.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$currentPlayers' },
          },
        },
      ]),
    ]);

    const totalParticipantsAcrossAllGames = participantsAgg[0]?.total || 0;

    return {
      totalUsers,
      totalGames,
      totalOnlineGames,
      totalOfflineGames,
      activeGames,
      totalParticipantsAcrossAllGames,
    };
  }
}

export default new AdminRepository();
