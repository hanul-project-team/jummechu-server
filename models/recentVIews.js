// src/models/recentVIews.js

import mongoose from 'mongoose';

const recentViewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 'User' 모델을 참조합니다.
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store', // 'Store' 모델을 참조합니다. (가게 정보 모델 이름에 따라 수정 필요)
        required: true
    },
    storeName: { // 가게 이름 (RecentView 문서에 직접 저장)
        type: String,
        required: true
    },
    keywords: { // 키워드 배열 (RecentView 문서에 직접 저장)
        type: [String],
        default: []
    },
    photos: { // 사진 URL 배열 (RecentView 문서에 직접 저장)
        type: [String],
        default: []
    },
    rating: { // 평점 (RecentView 문서에 직접 저장)
        type: Number,
        default: 0
    },
    address: { // 주소 (RecentView 문서에 직접 저장)
        type: String,
        default: ''
    },
    createdAt: { // 마지막으로 본 시간을 기록 (이 필드로 정렬하여 최신순 유지)
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // Mongoose의 기본 createdAt, updatedAt 사용하지 않음
});

// ★★★ 중요: user와 store의 조합이 고유하도록 복합 인덱스 설정 ★★★
// 이렇게 해야 같은 사용자가 같은 가게를 여러 번 방문해도 중복 기록이 생성되지 않습니다.
recentViewSchema.index({ user: 1, store: 1 }, { unique: true });

const RecentView = mongoose.model('RecentView', recentViewSchema);

export default RecentView;
