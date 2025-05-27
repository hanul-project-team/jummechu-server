// controllers/auth/myprofile.js
import User from "../../models/user.js";

export const myprofile = async (req, res) => {
  try {
    // protect 미들웨어를 통과했다면 req.user에는 인증된 사용자 정보가 있습니다.
    // 여기서는 req.user.email을 사용해야 합니다.
    if (!req.user || !req.user.email) { // 여기도 email로 확인
      return res.status(401).json({ message: "인증되지 않았거나 사용자 이메일을 찾을 수 없습니다." });
    }

    // ★★★ req.user.email을 사용하여 사용자를 찾습니다.
    const user = await User.findOne({ email: req.user.email }).select("-password"); // 비밀번호 필드 제외

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
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};

export const uploadProfile = async (req, res) => {
  try {
    // Multer 미들웨어가 파일을 성공적으로 처리했다면 req.file에 파일 정보가 담깁니다.
    if (!req.file) {
      return res.status(400).json({ message: '업로드된 파일이 없습니다.' });
    }

    // `app.js`에서 설정한 정적 파일 제공 경로와 일치해야 합니다.
    // 예: `/uploads/profile/파일명.png`
    const profileImageUrl = `/uploads/profile/${req.file.filename}`;

    // `req.user.id`는 `protect` 미들웨어를 통해 설정된 사용자 ID입니다.
    const user = await User.findByIdAndUpdate(
      req.user.id, // 현재 로그인된 사용자 ID
      { profileImage: profileImageUrl }, // User 모델의 profileImage 필드 업데이트
      { new: true } // 업데이트된 문서 반환
    ).select('-password'); // 비밀번호는 제외하고 반환

    if (!user) {
      // 사용자를 찾을 수 없는 경우 (토큰은 유효했지만 DB에서 사용자가 삭제되었을 경우 등)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 성공 응답
    res.json({
      message: '프로필 이미지가 성공적으로 변경되었습니다.',
      profileImage: profileImageUrl, // 업데이트된 이미지 URL을 클라이언트에 반환
      user: { // 필요한 사용자 정보만 반환 (보안상 민감 정보 제외)
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('프로필 이미지 업로드 중 서버 오류:', error);}
  }