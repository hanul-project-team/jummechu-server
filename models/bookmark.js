import mongoose from "mongoose";

const bookmarkSchema = mongoose.Schema({
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

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
