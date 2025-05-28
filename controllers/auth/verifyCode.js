import jwt from "jsonwebtoken";

export const verifyCode = (req, res) => {
  const { code } = req.body;
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
    res.status(200).json({
      message: "인증에 성공하였습니다.",
    });
  } catch {
    return res.status(401).json({
      message: "유효하지 않거나 만료된 인증 토큰입니다.",
    });
  }
};
