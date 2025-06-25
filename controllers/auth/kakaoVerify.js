import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";

export const kakaoVerify = async (req, res) => {
  const { code } = req.body;
  if (!code)
    return res.status(400).json({
      message: "인증 code가 필요합니다.",
    });
  try {
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_KEY,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const { access_token } = tokenRes.data;

    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const kakaoUser = userRes.data;
    const kakaoEmail = kakaoUser.kakao_account.email;
    const kakaoName = kakaoUser.kakao_account.profile.nickname;

    const user = await User.findOne({ email: kakaoEmail });
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };
    if (!user) {
      const newUser = new User({
        email: kakaoEmail,
        name: kakaoName,
        isAccountSetting: false,
      });
      await newUser.save();
      const accessToken = jwt.sign(
        { email: kakaoEmail },
        process.env.ACCESS_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      const refreshToken = jwt.sign(
        { email: kakaoEmail },
        process.env.REFRESH_SECRET_KEY,
        {
          expiresIn: "15d",
        }
      );
      res.cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          isAccountSetting: newUser.isAccountSetting,
        },
        message: "간편가입 성공",
      });
    }
    const accessToken = jwt.sign(
      { email: user.email },
      process.env.ACCESS_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_SECRET_KEY,
      {
        expiresIn: "15d",
      }
    );
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        role: user.role,
        isAccountSetting: user.isAccountSetting,
      },
      message: "로그인 성공",
    });
  } catch (e) {
    console.log(e);
  }
};
