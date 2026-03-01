export interface GameSearchQuery {
  sportType?: string;
  status?: 'open' | 'ongoing' | 'completed' | 'cancelled';
  tags?: string[];
  location?: { lat: number; lng: number; radiusKm: number };
  startAfter?: Date;
  startBefore?: Date;
  hostedBy?: string;
  hasSpace?: boolean;
}

export interface GameSearchSort {
  field: 'createdAt' | 'startTime' | 'playerCount';
  direction: 'asc' | 'desc';
}

export interface GameSearchOptions {
  query: GameSearchQuery;
  sort?: GameSearchSort;
  page?: number;
  limit?: number;
}

export function buildGameSearchPipeline(options: GameSearchOptions): object[] {
  const { query, sort, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  const match: Record<string, unknown> = {};

  if (query.sportType) match['sportType'] = query.sportType;
  if (query.status) match['status'] = query.status;
  if (query.tags?.length) match['tags'] = { $all: query.tags };
  if (query.hostedBy) match['createdBy'] = query.hostedBy;
  if (query.hasSpace) match['$expr'] = { $lt: ['$currentPlayers', '$maxPlayers'] };

  if (query.startAfter || query.startBefore) {
    match['scheduledAt'] = {
      ...(query.startAfter ? { $gte: query.startAfter } : {}),
      ...(query.startBefore ? { $lte: query.startBefore } : {}),
    };
  }

  const sortStage: Record<string, 1 | -1> = sort
    ? { [sort.field]: sort.direction === 'asc' ? 1 : -1 }
    : { createdAt: -1 };

  return [
    { $match: match },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'host',
        pipeline: [{ $project: { name: 1, profileImage: 1 } }],
      },
    },
    { $unwind: { path: '$host', preserveNullAndEmpty: false } },
  ];
}
