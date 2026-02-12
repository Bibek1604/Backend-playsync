export interface UserListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'createdAt' | 'lastLogin' | 'fullName';
  sortOrder?: 'asc' | 'desc';
}

export interface GameListQuery {
  page: number;
  limit: number;
  status?: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
  category?: 'ONLINE' | 'OFFLINE';
  creatorId?: string;
  sortBy?: 'createdAt' | 'popularity' | 'endTime';
  sortOrder?: 'asc' | 'desc';
}

export interface UserDetail {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  createdAt: Date;
  lastLogin?: Date;
  gamesCreated: number;
  gamesJoined: number;
}

export interface GameDetail {
  _id: string;
  title: string;
  description?: string;
  category: 'ONLINE' | 'OFFLINE';
  status: string;
  creator: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  participants: Array<{
    userId: {
      _id: string;
      fullName: string;
      profilePicture?: string;
    };
    joinedAt: Date;
    leftAt?: Date;
    status: string;
  }>;
  maxPlayers: number;
  currentPlayers: number;
  endTime?: Date;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalOnlineGames: number;
  totalOfflineGames: number;
  activeGames: number;
  totalParticipantsAcrossAllGames: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
