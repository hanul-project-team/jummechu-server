import express from "express";
import axios from "axios";
import 'dotenv/config';
import { AzureOpenAI } from "openai";
const router = express.Router();

// const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
// const apiKey = process.env["AZURE_OPENAI_API_KEY"];
// const dalleApiVersion = process.env["AZURE_OPENAI_DALLE_API_VERSION"];
// const deployment = process.env["AZURE_OPENAI_DALLE_DEPLOYMENT_NAME"];
const deployment = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT_NAME;
const dalleApiVersion = process.env.AZURE_OPENAI_DALLE_API_VERSION;

const endpoint = process.env.AZURE_OPENAI_ENDPOINT; // ex: https://sehwa-makipzh3-swedencentral.cognitiveservices.azure.com
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;
const openaiApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

router.post("/openai", async (req, res) => {
  const prompt = req.body.headers.prompt;
  console.log('리퀘스트 바디로 넘어론 스트링',prompt)

  try {
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${openaiApiVersion}`,
      {
        messages: [
          { role: "system", content: "음식점 추천 시스템입니다." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    // 만약 OpenAI가 JSON 형식 응답을 바로 준다면 바로 json 응답
    // 아니면 JSON.parse(reply) 하되 에러 대비
    // let json;
    // console.log(reply)
    // try {
    //   json = JSON.parse(reply);
    // } catch {
    //   json = { message: reply };
    // }

    res.status(201).json(reply);
  } catch (error) {
    console.error(
      "Azure OpenAI 호출 에러:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "OpenAI 호출 실패" });
  }
});

// --------------------------- dalle

const promptPrefix = "실제사진처럼  ";
const promptSuffix = "음식을 표현해주세요";
const size = "1024x1024";
const style = "vivid";
const quality = "standard";
const n = 1;

async function getClient() {
  return new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion:dalleApiVersion });
}

function analyzeKeywords(userPrompt) {
  const keywords = userPrompt.split(',').map(k => k.trim()).filter(k => k !== '');
//   console.log(keywords)
  const keywordCounts = {};
  keywords.forEach(keyword => {
    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
  });
//   console.log('키워드 카운트',keywordCounts)
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

router.post("/dalle", async (req, res) => {
  console.log("Received /api/azure/dalle request body:", req.body);
  try {
    // const { prompt: userPrompt } = req.body.prompt;
    const userPrompt = req.body.prompt;
    // console.log(req.body.prompt)
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
