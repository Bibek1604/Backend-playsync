import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const makeStorage = (subfolder: string) =>
  multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      const dir = path.join(__dirname, "../../../uploads", subfolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

export const avatarUpload = multer({
  storage: makeStorage("avatars"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const coverUpload = multer({
  storage: makeStorage("covers"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

export const picturesUpload = multer({
  storage: makeStorage("pictures"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});
