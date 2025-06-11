// src/routes/recentHistory.js

import RecentView from "../../models/recentVIews.js";
import mongoose from "mongoose";
import axios from 'axios'; // axios 임포트 추가

// OpenAI API 호출을 위한 헬퍼 함수 (백엔드 내부 호출)
const callOpenAiForKeywords = async (prompt) => {
    try {
        const response = await axios.post('http://localhost:3000/api/azure/openai', {
            prompt: prompt,
        });

        let generatedKeywords = [];
        if (response.data) {
            let parsedResult = response.data;
            if (typeof response.data === 'string') {
                try {
                    parsedResult = JSON.parse(response.data);
                } catch (parseError) {
                    console.warn("Backend: OpenAI 응답이 유효한 JSON 문자열이 아닙니다. 원시 문자열로 처리 시도.", parseError);
                    generatedKeywords = [response.data.trim()].filter(k => k !== '');
                    return generatedKeywords;
                }
            }
            
            if (Array.isArray(parsedResult)) {
                generatedKeywords = parsedResult.map(k => String(k).trim()).filter(k => k !== '');
            } else if (typeof parsedResult === 'string' && parsedResult.trim() !== '') {
                generatedKeywords = [parsedResult.trim()];
            } else if (typeof parsedResult === 'object' && parsedResult !== null) {
                if ('category' in parsedResult && typeof parsedResult.category === 'string') {
                    generatedKeywords = [parsedResult.category.trim()];
                } else if ('keyword' in parsedResult && typeof parsedResult.keyword === 'string') {
                    generatedKeywords = [parsedResult.keyword.trim()];
                }
            }
        }
        return generatedKeywords;
    } catch (error) {
        console.error("Backend: OpenAI 키워드 생성 API 호출 실패:", error.response?.data || error.message);
        return [];
    }
};


// 1. 최근 본 가게 추가/업데이트 컨트롤러 함수
export const addRecentView = async (req, res) => {
    const userId = req.body.userId;
    const { storeId, keywords, name } = req.body; 

    if (!userId || !storeId || !name || String(name).trim() === '') { 
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

        console.log("--- addRecentView 호출됨 (백엔드) ---");
        console.log("받은 userId:", userId);
        console.log("받은 storeId:", storeId);
        console.log("받은 name (프론트엔드에서 받은 이름):", name);
        console.log("프론트엔드에서 받은 키워드 (원시):", keywords);

        let finalKeywords = Array.isArray(keywords) ? keywords.map(k => String(k).trim()).filter(k => k !== '') : [];

        const foodCategories = ["한식", "일식", "양식", "중식", "야식", "간식", "카페/디저트"];
        const hasFoodCategory = finalKeywords.some(k => foodCategories.includes(k));

        // 프론트엔드에서 키워드가 비어있거나, 음식 카테고리가 포함되어 있지 않을 경우에만 OpenAI를 사용하여 키워드 생성
        if (finalKeywords.length === 0 || !hasFoodCategory) {
            console.log("키워드가 비어있거나 음식 카테고리가 없어 OpenAI 키워드 생성/보완 시도 중...");
            const openaiPrompt = `
                "${name}"(이)라는 음식점 이름과 해당 음식점의 메뉴(만약 있다면)를 기반으로,
                가장 적절한 음식 유형 카테고리 하나를 JSON 형식의 문자열로 추출해주세요.
                다음 카테고리 중 하나를 선택하세요: "한식", "일식", "양식", "중식", "야식", "간식", "카페/디저트".
                
                **중요:** 만약 명확한 카테고리 분류가 어렵다면, 가게 이름이나 메뉴에서 유추할 수 있는 **구체적인 음식 관련 키워드**를 반환해주세요.
                예: "치킨", "피자", "커피", "족발", "떡볶이" 등.
                최후의 수단으로만 가게 이름을 그대로 반환할 수 있습니다.
                
                **절대 "음식점", "가게", "맛집"과 같은 일반적인 단어는 키워드로 사용하지 마세요.**
                
                결과는 반드시 JSON 형식의 **단일 문자열**로만 출력해야 합니다. JSON 외에는 아무것도 출력하지 마세요.
                예시 1 (카테고리 분류 가능): "한식"
                예시 2 (메뉴/이름에서 유추): "치킨"
                예시 3 (카페/디저트): "카페"
                예시 4 (분류 불가능, 이름 그대로 사용): "김밥천국"
            `;
            const generated = await callOpenAiForKeywords(openaiPrompt);
            
            if (generated && generated.length > 0) {
                const newKeyword = generated[0];
                if (!foodCategories.includes(newKeyword) && !finalKeywords.includes(newKeyword)) {
                    // 새로 생성된 키워드가 카테고리도 아니고, 기존 키워드에도 없으면 추가
                    finalKeywords.push(newKeyword);
                } else if (foodCategories.includes(newKeyword) && !hasFoodCategory) {
                    // 새로 생성된 키워드가 카테고리이고, 기존 키워드에 카테고리가 없으면 추가
                    finalKeywords.push(newKeyword);
                }
                 // 이미 카테고리가 있거나 새로 생성된 키워드가 기존 키워드에 포함되어 있으면 추가하지 않음
                console.log("OpenAI로 생성/보완된 키워드:", finalKeywords);
            } else {
                // OpenAI가 키워드를 생성하지 못할 경우, 가게 이름을 그대로 키워드로 사용하거나 '기타'로 대체
                if (finalKeywords.length === 0) { // 기존 키워드도 없었을 때만
                    finalKeywords = [name.trim()]; 
                    console.log("OpenAI 키워드 생성 실패, 가게 이름을 키워드로 사용:", finalKeywords);
                } else {
                    console.log("OpenAI 키워드 생성 실패, 기존 키워드 유지:", finalKeywords);
                }
            }
        } else {
            console.log("음식 카테고리 키워드가 이미 존재하여 OpenAI 호출을 건너뜁니다:", finalKeywords);
        }
        
        // 최종 키워드 배열에서 중복 제거 및 빈 문자열 제거
        finalKeywords = [...new Set(finalKeywords)].filter(k => k !== '');

        if (recentView) {
            recentView.createdAt = new Date(); 
            recentView.keywords = finalKeywords; // 생성되거나 전달받은 키워드 사용
            recentView.storeName = name; // 'name' 필드 업데이트
            await recentView.save();
            console.log("addRecentView: 기존 기록 업데이트됨. ID:", recentView._id);
        } else {
            recentView = new RecentView({
                user: objectUserId,
                store: objectStoreId,
                createdAt: new Date(),
                keywords: finalKeywords, // 생성되거나 전달받은 키워드 사용
                storeName: name, // 'name' 필드 추가
            });
            await recentView.save();
            console.log("addRecentView: 새로운 기록 생성됨. ID:", recentView._id);
        }

        // 선택 사항: 최근 기록 개수 제한 (가장 오래된 기록 삭제)
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
        res
            .status(500)
            .json({
                message: "서버 오류로 최근 본 가게 기록을 업데이트할 수 없습니다.",
                error: error.message,
            });
    }
};

// 2. 최근 본 가게 기록 조회 컨트롤러 함수 (이전과 동일)
export const getRecentViews = async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ message: "사용자 ID는 필수입니다." });
    }

    try {
        const recentViews = await RecentView.find({
            user: new mongoose.Types.ObjectId(userId),
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate({
                path: 'store',
                select: 'name address thumbnail rating'
            });

        const recentStoresData = recentViews
            .filter((item) => item.store)
            .map((item) => ({
                _id: item.store._id,
                name: item.storeName, // RecentView 문서에 직접 저장된 storeName 사용
                address: item.store.address,
                thumbnail: item.store.thumbnail,
                rating: item.store.rating,
                keyword: item.keywords, // RecentView 문서에 직접 저장된 keywords 필드를 사용
                viewedAt: item.createdAt,
            }));

        res.status(200).json({ recentViewedStores: recentStoresData });
    } catch (error) {
        console.error("최근 본 가게 기록 조회 실패:", error);
        res.status(500).json({
            message: "서버 오류로 최근 본 가게 기록을 조회할 수 없습니다.",
            error: error.message,
        });
    }
};
