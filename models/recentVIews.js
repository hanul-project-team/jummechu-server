import mongoose from "mongoose";

const RecentViewSchema = mongoose.Schema({
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

export default RecentViewSchema