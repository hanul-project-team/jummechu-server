import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
const endpoint = process.env.AZURE_OPENAI_ENDPOINT // ex: https://sehwa-makipzh3-swedencentral.cognitiveservices.azure.com
const apiKey = process.env.AZURE_OPENAI_API_KEY
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2023-12-01-preview'

router.post('/', async (req, res) => {
  const { prompt } = req.body

  try {
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
      {
        messages: [
          { role: 'system', content: '음식점 추천 시스템입니다.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        }
      }
    )

    const reply = response.data.choices[0].message.content
    // 만약 OpenAI가 JSON 형식 응답을 바로 준다면 바로 json 응답
    // 아니면 JSON.parse(reply) 하되 에러 대비
    let json
    try {
      json = JSON.parse(reply)
    } catch {
      json = { message: reply }
    }

    res.json(json)
  } catch (error) {
    console.error('Azure OpenAI 호출 에러:', error.response?.data || error.message)
    res.status(500).json({ error: 'OpenAI 호출 실패' })
  }
})

export default router
