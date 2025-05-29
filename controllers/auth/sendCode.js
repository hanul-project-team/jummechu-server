import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const sendCode = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "전화번호가 필요합니다." });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", process.env.SOLAPI_API_SECRET)
    .update(String(date) + salt)
    .digest("hex");
  const headers = {
    Authorization: `HMAC-SHA256 apiKey=${process.env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
    "Content-Type": "application/json",
  };
  const data = {
    message: {
      to: phone,
      from: process.env.SOLAPI_SENDER,
      text: `[점메추] 인증번호는 [${code}]입니다.`,
      type: "SMS",
    },
  };
  try {
    await axios.post("https://api.solapi.com/messages/v4/send", data, {
      headers,
    });
    const smsVerifyToken = jwt.sign({ code }, process.env.SMS_VERIFY_KEY, {
      expiresIn: "3m",
    });
    res.cookie("sms_verify_token", smsVerifyToken, {
      httpOnly: true,
      maxAge: 3 * 60 * 1000,
    });
    return res.status(200).json({
      message: "인증번호가 발송되었습니다.",
    });
  } catch (e) {
    console.log(e.response.data);
    return res.status(500).json({
      message: "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
};
