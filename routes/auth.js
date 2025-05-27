import express from "express";
import { regist } from "../controllers/auth/regist.js";
import { login } from "../controllers/auth/login.js";
import { findAccount } from "../controllers/auth/findAccount.js";
import { target } from "../controllers/auth/target.js";
import { sendLink } from "../controllers/auth/sendLink.js";
import { verifyResetToken } from "../controllers/auth/verifyResetToken.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import { logout } from "../controllers/auth/logout.js";
import { restoreLogin } from "../controllers/auth/restoreLogin.js";

const router = express.Router();

router.post("/regist", regist);
router.post("/login", login);
router.post("/find_account", findAccount);
router.post("/target", target);
router.post("/send_link", sendLink);
router.post("/verify_reset_token", verifyResetToken);
router.post("/reset_password", resetPassword);
router.get("/logout", logout);
router.get("/restore_login", restoreLogin);

export default router;
