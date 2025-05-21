import express from "express";
import { AzureOpenAI } from "openai";
import "dotenv/config";

const router = express.Router();

const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
const apiKey = process.env["AZURE_OPENAI_API_KEY"];
const deployment = process.env["AZURE_OPENAI_DALLE_DEPLOYMENT_NAME"];
const apiVersion = process.env["AZURE_OPENAI_DALLE_API_VERSION"];

const promptPrefix = "실제사진처럼  ";
const promptSuffix = "음식을 표현해주세요";
const size = "1024x1024";
const style = "vivid";
const quality = "standard";
const n = 1;

async function getClient() {
  return new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion });
}

function analyzeKeywords(userPrompt) {
  const keywords = userPrompt.split(',').map(k => k.trim()).filter(k => k !== '');
  const keywordCounts = {};
  keywords.forEach(keyword => {
    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
  });
  return keywordCounts;
}

function getPriorityKeywords(keywordCounts) {
  let maxCount = 0;
  let priorityKeywords = [];

  for (const keyword in keywordCounts) {
    if (keywordCounts[keyword] > maxCount) {
      maxCount = keywordCounts[keyword];
      priorityKeywords = [keyword];
    } else if (keywordCounts[keyword] === maxCount && maxCount > 0) {
      priorityKeywords.push(keyword);
    }
  }

  // 특정 음식 종류를 우선시하는 로직 (예시)
  const foodKeywords = ["스시", "비빔밥", "짜장면", "파스타", "스테이크"];
  const prioritizedFood = priorityKeywords.find(keyword => foodKeywords.includes(keyword));
  if (prioritizedFood) {
    return [prioritizedFood];
  }

  return priorityKeywords;
}

router.post("/", async (req, res) => {
  console.log("Received /api/dalle request body:", req.body);
  try {
    const { prompt: userPrompt } = req.body;
    const keywordCounts = analyzeKeywords(userPrompt);
    const priorityKeywords = getPriorityKeywords(keywordCounts);

    let finalPrompt = promptPrefix;
    if (priorityKeywords.length > 0) {
      finalPrompt += `${priorityKeywords.join(" 또는 ")}`;
    } else if (Object.keys(keywordCounts).length > 0) {
      // 우선순위 키워드가 없으면 가장 먼저 나온 키워드 사용 (선택 사항)
      finalPrompt += Object.keys(keywordCounts)[0];
    } else {
      finalPrompt += "맛있는 음식"; // 기본 프롬프트
    }
    finalPrompt += promptSuffix;
    console.log("생성될 최종 프롬프트:", finalPrompt);

    const client = await getClient();
    const results = await client.images.generate({
      prompt: finalPrompt,
      n,
      size,
      style,
      quality,
    });

    if (results.data && results.data.length > 0 && results.data[0].url) {
      console.log("DALL-E 이미지 생성 성공:", results.data[0].url);
      res.json({ imageUrl: results.data[0].url });
    } else {
      console.error("DALL-E 이미지 생성 실패:", results);
      res.status(500).json({ error: "이미지 생성 실패", detail: results });
    }
  } catch (err) {
    console.error("DALL-E 이미지 생성 오류:", err);
    res.status(500).json({ error: "이미지 생성 실패", detail: err.message });
  }
});

export default router;