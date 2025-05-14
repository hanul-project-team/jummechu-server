import mongoose from "mongoose";

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
  profileImage: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["member", "business", "admin"],
    default: "member",
  },
  keywords: [
    {
      type: String,
    },
  ],
});

const User = mongoose.Model("User", userSchema)

export default User;
