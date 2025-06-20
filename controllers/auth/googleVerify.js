import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export const googleVerify = async (req, res) => {
  const { token } = req.body;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res
        .status(401)
        .json({ message: "토큰 payload가 유효하지 않습니다." });
    }
    const user = await User.findOne({ email: payload.email });
    if (user) {
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
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
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
    } else {
      const newUser = new User({
        email: payload.email,
        name: payload.name,
        profileImage: payload.picture,
        isAccountSetting: false,
      });
      await newUser.save();
      res.status(200).json({
        isAuthenticated: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          profileImage: newUser.profileImage,
          role: newUser.role,
          isAccountSetting: newUser.isAccountSetting,
        },
        message: "간편가입 성공",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
