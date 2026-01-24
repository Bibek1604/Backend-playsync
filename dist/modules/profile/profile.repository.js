"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const profile_model_1 = require("./profile.model");
class ProfileRepository {
    async create(profileData) {
        const profile = new profile_model_1.Profile(profileData);
        return await profile.save();
    }
    async findByUserId(userId) {
        return await profile_model_1.Profile.findOne({ userId });
    }
    async updateByUserId(userId, updateData) {
        return await profile_model_1.Profile.findOneAndUpdate({ userId }, updateData, { new: true });
    }
    async deleteByUserId(userId) {
        const result = await profile_model_1.Profile.findOneAndDelete({ userId });
        return !!result;
    }
}
exports.ProfileRepository = ProfileRepository;
//# sourceMappingURL=profile.repository.js.map