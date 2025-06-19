import express from "express";
import { regist } from "../controllers/auth/regist.js";
import { login } from "../controllers/auth/login.js";
import { findAccount } from "../controllers/auth/findAccount.js";
import { target } from "../controllers/auth/target.js";
import { sendCode } from "../controllers/auth/sendCode.js";
import { sendLink } from "../controllers/auth/sendLink.js";
import { verifyCode } from "../controllers/auth/verifyCode.js";
import { verifyResetToken } from "../controllers/auth/verifyResetToken.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import { googleVerify } from "../controllers/auth/googleVerify.js";
import { accountSetting } from "../controllers/auth/accountSetting.js";
import { logout } from "../controllers/auth/logout.js";
import { restoreLogin } from "../controllers/auth/restoreLogin.js";
import { myprofile, uploadProfile, resetProfileImage, updateProfile, changePassword, deleteAccount  } from "../controllers/auth/myprofile.js"
import { uploadProfileImage } from '../controllers/auth/multer.js'
import { verifyPassword } from "../controllers/auth/verifyPassword.js";
import { protect } from '../middlewares/authMiddleware.js'
import { addRecentView, getRecentViews } from '../controllers/auth/recentHistory.js';
import { getPlaceById } from '../controllers/auth/placeController.js'; 

const router = express.Router();

router.post("/regist", regist);
router.post("/login", login);
router.post("/find_account", findAccount);
router.post("/target", target);
router.post("/send_code", sendCode);
router.post("/send_link", sendLink);
router.post("/verify_code", verifyCode);
router.post("/verify_reset_token", verifyResetToken);
router.post("/google_verify", googleVerify);
router.post("/reset_password", resetPassword);
router.post('/upload/profile', protect, uploadProfileImage, uploadProfile )
router.post("/verify-password", protect, verifyPassword);
router.post('/recent-history', protect, addRecentView); // 새로운 기록 추가 또는 업데이트

router.get("/logout", logout);
router.get("/restore_login", restoreLogin);
// router.get('/check', check)
router.get('/logout', logout)
router.get('/myprofile', protect, myprofile)
router.get('/recent-history', protect, getRecentViews); // 최근 기록 조회
router.get('/places/:id', getPlaceById); 

router.put('/profile-image/reset',  protect, resetProfileImage);
router.put('/change-password',  protect, changePassword);
router.put('/profile',  protect, updateProfile);

router.delete('/account', protect, deleteAccount);


router.put("/reset_password", resetPassword);
router.put("/account_setting/:id", accountSetting);

export default router