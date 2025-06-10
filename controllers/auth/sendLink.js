import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";

export const sendLink = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }
    const resetToken = jwt.sign({ email }, process.env.RESET_SECRET_KEY, {
      expiresIn: "10m",
    });
    const resetLink = `http://localhost:5173/find_account/reset?token=${resetToken}`;

    await axios.post(
      `https://email.api.nhncloudservice.com/email/v2.1/appKeys/${process.env.NHN_APP_KEY}/sender/mail`,
      {
        templateId: process.env.NHN_TEMPLATE_ID,
        templateParameter: {
          username: user.name,
          link: resetLink,
        },
        receiverList: [
          {
            receiveMailAddr: email,
            receiveName: user.name,
            receiveType: "MRT0",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "X-Secret-Key": process.env.NHN_SECRET_KEY,
        },
      }
    );
    res.status(200).json({
      message: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
    });
  } catch (e) {
    console.log(e);
  }
};
