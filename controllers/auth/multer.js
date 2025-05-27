// D:/team-project/jummechu-server/controllers/auth/multer.js

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = path.join(__dirname, "../../profileuploads"); 
    console.log("Multer가 파일을 저장하려는 경로:", targetPath);
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    const userId =
      req.user && req.user.id ? req.user.id : `anonymous-${Date.now()}`;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "허용되지 않는 파일 형식입니다. PNG, JPEG, GIF, WebP만 가능합니다."
        ),
        false
      );
    }
  },
}).single("profileImage");
