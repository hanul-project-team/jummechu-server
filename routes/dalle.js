import express from "express";
import axios from "axios";
import "dotenv/config";

const router = express.Router();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2023-12-01-preview";
const dalleDeploymentName = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT_NAME;

console.log("DALL-E Endpoint:", endpoint);
console.log("DALL-E API Key:", apiKey);
console.log("DALL-E Deployment Name:", dalleDeploymentName);

router.post("/", async (req, res) => {
  console.log("Received /api/dalle request body:", req.body);
  try {
    const { prompt: userPrompt } = req.body;

    const keywords = userPrompt || "맛있는 음식";
    const dallePrompt = `일러스트 스타일로 다음 키워드를 반영한 음식점 장면을 그려주세요: ${keywords}. 음식이 놓인 테이블, 가게 분위기를 포함해 주세요.`;

    const response = await axios.post(
      `${endpoint}/openai/deployments/${dalleDeploymentName}/images/generations:submit?api-version=${apiVersion}`,
      {
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );
    const operationId = response.data.id; // <- response에서 operationId 추출

    const pollingInterval = 3000; // 3초

    async function pollForImage() {
      try {
        const statusResponse = await axios.get(
          `${endpoint}/openai/operations/${operationId}?api-version=${apiVersion}`,
          {
            headers: {
              "Content-Type": "application/json",
              "api-key": apiKey,
            },
          }
        );

        const status = statusResponse.data.status;

        if (status === "succeeded") {
          const imageUrl = statusResponse.data.result.data[0].url;
          console.log("DALL-E 이미지 생성 성공:", imageUrl);
          res.json({ imageUrl });
        } else if (status === "failed") {
          console.error("DALL-E 이미지 생성 실패:", statusResponse.data.error);
          res.status(500).json({
            error: "이미지 생성 실패",
            detail: statusResponse.data.error,
          });
        } else {
          setTimeout(pollForImage, pollingInterval);
        }
      } catch (error) {
        console.error("폴링 중 오류 발생:", error);
        res
          .status(500)
          .json({ error: "이미지 생성 실패", detail: error.message });
      }
    }

    pollForImage(); // 폴링 시작
  } catch (err) {
    console.error("DALL·E 이미지 생성 초기 요청 오류:", err);
    console.error("DALL·E 에러 응답 데이터:", err?.response?.data);
    console.error("DALL·E 에러 메시지:", err?.message);
    res.status(500).json({
      error: "이미지 생성 실패",
      detail: err?.response?.data || err.message,
    });
  }
});

export default router;
