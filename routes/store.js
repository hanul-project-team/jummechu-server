import express from "express";
const router = express.Router();
import save from "../controllers/store/saveStore.js";
import getStoreInfo from '../controllers/store/getStoreInfo.js'

router.post("/save", save);
router.get('/read/:id', getStoreInfo)

export default router;
