// src/controllers/auth/recentHistory.js

import RecentView from "../../models/recentVIews.js";
import mongoose from "mongoose";
import Review from "../../models/review.js";

// 1. 최근 본 가게 추가/업데이트 컨트롤러 함수
export const addRecentView = async (req, res) => {
  if (!req.user || !req.user.id) {
    console.error(
      "Backend: [addRecentView] req.user 또는 req.user.id가 없어 인증되지 않은 요청입니다. (protect 미들웨어 이후)"
    );
    return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
  }
  const userId = req.user.id;
  const { storeId, keywords, name, photos, rating, address } = req.body;

  if (!userId || !storeId || !name || String(name).trim() === "") {
    console.error(
      "Backend: [addRecentView] 유효성 검사 실패: 필수 정보 누락. (userId, storeId, name)"
    );
    return res
      .status(400)
      .json({ message: "사용자 ID, 가게 ID, 가게 이름은 필수입니다." });
  }

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(storeId)
    ) {
      console.error(
        "Backend: [addRecentView] 유효하지 않은 ObjectId 형식의 userId 또는 storeId:",
        { userId, storeId }
      );
      return res
        .status(400)
        .json({ message: "유효하지 않은 사용자 또는 가게 ID 형식입니다." });
    }
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectStoreId = new mongoose.Types.ObjectId(storeId);

    let recentView = await RecentView.findOne({
      user: objectUserId,
      store: objectStoreId,
    });

    let finalKeywords = Array.isArray(keywords)
      ? keywords.map((k) => String(k).trim()).filter((k) => k !== "")
      : [];

    if (recentView) {
      recentView.createdAt = new Date();
      recentView.keywords = finalKeywords;
      recentView.storeName = name;
      recentView.photos = photos || [];
      recentView.rating = rating;
      recentView.address = address || "";
      await recentView.save();
    } else {
      recentView = new RecentView({
        user: objectUserId,
        store: objectStoreId,
        createdAt: new Date(),
        keywords: finalKeywords,
        storeName: name,
        photos: photos || [],
        rating: rating,
        address: address || "",
      });
      await recentView.save();
    }

    const MAX_RECENT_HISTORY = 10;
    const userRecentViewsCount = await RecentView.countDocuments({
      user: objectUserId,
    });

    if (userRecentViewsCount > MAX_RECENT_HISTORY) {
      const limitToDelete = userRecentViewsCount - MAX_RECENT_HISTORY;
      if (limitToDelete > 0) {
        const oldestViews = await RecentView.find({ user: objectUserId })
          .sort({ createdAt: 1 })
          .limit(limitToDelete);

        if (Array.isArray(oldestViews) && oldestViews.length > 0) {
          const oldestViewIds = oldestViews
            .map((view) => view?._id)
            .filter(Boolean);
          if (oldestViewIds.length > 0) {
            await RecentView.deleteMany({ _id: { $in: oldestViewIds } });
          }
        }
      }
    }
    res
      .status(200)
      .json({ message: "최근 본 가게 기록이 업데이트되었습니다.", recentView });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
      error: error.message,
    });
  }
};

export const getRecentViews = async (req, res) => {
  // req.params.id 대신 req.query.userId를 사용합니다.
  const userId = req.query.userId || (req.user ? req.user.id : null); // <-- 이 부분이 수정되었습니다.

  if (!userId) {
    console.error("잘못된 접근입니다.");
    return res.status(400).json({ message: "사용자 ID는 필수입니다." });
  }

  try {
    const recentViews = await RecentView.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "store",
        select: "name address photos keywords",
        model: "Store",
      });

    const filteredRecentViews = recentViews.filter((item) => item.store);

    const storeIds = filteredRecentViews.map((item) => item.store._id);

    const reviews = await Review.find({
      store: { $in: storeIds },
    }).populate("store", "keywords");
    const recentStoresData = filteredRecentViews.map((item) => ({
      _id: item.store._id,
      recentViewId: item._id,
      name: item.store.name || "",
      address: item.store.address || "",
      photos: item.store.photos || [],
      keyword: filteredKeywords(item.store.keywords, item.store.name),
      rating: totalRating(reviews, item.store._id) ?? 0,
      viewedAt: item.createdAt,
    }));
    res.status(200).json({ recentViewedStores: recentStoresData });
  } catch (error) {
    console.error("서버 오류", error.message);
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 조회할 수 없습니다.",
      error: error.message,
    });
  }
};

function totalRating(reviews, id) {
  if (reviews && id) {
    const filteredReviews = reviews.filter(
      (review) => review?.store._id.toString() === id.toString()
    );

    if (filteredReviews.length === 0) {
      return 0;
    }
    const total = filteredReviews.reduce((acc, cts) => {
      return acc + (cts.rating || 0);
    }, 0);

    const avgRating =
      filteredReviews?.length > 0 ? total / filteredReviews.length : 0;
    const rounded = Math.round(avgRating * 10) / 10;

    return rounded;
  } else {
    return 0;
  }
}
function filteredKeywords(keywords, name) {
  if (keywords && name) {
    const keys = keywords[0]?.split(",").map((item) => item.trim()); // keywords[0]가 undefined일 경우 에러 방지
    const filtered = keys.filter((key) => key !== name);
    return filtered;
  } else {
    return null;
  }
}
