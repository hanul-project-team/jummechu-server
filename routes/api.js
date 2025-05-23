import express from "express";
const router = express.Router();
import KakaoRouter from '../controllers/kakao_api/callKakaoApi.js'

router.use('/kakao', KakaoRouter)

export default router;
