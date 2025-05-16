import User from "../../models/user.js";

export const regist = async(req, res) => {
    const { email, password, name, role, profileImage } = req.body
    try {
        const exisUser = await User.findOne({email})
        if(exisUser) {
            return res.status(400).json({
                message:'존재하는 사용자'
            })
        }
        const newUser = new User({
            email,
            password,
            name,
            role,
            profileImage
        })
        await newUser.save()
        res.status(200).json({
            message:'회원가입 성공'
        })
    } catch(e) {
        console.log(e)
    }
}
