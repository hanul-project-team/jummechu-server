import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
},
  store: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Store" 
},
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
},
  comment: { 
    type: String 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
},
});

export default ReviewSchema;
