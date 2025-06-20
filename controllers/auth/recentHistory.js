// src/controllers/auth/recentHistory.js

import RecentView from "../../models/recentVIews.js";
import mongoose from "mongoose";
import Review from "../../models/review.js";

// const callOpenAiForKeywords = async (prompt) => {
//   console.log("Backend: [OpenAI Helper] callOpenAiForKeywords 함수 호출됨.");
//   console.log("Backend: [OpenAI Helper] OpenAI 프롬프트:", prompt);
//   try {
//     const response = await axios.post(
//       "http://localhost:3000/api/azure/openai",
//       {
//         prompt: prompt,
//       }
//     );

//     console.log(
//       "Backend: [OpenAI Helper] OpenAI API 응답 수신:",
//       response.data
//     );

//     let generatedKeywords = [];
//     if (response.data) {
//       let parsedResult = response.data;
//       if (typeof response.data === "string") {
//         try {
//           parsedResult = JSON.parse(response.data);
//           console.log("Backend: [OpenAI Helper] OpenAI 응답 JSON 파싱 성공.");
//         } catch (parseError) {
//           console.warn(
//             "Backend: [OpenAI Helper] OpenAI 응답이 유효한 JSON 문자열이 아닙니다. 원시 문자열로 처리 시도.",
//             parseError
//           );
//           generatedKeywords = [response.data.trim()].filter((k) => k !== "");
//           return generatedKeywords;
//         }
//       }

//       if (Array.isArray(parsedResult)) {
//         generatedKeywords = parsedResult
//           .map((k) => String(k).trim())
//           .filter((k) => k !== "");
//         console.log(
//           "Backend: [OpenAI Helper] OpenAI 응답이 배열로 처리됨:",
//           generatedKeywords
//         );
//       } else if (
//         typeof parsedResult === "string" &&
//         parsedResult.trim() !== ""
//       ) {
//         generatedKeywords = [parsedResult.trim()];
//         console.log(
//           "Backend: [OpenAI Helper] OpenAI 응답이 단일 문자열로 처리됨:",
//           generatedKeywords
//         );
//       } else if (typeof parsedResult === "object" && parsedResult !== null) {
//         if (
//           "category" in parsedResult &&
//           typeof parsedResult.category === "string"
//         ) {
//           generatedKeywords = [parsedResult.category.trim()];
//           console.log(
//             "Backend: [OpenAI Helper] OpenAI 응답에서 'category' 추출됨:",
//             generatedKeywords
//           );
//         } else if (
//           "keyword" in parsedResult &&
//           typeof parsedResult.keyword === "string"
//         ) {
//           generatedKeywords = [parsedResult.keyword.trim()];
//           console.log(
//             "Backend: [OpenAI Helper] OpenAI 응답에서 'keyword' 추출됨:",
//             generatedKeywords
//           );
//         }
//       }
//     }
//     console.log(
//       "Backend: [OpenAI Helper] 최종 생성된 키워드:",
//       generatedKeywords
//     );
//     return generatedKeywords;
//   } catch (error) {
//     console.error(
//       "Backend: [OpenAI Helper] OpenAI 키워드 생성 API 호출 실패 (catch 블록):",
//       error.response?.data || error.message
//     );
//     if (error.response) {
//       console.error(
//         "Backend: [OpenAI Helper] OpenAI API 응답 상세 (에러):",
//         error.response.status,
//         error.response.data
//       );
//     }
//     return [];
//   }
// };

// 1. 최근 본 가게 추가/업데이트 컨트롤러 함수
export const addRecentView = async (req, res) => {
  console.log("\n--- Backend: [addRecentView] 컨트롤러 함수 시작 ---");
  console.log("Backend: [addRecentView] 요청 헤더 전체:", req.headers);
  console.log(
    "Backend: [addRecentView] req.user 객체 (protect 미들웨어 후):",
    req.user
  );
  console.log("Backend: [addRecentView] 요청 바디 (req.body):", req.body); // 이 로그를 백엔드 콘솔에서 확인하세요!
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
  console.log("Backend: [addRecentView] 프론트에서 받은 storeId:", storeId);
  console.log("Backend: [addRecentView] 프론트에서 받은 name:", name);
  console.log("Backend: [addRecentView] 프론트에서 받은 photos:", photos);
  console.log("Backend: [addRecentView] 프론트에서 받은 rating:", rating);
  console.log("Backend: [addRecentView] 프론트에서 받은 address:", address);
  console.log("Backend: [addRecentView] 프론트에서 받은 keywords:", keywords);

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
    // ★★★ 이 catch 블록에서 error 객체를 자세히 로깅해야 합니다. ★★★
    console.error(
      "Backend: [addRecentView] 서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다. 상세 에러:",
      error.message // 에러 메시지
    );
    console.error("Backend: [addRecentView] 에러 객체 전체:", error); // 전체 에러 객체 출력 (스택 트레이스 포함)

    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
      error: error.message,
    });
  } finally {
    // console.log("--- Backend: [addRecentView] 컨트롤러 함수 종료 ---");
  }
};

// 2. 최근 본 가게 기록 조회 컨트롤러 함수 (이전과 동일)
export const getRecentViews = async (req, res) => {
  console.log("\n--- Backend: [getRecentViews] 컨트롤러 함수 시작 ---");
  const userId = req.query.userId || (req.user ? req.user.id : null);
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
      });

    const storeIds = recentViews.map((item) => item?.store._id);

    const reviews = await Review.find({
      store: { $in: storeIds },
    }).populate("store", "keywords");
    // console.log(reviews)
    const recentStoresData = recentViews.map((item) => ({
      _id: item.store._id,
      recentViewId: item._id,
      name: item?.store?.name || "",
      address: item.address || item.store.address,
      photos: item.photos || item.store.photos,
      keyword: filteredKeywords(item?.store?.keywords, item?.store?.name),
      rating: totalRating(reviews, item.store._id) ?? 0,
      viewedAt: item.createdAt,
    }));
    // console.log(recentStoresData)
    res.status(200).json({ recentViewedStores: recentStoresData });
  } catch (error) {
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 조회할 수 없습니다.",
      error: error.message,
    });
  } finally {
    // console.log("--- Backend: [getRecentViews] 컨트롤러 함수 종료 ---");
  }
};

function totalRating(reviews, id) {
  if ((reviews, id)) {
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
    const keys = keywords[0]?.split(",").map((item) => item.trim());
    const filtered = keys.filter((key) => key !== name);
    return filtered;
  } else {
    return null;
  }
}
