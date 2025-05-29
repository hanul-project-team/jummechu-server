import jwt from "jsonwebtoken";

export const verifyResetToken = (req, res) => {
  const { resetToken } = req.body;
  if (!resetToken) {
    return res.status(400).json({
      message: "토큰이 필요합니다.",
    });
  }
  try {
    const decoded = jwt.verify(resetToken, process.env.RESET_SECRET_KEY);
    return res.status(200).json({
      message: "유효한 토큰입니다.",
    });
  } catch {
    return res.status(401).json({
      message: "유효하지 않거나 만료된 토큰입니다.",
    });
  }
};
