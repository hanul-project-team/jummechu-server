// D:/team-project/jummechu-server/controllers/auth/multer.js

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // fs 모듈 임포트 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ★★★ 이 부분을 수정합니다: '../../uploads/profileuploads' ★★★
    // 이 Multer 파일의 위치 (controllers/auth)를 기준으로 'uploads/profileuploads' 폴더는
    // 'jummechu-server/uploads/profileuploads'에 위치하게 됩니다.
    const targetPath = path.join(__dirname, "../../uploads/profileuploads"); 
    console.log("Multer: 파일 저장 시도 경로:", targetPath); // Multer가 어떤 경로를 찾는지 확인하는 로그

    // 디렉토리가 존재하는지 확인하고, 없으면 생성합니다.
    fs.mkdir(targetPath, { recursive: true }, (err) => {
        if (err) {
            console.error("Multer: 디렉토리 생성 실패:", err);
            return cb(err); // 디렉토리 생성 실패 시 에러를 콜백으로 전달
        }
        cb(null, targetPath); // 디렉토리 생성 성공 또는 이미 존재하면 콜백으로 경로 전달
    });
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
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
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
