"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const profile_model_1 = __importDefault(require("./profile.model"));
const mongoose_1 = require("mongoose");
exports.ProfileRepository = {
    async create(data) {
        const doc = new profile_model_1.default(data);
        return doc.save();
    },
    async findByUserId(userId) {
        return profile_model_1.default.findOne({ userId: new mongoose_1.Types.ObjectId(userId) }).exec();
    },
    async updateByUserId(userId, updateData, options = { new: true, upsert: true }) {
        return profile_model_1.default.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, updateData, options).exec();
    },
    async deleteByUserId(userId) {
        return profile_model_1.default.findOneAndDelete({ userId: new mongoose_1.Types.ObjectId(userId) }).exec();
    },
    async setAvatar(userId, url) {
        return profile_model_1.default.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { avatar: url }, { new: true }).exec();
    },
    async setCoverPhoto(userId, url) {
        return profile_model_1.default.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { coverPhoto: url }, { new: true }).exec();
    },
    async addPicture(userId, url) {
        return profile_model_1.default.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { $push: { pictures: url } }, { new: true }).exec();
    },
    async removePicture(userId, url) {
        return profile_model_1.default.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { $pull: { pictures: url } }, { new: true }).exec();
    },
};
//# sourceMappingURL=profile.repository.js.map