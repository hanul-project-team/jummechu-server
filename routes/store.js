import express from "express";
const router = express.Router();
import regist from "../controllers/store/regist.js";

router.post("/regist", regist);

export default router;
