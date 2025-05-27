import express from 'express'
const router = express.Router();
import regist from '../controllers/reviews/regist.js'
import readAll from '../controllers/reviews/readAll.js'

router.get('/read/:id', readAll)
router.post('/regist', regist)

export default router