/**
 * Game Module - Image Upload Utility
 * Handles game image uploads to Cloudinary
 */

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { AppError } from '../../Share/utils/AppError';

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
export const gameImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Upload image buffer to Cloudinary
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = 'games'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
          { quality: 'auto' }, // Auto quality optimization
          { fetch_format: 'auto' } // Auto format selection
        ]
      },
      (error, result) => {
        if (error) {
          reject(new AppError('Failed to upload image to Cloudinary', 500));
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
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    // Don't throw error - deletion failure shouldn't block other operations
  }
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = async (
  buffer: Buffer
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(new AppError('Failed to validate image', 400));
        } else if (result) {
          // Delete the temporary upload
          cloudinary.uploader.destroy(result.public_id).catch(() => {});
          
          const { width, height } = result;
          
          // Check minimum dimensions
          if (width < 200 || height < 200) {
            reject(new AppError('Image dimensions must be at least 200x200 pixels', 400));
          }
          
          // Check maximum dimensions
          if (width > 4000 || height > 4000) {
            reject(new AppError('Image dimensions cannot exceed 4000x4000 pixels', 400));
          }
          
          resolve { width, height });
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};
