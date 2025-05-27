import User from "../../models/user.js";
import jwt from 'jsonwebtoken'

export const findAccount = async (req, res) => {
  const { name, phone, code } = req.body;
  if (!code) {
    return res.status(400).json({
      message: "인증 코드가 필요합니다.",
    });
  }
  const smsVerifyToken = req.cookies.sms_verify_token;
  if (!smsVerifyToken) {
    return res.status(400).json({
      message: "인증이 필요합니다.",
    });
  }
  try {
    const decoded = jwt.verify(smsVerifyToken, process.env.SMS_VERIFY_KEY);
    const savedCode = decoded.code;

    if (code !== savedCode) {
      return res.status(400).json({
        message: "인증 코드가 일치하지 않습니다.",
      });
    }
    const user = await User.findOne({ name, phone });
    if (!user) {
      return res.status(200).json({
        userFound: false,
        user: {
          name: "",
          email: "",
          createdAt: "",
        },
        message: "존재하지 않는 사용자입니다.",
      });
    }
    res.status(200).json({
      userFound: true,
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: "입력하신 정보와 일치하는 계정을 찾았습니다.",
    });
  } catch (e) {
    console.log(e);
  }
};
