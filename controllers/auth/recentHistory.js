// src/routes/recentHistory.js (또는 routes/recentHistory/index.js)
// 이 파일에서는 이제 직접 express.Router()를 사용하지 않습니다.

import RecentView from "../../models/recentVIews.js"; // models 폴더 경로에 맞게 수정
import mongoose from "mongoose"; // ObjectId 사용을 위해 추가

// ★★★ 1. 최근 본 가게 추가/업데이트 컨트롤러 함수 ★★★
export const addRecentView = async (req, res) => {
  // 실제 사용자 ID는 인증 미들웨어를 통해 req.user.id 등으로 가져오는 것이 안전합니다.
  // 여기서는 예시를 위해 임시로 req.body.userId를 사용합니다.
  const userId = req.body.userId; // 실제 로그인된 사용자 ID로 대체 필요
  const { storeId } = req.body;

  if (!userId || !storeId) {
    return res
      .status(400)
      .json({ message: "사용자 ID와 가게 ID는 필수입니다." });
  }

  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectStoreId = new mongoose.Types.ObjectId(storeId);

    let recentView = await RecentView.findOne({
      user: objectUserId,
      store: objectStoreId,
    });

    if (recentView) {
      recentView.createdAt = new Date(); // 기존 기록의 시간 업데이트
      await recentView.save();
    } else {
      recentView = new RecentView({
        user: objectUserId,
        store: objectStoreId,
        createdAt: new Date(),
      });
      await recentView.save();
    }

    // 선택 사항: 최근 기록 개수 제한 (가장 오래된 기록 삭제)
    const MAX_RECENT_HISTORY = 10;
    const userRecentViewsCount = await RecentView.countDocuments({
      user: objectUserId,
    });

    if (userRecentViewsCount > MAX_RECENT_HISTORY) {
      const oldestViews = await RecentView.find({ user: objectUserId })
        .sort({ createdAt: 1 })
        .limit(userRecentViewsCount - MAX_RECENT_HISTORY);

      const oldestViewIds = oldestViews.map((view) => view._id);
      await RecentView.deleteMany({ _id: { $in: oldestViewIds } });
    }

    res
      .status(200)
      .json({ message: "최근 본 가게 기록이 업데이트되었습니다.", recentView });
  } catch (error) {
    console.error("최근 본 가게 기록 업데이트 실패:", error);
    res
      .status(500)
      .json({
        message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
        error: error.message,
      });
  }
};

// ★★★ 2. 최근 본 가게 기록 조회 컨트롤러 함수 ★★★
export const getRecentViews = async (req, res) => {
  // 실제 사용자 ID는 인증 미들웨어를 통해 req.user.id 등으로 가져오는 것이 안전합니다.
  const userId = req.query.userId; // 실제 로그인된 사용자 ID로 대체 필요

  if (!userId) {
    return res.status(400).json({ message: "사용자 ID는 필수입니다." });
  }

  try {
    const recentViews = await RecentView.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("store"); // 'store' 필드를 Store 모델 정보로 채웁니다.

    const recentStoresData = recentViews
      .filter((item) => item.store) // populate가 실패한 경우를 대비하여 유효한 가게 정보만 필터링
      .map((item) => ({
        _id: item.store._id,
        name: item.store.name,
        address: item.store.address,
        thumbnail: item.store.thumbnail,
        viewedAt: item.createdAt,
      }));

    res.status(200).json({ recentViewedStores: recentStoresData });
  } catch (error) {
    console.error("최근 본 가게 기록 조회 실패:", error);
    res
      .status(500)
      .json({
        message: "서버 오류로 최근 본 가게 기록을 조회할 수 없습니다.",
        error: error.message,
      });
  }
};
