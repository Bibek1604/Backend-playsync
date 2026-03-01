import mongoose from 'mongoose';
import { GameSearchOptions, buildGameSearchPipeline } from './game-search.query';

export interface GameSearchResult {
  items: object[];
  total: number;
  page: number;
  totalPages: number;
}

export class GameSearchService {
  private get gameModel() {
    return mongoose.model('Game');
  }

  async search(options: GameSearchOptions): Promise<GameSearchResult> {
    const limit = options.limit ?? 20;
    const page = options.page ?? 1;

    const pipeline = buildGameSearchPipeline(options);

    // Count separately (without skip/limit)
    const countPipeline = pipeline.slice(0, 1); // just $match
    const [items, countResult] = await Promise.all([
      this.gameModel.aggregate(pipeline),
      this.gameModel.aggregate([...countPipeline, { $count: 'total' }]),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSuggestions(query: string, limit = 5): Promise<object[]> {
    return this.gameModel
      .find({
        $text: { $search: query },
        status: 'open',
      })
      .select('title sportType scheduledAt currentPlayers maxPlayers')
      .limit(limit)
      .lean();
  }
}

export const gameSearchService = new GameSearchService();
