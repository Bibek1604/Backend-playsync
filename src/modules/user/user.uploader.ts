/**
 * User Module - Avatar Upload Utility
 * Handles user avatar uploads to Cloudinary
 */

import multer from 'multer';
import cloudinary from '../../Share/config/cloudinary';
import { Readable } from 'stream';
import AppError from '../../Share/utils/AppError';

// Multer configuration - store in memory for cloudinary upload
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only jpg, png, and webp images are allowed', 415) as any, false);
  }
};

// Export multer upload middleware
export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
  }
});

/**
 * Upload avatar buffer to Cloudinary
 */
export const uploadAvatarToCloudinary = (
  buffer: Buffer,
  userId: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: `avatar_${userId}`,
        resource_type: 'image',
        overwrite: true, // Overwrite previous avatar
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focused on face
          { quality: 'auto' }, // Auto quality optimization
          { fetch_format: 'auto' } // Auto format selection (webp for modern browsers)
        ]
      },
      (error, result) => {
        if (error) {
          reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete avatar from Cloudinary
 */
export const deleteAvatarFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error('Error deleting avatar from Cloudinary:', error.message);
    // Don't throw - deleting old avatar failure shouldn't break profile update
  }
};
