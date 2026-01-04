"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users = [];
class UserRepo {
    static async create(user) {
        users.push(user);
        return user;
    }
    static async findByEmail(email) {
        return users.find(u => u.email === email);
    }
    static async findById(id) {
        return users.find(u => u.id === id);
    }
    static async saveRefreshToken(userId, token) {
        const user = await this.findById(userId);
        if (user)
            user.refreshTokenHash = token;
    }
    static async clearRefreshToken(userId) {
        const user = await this.findById(userId);
        if (user)
            user.refreshTokenHash = null;
    }
    static async compareRefreshToken(userId, token) {
        const user = await this.findById(userId);
        if (!user || !user.refreshTokenHash)
            return false;
        return bcrypt_1.default.compare(token, user.refreshTokenHash);
    }
}
exports.UserRepo = UserRepo;
//# sourceMappingURL=user_repository.js.map