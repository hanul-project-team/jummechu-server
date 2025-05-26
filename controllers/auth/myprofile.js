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