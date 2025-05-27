import express from "express";
import { regist } from "../controllers/auth/regist.js";
import { login } from '../controllers/auth/login.js'
import { check } from "../controllers/auth/check.js";
import { logout } from "../controllers/auth/logout.js";
import { findId } from "../controllers/auth/findId.js";
import { myprofile, uploadProfile  } from "../controllers/auth/myprofile.js"
import { uploadProfileImage } from '../controllers/auth/multer.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/regist', regist)
router.post('/login', login)
router.post('/find_id', findId)
router.post('/upload/profile', protect, uploadProfileImage, uploadProfile )
router.get('/check', check)
router.get('/logout', logout)
router.get('/myprofile', protect, myprofile)

export default router