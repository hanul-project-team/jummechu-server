import RecentView from "../../models/recentVIews.js"; // models 폴더 경로에 맞게 수정
import mongoose from "mongoose"; // ObjectId 사용을 위해 추가

// ★★★ 1. 최근 본 가게 추가/업데이트 컨트롤러 함수 ★★★
export const addRecentView = async (req, res) => {
  // 실제 사용자 ID는 인증 미들웨어를 통해 req.user.id 등으로 가져오는 것이 안전합니다.
  // 여기서는 예시를 위해 임시로 req.body.userId를 사용합니다.
  const userId = req.body.userId; // 실제 로그인된 사용자 ID로 대체 필요
  const { storeId, keywords, name } = req.body; // ★★★ name을 req.body에서 받도록 추가 ★★★

  if (!userId || !storeId || !name) {
    // ★★★ name도 필수 파라미터로 추가 (필요시) ★★★
    return res
      .status(400)
      .json({ message: "사용자 ID, 가게 ID, 가게 이름은 필수입니다." });
  }

  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectStoreId = new mongoose.Types.ObjectId(storeId);

    let recentView = await RecentView.findOne({
      user: objectUserId,
      store: objectStoreId,
    });

    console.log("--- addRecentView 호출됨 ---");
    console.log("받은 userId:", userId);
    console.log("받은 storeId:", storeId);
    console.log("프론트엔드에서 받은 키워드:", keywords); // 프론트엔드에서 받은 키워드 로그
    console.log("프론트엔드에서 받은 이름:", name); // ★★★ 받은 name 로그 추가 ★★★

    if (recentView) {
      recentView.createdAt = new Date(); // 기존 기록의 시간 업데이트
      recentView.keywords = keywords || []; // 프론트엔드에서 받은 keywords로 업데이트
      recentView.name = name; // ★★★ 기존 기록 업데이트 시 name도 업데이트 ★★★
      await recentView.save();
      console.log("addRecentView: 기존 기록 업데이트됨. ID:", recentView._id);
    } else {
      recentView = new RecentView({
        user: objectUserId,
        store: objectStoreId,
        createdAt: new Date(),
        keywords: keywords || [],
        name: name, // ★★★ ReferenceError를 유발했던 placeDetail.name 대신 req.body에서 받은 name 사용 ★★★
      });
      await recentView.save(); // 데이터베이스에 저장
      console.log("addRecentView: 새로운 기록 생성됨. ID:", recentView._id);
    } // 선택 사항: 최근 기록 개수 제한 (가장 오래된 기록 삭제)

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
            console.log(
              `addRecentView: ${oldestViewIds.length}개의 오래된 최근 기록 삭제됨.`
            );
          }
        } else {
          console.log(
            "addRecentView: 삭제할 오래된 기록이 없거나 쿼리 결과가 비정상."
          );
        }
      }
    }

    res
      .status(200)
      .json({ message: "최근 본 가게 기록이 업데이트되었습니다.", recentView });
  } catch (error) {
    console.error("최근 본 가게 기록 업데이트 실패:", error);
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
      error: error.message,
    });
  }
};

// ★★★ 2. 최근 본 가게 기록 조회 컨트롤러 함수 (name 필드 반환 추가) ★★★
export const getRecentViews = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "사용자 ID는 필수입니다." });
  }

  try {
    const recentViews = await RecentView.find({
      user: new mongoose.Types.ObjectId(userId), // 쿼리 조건 수정: user 필드 사용
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "store",
        select: "address thumbnail rating", // name은 RecentView에 직접 저장되므로 store에서 가져올 필요 없음
      });

    const recentStoresData = recentViews
      .filter((item) => item.store) // item.store가 null이 아닌 경우만 필터링
      .map((item) => ({
        _id: item.store._id, // storeId는 item.store._id로 유지
        name: item.name, // ★★★ RecentView 문서에 직접 저장된 name 사용 ★★★
        address: item.store.address,
        thumbnail: item.store.thumbnail,
        rating: item.store.rating,
        keyword: item.keywords, // RecentView 문서에 직접 저장된 keywords 사용
        viewedAt: item.createdAt,
      }));
    res.status(200).json({ recentViewedStores: recentStoresData });
  } catch (error) {
    console.error("최근 본 가게 기록 조회 실패:", error);
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
      error: error.message,
    });
  }
};
