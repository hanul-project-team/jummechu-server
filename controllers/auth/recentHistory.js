// src/controllers/auth/recentHistory.js

import RecentView from "../../models/recentVIews.js";
import mongoose from "mongoose";
import Review from "../../models/review.js";

// 1. 최근 본 가게 추가/업데이트 컨트롤러 함수
export const addRecentView = async (req, res) => {
  console.log("\n--- Backend: [addRecentView] 컨트롤러 함수 시작 ---");
  console.log("Backend: [addRecentView] 요청 헤더 전체:", req.headers);
  console.log(
    "Backend: [addRecentView] req.user 객체 (protect 미들웨어 후):",
    req.user
  );
  console.log("Backend: [addRecentView] 요청 바디 (req.body):", req.body);
  if (!req.user || !req.user.id) {
    console.error(
      "Backend: [addRecentView] req.user 또는 req.user.id가 없어 인증되지 않은 요청입니다. (protect 미들웨어 이후)"
    );
    return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
  }
  const userId = req.user.id;
  const { storeId, keywords, name, photos, rating, address } = req.body;

  console.log(
    "Backend: [addRecentView] protect 미들웨어에서 확인된 userId:",
    userId
  );

  if (!userId || !storeId || !name || String(name).trim() === "") {
    console.log(
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
    console.log("Backend: [addRecentView] MongoDB ObjectId 변환 완료.");

    console.log("Backend: [addRecentView] 기존 최근 기록 검색 중...");
    let recentView = await RecentView.findOne({
      user: objectUserId,
      store: objectStoreId,
    });
    console.log(
      "Backend: [addRecentView] RecentView.findOne 결과:",
      recentView ? "기존 기록 찾음" : "새로운 기록 없음"
    );

    let finalKeywords = Array.isArray(keywords)
      ? keywords.map((k) => String(k).trim()).filter((k) => k !== "")
      : [];
    console.log(
      "Backend: [addRecentView] 최종 키워드 (프론트에서 수신):",
      finalKeywords
    );

    if (recentView) {
      console.log("Backend: [addRecentView] 기존 최근 기록 업데이트 중...");
      recentView.createdAt = new Date();
      recentView.keywords = finalKeywords;
      recentView.storeName = name;
      recentView.photos = photos || [];
      recentView.rating = rating;
      recentView.address = address || "";
      await recentView.save();
      console.log(
        "Backend: [addRecentView] 기존 기록 업데이트됨. ID:",
        recentView._id
      );
    } else {
      console.log("Backend: [addRecentView] 새로운 최근 기록 생성 중...");
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
      console.log(
        "Backend: [addRecentView] 새로운 기록 생성됨. ID:",
        recentView._id
      );
    }

    const MAX_RECENT_HISTORY = 10;
    const userRecentViewsCount = await RecentView.countDocuments({
      user: objectUserId,
    });
    console.log(
      "Backend: [addRecentView] 현재 사용자 최근 기록 개수:",
      userRecentViewsCount
    );

    if (userRecentViewsCount > MAX_RECENT_HISTORY) {
      const limitToDelete = userRecentViewsCount - MAX_RECENT_HISTORY;
      console.log(
        `Backend: [addRecentView] 삭제할 오래된 기록 개수: ${limitToDelete}`
      );
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
            console.log(
              `Backend: [addRecentView] ${oldestViewIds.length}개의 오래된 최근 기록 삭제됨.`
            );
          }
        } else {
          console.log(
            "Backend: [addRecentView] 삭제할 오래된 기록이 없거나 쿼리 결과가 비정상."
          );
        }
      }
    }
    res
      .status(200)
      .json({ message: "최근 본 가게 기록이 업데이트되었습니다.", recentView });
  } catch (error) {
    console.error(
      "Backend: [addRecentView] 서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다. 상세 에러:",
      error.message
    );
    console.error("Backend: [addRecentView] 에러 객체 전체:", error);

    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
      error: error.message,
    });
  } finally {
    // console.log("--- Backend: [addRecentView] 컨트롤러 함수 종료 ---");
  }
};

// 2. 최근 본 가게 기록 조회 컨트롤러 함수
export const getRecentViews = async (req, res) => {
  // req.params.id 대신 req.query.userId를 사용합니다.
  const userId = req.query.userId || (req.user ? req.user.id : null); // <-- 이 부분이 수정되었습니다.
  console.log("Backend: [getRecentViews] 조회할 userId:", userId);

  if (!userId) {
    console.error(
      "Backend: [getRecentViews] 사용자 ID가 없어 최근 기록을 조회할 수 없습니다."
    );
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
        // 'Store'는 Store 모델의 실제 이름이어야 합니다.
        // 예시: import Store from '../../models/Store.js';
        model: 'Store' // <-- Store 모델을 명시적으로 지정. 해당 모델 임포트 필요!
      });

    // populate된 store 객체가 null이거나 undefined인 경우를 방지합니다.
    const filteredRecentViews = recentViews.filter(item => item.store);

    const storeIds = filteredRecentViews.map((item) => item.store._id);

    const reviews = await Review.find({
      store: { $in: storeIds },
    }).populate("store", "keywords");
   
    const recentStoresData = filteredRecentViews.map((item) => ({
      _id: item.store._id,
      recentViewId: item._id,
      name: item.store.name || "", // <-- 선택적 연결 제거, 이미 필터링됨
      address: item.store.address || "", // <-- 선택적 연결 제거, 이미 필터링됨
      photos: item.store.photos || [], // <-- 선택적 연결 제거, 이미 필터링됨
      keyword: filteredKeywords(item.store.keywords, item.store.name), // <-- 선택적 연결 제거, 이미 필터링됨
      rating: totalRating(reviews, item.store._id) ?? 0,
      viewedAt: item.createdAt,
    }));
   
    res.status(200).json({ recentViewedStores: recentStoresData });
  } catch (error) {
    console.error("Backend: [getRecentViews] 서버 오류로 최근 본 가게 기록을 조회할 수 없습니다. 상세 에러:", error.message);
    console.error("Backend: [getRecentViews] 에러 객체 전체:", error);
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 조회할 수 없습니다.",
      error: error.message,
    });
  } finally {
    // console.log("--- Backend: [getRecentViews] 컨트롤러 함수 종료 ---");
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
