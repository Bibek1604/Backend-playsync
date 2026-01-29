import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../Share/config/cloudinary";

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "playsync/avatars",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "playsync/covers",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const picturesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "playsync/pictures",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

export const avatarUpload = multer({ storage: avatarStorage });
export const coverUpload = multer({ storage: coverStorage });
export const picturesUpload = multer({ storage: picturesStorage });

