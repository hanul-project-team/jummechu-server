import User from "../../models/user.js";
import jwt from "jsonwebtoken";

export const restoreLogin = async(req, res) => {
  let accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;
  let decoded;
  try {
    if (!accessToken) {
      if (!refreshToken) {
        return res.status(401).json({
          message: "토큰 정보가 없습니다, 세션 연결 실패.",
        });
      }
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      accessToken = jwt.sign(
        { email: decoded.email },
        process.env.ACCESS_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
    } else {
      decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY);
    }
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
        role: user.role,
      },
      message: "세션 연결 성공",
    });
  } catch (e) {
    console.log(e);
  }
};
