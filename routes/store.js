import express from "express";
const router = express.Router();
import save from "../controllers/store/saveStore.js";
import renewStoreInfo from '../controllers/store/renewStoreInfo.js'
import getStoreInfo from "../controllers/store/getStoreInfo.js";

router.post("/save", save);
router.get('/read/:id', renewStoreInfo)
router.post('/storeInfo', getStoreInfo)

export default router;
