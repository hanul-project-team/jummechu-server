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
});

const RecentView = mongoose.model("RecentView", recentViewSchema);

export default RecentView