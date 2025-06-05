import mongoose from "mongoose";

const recentViewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  keywords: [
    {
      type: String,
    }],
    name: [{
      type: String,
      required: true, // 가게 이름은 필수라고 가정합니다.
    },
  ],
});

const RecentView = mongoose.model("RecentView", recentViewSchema);

export default RecentView