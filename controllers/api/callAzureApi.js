// routes/api/azure.js

import express from "express";
import axios from "axios";
import 'dotenv/config'; // .env 파일 로드를 위한 설정
import { AzureOpenAI } from "openai";

const router = express.Router();

// 환경 변수에서 값 가져오기
const deployment = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT_NAME; // DALL-E 배포 이름
const dalleApiVersion = process.env.AZURE_OPENAI_DALLE_API_VERSION; // ★★★ DALL-E API 버전 ★★★


const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT; // OpenAI 텍스트 모델 배포 이름
const openaiApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15"; // OpenAI 텍스트 모델 API 버전

router.post("/openai", async (req, res) => {
    // 프롬프트와 함께 위도, 경도 정보도 req.body에서 추출
    const { prompt: userPrompt, latitude, longitude } = req.body;
    // console.log('Received /api/azure/openai request body:', req.body);

    if (!userPrompt || String(userPrompt).trim() === '') {
        return res.status(400).json({ error: "프롬프트가 제공되지 않았습니다." });
    }

    // 위치 정보를 프롬프트에 추가
    let fullPrompt = userPrompt;
    if (latitude && longitude) {
        fullPrompt = `사용자의 현재 위치 (위도: ${latitude}, 경도: ${longitude}) 근처에서, ${userPrompt}`;
        // console.log(`AI 프롬프트에 위치 정보 추가됨: 위도 ${latitude}, 경도 ${longitude}`);
    } else {
        // console.log("위치 정보가 제공되지 않습니다. 일반적인 추천을 수행합니다.");
    }
    // console.log('OpenAI로 전송될 최종 프롬프트:', fullPrompt);

    try {
        const response = await axios.post(
            `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${openaiApiVersion}`,
            {
                messages: [
                    { role: "system", content: "당신은 음식점 추천 전문가입니다. 요청된 정보만 JSON 형식의 문자열로 제공하세요. 추가적인 설명은 하지 마십시오." },
                    { role: "user", content: fullPrompt }, // 수정된 프롬프트 사용
                ],
                max_tokens: 1000,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
            }
        );

        const replyContent = response.data.choices[0].message.content;
        // console.log('OpenAI로부터 받은 원시 응답:', replyContent);

        try {
            const parsedReply = JSON.parse(replyContent);
            res.status(200).json(parsedReply);
        } catch (jsonParseError) {
            console.warn("OpenAI 응답이 유효한 JSON 형식이 아닙니다. 원시 문자열로 전송합니다.", jsonParseError);
            res.status(200).json(replyContent);
        }

    } catch (error) {
        console.error(
            "Azure OpenAI 호출 에러:",
            error.response?.data?.error || error.message || error,
            error.response?.statusText ? `HTTP Status: ${error.response.status} ${error.response.statusText}` : ''
        );
        res.status(500).json({ error: "OpenAI 호출 실패", details: error.response?.data || error.message });
    }
});

// --------------------------- DALL-E ---------------------------

const promptPrefix = "실제사진처럼 ";
const promptSuffix = " 음식을 표현해주세요";
const size = "1024x1024";
const style = "natural";
const quality = "hd";
const n = 1;

async function getClient() {
    // ★★★ 여기에서 apiVersion이 `dalleApiVersion` 변수를 사용하고 있습니다. ★★★
    // 이 변수가 `.env` 파일에서 올바르게 로드되었는지 확인하는 것이 중요합니다.
    return new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion: dalleApiVersion });
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

    const foodKeywords = ["스시", "비빔밥", "짜장면", "파스타", "스테이크", "한식", "일식", "양식", "중식", "야식", "간식", "카페/디저트"];
    const prioritizedFood = priorityKeywords.find(keyword => foodKeywords.includes(keyword));
    if (prioritizedFood) {
        return [prioritizedFood];
    }

    return priorityKeywords;
}

router.post("/dalle", async (req, res) => {
    // console.log("Received /api/azure/dalle request body:", req.body);
    try {
        const userPrompt = req.body.prompt;

        const keywordCounts = analyzeKeywords(userPrompt);
        const priorityKeywords = getPriorityKeywords(keywordCounts);

        let finalPrompt = promptPrefix;
        if (priorityKeywords.length > 0) {
            finalPrompt += `${priorityKeywords.join(" 또는 ")}`;
        } else if (Object.keys(keywordCounts).length > 0) {
            finalPrompt += Object.keys(keywordCounts)[0];
        } else {
            finalPrompt += "맛있는 음식";
        }
        finalPrompt += promptSuffix;
        // console.log("생성될 최종 프롬프트:", finalPrompt);

        const client = await getClient();
        const results = await client.images.generate({
            prompt: finalPrompt,
            n,
            size,
            style,
            quality,
        });

        if (results.data && results.data.length > 0 && results.data[0].url) {
            // console.log("DALL-E 이미지 생성 성공:", results.data[0].url);
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
