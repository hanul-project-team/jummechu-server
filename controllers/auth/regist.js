import User from "../../models/user.js";





export const regist = async (req, res) => {
  const { email, password, name, phone, role, service, privacy, business, } =
    req.body;

    const RandomNickname = () => {
           const first = ["치킨을", "피자를", "짬뽕을", "족발을", "국밥을", "돈까스", "디저트를"]
           const second = ["먹고싶은", "먹고있는", "좋아하는"]
           const third = ["배고픈", "행복한", "심심한", "졸린", "굶주린", "화난", "야근하는", "잔업중인"]
           const last = ["강아지", "고양이", "호랑이", "상어", "비버", "족제비", "곰", "직장인"]
   
           const firstIndex = Math.floor(Math.random() * first.length);
           const secondIndex = Math.floor(Math.random() * second.length);
           const thirdIndex = Math.floor(Math.random() * third.length);
           const lastIndex = Math.floor(Math.random() * last.length);
   
           return `${first[firstIndex]} ${second[secondIndex]} ${third[thirdIndex]} ${last[lastIndex]}`;  
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
