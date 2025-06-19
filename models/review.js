import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attachments: [{
    type: String
  }]
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
