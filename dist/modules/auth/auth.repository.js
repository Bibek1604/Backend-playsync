"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const auth_model_1 = require("./auth.model");
class UserRepository {
    async create(userData) {
        const user = new auth_model_1.User(userData);
        return await user.save();
    }
    async findByEmail(email) {
        return await auth_model_1.User.findOne({ email });
    }
    async findByEmailWithPassword(email) {
        return await auth_model_1.User.findOne({ email }).select("+password");
    }
    async findById(id) {
        return await auth_model_1.User.findById(id).select("-password");
    }
    async findByIdWithPassword(id) {
        return await auth_model_1.User.findById(id).select("+password");
    }
    async updateById(id, updateData) {
        return await auth_model_1.User.findByIdAndUpdate(id, updateData, { new: true });
    }
    async findByEmailOrRefreshToken(refreshToken) {
        return await auth_model_1.User.findOne({ refreshToken });
    }
    async findAll(filter = {}) {
        return await auth_model_1.User.find(filter).select("-password -refreshTokens");
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=auth.repository.js.map