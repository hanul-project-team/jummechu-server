import express from "express";
import { regist } from "../controllers/auth/regist.js";
import { login } from '../controllers/auth/login.js'
import { check } from "../controllers/auth/check.js";
import { logout } from "../controllers/auth/logout.js";
import { findId } from "../controllers/auth/findId.js";

const router = express.Router();

router.post('/regist', regist)
router.post('/login', login)
router.post('/find_id', findId)
router.get('/check', check)
router.get('/logout', logout)

export default router