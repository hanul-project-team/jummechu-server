import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
    default: RandomNickname,
  },
  phone: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["member", "business", "admin"],
    default: "member",
  },
  agreement: {
    service: { type: Boolean, required: true },
    privacy: { type: Boolean, required: true },
    business: { type: Boolean, required: false },
  },
  keywords: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (e) {
    next(e);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
