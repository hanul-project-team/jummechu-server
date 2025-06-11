// src/models/recentVIews.js
import mongoose from 'mongoose';

const recentViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  storeName: { // 이 필드가 모델에 'storeName'으로 정의되어 있어야 합니다.
    type: String,
    required: true, // 필수 필드인 경우
  },
  keywords: { // keywords 필드도 배열 형태로 정의되어 있어야 합니다.
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RecentView = mongoose.model('RecentView', recentViewSchema);
export default RecentView;
