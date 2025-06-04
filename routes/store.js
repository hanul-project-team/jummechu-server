import express from "express";
const router = express.Router();
import save from "../controllers/store/saveStore.js";

router.post("/save", save);

export default router;
