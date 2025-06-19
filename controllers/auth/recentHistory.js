// src/controllers/auth/recentHistory.js

import RecentView from "../../models/recentVIews.js";
import mongoose from "mongoose";
import axios from "axios";

// OpenAI API 호출을 위한 헬퍼 함수 (백엔드 내부 호출)
const callOpenAiForKeywords = async (prompt) => {
  console.log("Backend: [OpenAI Helper] callOpenAiForKeywords 함수 호출됨.");
  console.log("Backend: [OpenAI Helper] OpenAI 프롬프트:", prompt);
  try {
    const response = await axios.post(
      "http://localhost:3000/api/azure/openai",
      {
        prompt: prompt,
      }
    );

    console.log(
      "Backend: [OpenAI Helper] OpenAI API 응답 수신:",
      response.data
    );

    let generatedKeywords = [];
    if (response.data) {
      let parsedResult = response.data;
      if (typeof response.data === "string") {
        try {
          parsedResult = JSON.parse(response.data);
          console.log("Backend: [OpenAI Helper] OpenAI 응답 JSON 파싱 성공.");
        } catch (parseError) {
          console.warn(
            "Backend: [OpenAI Helper] OpenAI 응답이 유효한 JSON 문자열이 아닙니다. 원시 문자열로 처리 시도.",
            parseError
          );
          generatedKeywords = [response.data.trim()].filter((k) => k !== "");
          return generatedKeywords;
        }
      }

      if (Array.isArray(parsedResult)) {
        generatedKeywords = parsedResult
          .map((k) => String(k).trim())
          .filter((k) => k !== "");
        console.log(
          "Backend: [OpenAI Helper] OpenAI 응답이 배열로 처리됨:",
          generatedKeywords
        );
      } else if (
        typeof parsedResult === "string" &&
        parsedResult.trim() !== ""
      ) {
        generatedKeywords = [parsedResult.trim()];
        console.log(
          "Backend: [OpenAI Helper] OpenAI 응답이 단일 문자열로 처리됨:",
          generatedKeywords
        );
      } else if (typeof parsedResult === "object" && parsedResult !== null) {
        if (
          "category" in parsedResult &&
          typeof parsedResult.category === "string"
        ) {
          generatedKeywords = [parsedResult.category.trim()];
          console.log(
            "Backend: [OpenAI Helper] OpenAI 응답에서 'category' 추출됨:",
            generatedKeywords
          );
        } else if (
          "keyword" in parsedResult &&
          typeof parsedResult.keyword === "string"
        ) {
          generatedKeywords = [parsedResult.keyword.trim()];
          console.log(
            "Backend: [OpenAI Helper] OpenAI 응답에서 'keyword' 추출됨:",
            generatedKeywords
          );
        }
      }
    }
    console.log(
      "Backend: [OpenAI Helper] 최종 생성된 키워드:",
      generatedKeywords
    );
    return generatedKeywords;
  } catch (error) {
    console.error(
      "Backend: [OpenAI Helper] OpenAI 키워드 생성 API 호출 실패 (catch 블록):",
      error.response?.data || error.message
    );
    if (error.response) {
      console.error(
        "Backend: [OpenAI Helper] OpenAI API 응답 상세 (에러):",
        error.response.status,
        error.response.data
      );
    }
    return [];
  }
};

// 1. 최근 본 가게 추가/업데이트 컨트롤러 함수
export const addRecentView = async (req, res) => {
  console.log("\n--- Backend: [addRecentView] 컨트롤러 함수 시작 ---");
  console.log("Backend: [addRecentView] 요청 헤더 전체:", req.headers); // 추가
  console.log(
    "Backend: [addRecentView] req.user 객체 (protect 미들웨어 후):",
    req.user
  ); // 추가
  console.log("Backend: [addRecentView] 요청 바디 (req.body):", req.body); // 유지 (디버깅) // protect 미들웨어 이후 req.user가 설정되었는지 확인 (매우 중요)
  if (!req.user || !req.user.id) {
    console.error(
      "Backend: [addRecentView] req.user 또는 req.user.id가 없어 인증되지 않은 요청입니다. (protect 미들웨어 이후)"
    );
    return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
  }
  const userId = req.user.id; // protect 미들웨어에서 설정된 사용자 ID 사용 // ★★★ thumbnail 대신 photos 배열을 받습니다. ★★★
  const { storeId, keywords, name, photos, rating, address } = req.body;

  console.log(
    "Backend: [addRecentView] protect 미들웨어에서 확인된 userId:",
    userId
  );
  console.log("Backend: [addRecentView] 프론트에서 받은 storeId:", storeId);
  console.log("Backend: [addRecentView] 프론트에서 받은 name:", name);
  console.log("Backend: [addRecentView] 프론트에서 받은 photos:", photos); // 추가

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

    console.log(
      "Backend: [addRecentView] 프론트엔드에서 받은 키워드 (원시):",
      keywords
    );
    let finalKeywords = Array.isArray(keywords)
      ? keywords.map((k) => String(k).trim()).filter((k) => k !== "")
      : [];
    console.log("Backend: [addRecentView] 초기 정제된 키워드:", finalKeywords);

    const foodCategories = [
      "한식",
      "일식",
      "양식",
      "중식",
      "야식",
      "간식",
      "카페/디저트",
    ];
    const hasFoodCategory = finalKeywords.some((k) =>
      foodCategories.includes(k)
    );
    console.log(
      "Backend: [addRecentView] 기존 키워드에 음식 카테고리 포함 여부:",
      hasFoodCategory
    );

    if (finalKeywords.length === 0 || !hasFoodCategory) {
      console.log(
        "Backend: [addRecentView] 키워드가 비어있거나 음식 카테고리가 없어 OpenAI 키워드 생성/보완 시도 중..."
      );
      const openaiPrompt = `
        "${name}"(이)라는 음식점 이름과 해당 음식점의 메뉴(만약 있다면)를 기반으로,
        가장 적절한 음식 유형 카테고리 하나를 JSON 형식의 문자열로 추출해주세요.
        다음 카테고리 중 하나를 선택하세요: "한식", "일식", "양식", "중식", "야식", "간식", "카페/디저트".
        
        **중요:** 만약 명확한 카테고리 분류가 어렵다면, 가게 이름이나 메뉴에서 유추할 수 있는 **구체적인 음식 관련 키워드**를 반환해주세요.
        예: "치킨", "피자", "커피", "족발", "떡볶이" 등.
        최후의 수단으로만 가게 이름을 그대로 반환할 수 있습니다.
        
        결과는 반드시 JSON 형식의 **단일 문자열**로만 출력해야 합니다. JSON 외에는 아무것도 출력하지 마세요.
        예시 1 (카테고리 분류 가능): "한식"
        예시 2 (메뉴/이름에서 유추): "치킨"
        예시 3 (카페/디저트): "카페"
        예시 4 (분류 불가능, 이름 그대로 사용): "김밥천국"
        `;
      const generated = await callOpenAiForKeywords(openaiPrompt);
      console.log(
        "Backend: [addRecentView] OpenAI로부터 생성된 키워드:",
        generated
      );

      if (generated && generated.length > 0) {
        const newKeyword = generated[0];
        if (
          !foodCategories.includes(newKeyword) &&
          !finalKeywords.includes(newKeyword)
        ) {
          finalKeywords.push(newKeyword);
          console.log(
            "Backend: [addRecentView] 새 키워드 추가됨 (카테고리X, 기존X):",
            newKeyword
          );
        } else if (foodCategories.includes(newKeyword) && !hasFoodCategory) {
          finalKeywords.push(newKeyword);
          console.log(
            "Backend: [addRecentView] 새 키워드 추가됨 (카테고리O, 기존X):",
            newKeyword
          );
        } else {
          console.log(
            "Backend: [addRecentView] 생성된 키워드가 이미 포함되거나 적절하지 않아 추가되지 않음."
          );
        }
      } else {
        if (finalKeywords.length === 0) {
          finalKeywords = [name.trim()];
          console.log(
            "Backend: [addRecentView] OpenAI 키워드 생성 실패, 가게 이름을 키워드로 사용:",
            finalKeywords
          );
        } else {
          console.log(
            "Backend: [addRecentView] OpenAI 키워드 생성 실패, 기존 키워드 유지:",
            finalKeywords
          );
        }
      }
    } else {
      console.log(
        "Backend: [addRecentView] 음식 카테고리 키워드가 이미 존재하여 OpenAI 호출을 건너뜁니다:",
        finalKeywords
      );
    }

    finalKeywords = [...new Set(finalKeywords)].filter((k) => k !== "");
    console.log(
      "Backend: [addRecentView] 최종 키워드 (중복 제거 및 빈 문자열 제거 후):",
      finalKeywords
    );

    if (recentView) {
      console.log("Backend: [addRecentView] 기존 최근 기록 업데이트 중...");
      recentView.createdAt = new Date();
      recentView.keywords = finalKeywords;
      recentView.storeName = name;
      recentView.photos = photos || []; // ★★★ thumbnail -> photos로 변경 ★★★
      recentView.rating = rating,
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
        photos: photos || [], // ★★★ thumbnail -> photos로 변경 ★★★
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
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
      error: error.message,
    });
  } finally {
    // console.log("--- Backend: [addRecentView] 컨트롤러 함수 종료 ---"); // 기존 주석 처리 유지
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
        select: "name address photos", // photos를 store 모델에서 가져옴
      });

    const recentStoresData = recentViews
      .filter((item) => item.store)
      .map((item) => ({
        _id: item.store._id,
        name: item.storeName,
        address: item.store.address,
        photos: item.store.photos, // 여기서 item.store.photos를 사용
        keyword: item.keywords,
        rating: item.rating,
        viewedAt: item.createdAt,
        // 이전에 포함되었던 thumbnail, rating 필드는 RecentView 모델에 직접 저장된 값을 사용하거나,
        // 필요하다면 store.rating/store.thumbnail을 populate해서 가져와야 합니다.
        // 현재는 photos 필드에 집중하고 기존 구조 유지합니다.
      }));

    res.status(200).json({ recentViewedStores: recentStoresData });
  } catch (error) {
    res.status(500).json({
      message: "서버 오류로 최근 본 가게 기록을 조회할 수 없습니다.",
      error: error.message,
    });
  } finally {
    // console.log("--- Backend: [getRecentViews] 컨트롤러 함수 종료 ---"); // 기존 주석 처리 유지
  }
};
