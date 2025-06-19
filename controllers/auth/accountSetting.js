import User from "../../models/user.js";

export const accountSetting = async (req, res) => {
  const { id } = req.params;
  const { name, phone, service, privacy } = req.body;
  try {
    const exisUser = await User.findOne({ _id: id });
    if (!exisUser) {
      return res.status(404).json({ message: "가입된 계정이 아닙니다" });
    }
    await User.updateOne(
      { _id: id },
      {
        $set: {
          name,
          phone,
          agreement: {
            service,
            privacy,
          },
          isAccountSetting: true,
        },
      }
    );
    res.status(200).json({ message: "계정 설정이 완료되었습니다." });
  } catch(e) {
    console.log(e);
  }
};
