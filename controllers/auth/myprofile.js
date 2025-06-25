// controllers/auth/myprofile.js
import User from "../../models/user.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const myprofile = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        message: "인증되지 않았거나 사용자 이메일을 찾을 수 없습니다.",
      });
    }

    const user = await User.findOne({ email: req.user.email }).select(
      "-password"
    ); // Exclude password field

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
  console.log("\n--- Backend: [updateProfile] 컨트롤러 실행 시작 ---");
  try {
    const userId = req.user.id;
    const { nickname, email, phone, name } = req.body;
    // console.log(`Backend: [updateProfile] 요청 사용자 ID: ${userId}`);
    // console.log(`Backend: [updateProfile] 수신된 데이터: 닉네임=${nickname}, 이메일=${email}, 전화=${phone}, 이름=${name}`);

    // 1. 유효성 검사
    if (!nickname || nickname.trim() === "") {
      console.warn("Backend: [updateProfile] 닉네임이 비어있습니다.");
      return res.status(400).json({ message: "닉네임은 필수 항목입니다." });
    }
    // 추가적인 유효성 검사를 여기에 추가할 수 있습니다 (예: 이메일 형식, 전화번호 형식)

    // 2. 현재 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      console.error(`Backend: [updateProfile] 사용자를 찾을 수 없습니다. ID: ${userId}`);
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }


    // 4. 닉네임 중복 검사 (본인 닉네임은 제외)
    if (nickname && nickname !== user.nickname) {
      const existingUserWithNickname = await User.findOne({ nickname });
      if (existingUserWithNickname) {
        console.warn(`Backend: [updateProfile] 닉네임 중복 감지: ${nickname}`);
        return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
      }
    }

    // 5. User.findByIdAndUpdate를 사용하여 직접 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickname, phone, name }, // 업데이트할 필드를 객체로 전달
      { new: true, runValidators: true } // 업데이트된 문서를 반환하고 스키마 유효성 검사 실행
    ).select("-password"); // 비밀번호 필드는 제외

    if (!updatedUser) {
        console.error(`Backend: [updateProfile] 사용자 정보 업데이트 후 문서를 찾을 수 없습니다. ID: ${userId}`);
        return res.status(500).json({ message: "프로필 정보 업데이트에 실패했습니다." });
    }


    // 6. 업데이트된 사용자 정보 반환
    return res.status(200).json({
      message: "프로필 정보가 성공적으로 업데이트되었습니다.",
      user: {
        id: updatedUser._id,
        nickname: updatedUser.nickname,
        // email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        name: updatedUser.name,
        role: updatedUser.role, // role 필드가 필요한 경우 포함
      },
    });
  } catch (error) {
    console.error("Backend: [updateProfile] 프로필 정보 업데이트 중 오류 발생:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "이미 사용 중인 이메일 또는 닉네임입니다." });
    }
    return res.status(500).json({ message: "서버 오류로 프로필 정보 업데이트에 실패했습니다." });
  } finally {
    // console.log("--- Backend: [updateProfile] 컨트롤러 실행 종료 ---");
  }
};

export const uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      console.error("Backend: [uploadProfile] 업로드된 파일이 없습니다.");
      return res.status(400).json({ message: "업로드된 파일이 없습니다." });
    }

    const profileImageUrl = `/uploads/profileuploads/${req.file.filename}`;


    const user = await User.findByIdAndUpdate(
      req.user.id, // Current logged-in user ID
      { profileImage: profileImageUrl }, // Update profileImage field in User model
      { new: true } // Return the updated document
    ).select("-password"); // Exclude password from returned user

    if (!user) {
      console.error(
        "Backend: [uploadProfile] 사용자를 찾을 수 없습니다. userId:",
        req.user.id
      );
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }


    res.json({
      message: "프로필 이미지가 성공적으로 변경되었습니다.",
      profileImage: profileImageUrl, // Return updated image URL to client
      user: {
        // Return only necessary user info (exclude sensitive data for security)
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        profileImage: user.profileImage,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(
      "Backend: [uploadProfile] 프로필 이미지 업로드 중 서버 오류:",
      error
    );
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  } finally {
  }
};

export const resetProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId); // Get existing user info to handle physical file deletion
    if (!user) {
      console.error(
        "Backend: [resetProfileImage] 사용자를 찾을 수 없습니다. userId:",
        userId
      );
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const oldProfileImagePath = user.profileImage;


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: "" }, // Set profileImage to an empty string
      { new: true } // Return the updated document
    ).select("-password"); // Exclude password from returned user

    if (!updatedUser) {
      console.error(
        "Backend: [resetProfileImage] 프로필 이미지 업데이트 후 사용자 정보를 찾을 수 없습니다."
      );
      return res
        .status(500)
        .json({ message: "프로필 이미지 업데이트에 실패했습니다." });
    }



    // 2. Delete physical file from server (only if it's an uploaded file)
    if (
      oldProfileImagePath &&
      oldProfileImagePath.startsWith("/uploads/profileuploads/")
    ) {
      const fileName = oldProfileImagePath.split("/uploads/profileuploads/")[1];
      const filePath = path.join(
        __dirname,
        "../../uploads/profileuploads", // New uploads directory relative to this controller
        fileName
      );


      fs.unlink(filePath, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            console.warn(
              "Backend: [resetProfileImage] 기존 프로필 이미지 파일이 서버에 존재하지 않습니다 (이미 삭제되었을 수 있음). 경로:",
              filePath
            );
          } else {
            console.error(
              "Backend: [resetProfileImage] 기존 프로필 이미지 파일 삭제 실패 (권한 문제 등):",
              err.message,
              "오류 코드:",
              err.code
            );
          }
        } else {

        }
      });
    } else {

    }

    return res.status(200).json({
      message: "프로필 이미지가 기본 상태로 변경되었습니다.",
      profileImage: "", // Return empty string to frontend
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        name: updatedUser.name,
        profileImage: updatedUser.profileImage, // Will be ""
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error(
      "Backend: [resetProfileImage] 프로필 이미지 초기화 실패 (catch 블록):",
      error
    );
    return res
      .status(500)
      .json({
        message: "서버 오류로 프로필 이미지 초기화에 실패했습니다.",
        error: error.message,
      });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;



    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "새 비밀번호와 확인 비밀번호를 모두 입력해주세요." });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "새 비밀번호가 일치하지 않습니다." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "새 비밀번호는 최소 6자 이상이어야 합니다." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash new password


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword }, // Directly update password field with hashed value
      { new: true, runValidators: true } // Return updated document, run schema validators
    );

    if (!updatedUser) {

      return res.status(500).json({
        message: "비밀번호 업데이트 후 사용자 정보를 찾을 수 없습니다.",
      });
    }


    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("백엔드 비밀번호 변경 중 서버 오류:", error);
    res.status(500).json({
      message: "비밀번호 변경 중 서버 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is set by authMiddleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 1. Delete user's physical files (e.g., profile image)
    const profileImagePathToDelete = user.profileImage;
    if (
      profileImagePathToDelete &&
      (profileImagePathToDelete.startsWith("/uploads/profileuploads/") ||
        profileImagePathToDelete.startsWith("/uploads/profile/profileuploads/"))
    ) {
      let fileName;
      if (profileImagePathToDelete.startsWith("/uploads/profileuploads/")) {
        fileName = profileImagePathToDelete.split(
          "/uploads/profileuploads/"
        )[1];
      } else if (
        profileImagePathToDelete.startsWith("/uploads/profile/profileuploads/")
      ) {
        fileName = profileImagePathToDelete.split(
          "/uploads/profile/profileuploads/"
        )[1];
      } else {
        console.warn(
          "Backend: [deleteAccount] 알 수 없는 프로필 이미지 경로 형식:",
          profileImagePathToDelete
        );
        fileName = null;
      }

      if (fileName) {
        const filePath = path.join(
          __dirname,
          "../../uploads/profileuploads", // New uploads directory
          fileName
        );


        fs.unlink(filePath, (err) => {
          if (err) {
            if (err.code === "ENOENT") {
              console.warn(
                "Backend: [deleteAccount] 기존 프로필 이미지 파일이 서버에 존재하지 않습니다 (이미 삭제되었을 수 있음). 경로:",
                filePath
              );
            } else {
              console.error(
                "Backend: [deleteAccount] 계정 삭제 시 기존 프로필 이미지 파일 삭제 실패:",
                err
              );
            }
          } else {

          }
        });
      }
    } else {
      // console.log(
      //   "Backend: [deleteAccount] 삭제할 물리적 파일 없음 (업로드된 이미지가 아니거나 기본 이미지). 현재 profileImage 값:",
      //   profileImagePathToDelete
      // );
    }

    // 2. Delete user from database
    await User.deleteOne({ _id: userId });

    // 3. (Optional) Delete related data
    // ... (e.g., reviews, bookmarks) ...

    // 4. Invalidate session/cookie (logout)
    // ...

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
