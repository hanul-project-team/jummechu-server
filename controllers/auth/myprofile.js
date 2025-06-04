// controllers/auth/myprofile.js
import User from "../../models/user.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const myprofile = async (req, res) => {
  try {
    // protect 미들웨어를 통과했다면 req.user에는 인증된 사용자 정보가 있습니다.
    // 여기서는 req.user.email을 사용해야 합니다.
    if (!req.user || !req.user.email) {
      // 여기도 email로 확인
      return res.status(401).json({
        message: "인증되지 않았거나 사용자 이메일을 찾을 수 없습니다.",
      });
    }

    // ★★★ req.user.email을 사용하여 사용자를 찾습니다.
    const user = await User.findOne({ email: req.user.email }).select(
      "-password"
    ); // 비밀번호 필드 제외

    if (user) {
      res.json({
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        phone: user.phone,
        profileImage: user.profileImage,
      });
    } else {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error("서버측 myprofile 조회 오류:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, email, phone } = req.body; // 프론트에서 보낼 데이터

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 유효성 검사 (예시: 실제 서비스에서는 더 복잡한 유효성 검사 필요)
    if (!nickname || nickname.trim() === "") {
      return res.status(400).json({ message: "닉네임은 필수 항목입니다." });
    }
    // 이메일 형식 검사 등 추가 가능

    // 필드 업데이트
    user.nickname = nickname;
    user.email = email;
    user.phone = phone;

    await user.save(); // 변경된 정보 저장

    // 업데이트된 사용자 정보 반환 (보안상 민감 정보는 제외)
    return res.status(200).json({
      message: "프로필 정보가 성공적으로 업데이트되었습니다.",
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage, // 이미지 경로는 그대로 유지
      },
    });
  } catch (error) {
    console.error("프로필 정보 업데이트 실패:", error);
    // MongoDB 유효성 검사 오류 처리 (예: 중복 이메일)
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res
        .status(409)
        .json({ message: "이미 사용 중인 이메일 또는 닉네임입니다." });
    }
    return res
      .status(500)
      .json({ message: "서버 오류로 프로필 정보 업데이트에 실패했습니다." });
  }
};

export const uploadProfile = async (req, res) => {
  try {
    // Multer 미들웨어가 파일을 성공적으로 처리했다면 req.file에 파일 정보가 담깁니다.
    if (!req.file) {
      return res.status(400).json({ message: "업로드된 파일이 없습니다." });
    }

    // `app.js`에서 설정한 정적 파일 제공 경로와 일치해야 합니다.
    // 예: `/uploads/profile/파일명.png`
    const profileImageUrl = `/uploads/profile/${req.file.filename}`;

    // `req.user.id`는 `protect` 미들웨어를 통해 설정된 사용자 ID입니다.
    const user = await User.findByIdAndUpdate(
      req.user.id, // 현재 로그인된 사용자 ID
      { profileImage: profileImageUrl }, // User 모델의 profileImage 필드 업데이트
      { new: true } // 업데이트된 문서 반환
    ).select("-password"); // 비밀번호는 제외하고 반환

    if (!user) {
      // 사용자를 찾을 수 없는 경우 (토큰은 유효했지만 DB에서 사용자가 삭제되었을 경우 등)
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 성공 응답
    res.json({
      message: "프로필 이미지가 성공적으로 변경되었습니다.",
      profileImage: profileImageUrl, // 업데이트된 이미지 URL을 클라이언트에 반환
      user: {
        // 필요한 사용자 정보만 반환 (보안상 민감 정보 제외)
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("프로필 이미지 업로드 중 서버 오류:", error);
  }
};

export const resetProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware에서 설정된 사용자 ID

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const oldProfileImagePath = user.profileImage; // 현재 DB에 저장된 이미지 경로

    // 1. DB에서 profileImage 필드를 빈 문자열로 초기화
    user.profileImage = ""; // ★★★ 빈 문자열로 설정
    await user.save();

    // 2. 서버의 물리적인 파일도 삭제 (선택 사항이지만 권장)
    // 기존 이미지가 있고, 픽섬이나 기본 이미지가 아닐 때만 삭제
    if (oldProfileImagePath && !oldProfileImagePath.startsWith("/static/")) {
      const filePath = path.join(
        __dirname,
        "../../uploads/profile/profileuploads",
        oldProfileImagePath.split("/uploads/profile/")[1]
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(
            "기존 프로필 이미지 파일 삭제 실패 (파일이 없거나 권한 문제):",
            err
          );
          // 파일이 없거나 삭제에 실패해도 DB는 업데이트되었으므로 에러를 반환하지는 않음
        } else {
          console.log("기존 프로필 이미지 파일 삭제 성공:", filePath);
        }
      });
    }

    return res.status(200).json({
      message: "프로필 이미지가 기본 상태로 변경되었습니다.",
      profileImage: "", // 프론트엔드에게 빈 문자열 반환
    });
  } catch (error) {
    console.error("프로필 이미지 초기화 실패:", error);
    return res
      .status(500)
      .json({ message: "서버 오류로 프로필 이미지 초기화에 실패했습니다." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

    console.log("백엔드 changePassword 호출됨. userId:", userId);
    console.log(
      "받은 데이터 - newPassword:",
      newPassword,
      "confirmPassword:",
      confirmPassword
    );

    // 1. 새 비밀번호 유효성 검사
    if (!newPassword || !confirmPassword) {
      console.log("changePassword: 새 비밀번호 또는 확인 비밀번호 누락");
      return res
        .status(400)
        .json({ message: "새 비밀번호와 확인 비밀번호를 모두 입력해주세요." });
    }
    if (newPassword !== confirmPassword) {
      console.log("changePassword: 새 비밀번호와 확인 비밀번호 불일치");
      return res
        .status(400)
        .json({ message: "새 비밀번호가 일치하지 않습니다." });
    }
    if (newPassword.length < 6) {
      console.log("changePassword: 새 비밀번호 길이가 너무 짧음");
      return res
        .status(400)
        .json({ message: "새 비밀번호는 최소 6자 이상이어야 합니다." });
    }

    // 2. 사용자를 데이터베이스에서 찾기
    const user = await User.findById(userId);
    if (!user) {
      console.log("changePassword: 사용자를 찾을 수 없음");
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // ★★★ 3. 새 비밀번호를 해싱 (가장 중요!) ★★★
    const salt = await bcrypt.genSalt(10); // 솔트 생성
    const hashedPassword = await bcrypt.hash(newPassword, salt); // 새 비밀번호 해싱

    console.log("changePassword: 생성된 해시 비밀번호:", hashedPassword); // 해시 값 확인 로그

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword }, // password 필드를 해싱된 값으로 직접 업데이트
      { new: true, runValidators: true } // 업데이트된 문서 반환, 스키마 유효성 검사 실행
    );

    if (!updatedUser) {
      console.log(
        "changePassword: 비밀번호 업데이트 후 사용자 찾을 수 없음 (비정상)"
      );
      return res
        .status(500)
        .json({
          message: "비밀번호 업데이트 후 사용자 정보를 찾을 수 없습니다.",
        });
    }

    console.log(
      "changePassword: 비밀번호 성공적으로 변경됨. DB에 최종 저장된 해시:",
      updatedUser.password
    ); // 업데이트 후 반환된 user의 비밀번호 확인

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("백엔드 비밀번호 변경 중 서버 오류:", error);
    res
      .status(500)
      .json({
        message: "비밀번호 변경 중 서버 오류가 발생했습니다.",
        error: error.message,
      });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware를 통해 req.user에 사용자 ID가 설정되어 있다고 가정

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 1. 사용자 관련 물리적 파일 삭제 (예: 프로필 이미지)
    // 실제 프로젝트에서는 사용자가 업로드한 모든 파일을 삭제하는 로직을 추가해야 합니다.
    // 예를 들어, user.profileImage 필드에 경로가 있다면 해당 파일을 삭제.
    const profileImagePathToDelete = user.profileImage;
    if (
      profileImagePathToDelete &&
      !profileImagePathToDelete.startsWith("/static/")
    ) {
      const filePath = path.join(
        __dirname,
        "../../uploads/profile/profileuploads",
        profileImagePathToDelete.split("/uploads/profile/")[1]
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("계정 삭제 시 기존 프로필 이미지 파일 삭제 실패:", err);
        } else {
          console.log("계정 삭제 시 프로필 이미지 파일 삭제 성공:", filePath);
        }
      });
    }
    // 다른 업로드된 파일 (리뷰 사진 등)도 있다면 여기서 모두 삭제 로직을 추가해야 합니다.

    // 2. 데이터베이스에서 사용자 삭제
    await User.deleteOne({ _id: userId }); // 또는 findByIdAndDelete(userId);

    // 3. (선택 사항) 관련 데이터 삭제
    // 사용자와 연관된 다른 데이터 (예: 리뷰, 찜 목록 등)도 함께 삭제해야 할 수 있습니다.
    // 예: await Review.deleteMany({ userId: userId });
    // 예: await Bookmark.deleteMany({ userId: userId });
    // 이 부분은 데이터베이스 스키마와 관계에 따라 달라집니다.

    // 4. 세션/쿠키 무효화 (로그아웃 처리)
    // Express-session이나 Passport.js 등을 사용한다면, 여기서 세션을 파괴합니다.
    // JWT를 사용한다면, 클라이언트 측에서 토큰을 삭제하도록 지시합니다.
    // 여기서는 클라이언트에게 성공 메시지를 보내고, 클라이언트에서 로컬 스토리지/쿠키를 지우도록 합니다.

    return res
      .status(200)
      .json({ message: "계정이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("계정 삭제 실패:", error);
    return res
      .status(500)
      .json({ message: "서버 오류로 계정 삭제에 실패했습니다." });
  }
};
