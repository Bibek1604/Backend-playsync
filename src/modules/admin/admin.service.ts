import adminRepository from './admin.repository';
import { UserListQuery, GameListQuery, PaginatedResponse } from './admin.types';
import AppError from '../../Share/utils/AppError';

class AdminService {
  /**
   * Get paginated list of users
   */
  async getUsers(query: UserListQuery) {
    const { page, limit } = query;
    const { users, total } = await adminRepository.getUsersList(query);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return response;
  }

  /**
   * Get detailed user information
   */
  async getUserById(userId: string) {
    const user = await adminRepository.getUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Get paginated list of games
   */
  async getGames(query: GameListQuery) {
    const { page, limit } = query;
    const { games, total } = await adminRepository.getGamesList(query);

    const totalPages = Math.ceil(total / limit);

    // Transform games to include creator name
    const transformedGames = games.map((game: any) => ({
      _id: game._id,
      title: game.title,
      category: game.category,
      status: game.status,
      creator: game.creatorId
        ? {
            _id: game.creatorId._id,
            fullName: game.creatorId.fullName,
            email: game.creatorId.email,
            profilePicture: game.creatorId.profilePicture,
          }
        : null,
      currentPlayers: game.currentPlayers,
      maxPlayers: game.maxPlayers,
      endTime: game.endTime,
      createdAt: game.createdAt,
    }));

    const response: PaginatedResponse<any> = {
      data: transformedGames,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return response;
  }

  /**
   * Get paginated list of ONLINE games
   */
  async getOnlineGames(query: GameListQuery) {
    return this.getGames({ ...query, category: 'ONLINE' });
  }

  /**
   * Get paginated list of OFFLINE games
   */
  async getOfflineGames(query: GameListQuery) {
    return this.getGames({ ...query, category: 'OFFLINE' });
  }

  /**
   * Get detailed game information
   */
  async getGameById(gameId: string) {
    const game = await adminRepository.getGameById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    return game;
  }

  /**
   * Get admin dashboard statistics
   */
  async getStats() {
    const stats = await adminRepository.getAdminStats();
    return stats;
  }
}

export default new AdminService();
