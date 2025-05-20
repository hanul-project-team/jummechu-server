import axios from "axios";
import "dotenv/config";

async function generateKeywordAndDescription({
  category,
  address_name,
  place_name,
}) {
  const prompt = `
다음 장소 정보를 기반으로 검색용 키워드와 장소 소개 설명을 만들어줘.

장소 정보:
- 카테고리: ${category}
- 주소: ${address_name}
- 가게명: ${place_name}

[출력 형식 : 반드시 JSON만 반환]
{
    "키워드": "${category}와 ${place_name}을 이용하여 쉼표로 구분된 단어 3개",
    "설명": "${category}, ${address_name}, ${place_name}을 이용한 2문장 정도의 장소 소개"
}
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

    // console.log("OpenAI 응답:", JSON.stringify(response.data, null, 2));
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
