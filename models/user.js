import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["guest", "member", "business", "admin"],
    default: "guest",
  },
  keywords: [
    {
      type: String,
    },
  ],
});

export default UserSchema;
