import express from "express";
import { regist } from "../controllers/auth/regist.js";
import { login } from '../controllers/auth/login.js'

const router = express.Router();

router.post('/regist', regist)
router.post('/login', login)

export default router