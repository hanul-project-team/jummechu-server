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
import { kakaoVerify } from "../controllers/auth/kakaoVerify.js";
import { accountSetting } from "../controllers/auth/accountSetting.js";
import { logout } from "../controllers/auth/logout.js";
import { restoreLogin } from "../controllers/auth/restoreLogin.js";

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
router.post("/kakao_verify", kakaoVerify);
router.get("/logout", logout);
router.get("/restore_login", restoreLogin);
router.put("/reset_password", resetPassword);
router.put("/account_setting/:id", accountSetting);

export default router;
