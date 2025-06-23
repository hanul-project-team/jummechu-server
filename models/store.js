import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  photos: [
    {
      type: String,
    },
  ],
  phone: {
    type: String,
  },
  description: {
    type: String,
  },
  isExternal: {
    type: Boolean,
    default: true,
  },
  keywords: [
    {
      type: String,
    },
  ],
});
storeSchema.index({ name: 1, address: 1 }, { unique: true });
const Store = mongoose.model("Store", storeSchema);

export default Store;
