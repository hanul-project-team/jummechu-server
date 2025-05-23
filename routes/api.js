import express from "express";
const router = express.Router();
import KakaoApi from '../controllers/api/callKakaoApi.js'

router.use('/kakao', KakaoApi)

export default router;
