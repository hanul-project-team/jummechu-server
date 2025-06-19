import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const dell = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT_NAME;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2023-12-01-preview";

// console.log("DALL-E Endpoint:", endpoint); // 추가
// console.log("DALL-E API Key:", apiKey); // 추가

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      `${endpoint}/openai/images/generations:submit?api-version=${apiVersion}`, // 수정된 부분: apiVersion 사용
      {
        prompt,
        n: 1,
        size: "512x512",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    ); // ... (이후 폴링 로직은 그대로 유지)
  } catch (err) {
    console.error(
      "DALL·E 이미지 생성 오류:",
      err?.response?.data || err.message || err
    );
    res.status(500).json({
      error: "이미지 생성 실패",
      detail: err?.response?.data || err.message,
    });
  }
});

export default router;
