import User from "../../models/user.js";

export const regist = async (req, res) => {
  const { email, password, name, phone, role, service, privacy, business } =
    req.body;
  try {
    const exisUser = await User.findOne({ email });
    if (exisUser) {
      return res.status(400).json({
        message: "사용 중인 이메일 입니다",
      });
    }
    const newUser = new User({
      email,
      password,
      phone,
      name,
      role,
      agreement: { service, privacy, business },
      isAccountSetting: true
    });
    await newUser.save();
    res.status(200).json({
      message: "회원가입 성공",
    });
  } catch (e) {
    console.log(e);
  }
};
