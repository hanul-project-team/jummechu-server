import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
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
      required: true,
    },
  ],
  phone: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isExternal: {
    type: Boolean,
    default: false,
  },
  keywords: [
    {
      type: String,
    },
  ],
});

export default StoreSchema;
