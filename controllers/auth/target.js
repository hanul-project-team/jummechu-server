import User from "../../models/user.js";

export const target = async (req, res) => {
  const { email } = req.body;
  const exisUser = await User.findOne({ email });
  if (!exisUser) {
    return res.status(404).json({
      message: "가입된 계정이 아닙니다",
    });
  }
  res.status(200).json({
    message: "가입된 계정입니다",
  });
};
