"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.picturesUpload = exports.coverUpload = exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../../Share/config/cloudinary"));
const avatarStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        return {
            folder: "playsync/avatars",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});
const coverStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        return {
            folder: "playsync/covers",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});
const picturesStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        return {
            folder: "playsync/pictures",
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});
exports.avatarUpload = (0, multer_1.default)({ storage: avatarStorage });
exports.coverUpload = (0, multer_1.default)({ storage: coverStorage });
exports.picturesUpload = (0, multer_1.default)({ storage: picturesStorage });
//# sourceMappingURL=profile.uploader.js.map