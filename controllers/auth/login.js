import User from "../../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message:
          "이메일 또는 비밀번호가 잘못 되었습니다. 이메일과 비밀번호를 정확히 입력해 주세요.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message:
          "이메일 또는 비밀번호가 잘못 되었습니다. 이메일과 비밀번호를 정확히 입력해 주세요.",
      });
    }
    const accessToken = jwt.sign({ email }, process.env.ACCESS_SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET_KEY, {
      expiresIn: "30d",
    });
    res.cookie("access-token", accessToken,{
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });
    res.status(200).json({
      message: "로그인 성공",
    });
  } catch (e) {
    console.log(e);
  }
};
