import User from "../../models/user.js";





export const regist = async (req, res) => {
  const { email, password, name, phone, role, service, privacy, business, } =
    req.body;

    const RandomNickname = () => {
           const second = ["배고픈", "심심한", "말이많은"]
           const last = ["강아지", "고양이", "호랑이", "상어", "비버", "족제비", "곰", "직장인"]

           const secondIndex = Math.floor(Math.random() * second.length);
           const lastIndex = Math.floor(Math.random() * last.length);

           return `${second[secondIndex]}${last[lastIndex]}`;
       };


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
            nickname: RandomNickname() ,
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
