import axios from "axios";
import "dotenv/config";
const defaultCategories = [
  "패스트푸드",
  "치킨",
  "피자",
  "햄버거",
  "스테이크",
  "샤브샤브",
  "초밥",
  "갈비",
  "비빔밥",
  "커피",
  "디저트",
  "라면",
  "김밥",
  "전골",
  "샌드위치",
  "도시락",
  "삼계탕",
  "핫도그",
  "국수",
  "스테이크 하우스",
  "레스토랑",
  "커피숍",
  "호프",
  "감자탕",
  "술집",
  "고기집",
  "도넛",
  "회",
  "분식",
  "국밥",
  "찜닭",
  "파스타",
  "기사식당",
  "수제버거",
  "닭강정",
  "돈까스",
  "비빔국수",
  "회덮밥",
  "샐러드",
  "덮밥",
  "닭꼬치",
  "떡갈비",
  "돼지불백",
  "한식",
  "일식",
  "양식",
  "중식",
  "삼겹살",
  "김치찌개",
  "닭갈비",
  "불고기",
  "보쌈",
  "조개",
  "해장국",
  "갈비찜",
  "설렁탕",
  "매운탕",
  "빵",
  "떡볶이",
  "부대찌개",
  "짜장면",
  "탕수육",
  "아이스크림",
  "떡",
];
async function generateKeywordAndDescription({
  category,
  address_name,
  place_name,
}) {
  const prompt = `
다음 장소 정보를 바탕으로 검색 키워드 3개와 간단한 장소 소개를 JSON 형식으로 작성해줘.

장소 정보:
- 카테고리: ${category}
- 주소: ${address_name}
- 가게명: ${place_name}

[출력 형식: 반드시 JSON만 반환]
{
  "키워드": "쉼표로 구분된 단어 3개 (예: 김밥, 떡볶이, 튀김)",
  "설명": "가게의 카테고리, 위치, 특징을 바탕으로 작성한 2문장 이내의 설명"
}

조건:
- 키워드는 '기본 키워드 목록'에 있는 단어 중 1~2개를 포함해도 좋음
- 단, 해당 가게에서 제공하지 않는 음식은 포함하지 말 것
- 나머지는 모델이 직접 유사한 단어를 생성해서 총 3개 키워드를 만들 것
- 키워드는 음식 이름, 메뉴, 업종, 서비스 성격 등을 중심으로 실용적으로 구성
- 장소명, 주소, 카테고리 이름을 그대로 키워드에 넣지 말 것
- '감성 카페', '혼밥 추천' 같은 추상적인 단어는 피할 것

[기본 키워드 목록: ${defaultCategories.join(", ")}]
`;

  try {
    const response = await axios.post(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
      {
        messages: [
          {
            role: "system",
            content: "당신은 장소 정보를 요약해주는 마케팅 작가입니다.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          "api-key": process.env.AZURE_OPENAI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    try {
      const parsed = JSON.parse(content);

      return {
        keyword: parsed["keyword"] || parsed["키워드"] || "",
        description: parsed["description"] || parsed["설명"] || "",
      };
    } catch (err) {
      console.error("JSON 파싱 실패. 원본 반환:", content);
      return {
        keyword: "",
        description: content,
      };
    }
  } catch (err) {
    console.error("OpenAI 요청 에러:", err.response?.data || err.message);
    return {
      keyword: "",
      description: "",
    };
  }
}

export default generateKeywordAndDescription;
