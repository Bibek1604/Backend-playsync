import { Request , Response  , NextFunction} from "express";

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}   
declare module 'express-serve-static-core' {
    interface Request {
        pagination?: PaginationParams;
    }
}
export const paginate= (defaultLimit = 10) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || defaultLimit;
        const skip = (page - 1) * limit;

        req.pagination = { page, limit, skip };

        next();
    };
};