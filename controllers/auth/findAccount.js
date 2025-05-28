import User from "../../models/user.js";

export const findAccount = async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findOne({ name, phone });
    if (!user) {
      return res.status(200).json({
        userFound: false,
        user: {
          name: "",
          email: "",
          createdAt: "",
        },
        message: "존재하지 않는 사용자입니다.",
      });
    }
    res.status(200).json({
      userFound: true,
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: "입력하신 정보와 일치하는 계정을 찾았습니다.",
    });
  } catch (e) {
    console.log(e);
  }
};
