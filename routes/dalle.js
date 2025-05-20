import express from "express";
import { AzureOpenAI } from "openai";
import "dotenv/config";

const router = express.Router();

const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
const apiKey = process.env["AZURE_OPENAI_API_KEY"];
const deployment = process.env["AZURE_OPENAI_DALLE_DEPLOYMENT_NAME"];
const apiVersion = process.env["AZURE_OPENAI_DALLE_API_VERSION"];

const promptPrefix =
  "일러스트 스타일로 다음 키워드중에서 가장 많은 키워드 또는 음식의 종류로 일러스트를 그려줘: 키워드:";
const size = "1024x1024";
const style = "natural";
const quality = "standard";
const n = 1;

async function getClient() {
  return new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion });
}

router.post("/", async (req, res) => {
  console.log("Received /api/dalle request body:", req.body);
  try {
    const { prompt: userPrompt } = req.body;
    const finalPrompt = `${promptPrefix}{${userPrompt}}.`;

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
