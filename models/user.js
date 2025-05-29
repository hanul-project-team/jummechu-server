import mongoose from "mongoose";
import bcrypt from "bcrypt";



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
    unique: true,
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

http://localhost3000/사진이름. jpg

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
