import axios from "axios";
import "dotenv/config";

async function generateKeywordAndDescription({
  category,
  address_name,
  place_name,
}) {
  const prompt = `
다음 장소 정보를 바탕으로 검색용 키워드와 간단한 장소 소개를 작성해줘.

장소 정보:
- 카테고리: ${category}
- 주소: ${address_name}
- 가게명: ${place_name}

[출력 형식: 반드시 JSON만 반환. 설명은 2문장 내외. 키워드는 쉼표(,)로 구분된 단어 3개.]
{
  "키워드": "장소와 관련된 인기 키워드, 예: 메뉴, 분위기, 서비스 특징, 고객층 등을 포함한 단어들",
  "설명": "장소의 카테고리, 위치, 특성을 반영하여 마케팅에 적합한 설명 문장"
}

조건:
- 장소명, 주소, 카테고리 이름을 그대로 키워드에 넣지 말 것
- 키워드는 일반 사용자가 검색할 때 유용한 단어로 생성할 것
- 예: '분위기 좋은', '혼밥 추천', '직장인 점심', '가성비 맛집', '감성 카페'
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
