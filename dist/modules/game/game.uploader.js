"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageDimensions = exports.deleteFromCloudinary = exports.uploadToCloudinary = exports.gameImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new AppError_1.default('Invalid file type. Only jpg, png, and webp images are allowed', 415), false);
    }
};
exports.gameImageUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
const uploadToCloudinary = (buffer, folder = 'games') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                reject(new AppError_1.default('Failed to upload image to Cloudinary', 500));
            }
            else if (result) {
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        });
        const readableStream = new stream_1.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
const validateImageDimensions = async (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
                reject(new AppError_1.default('Failed to validate image', 400));
            }
            else if (result) {
                cloudinary_1.v2.uploader.destroy(result.public_id).catch(() => { });
                const { width, height } = result;
                if (width < 200 || height < 200) {
                    reject(new AppError_1.default('Image dimensions must be at least 200x200 pixels', 400));
                }
                if (width > 4000 || height > 4000) {
                    reject(new AppError_1.default('Image dimensions cannot exceed 4000x4000 pixels', 400));
                }
                resolve({ width, height });
            }
        });
        const readableStream = new stream_1.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.validateImageDimensions = validateImageDimensions;
//# sourceMappingURL=game.uploader.js.map