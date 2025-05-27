import axios from "axios";
import jwt from 'jsonwebtoken'

export const sendCode = async (req, res) => {
  const { phone } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  if (!phone) {
    return res.status(400).json({ message: "전화번호가 필요합니다." });
  }
  try {
    await axios.post("https://apis.aligo.in/send/", null, {
      params: {
        key: process.env.ALIGO_API_KEY,
        user_id: process.env.ALIGO_USER_ID,
        sender: process.env.ALIGO_SENDER,
        receiver: phone,
        msg: `[점메추] 인증번호는 [${code}]입니다.`,
        testmode_yn: "N", // 실제 문자 전송: 'N'
      },
    });
    return res.status(200).json({
      message: "인증번호가 발송되었습니다.",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
};
