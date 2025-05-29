import User from "../../models/user.js";
import jwt from "jsonwebtoken";

export const resetPassword = async (req, res) => {
  const { password, resetToken } = req.body;
  if (!resetToken) {
    return res.status(400).json({
      message:
        "유효하지 않은 요청입니다. 비밀번호 재설정을 다시 시도해 주세요.",
    });
  }
  try {
    const decoded = jwt.verify(resetToken, process.env.RESET_SECRET_KEY);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        message: "계정을 찾을 수 없습니다. 링크가 올바른지 확인해 주세요.",
      });
    }
    user.password = password;
    await user.save();
    return res.status(200).json({
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch {
    return res.status(401).json({
      message:
        "이 링크는 더 이상 유효하지 않습니다. 비밀번호 재설정을 다시 요청해 주세요.",
    });
  }
};
