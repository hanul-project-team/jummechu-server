import mongoose from "mongoose";

const storeImgSchema = mongoose.Schema({
  keyword: {
    type: String,
  },
  url: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StoreImg = mongoose.model("StoreImg", storeImgSchema);

export default StoreImg