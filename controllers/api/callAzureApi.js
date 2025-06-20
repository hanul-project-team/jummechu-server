import express from "express";
import axios from "axios";
import 'dotenv/config';
import { AzureOpenAI }  from "openai"; // 사용자 코드에서 이 라이브러리를 사용 중이므로 유지

const router = express.Router();

// 환경 변수에서 값 가져오기
const deployment = process.env.AZURE_OPENAI_DALLE_DEPLOYMENT_NAME; // DALL-E 배포 이름
const dalleApiVersion = process.env.AZURE_OPENAI_DALLE_API_VERSION; // DALL-E API 버전

const endpoint = process.env.AZURE_OPENAI_ENDPOINT; // 예: https://your-resource-name.openai.azure.com/
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT; // OpenAI 텍스트 모델 배포 이름
const openaiApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15"; // OpenAI 텍스트 모델 API 버전 (최신 권장 버전)

router.post("/openai", async (req, res) => {
    // ★★★ 수정: 이제 'prompt'는 req.body의 최상위 필드로 직접 전달됩니다. ★★★
    const userPrompt = req.body.prompt; 
    console.log('리퀘스트 바디로 넘어온 스트링 (처리 후):', userPrompt);

    if (!userPrompt || String(userPrompt).trim() === '') {
        return res.status(400).json({ error: "프롬프트가 제공되지 않았습니다." });
    }

    try {
        const response = await axios.post(
            `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${openaiApiVersion}`,
            {
                messages: [
                    { role: "system", content: "당신은 음식점 추천 전문가입니다. 요청된 정보만 JSON 형식의 문자열로 제공하세요. 추가적인 설명은 하지 마십시오." },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 1000, // 더 긴 JSON 응답을 위해 토큰 수 증가
                temperature: 0.7,
                // response_format은 요청된 프롬프트와 일치하도록 명시적으로 지정하지 않습니다.
                // 프롬프트가 이미 JSON 문자열을 요청하고 있으므로 모델의 자율성에 맡깁니다.
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
            }
        );

        const replyContent = response.data.choices[0].message.content;
        console.log('OpenAI로부터 받은 원시 응답:', replyContent);

        // OpenAI 응답을 JSON으로 파싱 시도. 실패하면 원시 문자열 그대로 반환
        try {
            const parsedReply = JSON.parse(replyContent);
            res.status(200).json(parsedReply); // 파싱된 JSON 객체를 응답
        } catch (jsonParseError) {
            console.warn("OpenAI 응답이 유효한 JSON 형식이 아닙니다. 원시 문자열로 전송합니다.", jsonParseError);
            res.status(200).json(replyContent); // 파싱 실패 시 원시 문자열 그대로 응답
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

// --------------------------- DALL-E (변경 없음) ---------------------------

const promptPrefix = "실제사진처럼  ";
const promptSuffix = "음식을 표현해주세요";
const size = "1024x1024";
const style = "natural";
const quality = "hd";
const n = 1;

// 사용자의 AzureOpenAI 초기화 방식을 유지합니다.
async function getClient() {
    return new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion:dalleApiVersion });
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
    console.log("Received /api/azure/dalle request body:", req.body);
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