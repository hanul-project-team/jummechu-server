import express from "express";
const router = express.Router();
import KakaoApi from '../controllers/api/callKakaoApi.js'
import AzureApi from '../controllers/api/callAzureApi.js'

router.use('/kakao', KakaoApi)
router.use('/azure', AzureApi)

export default router;
