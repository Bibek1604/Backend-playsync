"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../../config/jwt");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map