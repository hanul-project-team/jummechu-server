import mongoose from "mongoose";

const storeApplicaitonSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  businessNumber: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    enum: ["개인", "법인"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["대기", "승인 대기", "승인", "거부"],
    default: "대기",
    require: true,
  },
});

export default storeApplicaitonSchema;
