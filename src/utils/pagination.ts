export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (
  query: PaginationQuery,
  maxLimit: number = 50
): PaginationResult => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 10, maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
