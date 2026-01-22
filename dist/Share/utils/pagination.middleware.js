"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = (defaultLimit = 10) => {
    return (req, res, next) => {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || defaultLimit;
        const skip = (page - 1) * limit;
        req.pagination = { page, limit, skip };
        next();
    };
};
exports.paginate = paginate;
//# sourceMappingURL=pagination.middleware.js.map